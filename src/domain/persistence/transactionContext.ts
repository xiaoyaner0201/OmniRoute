export interface PersistenceTransactionContext {
  readonly backendId: string;
  readonly transactionId: string;
}

export interface TransactionOptions {
  isolation?: "default";
  readOnly?: boolean;
  signal?: AbortSignal;
}
