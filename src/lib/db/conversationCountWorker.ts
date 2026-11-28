/**
 * worker_threads entry for the conversation list total (see conversationCountOffThread.ts).
 *
 * Opens its own read-only connection, runs the one count query and replies. WAL lets this
 * reader run while the main connection keeps writing, so the walk over conversation_turn_nodes
 * no longer holds the main event loop. Imports stay native-loadable (node builtins, the driver
 * package and a leaf module with an explicit .ts extension) because dev and test runs start
 * this file without a TypeScript loader.
 */
import { createRequire } from "node:module";
import { parentPort } from "node:worker_threads";

import { MULTI_TURN_CONVERSATION_COUNT_SQL } from "./multiTurnConversationSql.ts";

type CountRequest = { filePath: string; busyTimeoutMs: number };
type CountReply = { ok: true; total: number } | { ok: false; error: string };

type ReadOnlyDatabase = {
  prepare(sql: string): { get(): unknown };
  close(): void;
};
type DatabaseConstructor = new (
  filePath: string,
  options: { readonly: boolean; fileMustExist: boolean; timeout: number }
) => ReadOnlyDatabase;

function countOnce(request: CountRequest): CountReply {
  let db: ReadOnlyDatabase | null = null;
  try {
    const Database = createRequire(import.meta.url)("better-sqlite3") as DatabaseConstructor;
    db = new Database(request.filePath, {
      readonly: true,
      fileMustExist: true,
      timeout: request.busyTimeoutMs,
    });
    const row = db.prepare(MULTI_TURN_CONVERSATION_COUNT_SQL).get() as { c?: unknown } | undefined;
    return { ok: true, total: Number(row?.c ?? 0) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.name : "Error" };
  } finally {
    try {
      db?.close();
    } catch {
      /* The reply already carries the result or the original failure. */
    }
  }
}

parentPort?.once("message", (request: CountRequest) => {
  parentPort?.postMessage(countOnce(request));
});
