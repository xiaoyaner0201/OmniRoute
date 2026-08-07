import assert from "node:assert/strict";
import test from "node:test";

import { PersistenceError } from "../../../../src/domain/persistence/errors.ts";
import { createSqliteOperationalBackend } from "../../../../src/lib/db/backends/sqliteOperationalBackend.ts";
import { registerPersistenceBackendConformance } from "../../../helpers/persistence/backendConformance.ts";
import { createControlledOperationalBackend } from "../../../helpers/persistence/controlledOperationalBackend.ts";

test("[controlled] coalesces concurrent initialization and reports readiness transitions", async () => {
  const controlled = createControlledOperationalBackend("controlled");

  assert.deepEqual(await controlled.backend.readiness(), {
    ready: false,
    state: "new",
  });

  const first = controlled.backend.initialize();
  const second = controlled.backend.initialize();

  assert.equal(controlled.initializeCalls, 1);
  assert.deepEqual(await controlled.backend.readiness(), {
    ready: false,
    state: "initializing",
  });

  controlled.resolveInitialize();
  await Promise.all([first, second]);

  assert.equal(controlled.backend.state, "ready");
  assert.deepEqual(await controlled.backend.readiness(), {
    ready: true,
    state: "ready",
  });
});

registerPersistenceBackendConformance([
  {
    name: "controlled",
    async create() {
      const controlled = createControlledOperationalBackend("controlled-conformance");
      controlled.resolveInitialize();
      return controlled.backend;
    },
  },
]);

test("[controlled] transaction contexts commit once, roll back failures, and expire", async () => {
  const controlled = createControlledOperationalBackend("controlled-transactions");
  controlled.resolveInitialize();
  await controlled.backend.initialize();

  let committedContext: Parameters<typeof controlled.stage>[0] | undefined;
  const result = await controlled.backend.transactions.run(async (context) => {
    committedContext = context;
    controlled.stage(context, "committed");
    return 42;
  });

  assert.equal(result, 42);
  assert.equal(committedContext?.backendId, "controlled-transactions");
  assert.ok(committedContext?.transactionId);
  assert.deepEqual(controlled.journal, ["committed"]);

  await assert.rejects(
    controlled.backend.transactions.run(async (context) => {
      controlled.stage(context, "rolled-back");
      throw new Error("boom");
    }),
    (error: unknown) => error instanceof PersistenceError && error.code === "unknown"
  );
  assert.deepEqual(controlled.journal, ["committed"]);
  assert.throws(
    () => controlled.stage(committedContext!, "late"),
    (error: unknown) => error instanceof PersistenceError && error.code === "conflict"
  );
});

test("[controlled] initialization failure is classified and makes readiness false", async () => {
  const controlled = createControlledOperationalBackend("controlled-failure");
  controlled.rejectInitialize(new Error("cannot open"));

  await assert.rejects(
    controlled.backend.initialize(),
    (error: unknown) => error instanceof PersistenceError && error.code === "unknown"
  );
  assert.deepEqual(await controlled.backend.readiness(), {
    ready: false,
    state: "failed",
    reason: "unknown",
  });
});

test("synchronous initialization failure becomes a portable terminal failed state", async () => {
  const backend = createSqliteOperationalBackend({
    initialize: () => {
      throw new Error("driver initialization detail");
    },
    isReady: () => false,
    close: () => undefined,
  });

  await assert.rejects(
    backend.initialize(),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "unknown" &&
      error.operation === "initialize"
  );
  assert.equal(backend.state, "failed");
  assert.deepEqual(await backend.readiness(), {
    ready: false,
    state: "failed",
    reason: "unknown",
  });
});

test("[controlled] close waits for initialization and rejects new work while closing", async () => {
  const controlled = createControlledOperationalBackend("controlled-close-race");
  controlled.pauseClose();
  const initializing = controlled.backend.initialize();
  const closing = controlled.backend.close();

  assert.equal(controlled.backend.state, "closing");
  const lateInitialize = controlled.backend.initialize();
  await assert.rejects(controlled.backend.transactions.run(async () => undefined));
  await assert.rejects(
    controlled.backend.migrationLocks.acquire({ ownerId: "late", timeoutMs: 1 }),
    (error: unknown) => error instanceof PersistenceError && error.code === "closed"
  );

  controlled.resolveInitialize();
  await initializing;
  await assert.rejects(
    lateInitialize,
    (error: unknown) => error instanceof PersistenceError && error.code === "closed"
  );
  assert.equal(controlled.backend.state, "closing");
  await assert.rejects(controlled.backend.transactions.run(async () => undefined));
  await assert.rejects(
    controlled.backend.migrationLocks.acquire({ ownerId: "still-late", timeoutMs: 1 }),
    (error: unknown) => error instanceof PersistenceError && error.code === "closed"
  );

  controlled.resolveClose();
  await Promise.all([closing, controlled.backend.close()]);
  assert.equal(controlled.backend.state, "closed");
  assert.equal(controlled.closeCalls, 1);
});

test("[controlled] initialization failure cannot replace an in-flight closing state", async () => {
  const controlled = createControlledOperationalBackend("controlled-close-failure-race");
  controlled.pauseClose();
  const initializing = controlled.backend.initialize();
  const closing = controlled.backend.close();

  controlled.rejectInitialize(new Error("cannot open"));
  await assert.rejects(initializing);
  assert.equal(controlled.backend.state, "closing");

  controlled.resolveClose();
  await closing;
  assert.equal(controlled.backend.state, "closed");
});

test("readiness started while ready cannot report ready after close", async () => {
  let resolveReadiness!: (ready: boolean) => void;
  const readinessGate = new Promise<boolean>((resolve) => {
    resolveReadiness = resolve;
  });
  const backend = createSqliteOperationalBackend({
    initialize: async () => undefined,
    isReady: () => readinessGate,
    close: () => undefined,
  });
  await backend.initialize();

  const readiness = backend.readiness();
  await backend.close();
  resolveReadiness(true);

  assert.deepEqual(await readiness, { ready: false, state: "closed" });
});

test("readiness hook failures return a portable non-ready result", async () => {
  const backend = createSqliteOperationalBackend({
    initialize: async () => undefined,
    isReady: async () => {
      throw new Error("driver readiness detail");
    },
    close: () => undefined,
  });
  await backend.initialize();

  assert.deepEqual(await backend.readiness(), {
    ready: false,
    state: "ready",
    reason: "unknown",
  });
  await backend.close();
});

test("close hook failure becomes a portable terminal failed state", async () => {
  let closeCalls = 0;
  const backend = createSqliteOperationalBackend({
    initialize: async () => undefined,
    isReady: () => true,
    close: () => {
      closeCalls += 1;
      throw new Error("driver close detail");
    },
  });
  await backend.initialize();

  await assert.rejects(
    backend.close(),
    (error: unknown) =>
      error instanceof PersistenceError && error.code === "unknown" && error.operation === "close"
  );
  assert.equal(backend.state, "failed");
  assert.deepEqual(await backend.readiness(), {
    ready: false,
    state: "failed",
    reason: "unknown",
  });
  await assert.rejects(
    backend.initialize(),
    (error: unknown) =>
      error instanceof PersistenceError && error.code === "unknown" && error.operation === "close"
  );
  await assert.rejects(backend.close(), PersistenceError);
  assert.equal(closeCalls, 1);
});

test("SQLite adapter cannot override its unsupported async transaction executor", async () => {
  let overrideCalls = 0;
  const backend = createSqliteOperationalBackend({
    initialize: async () => undefined,
    isReady: () => true,
    close: () => undefined,
    // @ts-expect-error SQLite async transactions are intentionally not configurable.
    transactions: {
      async run(work) {
        overrideCalls += 1;
        return work({ backendId: "unsafe-override", transactionId: "unsafe-override" });
      },
    },
  });
  await backend.initialize();

  await assert.rejects(
    backend.transactions.run(async () => "not atomic"),
    (error: unknown) => error instanceof PersistenceError && error.code === "unsupported"
  );
  assert.equal(overrideCalls, 0);
  await backend.close();
});
