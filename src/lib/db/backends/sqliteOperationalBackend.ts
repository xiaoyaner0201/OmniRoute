import {
  PersistenceError,
  isPersistenceError,
  type PersistenceErrorCode,
} from "@/domain/persistence/errors";
import { closeDbInstance, ensureDbInitialized, pingDb } from "../core";
import { OperationalBackend } from "./operationalBackend";
import { createProcessLocalMigrationLockManager } from "./processLocalMigrationLock";
import type { MigrationLockManager, PersistenceTransactionExecutor } from "./types";

export interface SqliteOperationalBackendOptions {
  id?: string;
  initialize?: () => Promise<void>;
  isReady?: () => boolean | Promise<boolean>;
  close?: () => void | Promise<void>;
  migrationLocks?: MigrationLockManager;
}

function unsupported(operation: string): PersistenceError {
  return new PersistenceError("unsupported", { retryable: false, operation });
}

const unsupportedTransactions: PersistenceTransactionExecutor = {
  async run(): Promise<never> {
    throw unsupported("transaction");
  },
};

export function classifySqlitePersistenceError(
  error: unknown,
  operation?: string
): PersistenceError {
  if (isPersistenceError(error)) return error;

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  let portableCode: PersistenceErrorCode = "unknown";
  let retryable = false;

  if (code.includes("SQLITE_CONSTRAINT_UNIQUE") || code.includes("SQLITE_CONSTRAINT_PRIMARYKEY")) {
    portableCode = "constraint_unique";
  } else if (code.includes("SQLITE_CONSTRAINT_FOREIGNKEY")) {
    portableCode = "constraint_foreign_key";
  } else if (
    code === "SQLITE_BUSY" ||
    code.startsWith("SQLITE_BUSY_") ||
    code === "SQLITE_LOCKED" ||
    code.startsWith("SQLITE_LOCKED_")
  ) {
    portableCode = "unavailable";
    retryable = true;
  } else if (
    message.includes("database closed") ||
    message.includes("database connection is not open")
  ) {
    portableCode = "closed";
  }

  return new PersistenceError(portableCode, {
    retryable,
    operation,
    cause: error,
  });
}

export function createSqliteOperationalBackend(
  options: SqliteOperationalBackendOptions = {}
): OperationalBackend {
  let backend!: OperationalBackend;
  const migrationLocks =
    options.migrationLocks ??
    createProcessLocalMigrationLockManager(() => backend?.state === "ready");
  backend = new OperationalBackend({
    id: options.id ?? "sqlite",
    hooks: {
      initialize: options.initialize ?? ensureDbInitialized,
      isReady: options.isReady ?? pingDb,
      close:
        options.close ??
        (() => {
          closeDbInstance();
        }),
    },
    transactions: unsupportedTransactions,
    migrationLocks,
    classifyError: classifySqlitePersistenceError,
  });
  return backend;
}

export const sqliteOperationalBackend = createSqliteOperationalBackend();
