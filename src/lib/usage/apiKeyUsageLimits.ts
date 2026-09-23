import { getDbInstance } from "@/lib/db/core";
import { calculateCostDetailed } from "./costCalculator";
import { buildErrorBody, sanitizeErrorMessage } from "@omniroute/open-sse/utils/error.ts";

const FORTALEZA_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const SHANGHAI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface ApiKeyUsageLimitMetadata {
  id: string;
  allowedConnections?: string[] | null;
  preferredProvider?: string | null;
  usageLimitEnabled?: boolean;
  dailyUsageLimitUsd?: number | null;
  weeklyUsageLimitUsd?: number | null;
}

export interface ApiKeyUsageLimitStatus {
  enabled: boolean;
  dailyLimitUsd: number | null;
  weeklyLimitUsd: number | null;
  dailySpentUsd: number;
  weeklySpentUsd: number;
  dailyWindowStartIso: string;
  dailyResetAtIso: string;
  weeklyWindowStartIso: string;
  weeklyResetAtIso: string | null;
  dailyExceeded: boolean;
  weeklyExceeded: boolean;
  /**
   * True when at least one usage_history row in the daily/weekly window could not
   * be priced at all (no pricing row for the provider+model — e.g. a routing
   * alias such as `auto`, #12341). Enforcement fails closed on this: an unpriced
   * row forces `*Exceeded = true` rather than silently contributing $0 to spend,
   * since a real cost may be hiding behind the alias.
   */
  dailyHasUnpricedUsage?: boolean;
  weeklyHasUnpricedUsage?: boolean;
}

export interface ApiKeyUsageLimitDailyPoint {
  date: string;
  spentUsd: number;
  cumulativeSpentUsd: number;
  remainingUsd: number;
}

export interface ApiKeyUsageLimitDetails extends ApiKeyUsageLimitStatus {
  weeklyDaily: ApiKeyUsageLimitDailyPoint[];
}

export interface ApiKeyUsageLimitDeps {
  now?: () => number;
}

interface UsageCostRow {
  provider: string | null;
  model: string | null;
  serviceTier: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  cacheReadTokens: number | null;
  cacheCreationTokens: number | null;
  reasoningTokens: number | null;
}

interface UsageCostByDayRow extends UsageCostRow {
  usageDate: string | null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeLimitUsd(value: unknown): number | null {
  const numeric = toNumber(value);
  return numeric > 0 ? numeric : null;
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not configured";
  return `$${value.toFixed(2)}`;
}

function getUsagePercent(spentUsd: number, limitUsd: number | null): number | null {
  if (limitUsd === null || !Number.isFinite(limitUsd) || limitUsd <= 0) return null;
  return (spentUsd / limitUsd) * 100;
}

function formatUsagePercent(percent: number | null): string {
  if (percent === null || !Number.isFinite(percent)) return "Unavailable";
  return `${Math.round(percent)}%`;
}

function formatLeftPercent(percent: number | null): string {
  if (percent === null || !Number.isFinite(percent)) return "Unavailable";
  return `${Math.round(100 - clampPercent(percent))}% left`;
}

function formatResetIn(resetAt: string | null, now = Date.now()): string {
  if (!resetAt) return "unknown";
  const resetMs = Date.parse(resetAt);
  if (!Number.isFinite(resetMs)) return "unknown";

  const deltaMs = resetMs - now;
  if (deltaMs <= 0) return "now";

  const minuteMs = 60_000;
  const totalMinutes = Math.max(1, Math.ceil(deltaMs / minuteMs));
  const dayMinutes = 24 * 60;
  const days = Math.floor(totalMinutes / dayMinutes);
  const hours = Math.floor((totalMinutes % dayMinutes) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getFortalezaDayStartIso(nowMs = Date.now()): string {
  const fortalezaLocal = new Date(nowMs - FORTALEZA_UTC_OFFSET_MS);
  return new Date(
    Date.UTC(
      fortalezaLocal.getUTCFullYear(),
      fortalezaLocal.getUTCMonth(),
      fortalezaLocal.getUTCDate(),
      3,
      0,
      0,
      0
    )
  ).toISOString();
}

export function getFortalezaDayResetIso(nowMs = Date.now()): string {
  return new Date(Date.parse(getFortalezaDayStartIso(nowMs)) + DAY_MS).toISOString();
}

export function getShanghaiWeeklyWindow(nowMs = Date.now()): {
  windowStartIso: string;
  resetAtIso: string;
} {
  // API-key USD limits are an organization policy, so their window is independent
  // from upstream provider subscription resets: Monday 00:00 Asia/Shanghai.
  const local = new Date(nowMs + SHANGHAI_UTC_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const windowStartMs =
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() - daysSinceMonday,
      0,
      0,
      0,
      0
    ) - SHANGHAI_UTC_OFFSET_MS;

  return {
    windowStartIso: new Date(windowStartMs).toISOString(),
    resetAtIso: new Date(windowStartMs + WEEK_MS).toISOString(),
  };
}

interface ApiKeyUsdSpend {
  totalUsd: number;
  /** True when at least one (provider, model) group had no pricing row at all (#12341). */
  hasUnpricedUsage: boolean;
}

async function getApiKeyUsdSpendSince(
  apiKeyId: string,
  sinceIso: string,
  untilIso: string
): Promise<ApiKeyUsdSpend> {
  if (!apiKeyId) return { totalUsd: 0, hasUnpricedUsage: false };
  const db = getDbInstance();
  const rows = db
    .prepare(
      `
      SELECT
        LOWER(provider) as provider,
        LOWER(model) as model,
        COALESCE(NULLIF(service_tier, ''), 'standard') as serviceTier,
        COALESCE(SUM(tokens_input), 0) as promptTokens,
        COALESCE(SUM(tokens_output), 0) as completionTokens,
        COALESCE(SUM(tokens_cache_read), 0) as cacheReadTokens,
        COALESCE(SUM(tokens_cache_creation), 0) as cacheCreationTokens,
        COALESCE(SUM(tokens_reasoning), 0) as reasoningTokens
      FROM usage_history
      WHERE api_key_id = @apiKeyId
        AND timestamp >= @sinceIso
        AND timestamp < @untilIso
        AND success = 1
      GROUP BY LOWER(provider), LOWER(model), serviceTier
    `
    )
    .all({ apiKeyId, sinceIso, untilIso }) as UsageCostRow[];

  let total = 0;
  let hasUnpricedUsage = false;
  for (const row of rows) {
    const provider = typeof row.provider === "string" ? row.provider : "";
    const model = typeof row.model === "string" ? row.model : "";
    if (!provider || !model) continue;

    const { costUsd, priced } = await calculateCostDetailed(
      provider,
      model,
      {
        input: toNumber(row.promptTokens),
        output: toNumber(row.completionTokens),
        cacheRead: toNumber(row.cacheReadTokens),
        cacheCreation: toNumber(row.cacheCreationTokens),
        reasoning: toNumber(row.reasoningTokens),
      },
      {
        provider,
        model,
        serviceTier: row.serviceTier || "standard",
      }
    );
    if (!priced) {
      hasUnpricedUsage = true;
      console.warn(
        `[apiKeyUsageLimits] no pricing found for ${provider}/${model} — usage counted as $0 ` +
          "and enforcement is failing closed for this window (#12341)"
      );
    }
    total += costUsd;
  }

  return { totalUsd: roundUsd(total), hasUnpricedUsage };
}

export async function getApiKeyUsageLimitStatus(
  metadata: ApiKeyUsageLimitMetadata,
  deps: ApiKeyUsageLimitDeps = {}
): Promise<ApiKeyUsageLimitStatus> {
  const now = deps.now?.() ?? Date.now();
  const dailyWindowStartIso = getFortalezaDayStartIso(now);
  const dailyResetAtIso = getFortalezaDayResetIso(now);
  const weeklyWindow = getShanghaiWeeklyWindow(now);
  const weeklyResetAtIso = weeklyWindow.resetAtIso;
  const weeklyWindowStartIso = weeklyWindow.windowStartIso;
  const dailyLimitUsd = normalizeLimitUsd(metadata.dailyUsageLimitUsd);
  const weeklyLimitUsd = normalizeLimitUsd(metadata.weeklyUsageLimitUsd);
  const enabled = metadata.usageLimitEnabled === true;
  const untilIso = new Date(now + 1).toISOString();

  const [dailySpend, weeklySpend] = await Promise.all([
    getApiKeyUsdSpendSince(metadata.id, dailyWindowStartIso, untilIso),
    getApiKeyUsdSpendSince(metadata.id, weeklyWindowStartIso, untilIso),
  ]);
  const dailySpentUsd = dailySpend.totalUsd;
  const weeklySpentUsd = weeklySpend.totalUsd;

  // Fail closed (#12341): a window with a configured limit that also contains
  // usage which could not be priced at all (e.g. a provider's `auto` routing
  // alias with no catalog price) must not let that usage silently pass the cap
  // as an invisible $0 — treat the limit as exceeded rather than trust an
  // undercounted spend total. A window with no configured limit was never
  // enforced, so unpriced usage there is only logged, not blocking.
  const dailyExceeded =
    enabled &&
    dailyLimitUsd !== null &&
    (dailySpentUsd >= dailyLimitUsd || dailySpend.hasUnpricedUsage);
  const weeklyExceeded =
    enabled &&
    weeklyLimitUsd !== null &&
    (weeklySpentUsd >= weeklyLimitUsd || weeklySpend.hasUnpricedUsage);

  return {
    enabled,
    dailyLimitUsd,
    weeklyLimitUsd,
    dailySpentUsd,
    weeklySpentUsd,
    dailyWindowStartIso,
    dailyResetAtIso,
    weeklyWindowStartIso,
    weeklyResetAtIso,
    dailyExceeded,
    weeklyExceeded,
    dailyHasUnpricedUsage: dailySpend.hasUnpricedUsage,
    weeklyHasUnpricedUsage: weeklySpend.hasUnpricedUsage,
  };
}

async function getApiKeyUsdSpendByShanghaiDay(
  apiKeyId: string,
  sinceIso: string,
  untilIso: string
): Promise<Map<string, number>> {
  if (!apiKeyId) return new Map();
  const rows = getDbInstance()
    .prepare(
      `
      SELECT
        strftime('%Y-%m-%d', datetime(timestamp, '+8 hours')) as usageDate,
        LOWER(provider) as provider,
        LOWER(model) as model,
        COALESCE(NULLIF(service_tier, ''), 'standard') as serviceTier,
        COALESCE(SUM(tokens_input), 0) as promptTokens,
        COALESCE(SUM(tokens_output), 0) as completionTokens,
        COALESCE(SUM(tokens_cache_read), 0) as cacheReadTokens,
        COALESCE(SUM(tokens_cache_creation), 0) as cacheCreationTokens,
        COALESCE(SUM(tokens_reasoning), 0) as reasoningTokens
      FROM usage_history
      WHERE api_key_id = @apiKeyId
        AND timestamp >= @sinceIso
        AND timestamp < @untilIso
        AND success = 1
      GROUP BY usageDate, LOWER(provider), LOWER(model), serviceTier
    `
    )
    .all({ apiKeyId, sinceIso, untilIso }) as UsageCostByDayRow[];

  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!row.usageDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.usageDate)) continue;
    const provider = typeof row.provider === "string" ? row.provider : "";
    const model = typeof row.model === "string" ? row.model : "";
    if (!provider || !model) continue;

    const { costUsd } = await calculateCostDetailed(
      provider,
      model,
      {
        input: toNumber(row.promptTokens),
        output: toNumber(row.completionTokens),
        cacheRead: toNumber(row.cacheReadTokens),
        cacheCreation: toNumber(row.cacheCreationTokens),
        reasoning: toNumber(row.reasoningTokens),
      },
      {
        provider,
        model,
        serviceTier: row.serviceTier || "standard",
      }
    );
    totals.set(row.usageDate, (totals.get(row.usageDate) ?? 0) + costUsd);
  }
  return totals;
}

export async function getApiKeyUsageLimitDetails(
  metadata: ApiKeyUsageLimitMetadata,
  deps: ApiKeyUsageLimitDeps = {}
): Promise<ApiKeyUsageLimitDetails> {
  const now = deps.now?.() ?? Date.now();
  const status = await getApiKeyUsageLimitStatus(metadata, { ...deps, now: () => now });
  if (!status.enabled || status.weeklyLimitUsd === null) {
    return { ...status, weeklyDaily: [] };
  }

  const spendByDate = await getApiKeyUsdSpendByShanghaiDay(
    metadata.id,
    status.weeklyWindowStartIso,
    new Date(now + 1).toISOString()
  );
  const startMs = Date.parse(status.weeklyWindowStartIso);
  const resetMs = Date.parse(status.weeklyResetAtIso ?? "");
  const lastPointMs = Number.isFinite(resetMs) ? Math.min(now, resetMs - 1) : now;
  let cumulative = 0;
  const weeklyDaily: ApiKeyUsageLimitDailyPoint[] = [];

  for (let pointMs = startMs; pointMs <= lastPointMs; pointMs += DAY_MS) {
    const date = new Date(pointMs + SHANGHAI_UTC_OFFSET_MS).toISOString().slice(0, 10);
    const spent = spendByDate.get(date) ?? 0;
    cumulative += spent;
    weeklyDaily.push({
      date,
      spentUsd: roundUsd(spent),
      cumulativeSpentUsd: roundUsd(cumulative),
      remainingUsd: roundUsd(Math.max(status.weeklyLimitUsd - cumulative, 0)),
    });
  }

  return { ...status, weeklyDaily };
}

export function buildApiKeyUsageLimitText(
  status: ApiKeyUsageLimitStatus,
  now = Date.now()
): string {
  return [
    "Daily quota",
    formatUsd(status.dailyLimitUsd),
    "Daily spent",
    formatUsd(status.dailySpentUsd),
    "Daily used",
    formatUsagePercent(getUsagePercent(status.dailySpentUsd, status.dailyLimitUsd)),
    `Resets in ${formatResetIn(status.dailyResetAtIso, now)}`,
    "",
    "Weekly quota",
    formatUsd(status.weeklyLimitUsd),
    "Weekly spent",
    formatUsd(status.weeklySpentUsd),
    "Weekly used",
    formatUsagePercent(getUsagePercent(status.weeklySpentUsd, status.weeklyLimitUsd)),
    `Resets in ${formatResetIn(status.weeklyResetAtIso, now)}`,
  ].join("\n");
}

export function buildApiKeyUsageLimitPercentText(
  status: ApiKeyUsageLimitStatus,
  now = Date.now()
): string {
  return [
    "Daily",
    formatLeftPercent(getUsagePercent(status.dailySpentUsd, status.dailyLimitUsd)),
    `⏱ reset in ${formatResetIn(status.dailyResetAtIso, now)}`,
    "",
    "Weekly",
    formatLeftPercent(getUsagePercent(status.weeklySpentUsd, status.weeklyLimitUsd)),
    `⏱ reset in ${formatResetIn(status.weeklyResetAtIso, now)}`,
  ].join("\n");
}

function buildUsageLimitExceededMessage(
  status: ApiKeyUsageLimitStatus,
  now = Date.now(),
  options: { showUsd?: boolean } = {}
): string {
  const showUsd = options.showUsd !== false;
  if (status.dailyExceeded && status.dailyLimitUsd !== null) {
    const percent = formatUsagePercent(getUsagePercent(status.dailySpentUsd, status.dailyLimitUsd));
    if (!showUsd) {
      return `This API key reached its daily usage quota (${percent}). Resets in ${formatResetIn(status.dailyResetAtIso, now)}. Choose another allowed model after reset.`;
    }
    return `This API key reached its daily USD usage quota (${formatUsd(status.dailySpentUsd)} of ${formatUsd(status.dailyLimitUsd)}, ${percent}). Resets in ${formatResetIn(status.dailyResetAtIso, now)}. Choose another allowed model after reset.`;
  }
  if (status.weeklyExceeded && status.weeklyLimitUsd !== null) {
    const percent = formatUsagePercent(
      getUsagePercent(status.weeklySpentUsd, status.weeklyLimitUsd)
    );
    if (!showUsd) {
      return `This API key reached its weekly usage quota (${percent}). Resets in ${formatResetIn(status.weeklyResetAtIso, now)}. Choose another allowed model after reset.`;
    }
    return `This API key reached its weekly USD usage quota (${formatUsd(status.weeklySpentUsd)} of ${formatUsd(status.weeklyLimitUsd)}, ${percent}). Resets in ${formatResetIn(status.weeklyResetAtIso, now)}. Choose another allowed model after reset.`;
  }
  return showUsd
    ? "This API key reached its USD usage quota. Choose another allowed model or wait for quota reset."
    : "This API key reached its usage quota. Choose another allowed model or wait for quota reset.";
}

function isAnthropicMessagesRequest(request: Request): boolean {
  if (request.headers.has("anthropic-version")) return true;
  try {
    return new URL(request.url).pathname.endsWith("/v1/messages");
  } catch {
    return false;
  }
}

export function buildApiKeyUsageLimitRejection(
  request: Request,
  status: ApiKeyUsageLimitStatus,
  now = Date.now(),
  options: { showUsd?: boolean } = {}
): Response {
  const message = sanitizeErrorMessage(buildUsageLimitExceededMessage(status, now, options));
  if (isAnthropicMessagesRequest(request)) {
    return new Response(
      JSON.stringify({
        type: "error",
        error: {
          type: "invalid_request_error",
          message,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(buildErrorBody(400, message)), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function buildApiKeyUsageLimitPolicyRejection(
  request: Request,
  metadata: ApiKeyUsageLimitMetadata
): Promise<Response | null> {
  const status = await getApiKeyUsageLimitStatus(metadata);
  if (!status.enabled || (!status.dailyExceeded && !status.weeklyExceeded)) return null;
  return buildApiKeyUsageLimitRejection(request, status, Date.now(), {
    showUsd: false,
  });
}
