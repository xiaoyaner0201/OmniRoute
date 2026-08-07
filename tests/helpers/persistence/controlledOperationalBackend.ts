import { randomUUID } from "node:crypto";

import { PersistenceError } from "../../../src/domain/persistence/errors.ts";
import type { PersistenceTransactionContext } from "../../../src/domain/persistence/transactionContext.ts";
import { OperationalBackend } from "../../../src/lib/db/backends/operationalBackend.ts";
import { createProcessLocalMigrationLockManager } from "../../../src/lib/db/backends/processLocalMigrationLock.ts";
import type { PersistenceTransactionExecutor } from "../../../src/lib/db/backends/types.ts";

export interface ControlledOperationalBackend {
  backend: OperationalBackend;
  readonly initializeCalls: number;
  readonly closeCalls: number;
  readonly journal: readonly string[];
  resolveInitialize(): void;
  rejectInitialize(error?: unknown): void;
  pauseClose(): void;
  resolveClose(): void;
  stage(context: PersistenceTransactionContext, value: string): void;
}

export function createControlledOperationalBackend(id: string): ControlledOperationalBackend {
  let initializeCalls = 0;
  let closeCalls = 0;
  let resolveInitialize!: () => void;
  let rejectInitialize!: (error: unknown) => void;
  let closePaused = false;
  let resolveClose!: () => void;
  const closeGate = new Promise<void>((resolve) => {
    resolveClose = resolve;
  });
  const initializeGate = new Promise<void>((resolve, reject) => {
    resolveInitialize = resolve;
    rejectInitialize = reject;
  });
  const journal: string[] = [];
  const activeTransactions = new Map<string, string[]>();
  let backend!: OperationalBackend;
  const migrationLocks = createProcessLocalMigrationLockManager(() => backend?.state === "ready");

  const transactions: PersistenceTransactionExecutor = {
    async run(work, options) {
      if (backend.state !== "ready") {
        throw new PersistenceError(backend.state === "closed" ? "closed" : "conflict", {
          retryable: false,
          operation: "transaction",
        });
      }
      if (options?.signal?.aborted) {
        throw new PersistenceError("timeout", {
          retryable: true,
          operation: "transaction",
          cause: options.signal.reason,
        });
      }

      const context = Object.freeze({ backendId: id, transactionId: randomUUID() });
      const staged: string[] = [];
      activeTransactions.set(context.transactionId, staged);
      try {
        const result = await work(context);
        journal.push(...staged);
        return result;
      } catch (error: unknown) {
        throw backend.classifyError(error, "transaction");
      } finally {
        activeTransactions.delete(context.transactionId);
      }
    },
  };

  backend = new OperationalBackend({
    id,
    hooks: {
      initialize() {
        initializeCalls += 1;
        return initializeGate;
      },
      isReady: () => true,
      async close() {
        closeCalls += 1;
        if (closePaused) await closeGate;
      },
    },
    transactions,
    migrationLocks,
    classifyError(error, operation) {
      return new PersistenceError("unknown", {
        retryable: false,
        operation,
        cause: error,
      });
    },
  });

  return {
    backend,
    get initializeCalls() {
      return initializeCalls;
    },
    get journal() {
      return journal;
    },
    get closeCalls() {
      return closeCalls;
    },
    resolveInitialize,
    rejectInitialize(error: unknown = new Error("controlled initialization failure")) {
      rejectInitialize(error);
    },
    pauseClose() {
      closePaused = true;
    },
    resolveClose,
    stage(context, value) {
      const staged =
        context.backendId === id ? activeTransactions.get(context.transactionId) : undefined;
      if (!staged) {
        throw new PersistenceError("conflict", {
          retryable: false,
          operation: "transaction_context",
        });
      }
      staged.push(value);
    },
  };
}
