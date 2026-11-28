/**
 * Opt-in off-thread total for GET /api/conversations.
 *
 * The list total (`countMultiTurnConversations`) walks every conversation's turn nodes. On a
 * multi-GB storage.sqlite whose pages are not in the page cache, one run reads the whole
 * conversation_turn_nodes index from disk and holds the event loop for tens of seconds, and
 * the Conversations page polls it every few seconds. With
 * OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD enabled the count runs in a worker thread on its
 * own read-only connection: concurrent requests share one run (single flight), a result is
 * reused for OMNIROUTE_CONVERSATION_COUNT_CACHE_MS, and once it expires the previous total is
 * returned while one refresh runs. The page rows still come from the main connection; that
 * query reads only the requested page.
 *
 * Off (the default) keeps the existing synchronous path. Whenever the worker cannot give an
 * answer (non better-sqlite3 driver, in-memory DB, worker failure, timeout) the request falls
 * back to that same synchronous count, so enabling the flag never returns a different total
 * than today; it can only move the wait off the event loop.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";

import {
  countMultiTurnConversations,
  listMultiTurnConversationPage,
  listMultiTurnConversations,
  type MultiTurnConversationRow,
} from "./agenticConversations";
import { getDbInstance } from "./core";

const DEFAULT_CACHE_MS = 300_000;
const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_TIMEOUT_MS = 600_000;
const WORKER_BUSY_TIMEOUT_MS = 5_000;
const WORKER_FILE = "conversationCountWorker";

export interface ConversationCountOffThreadConfig {
  enabled: boolean;
  cacheMs: number;
  timeoutMs: number;
}

function parseNonNegativeInt(raw: string | undefined, fallback: number, max: number): number {
  const value = raw?.trim() ?? "";
  if (!/^\d+$/.test(value)) return fallback;
  return Math.min(max, Number(value));
}

export function parseConversationCountOffThreadEnv(
  env: NodeJS.ProcessEnv = process.env
): ConversationCountOffThreadConfig {
  const flag = env.OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD?.trim().toLowerCase() ?? "";
  return {
    enabled: flag === "true" || flag === "1",
    cacheMs: parseNonNegativeInt(
      env.OMNIROUTE_CONVERSATION_COUNT_CACHE_MS,
      DEFAULT_CACHE_MS,
      3_600_000
    ),
    timeoutMs: Math.max(
      1,
      parseNonNegativeInt(
        env.OMNIROUTE_CONVERSATION_COUNT_TIMEOUT_MS,
        DEFAULT_TIMEOUT_MS,
        MAX_TIMEOUT_MS
      )
    ),
  };
}

type WorkerReply = { ok: true; total: number } | { ok: false; error: string };
type CountRunner = (filePath: string, timeoutMs: number) => Promise<number>;

function fileExistsAtRuntime(candidate: string): boolean {
  // Explicit packaging copies the worker; keep the probe opaque to Next's build tracer.
  return Reflect.apply(fs.existsSync, fs, [candidate]) as boolean;
}

export function resolveConversationCountWorker(
  context: {
    moduleDir?: string | null;
    cwd?: string;
    entryFile?: string | null;
    fileExists?: (p: string) => boolean;
  } = {}
): string {
  let moduleDir = context.moduleDir;
  if (moduleDir === undefined) {
    try {
      moduleDir = path.dirname(fileURLToPath(import.meta.url));
    } catch {
      moduleDir = null;
    }
  }
  const cwd = context.cwd ?? process.cwd();
  const entryFile = context.entryFile === undefined ? process.argv[1] : context.entryFile;
  const exists = context.fileExists ?? fileExistsAtRuntime;
  const rel = path.join("src", "lib", "db");
  const candidates = [
    moduleDir ? path.join(moduleDir, `${WORKER_FILE}.js`) : null,
    entryFile ? path.join(path.dirname(path.resolve(entryFile)), rel, `${WORKER_FILE}.js`) : null,
    path.resolve(cwd, rel, `${WORKER_FILE}.js`),
    moduleDir ? path.join(moduleDir, `${WORKER_FILE}.ts`) : null,
    path.resolve(cwd, rel, `${WORKER_FILE}.ts`),
  ].filter((candidate): candidate is string => candidate !== null);
  const found = candidates.find((candidate) => exists(candidate));
  if (!found) throw new Error("Conversation count worker is missing");
  return found;
}

function runCountInWorker(filePath: string, timeoutMs: number): Promise<number> {
  const workerFile = resolveConversationCountWorker();
  return new Promise((resolve, reject) => {
    // Reflect.construct keeps Next/Turbopack from tracing the runtime-selected worker path.
    const worker = Reflect.construct(Worker, [pathToFileURL(workerFile)]) as Worker;
    let settled = false;
    const finish = (error: Error | null, total?: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate().catch(() => {});
      if (error) reject(error);
      else resolve(total as number);
    };
    const timer = setTimeout(
      () => finish(new Error("Conversation count worker timed out")),
      timeoutMs
    );
    timer.unref?.();
    worker.once("message", (reply: WorkerReply) => {
      if (reply?.ok === true && Number.isFinite(reply.total)) finish(null, reply.total);
      else finish(new Error("Conversation count worker failed"));
    });
    worker.once("error", () => finish(new Error("Conversation count worker failed")));
    worker.once("exit", () =>
      finish(new Error("Conversation count worker exited without a result"))
    );
    worker.postMessage({ filePath, busyTimeoutMs: WORKER_BUSY_TIMEOUT_MS });
  });
}

let runner: CountRunner = runCountInWorker;
let inflight: Promise<number> | null = null;
let cached: { total: number; expiresAt: number } | null = null;
let lastTotal: number | null = null;

/** Test seam: replace the worker runner (null restores it) and clear shared state. */
export function __setConversationCountRunnerForTests(next: CountRunner | null): void {
  runner = next ?? runCountInWorker;
  inflight = null;
  cached = null;
  lastTotal = null;
}

function workerTarget(): string | null {
  const db = getDbInstance();
  if (db.driver !== "better-sqlite3" || !db.name || db.name === ":memory:") return null;
  return db.name;
}

async function countOffThread(config: ConversationCountOffThreadConfig): Promise<number> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.total;
  const filePath = workerTarget();
  if (!filePath) return countMultiTurnConversations();
  if (!inflight) {
    inflight = runner(filePath, config.timeoutMs)
      .then((total) => {
        cached = config.cacheMs > 0 ? { total, expiresAt: Date.now() + config.cacheMs } : null;
        lastTotal = config.cacheMs > 0 ? total : null;
        return total;
      })
      .finally(() => {
        inflight = null;
      });
  }
  // An expired total is still shown while one refresh runs; the count only labels the list.
  if (lastTotal !== null) {
    inflight.catch(() => {});
    return lastTotal;
  }
  try {
    return await inflight;
  } catch {
    // Same answer as with the flag off; failures are not cached.
    return countMultiTurnConversations();
  }
}

/**
 * GET /api/conversations data. Flag off: exactly listMultiTurnConversations(). Flag on: the
 * same rows, with the total counted off the event loop.
 */
export async function listMultiTurnConversationsForRoute(
  filter: { limit?: number; offset?: number } = {},
  config: ConversationCountOffThreadConfig = parseConversationCountOffThreadEnv()
): Promise<{ rows: MultiTurnConversationRow[]; total: number }> {
  if (!config.enabled) return listMultiTurnConversations(filter);
  const total = await countOffThread(config);
  return { total, rows: listMultiTurnConversationPage(filter) };
}
