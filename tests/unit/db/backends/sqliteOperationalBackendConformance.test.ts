import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { registerPersistenceBackendConformance } from "../../../helpers/persistence/backendConformance.ts";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-backend-contract-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const { createSqliteOperationalBackend } =
  await import("../../../../src/lib/db/backends/sqliteOperationalBackend.ts");

registerPersistenceBackendConformance([
  {
    name: "sqlite-operational-adapter",
    async create() {
      return createSqliteOperationalBackend({ id: "sqlite-test" });
    },
  },
]);

test.after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});
