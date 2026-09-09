import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-api-key-usage-limits-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.API_KEY_SECRET = process.env.API_KEY_SECRET || "usage-limit-test-secret";

const core = await import("../../src/lib/db/core.ts");
const localDb = await import("../../src/lib/localDb.ts");
const apiKeysDb = await import("../../src/lib/db/apiKeys.ts");
const usageHistory = await import("../../src/lib/usage/usageHistory.ts");
const usageLimits = await import("../../src/lib/usage/apiKeyUsageLimits.ts");

const NOW = Date.parse("2026-06-19T20:00:00.000Z");

async function resetStorage() {
  core.resetDbInstance();
  apiKeysDb.resetApiKeyState();
  usageHistory.clearPendingRequests();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

test.beforeEach(async () => {
  await resetStorage();
});

test.after(() => {
  core.resetDbInstance();
  apiKeysDb.resetApiKeyState();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

test("Shanghai weekly quota window resets at Monday 00:00", () => {
  assert.deepEqual(usageLimits.getShanghaiWeeklyWindow(Date.parse("2026-09-09T13:00:00.000Z")), {
    windowStartIso: "2026-09-06T16:00:00.000Z",
    resetAtIso: "2026-09-13T16:00:00.000Z",
  });
  assert.deepEqual(usageLimits.getShanghaiWeeklyWindow(Date.parse("2026-09-06T15:59:59.999Z")), {
    windowStartIso: "2026-08-30T16:00:00.000Z",
    resetAtIso: "2026-09-06T16:00:00.000Z",
  });
  assert.deepEqual(usageLimits.getShanghaiWeeklyWindow(Date.parse("2026-09-06T16:00:00.000Z")), {
    windowStartIso: "2026-09-06T16:00:00.000Z",
    resetAtIso: "2026-09-13T16:00:00.000Z",
  });
});

test("API key USD usage limits persist and default off", async () => {
  const created = await apiKeysDb.createApiKey("Usage Limit Key", "machine-limit-01");

  let metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.equal(metadata?.usageLimitEnabled, false);
  assert.equal(metadata?.dailyUsageLimitUsd, null);
  assert.equal(metadata?.weeklyUsageLimitUsd, null);

  await apiKeysDb.updateApiKeyPermissions(created.id, {
    usageLimitEnabled: true,
    dailyUsageLimitUsd: 10.5,
    weeklyUsageLimitUsd: 50,
  });
  apiKeysDb.clearApiKeyCaches();

  metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.equal(metadata?.usageLimitEnabled, true);
  assert.equal(metadata?.dailyUsageLimitUsd, 10.5);
  assert.equal(metadata?.weeklyUsageLimitUsd, 50);
});

test("getApiKeyUsageLimitStatus uses the Shanghai Monday window instead of provider resetAt", async () => {
  await localDb.updatePricing({
    claude: {
      "claude-opus-4-8": {
        input: 1,
        cached: 1,
        output: 1,
        reasoning: 1,
        cache_creation: 1,
      },
    },
  });

  const created = await apiKeysDb.createApiKey("Metered Key", "machine-limit-02");
  await apiKeysDb.updateApiKeyPermissions(created.id, {
    usageLimitEnabled: true,
    dailyUsageLimitUsd: 10,
    weeklyUsageLimitUsd: 20,
  });

  await usageHistory.saveRequestUsage({
    provider: "claude",
    model: "claude-opus-4-8",
    apiKeyId: created.id,
    apiKeyName: "Metered Key",
    tokens: { input: 2_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-19T12:00:00.000Z",
  });
  await usageHistory.saveRequestUsage({
    provider: "claude",
    model: "claude-opus-4-8",
    apiKeyId: created.id,
    apiKeyName: "Metered Key",
    tokens: { input: 3_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-18T21:00:00.000Z",
  });
  await usageHistory.saveRequestUsage({
    provider: "claude",
    model: "claude-opus-4-8",
    apiKeyId: created.id,
    apiKeyName: "Metered Key",
    tokens: { input: 7_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-18T12:00:00.000Z",
  });

  const metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.ok(metadata);

  const status = await usageLimits.getApiKeyUsageLimitStatus(metadata, { now: () => NOW });

  assert.equal(status.enabled, true);
  assert.equal(status.dailySpentUsd, 2);
  assert.equal(status.weeklySpentUsd, 12);
  assert.equal(status.dailyLimitUsd, 10);
  assert.equal(status.weeklyLimitUsd, 20);
  assert.equal(status.dailyResetAtIso, "2026-06-20T03:00:00.000Z");
  assert.equal(status.weeklyWindowStartIso, "2026-06-14T16:00:00.000Z");
  assert.equal(status.weeklyResetAtIso, "2026-06-21T16:00:00.000Z");
  assert.equal(status.dailyExceeded, false);
  assert.equal(status.weeklyExceeded, false);
});

test("getApiKeyUsageLimitStatus cuts weekly USD spend at Shanghai Monday 00:00", async () => {
  await localDb.updatePricing({
    claude: {
      "claude-opus-4-8": {
        input: 1,
        cached: 1,
        output: 1,
        reasoning: 1,
        cache_creation: 1,
      },
    },
  });

  const created = await apiKeysDb.createApiKey("Reset Cut Key", "machine-limit-reset");
  await apiKeysDb.updateApiKeyPermissions(created.id, {
    usageLimitEnabled: true,
    dailyUsageLimitUsd: 10,
    weeklyUsageLimitUsd: 20,
  });

  await usageHistory.saveRequestUsage({
    provider: "claude",
    model: "claude-opus-4-8",
    apiKeyId: created.id,
    apiKeyName: "Reset Cut Key",
    tokens: { input: 7_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-14T15:30:00.000Z",
  });
  await usageHistory.saveRequestUsage({
    provider: "claude",
    model: "claude-opus-4-8",
    apiKeyId: created.id,
    apiKeyName: "Reset Cut Key",
    tokens: { input: 2_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-14T16:30:00.000Z",
  });

  const metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.ok(metadata);

  const status = await usageLimits.getApiKeyUsageLimitStatus(metadata, {
    now: () => Date.parse("2026-06-20T14:30:00.000Z"),
  });

  assert.equal(status.weeklyWindowStartIso, "2026-06-14T16:00:00.000Z");
  assert.equal(status.weeklyResetAtIso, "2026-06-21T16:00:00.000Z");
  assert.equal(status.weeklySpentUsd, 2);
});

test("unlimited windows do not require pricing for unrelated historical usage", async () => {
  const unlimited = await apiKeysDb.createApiKey("Unlimited Key", "machine-limit-unlimited");
  await apiKeysDb.updateApiKeyPermissions(unlimited.id, {
    usageLimitEnabled: true,
    dailyUsageLimitUsd: null,
    weeklyUsageLimitUsd: null,
  });
  const dailyOnly = await apiKeysDb.createApiKey("Daily Only Key", "machine-limit-daily-only");
  await apiKeysDb.updateApiKeyPermissions(dailyOnly.id, {
    usageLimitEnabled: true,
    dailyUsageLimitUsd: 10,
    weeklyUsageLimitUsd: null,
  });
  for (const key of [unlimited, dailyOnly]) {
    await usageHistory.saveRequestUsage({
      provider: "unknown-provider",
      model: "unknown-model-without-pricing",
      apiKeyId: key.id,
      apiKeyName: key.name,
      tokens: { input: 1_000_000, output: 0 },
      success: true,
      timestamp: "2026-06-15T12:00:00.000Z",
    });
  }

  const unlimitedMetadata = await apiKeysDb.getApiKeyMetadata(unlimited.key);
  const dailyOnlyMetadata = await apiKeysDb.getApiKeyMetadata(dailyOnly.key);
  assert.ok(unlimitedMetadata);
  assert.ok(dailyOnlyMetadata);
  const unlimitedStatus = await usageLimits.getApiKeyUsageLimitStatus(unlimitedMetadata, {
    now: () => NOW,
  });
  const dailyOnlyStatus = await usageLimits.getApiKeyUsageLimitStatus(dailyOnlyMetadata, {
    now: () => NOW,
  });
  assert.equal(unlimitedStatus.dailySpentUsd, 0);
  assert.equal(unlimitedStatus.weeklySpentUsd, 0);
  assert.equal(dailyOnlyStatus.dailySpentUsd, 0);
  assert.equal(dailyOnlyStatus.weeklySpentUsd, 0);
});

test("quota status fails closed when successful usage has no pricing", async () => {
  const created = await apiKeysDb.createApiKey(
    "Unknown Pricing Key",
    "machine-limit-unknown-pricing"
  );
  await apiKeysDb.updateApiKeyPermissions(created.id, {
    usageLimitEnabled: true,
    weeklyUsageLimitUsd: 20,
  });
  await usageHistory.saveRequestUsage({
    provider: "unknown-provider",
    model: "unknown-model-without-pricing",
    apiKeyId: created.id,
    apiKeyName: "Unknown Pricing Key",
    tokens: { input: 1_000_000, output: 0 },
    success: true,
    timestamp: "2026-06-19T12:00:00.000Z",
  });

  const metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.ok(metadata);
  await assert.rejects(
    usageLimits.getApiKeyUsageLimitStatus(metadata, { now: () => NOW }),
    /api_key_usage_pricing_unavailable/
  );
});

test("getApiKeyUsageLimitDetails returns cumulative Beijing-day waterline without future points", async () => {
  await localDb.updatePricing({
    claude: {
      "claude-opus-4-8": {
        input: 1,
        cached: 1,
        output: 1,
        reasoning: 1,
        cache_creation: 1,
      },
    },
  });

  const created = await apiKeysDb.createApiKey("Waterline Key", "machine-limit-waterline");
  await apiKeysDb.updateApiKeyPermissions(created.id, {
    usageLimitEnabled: true,
    weeklyUsageLimitUsd: 20,
  });
  for (const [timestamp, input] of [
    ["2026-06-15T02:00:00.000Z", 1_000_000],
    ["2026-06-16T02:00:00.000Z", 2_000_000],
    ["2026-06-18T02:00:00.000Z", 5_000_000],
  ] as const) {
    await usageHistory.saveRequestUsage({
      provider: "claude",
      model: "claude-opus-4-8",
      apiKeyId: created.id,
      apiKeyName: "Waterline Key",
      tokens: { input, output: 0 },
      success: true,
      timestamp,
    });
  }

  const metadata = await apiKeysDb.getApiKeyMetadata(created.key);
  assert.ok(metadata);
  const details = await usageLimits.getApiKeyUsageLimitDetails(metadata, {
    now: () => Date.parse("2026-06-17T12:00:00.000Z"),
  });

  assert.equal(details.weeklySpentUsd, 3);
  assert.deepEqual(details.weeklyDaily, [
    { date: "2026-06-15", spentUsd: 1, cumulativeSpentUsd: 1, remainingUsd: 19 },
    { date: "2026-06-16", spentUsd: 2, cumulativeSpentUsd: 3, remainingUsd: 17 },
    { date: "2026-06-17", spentUsd: 0, cumulativeSpentUsd: 3, remainingUsd: 17 },
  ]);
});

test("buildApiKeyUsageLimitText returns API-key quota spend percentage and reset lines", async () => {
  const text = usageLimits.buildApiKeyUsageLimitText(
    {
      enabled: true,
      dailyLimitUsd: 10,
      weeklyLimitUsd: 50,
      dailySpentUsd: 2,
      weeklySpentUsd: 5.25,
      dailyWindowStartIso: "2026-06-19T03:00:00.000Z",
      dailyResetAtIso: "2026-06-20T03:00:00.000Z",
      weeklyWindowStartIso: "2026-06-12T20:00:00.000Z",
      weeklyResetAtIso: "2026-06-25T20:00:00.000Z",
      dailyExceeded: false,
      weeklyExceeded: false,
    },
    Date.parse("2026-06-19T20:00:00.000Z")
  );

  assert.equal(
    text,
    [
      "Daily quota",
      "$10.00",
      "Daily spent",
      "$2.00",
      "Daily used",
      "20%",
      "Resets in 7h 0m",
      "",
      "Weekly quota",
      "$50.00",
      "Weekly spent",
      "$5.25",
      "Weekly used",
      "11%",
      "Resets in 6d 0h 0m",
    ].join("\n")
  );
});

test("buildApiKeyUsageLimitPercentText returns remaining percentages only", () => {
  const text = usageLimits.buildApiKeyUsageLimitPercentText(
    {
      enabled: true,
      dailyLimitUsd: 10,
      weeklyLimitUsd: 50,
      dailySpentUsd: 2,
      weeklySpentUsd: 5.25,
      dailyWindowStartIso: "2026-06-19T03:00:00.000Z",
      dailyResetAtIso: "2026-06-20T03:00:00.000Z",
      weeklyWindowStartIso: "2026-06-12T20:00:00.000Z",
      weeklyResetAtIso: "2026-06-25T20:00:00.000Z",
      dailyExceeded: false,
      weeklyExceeded: false,
    },
    Date.parse("2026-06-19T20:00:00.000Z")
  );

  assert.equal(
    text,
    ["Daily", "80% left", "⏱ reset in 7h 0m", "", "Weekly", "90% left", "⏱ reset in 6d 0h 0m"].join(
      "\n"
    )
  );
});

test("buildApiKeyUsageLimitRejection includes over-quota percentage and reset hint", async () => {
  const response = usageLimits.buildApiKeyUsageLimitRejection(
    new Request("http://localhost/v1/messages", {
      headers: { "anthropic-version": "2023-06-01" },
    }),
    {
      enabled: true,
      dailyLimitUsd: 10,
      weeklyLimitUsd: 1,
      dailySpentUsd: 0.25,
      weeklySpentUsd: 1.09,
      dailyWindowStartIso: "2026-06-19T03:00:00.000Z",
      dailyResetAtIso: "2026-06-20T03:00:00.000Z",
      weeklyWindowStartIso: "2026-06-12T20:00:00.000Z",
      weeklyResetAtIso: "2026-06-25T20:00:00.000Z",
      dailyExceeded: false,
      weeklyExceeded: true,
    },
    Date.parse("2026-06-19T20:00:00.000Z")
  );

  assert.equal(response.status, 400);
  const body = (await response.json()) as { error: { message: string } };
  assert.equal(
    body.error.message,
    "This API key reached its weekly USD usage quota ($1.09 of $1.00, 109%). Resets in 6d 0h 0m. Choose another allowed model after reset."
  );
});

test("buildApiKeyUsageLimitRejection can hide USD amounts for client-facing policy errors", async () => {
  const response = usageLimits.buildApiKeyUsageLimitRejection(
    new Request("http://localhost/v1/messages", {
      headers: { "anthropic-version": "2023-06-01" },
    }),
    {
      enabled: true,
      dailyLimitUsd: 10,
      weeklyLimitUsd: 1,
      dailySpentUsd: 0.25,
      weeklySpentUsd: 1.09,
      dailyWindowStartIso: "2026-06-19T03:00:00.000Z",
      dailyResetAtIso: "2026-06-20T03:00:00.000Z",
      weeklyWindowStartIso: "2026-06-12T20:00:00.000Z",
      weeklyResetAtIso: "2026-06-25T20:00:00.000Z",
      dailyExceeded: false,
      weeklyExceeded: true,
    },
    Date.parse("2026-06-19T20:00:00.000Z"),
    { showUsd: false }
  );

  assert.equal(response.status, 400);
  const body = (await response.json()) as { error: { message: string } };
  assert.equal(
    body.error.message,
    "This API key reached its weekly usage quota (109%). Resets in 6d 0h 0m. Choose another allowed model after reset."
  );
});

test("buildApiKeyUsageLimitRejection uses 400 so Claude Code does not trigger login", () => {
  const response = usageLimits.buildApiKeyUsageLimitRejection(
    new Request("http://localhost/v1/messages", {
      headers: { "anthropic-version": "2023-06-01" },
    }),
    {
      enabled: true,
      dailyLimitUsd: 10,
      weeklyLimitUsd: 50,
      dailySpentUsd: 12,
      weeklySpentUsd: 20,
      dailyWindowStartIso: "2026-06-19T03:00:00.000Z",
      dailyResetAtIso: "2026-06-20T03:00:00.000Z",
      weeklyWindowStartIso: "2026-06-12T20:00:00.000Z",
      weeklyResetAtIso: "2026-06-19T20:00:00.000Z",
      dailyExceeded: true,
      weeklyExceeded: false,
    }
  );

  assert.equal(response.status, 400);
});
