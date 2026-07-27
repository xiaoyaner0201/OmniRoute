import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import { PersistenceError } from "../../../../src/domain/persistence/errors.ts";
import { registerComboRepositoryConformance } from "../../../helpers/persistence/comboRepositoryConformance.ts";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-repository-contract-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const core = await import("../../../../src/lib/db/core.ts");
const { sqliteComboRepository } =
  await import("../../../../src/lib/db/repositories/sqliteComboRepository.ts");
const { sqliteModelComboMappingRepository } =
  await import("../../../../src/lib/db/repositories/sqliteModelComboMappingRepository.ts");
const { routingConfigRepositories } =
  await import("../../../../src/lib/db/repositories/routingConfigRepositories.ts");
const { sqliteOperationalBackend } =
  await import("../../../../src/lib/db/backends/sqliteOperationalBackend.ts");
const combosDb = await import("../../../../src/lib/db/combos.ts");

async function resetStorage(): Promise<void> {
  core.resetDbInstance();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

registerComboRepositoryConformance({
  name: "sqlite",
  async createHarness() {
    return {
      combos: sqliteComboRepository,
      mappings: sqliteModelComboMappingRepository,
      reset: resetStorage,
      async corruptComboPayload(comboId: string): Promise<void> {
        core.getDbInstance().prepare("UPDATE combos SET data = ? WHERE id = ?").run("", comboId);
      },
    };
  },
});

test("legacy combo count facade remains synchronous", async () => {
  await resetStorage();

  assert.equal(typeof combosDb.getCombosCount(), "number");
  assert.equal(combosDb.getCombosCount(), 0);
  await sqliteComboRepository.create({ name: "Counted", models: [] });
  assert.equal(combosDb.getCombosCount(), 1);
});

test("routing repository composition exposes the SQLite operational boundary", () => {
  assert.equal(routingConfigRepositories.backend, sqliteOperationalBackend);
  assert.equal(routingConfigRepositories.combos, sqliteComboRepository);
  assert.equal(routingConfigRepositories.modelComboMappings, sqliteModelComboMappingRepository);
});

test("SQLite repositories reject transaction contexts they cannot safely own", async () => {
  await resetStorage();
  const foreignContext = { backendId: "controlled", transactionId: "foreign" };

  await assert.rejects(
    sqliteComboRepository.list(undefined, undefined, foreignContext),
    (error: unknown) => error instanceof PersistenceError && error.code === "conflict"
  );
  await assert.rejects(
    sqliteModelComboMappingRepository.list(undefined, foreignContext),
    (error: unknown) => error instanceof PersistenceError && error.code === "conflict"
  );
});

test.after(() => {
  core.resetDbInstance();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});
