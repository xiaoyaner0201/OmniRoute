export type PersistenceErrorCode =
  | "constraint_unique"
  | "constraint_foreign_key"
  | "conflict"
  | "unavailable"
  | "timeout"
  | "closed"
  | "migration_lock_timeout"
  | "unsupported"
  | "unknown";

export interface PersistenceErrorOptions {
  retryable: boolean;
  operation?: string;
  cause?: unknown;
  message?: string;
}

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode;
  readonly retryable: boolean;
  readonly operation?: string;

  constructor(code: PersistenceErrorCode, options: PersistenceErrorOptions) {
    super(options.message ?? "Persistence operation failed", { cause: options.cause });
    this.name = "PersistenceError";
    this.code = code;
    this.retryable = options.retryable;
    this.operation = options.operation;
  }
}

export function isPersistenceError(value: unknown): value is PersistenceError {
  return value instanceof PersistenceError;
}
