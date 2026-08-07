import assert from "node:assert/strict";
import test from "node:test";

import { routingConfigRepositories } from "../../../../src/lib/db/repositories/routingConfigRepositories.ts";
import { sqliteComboRepository } from "../../../../src/lib/db/repositories/sqliteComboRepository.ts";

interface ExpectedPersistenceError extends Error {
  code: string;
  retryable: boolean;
  operation?: string;
}

interface ExpectedOperationalBackend {
  readonly state: string;
  initialize(): Promise<void>;
  readiness(): Promise<{ ready: boolean; state: string; reason?: string }>;
  close(): Promise<void>;
  classifyError(error: unknown, operation?: string): ExpectedPersistenceError;
  migrationLocks: {
    acquire(request: { ownerId: string; timeoutMs: number }): Promise<{
      ownerId: string;
      release(): Promise<void>;
    }>;
    close(): void;
  };
}

function currentBackend(): ExpectedOperationalBackend | undefined {
  return (
    routingConfigRepositories as typeof routingConfigRepositories & {
      backend?: ExpectedOperationalBackend;
    }
  ).backend;
}

test("routing persistence exposes an asynchronous operational lifecycle", () => {
  const backend = currentBackend();

  assert.ok(backend, "expected the routing persistence composition to expose its backend");
  assert.equal(backend.state, "new");
  assert.equal(typeof backend.initialize, "function");
  assert.equal(typeof backend.readiness, "function");
  assert.equal(typeof backend.close, "function");
});

test("routing persistence exposes portable classified errors", () => {
  const backend = currentBackend();

  assert.ok(backend, "expected the routing persistence composition to expose its backend");
  const raw = Object.assign(new Error("busy"), { code: "SQLITE_BUSY" });
  const classified = backend.classifyError(raw, "write");
  assert.equal(classified.code, "unavailable");
  assert.equal(classified.retryable, true);
  assert.equal(classified.operation, "write");
  assert.equal(classified.cause, raw);
});

test("routing persistence exposes process-local migration-lock ownership", () => {
  const backend = currentBackend();

  assert.ok(backend, "expected the routing persistence composition to expose its backend");
  assert.equal(typeof backend.migrationLocks.acquire, "function");
  assert.equal(typeof backend.migrationLocks.close, "function");
});

test("SQLite rejects opaque transaction contexts instead of silently ignoring them", async () => {
  const context = { backendId: "foreign", transactionId: "opaque" };
  const contextAwareList = sqliteComboRepository.list as (
    limit?: number,
    offset?: number,
    transactionContext?: object
  ) => Promise<unknown>;

  await assert.rejects(
    contextAwareList(undefined, undefined, context),
    (error: unknown) =>
      error instanceof Error && "code" in error && (error as { code?: unknown }).code === "conflict"
  );
});
