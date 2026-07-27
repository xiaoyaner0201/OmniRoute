import assert from "node:assert/strict";
import test from "node:test";

import { PersistenceError, isPersistenceError } from "../../../../src/domain/persistence/errors.ts";
import { classifySqlitePersistenceError } from "../../../../src/lib/db/backends/sqliteOperationalBackend.ts";

test("persistence errors expose portable classification without losing the cause", () => {
  const cause = Object.assign(new Error("driver detail"), { code: "SQLITE_BUSY" });
  const error = new PersistenceError("unavailable", {
    retryable: true,
    operation: "initialize",
    cause,
  });

  assert.equal(error.name, "PersistenceError");
  assert.equal(error.message, "Persistence operation failed");
  assert.equal(error.code, "unavailable");
  assert.equal(error.retryable, true);
  assert.equal(error.operation, "initialize");
  assert.equal(error.cause, cause);
  assert.equal(isPersistenceError(error), true);
  assert.equal(isPersistenceError(cause), false);
});

test("SQLite failures map to portable codes and retryability", () => {
  const cases = [
    {
      raw: Object.assign(new Error("unique failed"), { code: "SQLITE_CONSTRAINT_UNIQUE" }),
      code: "constraint_unique",
      retryable: false,
    },
    {
      raw: Object.assign(new Error("foreign key failed"), {
        code: "SQLITE_CONSTRAINT_FOREIGNKEY",
      }),
      code: "constraint_foreign_key",
      retryable: false,
    },
    {
      raw: Object.assign(new Error("database is busy"), { code: "SQLITE_BUSY" }),
      code: "unavailable",
      retryable: true,
    },
    {
      raw: Object.assign(new Error("snapshot is busy"), { code: "SQLITE_BUSY_SNAPSHOT" }),
      code: "unavailable",
      retryable: true,
    },
    {
      raw: Object.assign(new Error("shared cache is locked"), {
        code: "SQLITE_LOCKED_SHAREDCACHE",
      }),
      code: "unavailable",
      retryable: true,
    },
    {
      raw: new Error("Database closed"),
      code: "closed",
      retryable: false,
    },
    {
      raw: new Error("The database connection is not open"),
      code: "closed",
      retryable: false,
    },
  ] as const;

  for (const expected of cases) {
    const classified = classifySqlitePersistenceError(expected.raw, "write");
    assert.equal(classified.code, expected.code);
    assert.equal(classified.retryable, expected.retryable);
    assert.equal(classified.operation, "write");
    assert.equal(classified.cause, expected.raw);
  }
});
