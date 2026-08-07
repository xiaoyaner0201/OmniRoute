import type { PersistenceError, PersistenceErrorCode } from "@/domain/persistence/errors";
import type {
  PersistenceTransactionContext,
  TransactionOptions,
} from "@/domain/persistence/transactionContext";

export type PersistenceBackendState =
  "new" | "initializing" | "ready" | "closing" | "closed" | "failed";

export interface BackendReadiness {
  ready: boolean;
  state: PersistenceBackendState;
  reason?: PersistenceErrorCode;
}

export interface MigrationLockRequest {
  ownerId: string;
  timeoutMs: number;
  signal?: AbortSignal;
}

export interface MigrationLock {
  ownerId: string;
  release(): Promise<void>;
}

export interface MigrationLockManager {
  acquire(request: MigrationLockRequest): Promise<MigrationLock>;
  close(): void;
}

export interface PersistenceTransactionExecutor {
  run<T>(
    work: (context: PersistenceTransactionContext) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>;
}

export interface PersistenceBackend {
  readonly id: string;
  readonly state: PersistenceBackendState;
  readonly transactions: PersistenceTransactionExecutor;
  readonly migrationLocks: MigrationLockManager;
  initialize(): Promise<void>;
  readiness(): Promise<BackendReadiness>;
  close(): Promise<void>;
  classifyError(error: unknown, operation?: string): PersistenceError;
}
