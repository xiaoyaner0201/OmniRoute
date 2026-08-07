import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import { PersistenceError } from "../../../../src/domain/persistence/errors.ts";
import type { PersistenceTransactionContext } from "../../../../src/domain/persistence/transactionContext.ts";
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
    // Test-only portable transaction journal. It validates repository context
    // propagation without enabling SQLite's intentionally unsupported async
    // production transaction executor.
    let activeContext: PersistenceTransactionContext | null = null;
    let stagedCombos: Record<string, unknown>[] = [];
    let stagedMappings: Array<{
      pattern: string;
      comboId: string;
      priority?: number;
      enabled?: boolean;
      description?: string;
    }> = [];
    const observedContexts: PersistenceTransactionContext[] = [];

    function requireActiveContext(context: PersistenceTransactionContext): void {
      if (context !== activeContext) {
        throw new PersistenceError("conflict", {
          retryable: false,
          operation: "transaction_context",
        });
      }
      observedContexts.push(context);
    }

    const combos = {
      ...sqliteComboRepository,
      async create(data: Record<string, unknown>, context?: PersistenceTransactionContext) {
        if (!context) return sqliteComboRepository.create(data);
        requireActiveContext(context);
        const combo = {
          ...data,
          id: typeof data.id === "string" ? data.id : randomUUID(),
        };
        stagedCombos.push(combo);
        return combo;
      },
    };
    const mappings = {
      ...sqliteModelComboMappingRepository,
      async create(data: (typeof stagedMappings)[number], context?: PersistenceTransactionContext) {
        if (!context) return sqliteModelComboMappingRepository.create(data);
        requireActiveContext(context);
        stagedMappings.push(data);
        const now = new Date().toISOString();
        return {
          id: randomUUID(),
          pattern: data.pattern,
          comboId: data.comboId,
          priority: data.priority ?? 0,
          enabled: data.enabled !== false,
          description: data.description ?? "",
          createdAt: now,
          updatedAt: now,
        };
      },
    };

    return {
      combos,
      mappings,
      async reset() {
        activeContext = null;
        stagedCombos = [];
        stagedMappings = [];
        observedContexts.length = 0;
        await resetStorage();
      },
      async corruptComboPayload(comboId: string): Promise<void> {
        core.getDbInstance().prepare("UPDATE combos SET data = ? WHERE id = ?").run("", comboId);
      },
      async runInTransaction<T>(
        work: (context: PersistenceTransactionContext) => Promise<T>
      ): Promise<T> {
        const context = Object.freeze({
          backendId: "controlled-repository-harness",
          transactionId: randomUUID(),
        });
        activeContext = context;
        stagedCombos = [];
        stagedMappings = [];
        try {
          const result = await work(context);
          for (const combo of stagedCombos) await sqliteComboRepository.create(combo);
          for (const mapping of stagedMappings) {
            await sqliteModelComboMappingRepository.create(mapping);
          }
          return result;
        } finally {
          activeContext = null;
          stagedCombos = [];
          stagedMappings = [];
        }
      },
      observedTransactionContexts() {
        return observedContexts;
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

test("SQLite repository operations reject transaction contexts they cannot safely own", async () => {
  await resetStorage();
  const foreignContext = { backendId: "controlled", transactionId: "foreign" };
  const operations = [
    () => sqliteComboRepository.list(undefined, undefined, foreignContext),
    () => sqliteComboRepository.count(foreignContext),
    () => sqliteComboRepository.findById("id", foreignContext),
    () => sqliteComboRepository.findByName("name", foreignContext),
    () => sqliteComboRepository.findByNameInsensitive("name", foreignContext),
    () => sqliteComboRepository.create({ name: "name" }, foreignContext),
    () => sqliteComboRepository.update("id", { name: "name" }, foreignContext),
    () => sqliteComboRepository.reorder(["id"], foreignContext),
    () => sqliteComboRepository.deleteById("id", foreignContext),
    () => sqliteModelComboMappingRepository.list(undefined, foreignContext),
    () => sqliteModelComboMappingRepository.findById("id", foreignContext),
    () =>
      sqliteModelComboMappingRepository.create({ pattern: "*", comboId: "combo" }, foreignContext),
    () => sqliteModelComboMappingRepository.update("id", { pattern: "openai/*" }, foreignContext),
    () => sqliteModelComboMappingRepository.deleteById("id", foreignContext),
    () => sqliteModelComboMappingRepository.resolveForModel("model", foreignContext),
  ];

  for (const operation of operations) {
    await assert.rejects(
      operation(),
      (error: unknown) => error instanceof PersistenceError && error.code === "conflict"
    );
  }
});

test.after(() => {
  core.resetDbInstance();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});
