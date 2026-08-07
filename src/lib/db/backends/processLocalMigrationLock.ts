import { PersistenceError } from "@/domain/persistence/errors";
import type { MigrationLock, MigrationLockManager, MigrationLockRequest } from "./types";

interface PendingLock {
  request: MigrationLockRequest;
  resolve(lock: MigrationLock): void;
  reject(error: unknown): void;
  timer: ReturnType<typeof setTimeout>;
  abortListener?: () => void;
}

export function createProcessLocalMigrationLockManager(
  canAcquire: () => boolean = () => true
): MigrationLockManager {
  let owner: string | null = null;
  let closed = false;
  const queue: PendingLock[] = [];

  function rejectQueuedAsClosed(): void {
    for (const pending of queue.splice(0)) {
      clearTimeout(pending.timer);
      if (pending.abortListener) {
        pending.request.signal?.removeEventListener("abort", pending.abortListener);
      }
      pending.reject(
        new PersistenceError("closed", {
          retryable: false,
          operation: "migration_lock",
        })
      );
    }
  }

  function grantNext(): void {
    if (owner !== null) return;
    if (closed || !canAcquire()) {
      rejectQueuedAsClosed();
      return;
    }
    const pending = queue.shift();
    if (!pending) return;

    clearTimeout(pending.timer);
    if (pending.abortListener) {
      pending.request.signal?.removeEventListener("abort", pending.abortListener);
    }
    owner = pending.request.ownerId;
    let released = false;
    pending.resolve({
      ownerId: pending.request.ownerId,
      async release() {
        if (released) return;
        released = true;
        owner = null;
        grantNext();
      },
    });
  }

  return {
    acquire(request) {
      if (closed || !canAcquire()) {
        return Promise.reject(
          new PersistenceError("closed", {
            retryable: false,
            operation: "migration_lock",
          })
        );
      }
      if (request.signal?.aborted) {
        return Promise.reject(
          new PersistenceError("timeout", {
            retryable: true,
            operation: "migration_lock",
            cause: request.signal.reason,
          })
        );
      }
      return new Promise<MigrationLock>((resolve, reject) => {
        const pending: PendingLock = {
          request,
          resolve,
          reject,
          timer: setTimeout(
            () => {
              const index = queue.indexOf(pending);
              if (index < 0) return;
              queue.splice(index, 1);
              if (pending.abortListener) {
                request.signal?.removeEventListener("abort", pending.abortListener);
              }
              reject(
                new PersistenceError("migration_lock_timeout", {
                  retryable: true,
                  operation: "migration_lock",
                })
              );
            },
            Math.max(0, request.timeoutMs)
          ),
        };
        if (request.signal) {
          pending.abortListener = () => {
            const index = queue.indexOf(pending);
            if (index < 0) return;
            queue.splice(index, 1);
            clearTimeout(pending.timer);
            reject(
              new PersistenceError("timeout", {
                retryable: true,
                operation: "migration_lock",
                cause: request.signal?.reason,
              })
            );
          };
          request.signal.addEventListener("abort", pending.abortListener, { once: true });
        }
        queue.push(pending);
        grantNext();
      });
    },
    close() {
      if (closed) return;
      closed = true;
      rejectQueuedAsClosed();
    },
  };
}
