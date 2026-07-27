import { PersistenceError } from "@/domain/persistence/errors";
import type { PersistenceTransactionContext } from "@/domain/persistence/transactionContext";

/**
 * SQLite's synchronous transaction API cannot safely span an awaited callback.
 * Until a transaction-scoped repository implementation exists, any supplied
 * portable context is rejected instead of implying false async atomicity.
 */
export function rejectUnsupportedSqliteTransactionContext(
  context?: PersistenceTransactionContext
): void {
  if (!context) return;
  throw new PersistenceError("conflict", {
    retryable: false,
    operation: "transaction_context",
  });
}
