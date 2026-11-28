/**
 * GET /api/conversations: the list total can be counted off the event loop.
 *
 * The total walks every conversation's turn nodes. On a large storage.sqlite with a cold page
 * cache that blocked the event loop for tens of seconds per poll of the Conversations page.
 * With OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD the count runs in a worker thread on a
 * read-only connection, shares one run between concurrent callers, is reused for a short
 * window, and falls back to the synchronous count when the worker cannot answer. Off (the
 * default) is the existing synchronous path.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-conv-count-off-thread-"));
process.env.DATA_DIR = TEST_DATA_DIR;
delete process.env.OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD;

const core = await import("../../../src/lib/db/core.ts");
const agentic = await import("../../../src/lib/db/agenticConversations.ts");
const offThread = await import("../../../src/lib/db/conversationCountOffThread.ts");
const route = await import("../../../src/app/api/conversations/route.ts");

test.after(() => {
  offThread.__setConversationCountRunnerForTests(null);
  delete process.env.OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD;
  core.resetDbInstance();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

test.beforeEach(() => {
  offThread.__setConversationCountRunnerForTests(null);
  delete process.env.OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD;
});

function seed(id: string, nodes: number) {
  agentic.createAgenticConversation({ id, apiKeyId: null, fingerprintHash: "fp" });
  agentic.insertConversationTurnNodes(
    id,
    null,
    Array.from({ length: nodes }, (_, i) => ({
      id: `${id}-n${i}`,
      parentId: i === 0 ? null : `${id}-n${i - 1}`,
      role: i % 2 ? "assistant" : "user",
      contentHash: `${id}-h${i}`,
    }))
  );
}

seed("conv_count_a", 2);
seed("conv_count_b", 3);
seed("conv_count_single", 1);

async function getList(): Promise<{ total: number; ids: string[] }> {
  const res = await route.GET(new Request("http://localhost/api/conversations?limit=50"));
  assert.equal(res.status, 200);
  const body = (await res.json()) as { total: number; conversations: Array<{ id: string }> };
  return { total: body.total, ids: body.conversations.map((c) => c.id) };
}

const enabled = { enabled: true, cacheMs: 30_000, timeoutMs: 5_000 };

test("flag off: the route returns the synchronous total and the same rows", async () => {
  const expected = agentic.listMultiTurnConversations({ limit: 50 });
  const { total, ids } = await getList();
  assert.equal(total, expected.total);
  assert.equal(total, 2);
  assert.deepEqual(
    ids,
    expected.rows.map((r) => r.id)
  );
});

test("flag on: the total is counted by the worker on the database file, not on the event loop", async () => {
  process.env.OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD = "true";
  const calls: string[] = [];
  let release: (total: number) => void = () => {};
  offThread.__setConversationCountRunnerForTests((filePath) => {
    calls.push(filePath);
    return new Promise<number>((resolve) => {
      release = resolve;
    });
  });

  const pending = getList();
  // The event loop keeps turning while the count is outstanding.
  let ticks = 0;
  await new Promise<void>((resolve) => {
    const t = setInterval(() => {
      ticks++;
      if (ticks >= 3) {
        clearInterval(t);
        resolve();
      }
    }, 1);
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0], core.getDbInstance().name);
  release(2);
  const { total, ids } = await pending;
  assert.equal(total, 2);
  assert.deepEqual(ids.sort(), ["conv_count_a", "conv_count_b"]);
});

test("flag on: concurrent requests share one count and a fresh result is reused", async () => {
  let runs = 0;
  let release: (total: number) => void = () => {};
  offThread.__setConversationCountRunnerForTests(() => {
    runs++;
    return new Promise<number>((resolve) => {
      release = resolve;
    });
  });
  const first = offThread.listMultiTurnConversationsForRoute({ limit: 50 }, enabled);
  const second = offThread.listMultiTurnConversationsForRoute({ limit: 50 }, enabled);
  await new Promise((r) => setImmediate(r));
  release(2);
  assert.equal((await first).total, 2);
  assert.equal((await second).total, 2);
  assert.equal(
    (await offThread.listMultiTurnConversationsForRoute({ limit: 50 }, enabled)).total,
    2
  );
  assert.equal(runs, 1);
});

test("flag on: a worker failure falls back to the synchronous total and is not cached", async () => {
  let runs = 0;
  offThread.__setConversationCountRunnerForTests(async () => {
    runs++;
    throw new Error("worker unavailable");
  });
  assert.equal(
    (await offThread.listMultiTurnConversationsForRoute({ limit: 50 }, enabled)).total,
    2
  );
  assert.equal(
    (await offThread.listMultiTurnConversationsForRoute({ limit: 50 }, enabled)).total,
    2
  );
  assert.equal(runs, 2);
});

test("the real worker counts on its own read-only connection", async () => {
  offThread.__setConversationCountRunnerForTests(null);
  const result = await offThread.listMultiTurnConversationsForRoute(
    { limit: 50 },
    { enabled: true, cacheMs: 0, timeoutMs: 30_000 }
  );
  assert.equal(result.total, agentic.countMultiTurnConversations());
  assert.equal(result.total, 2);
});

test("env parsing: off unless explicitly enabled; bad numbers fall back to defaults", () => {
  assert.deepEqual(offThread.parseConversationCountOffThreadEnv({}), {
    enabled: false,
    cacheMs: 30_000,
    timeoutMs: 120_000,
  });
  const on = offThread.parseConversationCountOffThreadEnv({
    OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD: " TRUE ",
    OMNIROUTE_CONVERSATION_COUNT_CACHE_MS: "0",
    OMNIROUTE_CONVERSATION_COUNT_TIMEOUT_MS: "abc",
  });
  assert.deepEqual(on, { enabled: true, cacheMs: 0, timeoutMs: 120_000 });
  assert.equal(
    offThread.parseConversationCountOffThreadEnv({ OMNIROUTE_CONVERSATION_COUNT_OFF_THREAD: "yes" })
      .enabled,
    false
  );
});
