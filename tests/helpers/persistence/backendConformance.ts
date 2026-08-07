import assert from "node:assert/strict";
import test from "node:test";

import { PersistenceError } from "../../../src/domain/persistence/errors.ts";
import type { PersistenceBackend } from "../../../src/lib/db/backends/types.ts";

export interface BackendConformanceCase {
  name: string;
  create(): Promise<PersistenceBackend>;
  dispose?(backend: PersistenceBackend): Promise<void>;
}

export function registerPersistenceBackendConformance(cases: BackendConformanceCase[]): void {
  for (const backendCase of cases) {
    test(`[${backendCase.name}] initializes, reports readiness, and closes idempotently`, async () => {
      const backend = await backendCase.create();
      try {
        assert.deepEqual(await backend.readiness(), { ready: false, state: "new" });

        await backend.initialize();
        assert.deepEqual(await backend.readiness(), { ready: true, state: "ready" });

        await Promise.all([backend.close(), backend.close()]);
        assert.deepEqual(await backend.readiness(), { ready: false, state: "closed" });
      } finally {
        await backendCase.dispose?.(backend);
      }
    });

    test(`[${backendCase.name}] migration locks are exclusive and release is idempotent`, async () => {
      const backend = await backendCase.create();
      try {
        await backend.initialize();
        const first = await backend.migrationLocks.acquire({ ownerId: "first", timeoutMs: 100 });
        let secondAcquired = false;
        const secondPromise = backend.migrationLocks
          .acquire({ ownerId: "second", timeoutMs: 100 })
          .then((lock) => {
            secondAcquired = true;
            return lock;
          });

        await Promise.resolve();
        assert.equal(secondAcquired, false);
        await Promise.all([first.release(), first.release()]);

        const second = await secondPromise;
        assert.equal(second.ownerId, "second");
        await second.release();
      } finally {
        await backend.close();
        await backendCase.dispose?.(backend);
      }
    });

    test(`[${backendCase.name}] migration lock contention times out portably`, async () => {
      const backend = await backendCase.create();
      await backend.initialize();
      const first = await backend.migrationLocks.acquire({ ownerId: "first", timeoutMs: 100 });
      try {
        const acquisition = Promise.race([
          backend.migrationLocks.acquire({ ownerId: "timed-out", timeoutMs: 5 }),
          new Promise<"hung">((resolve) => setTimeout(() => resolve("hung"), 50)),
        ]);
        await assert.rejects(
          acquisition,
          (error: unknown) =>
            error instanceof PersistenceError && error.code === "migration_lock_timeout"
        );
      } finally {
        await first.release();
        await backend.close();
        await backendCase.dispose?.(backend);
      }
    });

    test(`[${backendCase.name}] aborted migration lock waits reject as portable timeouts`, async () => {
      const backend = await backendCase.create();
      await backend.initialize();
      const first = await backend.migrationLocks.acquire({ ownerId: "first", timeoutMs: 100 });
      const controller = new AbortController();
      try {
        const acquisition = Promise.race([
          backend.migrationLocks.acquire({
            ownerId: "aborted",
            timeoutMs: 100,
            signal: controller.signal,
          }),
          new Promise<"hung">((resolve) => setTimeout(() => resolve("hung"), 50)),
        ]);
        controller.abort(new Error("stop waiting"));
        await assert.rejects(
          acquisition,
          (error: unknown) => error instanceof PersistenceError && error.code === "timeout"
        );
      } finally {
        await first.release();
        await backend.close();
        await backendCase.dispose?.(backend);
      }
    });

    test(`[${backendCase.name}] close rejects queued migration locks before owner release`, async () => {
      const backend = await backendCase.create();
      await backend.initialize();
      const first = await backend.migrationLocks.acquire({ ownerId: "first", timeoutMs: 100 });
      const queued = backend.migrationLocks.acquire({ ownerId: "queued", timeoutMs: 1_000 });

      await backend.close();
      const queuedOutcome = await Promise.race([
        queued.then(
          () => "acquired" as const,
          (error: unknown) => error
        ),
        new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), 20)),
      ]);

      assert.ok(queuedOutcome instanceof PersistenceError);
      assert.equal(queuedOutcome.code, "closed");
      await first.release();
      await backendCase.dispose?.(backend);
    });
  }
}
