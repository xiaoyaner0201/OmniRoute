import { PersistenceError, isPersistenceError } from "@/domain/persistence/errors";
import type {
  BackendReadiness,
  MigrationLockManager,
  PersistenceBackend,
  PersistenceBackendState,
  PersistenceTransactionExecutor,
} from "./types";

export interface OperationalBackendHooks {
  initialize(): Promise<void>;
  isReady(): boolean | Promise<boolean>;
  close(): void | Promise<void>;
}

export interface OperationalBackendOptions {
  id: string;
  hooks: OperationalBackendHooks;
  transactions: PersistenceTransactionExecutor;
  migrationLocks: MigrationLockManager;
  classifyError(error: unknown, operation?: string): PersistenceError;
}

export class OperationalBackend implements PersistenceBackend {
  readonly id: string;
  readonly transactions: PersistenceTransactionExecutor;
  readonly migrationLocks: MigrationLockManager;

  private currentState: PersistenceBackendState = "new";
  private initializePromise: Promise<void> | null = null;
  private closePromise: Promise<void> | null = null;
  private failure: PersistenceError | null = null;

  constructor(private readonly options: OperationalBackendOptions) {
    this.id = options.id;
    this.transactions = options.transactions;
    this.migrationLocks = options.migrationLocks;
  }

  get state(): PersistenceBackendState {
    return this.currentState;
  }

  initialize(): Promise<void> {
    if (this.currentState === "ready") return Promise.resolve();
    if (this.currentState === "closing" || this.currentState === "closed") {
      return Promise.reject(
        new PersistenceError("closed", { retryable: false, operation: "initialize" })
      );
    }
    if (this.currentState === "failed" && this.failure) return Promise.reject(this.failure);
    if (this.initializePromise) return this.initializePromise;

    this.currentState = "initializing";
    let initialization: Promise<void>;
    try {
      initialization = this.options.hooks.initialize();
    } catch (error: unknown) {
      initialization = Promise.reject(error);
    }
    this.initializePromise = initialization.then(
      () => {
        if (this.currentState === "initializing") {
          this.currentState = "ready";
        }
      },
      (error: unknown) => {
        this.failure = this.classifyError(error, "initialize");
        if (this.currentState === "initializing") {
          this.currentState = "failed";
        }
        throw this.failure;
      }
    );
    return this.initializePromise;
  }

  async readiness(): Promise<BackendReadiness> {
    if (this.currentState === "ready") {
      let ready: boolean;
      try {
        ready = await this.options.hooks.isReady();
      } catch (error: unknown) {
        if (this.currentState !== "ready") {
          return {
            ready: false,
            state: this.currentState,
            ...(this.failure ? { reason: this.failure.code } : {}),
          };
        }
        return {
          ready: false,
          state: "ready",
          reason: this.classifyError(error, "readiness").code,
        };
      }
      if (this.currentState !== "ready") {
        return {
          ready: false,
          state: this.currentState,
          ...(this.failure ? { reason: this.failure.code } : {}),
        };
      }
      return ready
        ? { ready: true, state: "ready" }
        : { ready: false, state: "ready", reason: "unavailable" };
    }
    return {
      ready: false,
      state: this.currentState,
      ...(this.failure ? { reason: this.failure.code } : {}),
    };
  }

  close(): Promise<void> {
    if (this.closePromise) return this.closePromise;
    if (this.currentState === "closed") return Promise.resolve();

    this.currentState = "closing";
    this.closePromise = (async () => {
      try {
        this.migrationLocks.close();
        if (this.initializePromise) {
          try {
            await this.initializePromise;
          } catch {
            // Initialization failure does not prevent the close hook from running.
          }
        }
        await this.options.hooks.close();
        this.currentState = "closed";
      } catch (error: unknown) {
        this.failure = this.classifyError(error, "close");
        this.currentState = "failed";
        throw this.failure;
      }
    })();
    return this.closePromise;
  }

  classifyError(error: unknown, operation?: string): PersistenceError {
    if (isPersistenceError(error)) return error;
    return this.options.classifyError(error, operation);
  }
}
