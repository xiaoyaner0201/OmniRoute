import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeCostFromPricing } from "@/lib/usage/costCalculator";

/**
 * Regression: OpenAI chat/completions reports cache hits nested under
 * `prompt_tokens_details.cached_tokens`, not at the top level.
 * computeCostFromPricing only read top-level keys, so those tokens fell through
 * to the full input rate — inflating the cost ledger on cache-heavy traffic,
 * while callers that pre-flatten usage through tokenAccounting avoid that mismatch.
 */
describe("computeCostFromPricing — nested cache token discovery", () => {
  // Synthetic prices per million tokens: input 10, cache read 1, output 50.
  const pricing = { input: 10, cached: 1, output: 50 };
  const close = (actual: number, expected: number, eps = 1e-9) =>
    assert.ok(Math.abs(actual - expected) < eps, `expected ${expected}, got ${actual}`);

  it("applies the cached rate to prompt_tokens_details.cached_tokens", () => {
    const cost = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
      prompt_tokens_details: { cached_tokens: 99_000 },
    } as never);
    // 1,000 fresh @ $10/M + 99,000 cached @ $1/M
    close(cost, 0.01 + 0.099);
  });

  it("matches the top-level spelling it already supported", () => {
    const nested = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
      prompt_tokens_details: { cached_tokens: 99_000 },
    } as never);
    const topLevel = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
      cached_tokens: 99_000,
    });
    close(nested, topLevel);
  });

  it("reads input_tokens_details as well (Responses-style nesting)", () => {
    const cost = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
      input_tokens_details: { cached_tokens: 99_000 },
    } as never);
    close(cost, 0.109);
  });

  it("does not double-count when both spellings are present", () => {
    const cost = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
      cached_tokens: 99_000,
      prompt_tokens_details: { cached_tokens: 99_000 },
    } as never);
    close(cost, 0.109);
  });

  it("still prices uncached traffic at the full input rate", () => {
    const cost = computeCostFromPricing(pricing, {
      prompt_tokens: 100_000,
      completion_tokens: 0,
    });
    close(cost, 1.0);
  });

  it("keeps nested cache_creation_tokens on the cache-creation rate", () => {
    const cost = computeCostFromPricing(
      { input: 10, cached: 1, output: 50, cache_creation: 12.5 },
      {
        prompt_tokens: 100_000,
        completion_tokens: 0,
        prompt_tokens_details: { cache_creation_tokens: 20_000 },
      } as never
    );
    // 80,000 fresh @ $10/M + 20,000 creation @ $12.5/M
    close(cost, 0.8 + 0.25);
  });
});
