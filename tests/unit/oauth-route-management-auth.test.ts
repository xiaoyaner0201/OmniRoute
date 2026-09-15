/**
 * The dynamic OAuth route mints and persists provider credentials, so it must
 * require management authority — the same bar the per-provider import routes got
 * in GHSA-mg76-rhpx-gvw3 / GHSA-gxv4-955v-v6cm.
 *
 * `/api/oauth/` is PUBLIC-classified, so the central authz pipeline does not
 * authenticate it and the route's own guard is the only gate. The old guard used
 * `isAuthenticated()`, which on a PUBLIC path accepts any valid inference API key
 * and cannot read a scoped CLI access token at all. These tests pin the guard to
 * `requireManagementAuth` and lock the boundaries that must NOT widen.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { NextRequest } from "next/server";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omni-oauth-route-auth-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.API_KEY_SECRET = process.env.API_KEY_SECRET || "oauth-route-auth-secret";
process.env.OMNIROUTE_DISABLE_REDIS_AUTH_CACHE = "1";

const core = await import("../../src/lib/db/core.ts");
const apiKeysDb = await import("../../src/lib/db/apiKeys.ts");
const accessTokensDb = await import("../../src/lib/db/accessTokens.ts");
const settingsDb = await import("../../src/lib/db/settings.ts");
const route = await import("../../src/app/api/oauth/[provider]/[action]/route.ts");

test.before(async () => {
  process.env.JWT_SECRET = "oauth-route-auth-jwt";
  process.env.INITIAL_PASSWORD = "oauth-route-auth-pass";
  await settingsDb.updateSettings({ requireLogin: true });
});

test.after(() => {
  core.resetDbInstance();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  delete process.env.JWT_SECRET;
  delete process.env.INITIAL_PASSWORD;
});

const REDIRECT = "http://localhost:1455/auth/callback";

function authorize(credential?: string, options: { inUrl?: boolean } = {}) {
  const base =
    `http://localhost/api/oauth/codex/authorize?redirect_uri=${encodeURIComponent(REDIRECT)}` +
    (options.inUrl && credential ? `&key=${encodeURIComponent(credential)}` : "");
  return route.GET(
    new Request(base, {
      headers: credential && !options.inUrl ? { authorization: `Bearer ${credential}` } : {},
    }) as unknown as NextRequest,
    { params: Promise.resolve({ provider: "codex", action: "authorize" }) }
  );
}

function exchange(credential?: string) {
  return route.POST(
    new Request("http://localhost/api/oauth/codex/exchange", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(credential ? { authorization: `Bearer ${credential}` } : {}),
      },
      body: JSON.stringify({ code: "authorization-code", codeVerifier: "verifier", state: "s" }),
    }) as unknown as NextRequest,
    { params: Promise.resolve({ provider: "codex", action: "exchange" }) }
  );
}

test("an admin CLI access token may start the OAuth flow", async () => {
  const { secret } = accessTokensDb.createAccessToken({ name: "ops-admin", scope: "admin" });
  const response = await authorize(secret);
  assert.equal(response.status, 200);
  const body = (await response.json()) as { authUrl?: string };
  assert.equal(typeof body.authUrl, "string");
  assert.equal(new URL(body.authUrl as string).host, "auth.openai.com");
});

test("a manage-scope API key and an authenticated caller keep working", async () => {
  const manage = await apiKeysDb.createApiKey("manage-key", "machine-manage", ["manage"]);
  assert.equal((await authorize(manage.key)).status, 200);
});

test("lower-privileged credentials cannot start or complete an OAuth flow", async () => {
  const read = accessTokensDb.createAccessToken({ name: "reader", scope: "read" });
  const write = accessTokensDb.createAccessToken({ name: "writer", scope: "write" });
  const inference = await apiKeysDb.createApiKey("client", "machine-client", []);

  // `/api/oauth` is an ADMIN_SCOPE_PREFIXES surface for every method.
  assert.equal((await authorize(read.secret)).status, 403, "read token rejected");
  assert.equal((await authorize(write.secret)).status, 403, "write token rejected");
  assert.equal((await exchange(write.secret)).status, 403, "write token rejected on exchange");
  // The old guard accepted this key, because a PUBLIC path admits any valid key.
  assert.equal((await authorize(inference.key)).status, 403, "inference key rejected");
  assert.equal((await exchange(inference.key)).status, 403, "inference key rejected on exchange");
});

test("absent, unknown, revoked and expired credentials are refused", async () => {
  assert.equal((await authorize()).status, 401, "no credential");
  assert.equal((await exchange()).status, 401, "no credential on exchange");
  assert.equal((await authorize("oma_live_unknown-token")).status, 401, "unknown access token");

  const revoked = accessTokensDb.createAccessToken({ name: "revoked", scope: "admin" });
  accessTokensDb.revokeAccessToken(revoked.record.id);
  assert.equal((await authorize(revoked.secret)).status, 401, "revoked token");

  const expired = accessTokensDb.createAccessToken({
    name: "expired",
    scope: "admin",
    expiresAt: new Date(Date.now() - 60_000).toISOString(),
  });
  assert.equal((await authorize(expired.secret)).status, 401, "expired token");
});

test("a credential carried in the URL never authenticates the route", async () => {
  const admin = accessTokensDb.createAccessToken({ name: "url-admin", scope: "admin" });
  const manage = await apiKeysDb.createApiKey("url-manage", "machine-url", ["manage"]);
  assert.equal((await authorize(admin.secret, { inUrl: true })).status, 401, "token in URL");
  assert.equal((await authorize(manage.key, { inUrl: true })).status, 401, "key in URL");
});

test("permanently retired and keychain-only providers answer before the auth gate", async () => {
  const retired = await route.GET(
    new Request("http://localhost/api/oauth/devin-cli/authorize") as unknown as NextRequest,
    { params: Promise.resolve({ provider: "devin-cli", action: "authorize" }) }
  );
  assert.equal(retired.status, 410, "retired PKCE provider stays 410 for anonymous callers");

  const keychainOnly = await route.GET(
    new Request("http://localhost/api/oauth/zed/authorize") as unknown as NextRequest,
    { params: Promise.resolve({ provider: "zed", action: "authorize" }) }
  );
  assert.equal(keychainOnly.status, 400, "keychain-import-only provider stays 400");
});
