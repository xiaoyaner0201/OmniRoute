import { createSqliteOperationalBackend } from "../../../../src/lib/db/backends/sqliteOperationalBackend.ts";
import { registerPersistenceBackendConformance } from "../../../helpers/persistence/backendConformance.ts";

registerPersistenceBackendConformance([
  {
    name: "sqlite-operational-adapter",
    async create() {
      return createSqliteOperationalBackend({
        id: "sqlite-test",
        initialize: async () => undefined,
        isReady: () => true,
        close: () => undefined,
      });
    },
  },
]);
