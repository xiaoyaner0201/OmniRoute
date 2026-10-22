# OmniRoute repository scope and implementation map

**Proposal for discussion.** Source: `0482755c5e4faeeb23736b9e56ec293d84809efa`. Chinese edition: [repository-scope-map.zh-CN.md](repository-scope-map.zh-CN.md).

## Coverage

- Parsed 14,339 tracked script-source files from the frozen Git tree; 6,200 remain after test/fixture exclusions. AST discovery produced 346 persistence/boundary candidates; a complementary SQLite-specific lexical pass added 55. All **401 unique candidate files** have a primary capability assignment. They form **29 business capability areas plus 4 support/non-domain boundary areas**, not 401 repositories or 33 predetermined PRs.
- Corpus: src, open-sse (including vendored source), bin, electron, packages, @omniroute, contrib, docker, config, examples, scripts and exported root JS/TS configuration files. Tests/fixtures are excluded from production counts; docs, static assets and non-script configuration are outside this source count. 209 migration SQL files are inventoried separately. All 14,339 parsed source blobs matched the pinned Git objects.
- The map covers discovered SQLite-coupled surfaces and their related state boundaries; it does not claim an exhaustive audit of every in-memory, Redis-only or file-only feature. Counts are per path. Table-name candidates and importer counts are discovery signals, not semantic SQL/table/call counts. CommonJS, computed imports and external consumers need per-slice checks.
- Complete path mapping: [repository-scope-files.en.csv](repository-scope-files.en.csv); summary data: [inventory-summary.json](inventory-summary.json). Only source paths, links and planning classifications are published; unverified diagnostic hypotheses are not reported as bugs. Tests are an existing-behavior baseline, not a refactor result.

## Capability map

Each row may become several later PRs. A mixed file can have secondary owners; the CSV preserves them.

| ID | Capability | Proposed node | Primary files | Boundary |
|---|---|---|---:|---|
| R01 | Playground presets | S1 | 1 | Preset CRUD and serialization; not API authorization or request execution. |
| R02 | Prompt templates and small content registries | S2 (verify usage) | 1 | Stored templates/content metadata; verify real call paths before treating unused modules as early wins. |
| R03 | Model overrides and candidate policy | S2 | 8 | Manual/automatic overrides, provenance and invalidation; model capability resolution remains business logic. |
| R04 | Combo definitions and model mappings | EXISTING | 5 | Existing repositories; follow retained sync/settings paths and cross-domain cleanup explicitly. |
| R05 | Routing, interception and parameter rules | S2 | 5 | Rule persistence and reference checks; routing evaluation and policy decisions remain services. |
| R06 | Product settings and feature policies | S2 | 12 | Split key_value by business namespace; no public generic SQL/KV escape hatch; distinguish local settings. |
| R07 | Model catalog, aliases, discovery and pricing | S2 | 16 | Stored catalog state and namespace ownership; external sync and resolution orchestrate repositories. |
| R08 | Provider connections and credentials | S3 | 6 | Credential encryption, dedup, deletion, updates and owner-controlled refresh; no credentials in portable DTOs by accident. |
| R09 | Provider nodes, plans and limits | S3 | 4 | Definitions distinct from live usage, health, backoff and hot counters. |
| R10 | API keys, groups and permission bindings | S3 | 7 | Durable permission/key state and explicit atomic changes; auth decisions and revocation propagation separately verified. |
| R11 | Access credentials, sync tokens and registrations | S3 | 7 | Secret lifecycle, hashing/encryption, expiry and identity scopes; not generic mutable KV. |
| R12 | Proxy configuration, subscriptions and assignments | S3 | 15 | Persist registry/relationships/secrets; isolate OS config writes, probes and external subscription refresh. |
| R13 | Quota pool/group/allocation/schedule definitions | S3 | 4 | Durable policy and membership; separates live counters and scheduled execution ownership. |
| R14 | Quota, token and spend accounting | S4 | 9 | Atomic spend/limits/reset/idempotency; advisory counters and hard limits have different failure policies. |
| R15 | Affinity, continuation and account runtime state | S4 | 16 | Feature-specific shared stores; coordinate #16472/#16569, distinguish reconstructible affinity from required continuation evidence. |
| R16 | Exclusive leases, execution fences and job ownership | S4 | 7 | Coordination contracts require compare/update, ownership, expiry/recovery; not ordinary CRUD repositories. |
| R17 | Usage, cost records and read models | S5 | 21 | Append/dedupe/retention and query projections; accounting guarantees separate from best-effort telemetry. |
| R18 | Call/detail/proxy logs and export cursors | S5 | 16 | Record/artifact relationship, retention, pagination and stable cursor semantics; shared row does not share local artifacts. |
| R19 | Audit and compliance records | S5 | 4 | Acknowledged durable evidence, tenant/no-log/deletion policies and source linkage; not disposable cache. |
| R20 | Compression policies and telemetry | S2/S5 | 7 | Split configuration/pipeline definitions from cache metrics, analytics and execution telemetry. |
| R21 | Tasks, batches, conversations and file metadata | S5 | 7 | State machines, transitions and linked artifacts; worker/job ownership handled by coordination boundary. |
| R22 | Webhooks and log-export destinations/delivery records | S3/S5 | 6 | Separate encrypted destination definitions from cursors/retries/outbox semantics and actual network delivery. |
| R23 | Extensions, skills, middleware and execution records | S5 | 6 | Registry/policy/history storage only; plugin execution and sandboxing are not repository methods. |
| R24 | Evaluation and assessment records | S5 | 2 | Suite/case/run provenance and results; execution/scoring remain domain services. |
| R25 | Memory documents and search/vector indexes | S6 | 8 | Document repository separate from Search/Vector capabilities; no FTS5/sqlite-vec syntax in generic contract. |
| R26 | Semantic/reasoning caches and metrics | S6 | 3 | CacheStore contracts with TTL/capacity/invalidation; distinct from durable control-plane repositories. |
| R27 | Gamification and community ledgers | S5 | 7 | Badges/invites/community definitions versus atomic XP/credit ledger and derived rankings. |
| R28 | Radar feeds and discovery snapshots | S2/S6 | 2 | Split configured preferences from recomputable external feed caches and local model state. |
| R29 | Bridge/integration and local-tool state | S3/LOCAL | 28 | Persist selected shared integration settings; keep host paths, installed applications and external credential import local. |
| B01 | Backend lifecycle and SQLite maintenance | B | 58 | Driver, schema/migrations, readiness, transaction facilities, backup/restore/WAL/VACUUM; not per-domain repositories. |
| H01 | Shared mapping, encryption and cache helpers | SUPPORT | 51 | Supporting dependency belongs beside its owning domain/backend; not one repository per helper. |
| L01 | Local/vendor database integration | LOCAL | 5 | Reads external app databases or local machine files; not Omni durable-state backend migration. |
| X01 | Non-persistence or tooling-only matches | EXCLUDE | 47 | Lexical false positives, UI prose, eval fixtures, build/check tools; document why excluded. |

## Dependency sketch

```text
S0 inventory → S1 simple pilot → accepted pattern → S2 / S3 / S5 / S6 as dependencies permit
                                        ↘ B: minimal operational contracts
S3 owning policies + B → S4 correctness-sensitive stores
accepted bounded repository + B subset → PG-A parity experiment
necessary S2/S3 + B + propagation/recovery evidence → PG-B shared control plane
validated import/rollback + enabled-feature S4/S5 guarantees → PG-C switching
```

# Implementation nodes and first-slice contract (proposal)

Source: `cheaper-inference/OmniRoute` at `0482755c5e4faeeb23736b9e56ec293d84809efa`.

## Node order and exits

- **S0 — Scope and characterization (this inventory).** Map the whole discovered SQLite-coupling surface to capability owners, separate repositories from coordination/cache/index/backend/local boundaries, identify existing work, and freeze the source. Exit: a file-to-scope map, proposed dependency nodes, explicit first slice and existing-behavior evidence. This is not maintainer approval.
- **S1 — One low-risk pilot, then another if useful.** Start with Playground presets. After that, consider the already-async auto-candidate preference store, with its routing isolation/default-fallback tests, as a separate slice. Do not select a module with no verified live path merely because it has few lines. Exit: real calls go through a business contract, SQLite behavior and external API responses are unchanged, legacy synchronous entry points are handled explicitly, conformance and facade tests run.
- **S2 — Configuration domains.** Model overrides/catalog/aliases/pricing, routing and parameter rules, namespaced product settings and compression definitions. Split by a coherent business operation, not the physical key_value table. Exit: cache invalidation and source precedence are preserved; cross-domain references and multi-write operations are explicit. Depends on S1's accepted pattern; slices can then run independently.
- **S3 — Identity and durable control plane.** Provider connections/nodes, API keys/groups, access/sync tokens, proxy definitions and quota definitions. Exit: credentials remain protected, identity/permission relationships and deletion effects are preserved, and CLI/MCP/standalone bypasses use the same boundary or a documented compatibility adapter. Depends on accepted repository pattern and any required B transaction primitives.
- **S4 — Correctness-sensitive shared state.** Spend/token counters, quota resets, affinity/continuation, account runtime state, exclusive leases, job claims and execution fences. Coordinate with #16472/#16569 rather than create a second affinity implementation. Exit: explicit ownership, atomicity, retry/idempotency, expiry/recovery and per-feature failure policy tests. Depends on the owning S3 policy domains and B primitives; not every counter requires the same consistency policy.
- **S5 — Records and product modules.** Usage/cost projections, call/detail/proxy logs, audit, exports/webhooks, tasks/batches/files, skills/plugins, evals and community ledgers. Exit: append/update/retention/deletion and artifact linkage are explicit, with transaction/ownership guarantees where the capability requires them. Can proceed alongside S2–S4 once its own dependencies are stable; not one monolithic telemetry repository.
- **S6 — Cache and search capabilities.** Memory documents versus FTS/vector indexes, semantic/reasoning caches, feed caches and derived read models. Exit: authoritative documents are separated from reconstructible indexes/caches, backend capabilities and unavailable/degraded behavior are explicit. Depends on the owning document/configuration domain, not on every S5 module.
- **B — Backend operational interface (cross-cutting, incremental).** Transaction contexts and classified outcomes first as demanded by real slices; readiness, migration ownership, capability discovery and backup/restore semantics before an external backend is offered. SQLite WAL/VACUUM/file recovery stays backend-specific. This is not a prerequisite to invent a giant framework before S1.
- **PG-A — Backend parity experiment.** After an accepted repository contract and the necessary B subset, run the same behavior suite against SQLite and PostgreSQL for one bounded slice. This proves a backend implementation, not deployment HA or full database switching.
- **PG-B — Coherent shared-control-plane milestone.** Require the necessary connections/keys/routing path from S2/S3, B migration/readiness, and measured configuration/revocation propagation, concurrent-write and replica/database recovery tests. Every enabled feature must state whether its state is shared, intentionally local or unsupported. Do not wait for unrelated optional modules merely for completeness, and do not silently omit an enabled capability.
- **PG-C — Operational switching and broader capabilities.** Validated import, backup/restore, rollback and stated durability policy before user-facing switching; OAuth refresh, hard spending caps, scheduled jobs and continuation require their corresponding S4/S5 guarantees. Database HA itself and ingress redundancy are deployment responsibilities, not consequences of a Repository interface.

S-numbers organize work; they are not release dates and not a rule that every earlier scope must finish before any later scope can start.

## First proposed slice: Playground presets

### Why this before reasoning routing

`src/lib/db/playgroundPresets.ts` has 179 physical lines in the frozen source, one table (`playground_presets`), five exported synchronous CRUD/list functions and two directly importing production route files. It has no provider credential encryption, routing-cache invalidation or cross-table references in the inspected module/schema. The DB rows can contain user-supplied prompts/parameters and remain subject to the existing access policy; "low risk" does not mean public data.

Its table is created in `src/lib/db/migrations/084_playground_presets.sql`. Existing comments/tests refer to migration 076; use the actual file, not that stale prose, as the schema evidence.

The two real entry points are:
- `src/app/api/playground/presets/route.ts` — list/create;
- `src/app/api/playground/presets/[id]/route.ts` — get/update/delete.

The initial issue's reasoning-routing candidate stays in S2: it also carries cross-domain reference validation and a versioned local cache. The inventory therefore changes the proposed starting point, not the long-term direction.

### Contract boundary

Repository operations: list with pagination/total, find by id, create, partial update, delete. Repository records preserve current field meanings, JSON normalization, IDs/timestamps and missing-row outcomes. Request validation, management/API-key authorization, HTTP status/error mapping and model execution stay outside. No ORM requirement, new database driver/configuration, schema migration or production deployment.

The existing facade is synchronous. A new portable interface should be Promise-capable, but the PR must not silently change legacy exports to Promise or fake synchronous access to a future network database. Propose explicit async entry points for the two async route handlers, backed by the new repository, and retain thin SQLite-only synchronous compatibility helpers if required by the supported API contract. Share one SQLite implementation; do not duplicate SQL. Confirm the supported compatibility surface before coding. Internal callers and tests are evidence, not proof that no external consumer exists.

### Required behavior cases

- Normal create/list/get/update/delete and unknown IDs.
- UUID/timestamp behavior, newest-first ordering, pagination and totals; keep current timestamp-tie behavior rather than adding a new tie-breaker silently.
- Omitted patch fields, explicit null, empty patch, valid/invalid stored JSON, and existing affected-row outcomes.
- DB reset/reopen without stale captured handles.
- Unchanged route authentication, validation, CORS, errors and HTTP responses, including the existing difference between collection and item-route auth handling; any auth correction is a separate change.
- Portable behavior tests separated from raw malformed-SQLite fixtures; supported SQLite drivers stated explicitly.
- One independently reviewable/revertible PR, with no edits to unrelated routing or provider behavior.

### Existing baseline actually exercised

On the frozen source, Node v26.7.0 with the `node:sqlite` driver: four existing files, **33 passed, 0 failed, 0 skipped**:
- `tests/unit/db-playground-presets.test.ts`;
- `tests/unit/update-routes-keep-omitted-fields.test.ts`;
- `tests/unit/auto-candidate-overrides-7819.test.ts`;
- `tests/unit/auto-candidate-overrides-regression-7819.test.ts`.

This is an existing-behavior baseline, not a refactor result or full CI. The run used a pinned source archive, read-only reuse of existing dependencies, an isolated HOME/temp directory, a secret-free environment whitelist and a loopback-only network guard. The expected lookup-failure case emitted an error log and passed. No source files changed. Only `node:sqlite` was exercised; other runtime variants remain future validation requirements.

## Milestone proposal for maintainers

Approve/amend the capability ownership map, the receiving branch/review path, and the S1 synchronous-compatibility treatment. Take one S1 pilot first; use its measured diff/test results to set the next PR size. No contributor is assigned by this map and no release inclusion is implied.


## Complete file index

Every path below is classified; inclusion does not mean that file needs its own repository.

### R01 — Playground presets

- [`src/lib/db/playgroundPresets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/playgroundPresets.ts) — repository

### R02 — Prompt templates and small content registries

- [`src/lib/db/prompts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/prompts.ts) — mixed · also B01

### R03 — Model overrides and candidate policy

- [`open-sse/services/autoCombo/taskFitness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/autoCombo/taskFitness.ts) — mixed · also R07, H01
- [`src/lib/db/autoCandidateOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/autoCandidateOverrides.ts) — repository · also R10
- [`src/lib/db/modelCapabilityOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelCapabilityOverrides.ts) — repository · also R07
- [`src/lib/db/modelContextOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelContextOverrides.ts) — repository · also R07
- [`src/lib/db/modelIntelligence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligence.ts) — mixed · also R07
- [`src/lib/db/models/compat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/compat.ts) — mixed · also R07, H01
- [`src/lib/db/models/customVisionOverride.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/customVisionOverride.ts) — mixed · also R07
- [`src/lib/db/models/modelPreserveVideoUrl.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelPreserveVideoUrl.ts) — mixed · also R07

### R04 — Combo definitions and model mappings

- [`src/lib/db/combos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/combos.ts) — mixed · also R06, R08, R15, B01, H01
- [`src/lib/db/modelComboMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelComboMappings.ts) — repository
- [`src/lib/db/repositories/routingConfigRepositories.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/routingConfigRepositories.ts) — support
- [`src/lib/db/repositories/sqliteComboRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteComboRepository.ts) — repository · also R12, R15
- [`src/lib/db/repositories/sqliteModelComboMappingRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteModelComboMappingRepository.ts) — mixed · also R05

### R05 — Routing, interception and parameter rules

- [`src/lib/db/interceptionRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/interceptionRules.ts) — mixed
- [`src/lib/db/models/mitmAlias.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/mitmAlias.ts) — repository · also R07, R29
- [`src/lib/db/paramFilters.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/paramFilters.ts) — repository · also R06
- [`src/lib/db/reasoningRoutingRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningRoutingRules.ts) — repository · also R10, R04, R08
- [`src/mitm/_internal/standaloneRouting.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/_internal/standaloneRouting.cjs) — mixed · also R07, R29

### R06 — Product settings and feature policies

- [`bin/cli/settings-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/settings-store.mjs) — mixed · also R11, B01, H01
- [`open-sse/services/ipFilter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/ipFilter.ts) — mixed
- [`src/lib/config/hotReload.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/config/hotReload.ts) — support · also B01
- [`src/lib/db/chatAdmissionSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/chatAdmissionSettings.ts) — mixed
- [`src/lib/db/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/featureFlags.ts) — repository · also R07, H01
- [`src/lib/db/functionalGatewayMirrors.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/functionalGatewayMirrors.ts) — mixed
- [`src/lib/db/piiSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/piiSettings.ts) — repository
- [`src/lib/db/rootLayoutSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/rootLayoutSettings.ts) — repository
- [`src/lib/db/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings.ts) — mixed · also R12, R04, R08, R10, R11, R07, R15, R17, B01
- [`src/lib/db/tierConfig.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tierConfig.ts) — mixed · also R07, B01
- [`src/lib/memory/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/settings.ts) — support · also R25, H01
- [`src/shared/utils/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/featureFlags.ts) — support · also H01

### R07 — Model catalog, aliases, discovery and pricing

- [`open-sse/services/tierResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tierResolver.ts) — mixed · also R03, R06, H01
- [`src/lib/arenaEloSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/arenaEloSync.ts) — mixed · also R06, B01
- [`src/lib/catalogUserPricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/catalogUserPricing.ts) — mixed · also H01
- [`src/lib/db/ccDiscoveryAliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryAliases.ts) — mixed · also R06
- [`src/lib/db/discovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discovery.ts) — repository
- [`src/lib/db/discoveryResults.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discoveryResults.ts) — repository
- [`src/lib/db/models.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models.ts) — mixed · also R03, R08, R13, R04
- [`src/lib/db/models/activeSyncedCatalog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/activeSyncedCatalog.ts) — mixed · also R03, R08, R09
- [`src/lib/db/models/aliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/aliases.ts) — repository
- [`src/lib/db/models/syncedAvailableModelPersistence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelPersistence.ts) — mixed · also R03, H01
- [`src/lib/db/models/syncedAvailableModelVision.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelVision.ts) — cache-index · also H01
- [`src/lib/db/serviceModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/serviceModels.ts) — repository · also R29
- [`src/lib/db/settings/pricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/pricing.ts) — mixed · also B01
- [`src/lib/db/validatedModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/validatedModels.ts) — mixed · also R08, R09, R12, R06, R23, R16
- [`src/lib/modelsDevSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/modelsDevSync.ts) — mixed · also B01, R06, H01
- [`src/lib/pricingSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/pricingSync.ts) — mixed · also B01, H01

### R08 — Provider connections and credentials

- [`bin/cli/provider-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/provider-store.mjs) — mixed · also B01, R15, H01
- [`src/lib/cloudAgent/credentials.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/credentials.ts) — repository · also R29, H01
- [`src/lib/db/providers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers.ts) — mixed · also R15, R09, R07, R12, R17, B01, H01
- [`src/lib/db/providers/deletion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/deletion.ts) — mixed · also R12, R04, R15, R09, R07, R05
- [`src/lib/db/providers/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/migrations.ts) — mixed · also B01, H01
- [`src/lib/omnirouteStatus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/omnirouteStatus.ts) — mixed · also R13, R15, B01

### R09 — Provider nodes, plans and limits

- [`src/lib/db/providerLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerLimits.ts) — cache-index · also R15
- [`src/lib/db/providerPlans.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerPlans.ts) — repository
- [`src/lib/db/providers/nodePrefix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodePrefix.ts) — cache-index · also H01, R07
- [`src/lib/db/providers/nodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodes.ts) — repository · also R08, H01

### R10 — API keys, groups and permission bindings

- [`src/lib/db/apiKeyAccessAssign.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyAccessAssign.ts) — mixed
- [`src/lib/db/apiKeyGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyGroups.ts) — mixed · also R07
- [`src/lib/db/apiKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys.ts) — mixed · also R07, R14, R16, R19, B01
- [`src/lib/db/apiKeys/displayNames.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/displayNames.ts) — repository
- [`src/lib/db/apiKeys/modelPermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissions.ts) — support · also H01, R06, R07
- [`src/lib/db/apiKeys/publishedModelLookup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/publishedModelLookup.ts) — support · also R07, R09
- [`src/lib/db/apiKeys/selfLoopKey.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/selfLoopKey.ts) — support · also H01

### R11 — Access credentials, sync tokens and registrations

- [`src/lib/db/accessTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/accessTokens.ts) — mixed
- [`src/lib/db/commandCodeAuth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/commandCodeAuth.ts) — repository · also H01
- [`src/lib/db/registeredKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/registeredKeys.ts) — mixed · also R14
- [`src/lib/db/relayProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProxies.ts) — mixed · also R14, R17, R18
- [`src/lib/db/secrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/secrets.ts) — repository · also H01
- [`src/lib/db/syncTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/syncTokens.ts) — mixed · also B01
- [`src/lib/obsidian/api.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidian/api.ts) — mixed · also R29

### R12 — Proxy configuration, subscriptions and assignments

- [`src/lib/db/freeProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/freeProxies.ts) — repository · also B01
- [`src/lib/db/oneproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/oneproxy.ts) — repository
- [`src/lib/db/proxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies.ts) — mixed · also R18, R17, R08, R15, H01
- [`src/lib/db/proxies/guards.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/guards.ts) — mixed · also R06, R08
- [`src/lib/db/proxies/rotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/rotation.ts) — mixed · also R15, R18, R08
- [`src/lib/db/proxyLatency.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLatency.ts) — mixed · also R18
- [`src/lib/db/proxyOperatorEgress.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyOperatorEgress.ts) — cache-index
- [`src/lib/db/proxySubscriptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxySubscriptions.ts) — repository · also B01
- [`src/lib/db/settings/noAuthProxyFallback.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/noAuthProxyFallback.ts) — support · also H01
- [`src/lib/proxySubscription/due.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/due.ts) — support
- [`src/lib/proxySubscription/reloadSecret.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/reloadSecret.ts) — mixed · also H01
- [`src/lib/proxySubscription/selectorGuard.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorGuard.ts) — mixed · also R06
- [`src/lib/proxySubscription/selectorTrigger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorTrigger.ts) — mixed · also R16, H01
- [`src/lib/proxySubscription/staleNodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/staleNodes.ts) — support · also H01
- [`src/lib/proxySubscription/subscriptionService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/subscriptionService.ts) — mixed · also R06, R16, R29, B01

### R13 — Quota pool/group/allocation/schedule definitions

- [`src/lib/db/quotaGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaGroups.ts) — repository · also R07
- [`src/lib/db/quotaModelCaps.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaModelCaps.ts) — repository
- [`src/lib/db/quotaPools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaPools.ts) — mixed · also R04, R10, R08, R07, R16
- [`src/lib/db/quotaSchedules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSchedules.ts) — repository

### R14 — Quota, token and spend accounting

- [`open-sse/services/tokenLimitCounter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tokenLimitCounter.ts) — mixed · also R17
- [`src/lib/db/domainState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/domainState.ts) — mixed · also R05, R13, R15, R11, R17, B01
- [`src/lib/db/keyQuota.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/keyQuota.ts) — mixed · also R10
- [`src/lib/db/quotaConsumption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaConsumption.ts) — repository
- [`src/lib/db/quotaResetEvents.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaResetEvents.ts) — mixed · also R15, R17
- [`src/lib/db/tokenLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tokenLimits.ts) — mixed · also R10, B01
- [`src/lib/quota/providerQuotaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/providerQuotaState.ts) — repository · also R09
- [`src/lib/quota/quotaResetTimers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaResetTimers.ts) — repository
- [`src/lib/usage/apiKeyUsageLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeyUsageLimits.ts) — mixed · also R17, R07, R10, R09

### R15 — Affinity, continuation and account runtime state

- [`open-sse/services/geminiThoughtSignatureStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/geminiThoughtSignatureStore.ts) — cache-index · also H01
- [`open-sse/services/usage/antigravity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/usage/antigravity.ts) — mixed · also H01, R07, R09, R15, R17
- [`src/lib/db/connectionRuntimeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/connectionRuntimeState.ts) — repository
- [`src/lib/db/contextHandoffs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/contextHandoffs.ts) — repository · also R04
- [`src/lib/db/creditBalance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/creditBalance.ts) — cache-index · also R14
- [`src/lib/db/providers/codexAccountRecovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountRecovery.ts) — mixed · also R08
- [`src/lib/db/providers/codexAccountState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountState.ts) — mixed · also R08, H01
- [`src/lib/db/providers/providerSpecificDataMerge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataMerge.ts) — repository · also R08, R07
- [`src/lib/db/providers/rateLimit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/rateLimit.ts) — mixed · also R08, H01
- [`src/lib/db/responsesContinuationStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/responsesContinuationStore.ts) — mixed · also R18, R21
- [`src/lib/db/sessionAccountAffinity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sessionAccountAffinity.ts) — cache-index
- [`src/lib/db/settings/lkgp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/lkgp.ts) — cache-index · also R04, R08
- [`src/lib/warmupScheduler/circuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerStore.ts) — coordination
- [`src/lib/warmupScheduler/redisCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/redisCircuitBreakerStore.ts) — coordination
- [`src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts) — coordination
- [`src/sse/services/auth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/sse/services/auth.ts) — mixed · also R08, R16, R10, R09, R06, R18

### R16 — Exclusive leases, execution fences and job ownership

- [`src/lib/db/codexWakeups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/codexWakeups.ts) — mixed · also R21
- [`src/lib/db/exclusiveConnectionLeases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/exclusiveConnectionLeases.ts) — coordination · also R08, R10
- [`src/lib/db/skillExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skillExecutionFence.ts) — coordination · also R23
- [`src/lib/jobRegistry/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/index.ts) — support · also H01
- [`src/lib/jobRegistry/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/registry.ts) — coordination
- [`src/lib/skills/toolExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/toolExecutionFence.ts) — coordination · also R23
- [`src/lib/warmupScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler.ts) — mixed · also R15, R08, R06, R12

### R17 — Usage, cost records and read models

- [`src/lib/db/ccDiscoveryMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryMetrics.ts) — repository · also R07
- [`src/lib/db/comboForecast.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/comboForecast.ts) — repository · also R18
- [`src/lib/db/costLedger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/costLedger.ts) — repository · also R14, R18
- [`src/lib/db/providerStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerStats.ts) — repository · also R18, R09
- [`src/lib/db/providers/usageIdentityReconciliation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/usageIdentityReconciliation.ts) — repository · also R08
- [`src/lib/db/quotaSnapshots.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSnapshots.ts) — mixed · also R15, R14
- [`src/lib/db/settings/cacheMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/cacheMetrics.ts) — repository
- [`src/lib/db/usageAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics.ts) — repository · also R14
- [`src/lib/db/usageSummary.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageSummary.ts) — repository
- [`src/lib/quota/quotaAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaAnalytics.ts) — repository · also R14
- [`src/lib/usage/aggregateHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/aggregateHistory.ts) — mixed · also R07, B01
- [`src/lib/usage/analyticsResponseCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/analyticsResponseCache.ts) — cache-index · also R26
- [`src/lib/usage/apiKeySelfService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeySelfService.ts) — mixed · also R10, R14, R08, R09
- [`src/lib/usage/cacheHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/cacheHealth.ts) — mixed · also R18
- [`src/lib/usage/comboHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/comboHealth.ts) — mixed · also R18, R04, R09
- [`src/lib/usage/connectionSpeedStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/connectionSpeedStats.ts) — mixed · also R09
- [`src/lib/usage/providerWindowCosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/providerWindowCosts.ts) — mixed · also R14, R09, R10, R07
- [`src/lib/usage/usageHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory.ts) — mixed · also R18, H01
- [`src/lib/usage/usageHistory/duplicateEntry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory/duplicateEntry.ts) — support · also H01
- [`src/lib/usage/usageStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageStats.ts) — mixed · also R14, R07, R08, R10
- [`src/lib/usage/usageWriteRetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageWriteRetry.ts) — mixed · also R08, H01

### R18 — Call/detail/proxy logs and export cursors

- [`src/lib/db/callLogDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogDetails.ts) — coordination · also R16
- [`src/lib/db/callLogStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogStats.ts) — repository · also R17, R08
- [`src/lib/db/detailedLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/detailedLogs.ts) — repository · also R06, R19
- [`src/lib/db/inspectorSessions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorSessions.ts) — repository
- [`src/lib/db/proxyLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLogs.ts) — repository · also R12
- [`src/lib/db/usageLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageLogs.ts) — repository · also R17
- [`src/lib/monitoring/providerHealthMatrix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/monitoring/providerHealthMatrix.ts) — mixed · also R08, R07, R15, H01
- [`src/lib/proxyLogger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxyLogger.ts) — mixed · also B01, H01
- [`src/lib/usage/callLogDetailResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogDetailResolver.ts) — support · also H01
- [`src/lib/usage/callLogExportQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportQueries.ts) — repository · also R22, R08, R09
- [`src/lib/usage/callLogExportSource.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportSource.ts) — support · also R22
- [`src/lib/usage/callLogFilterOptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogFilterOptions.ts) — repository · also R08
- [`src/lib/usage/callLogRotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogRotation.ts) — mixed · also B01, R16
- [`src/lib/usage/callLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogs.ts) — mixed · also R15, R19, R17, R08, R09
- [`src/lib/usage/callLogsBoundedQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogsBoundedQueries.ts) — support · also H01
- [`src/lib/usage/completedRequestDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/completedRequestDetails.ts) — cache-index · also H01

### R19 — Audit and compliance records

- [`open-sse/mcp-server/audit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/audit.ts) — mixed · also B01, H01
- [`src/domain/configAudit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/configAudit.ts) — repository · also H01
- [`src/lib/compliance/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/index.ts) — mixed · also R17, R18, B01, R06
- [`src/lib/compliance/noLog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/noLog.ts) — mixed · also R10

### R20 — Compression policies and telemetry

- [`open-sse/mcp-server/server.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/server.ts) — mixed · also R19, R23
- [`src/lib/db/ccrBlocks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccrBlocks.ts) — cache-index · also R26
- [`src/lib/db/compression.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compression.ts) — mixed · also H01, B01
- [`src/lib/db/compressionAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionAnalytics.ts) — mixed · also R17, B01
- [`src/lib/db/compressionCacheStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCacheStats.ts) — repository · also R17
- [`src/lib/db/compressionCombos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCombos.ts) — mixed · also R04, B01
- [`src/lib/db/compressionRunTelemetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionRunTelemetry.ts) — mixed · also R17, B01

### R21 — Tasks, batches, conversations and file metadata

- [`open-sse/services/conversationTurnContent.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/conversationTurnContent.ts) — mixed · also R18
- [`src/lib/cloudAgent/db.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/db.ts) — mixed · also B01
- [`src/lib/db/a2aTasks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/a2aTasks.ts) — repository
- [`src/lib/db/agenticConversations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agenticConversations.ts) — mixed · also R18, R15
- [`src/lib/db/batches.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/batches.ts) — repository · also R16
- [`src/lib/db/files.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/files.ts) — repository
- [`src/lib/db/jobRegistryDb.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jobRegistryDb.ts) — repository · also R16

### R22 — Webhooks and log-export destinations/delivery records

- [`src/lib/db/logExportDestinations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportDestinations.ts) — repository · also R18
- [`src/lib/db/webhookDeliveries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhookDeliveries.ts) — repository
- [`src/lib/db/webhooks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhooks.ts) — repository
- [`src/lib/logExport/childRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/childRunner.ts) — support · also R18
- [`src/lib/logExport/exportChild.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/exportChild.ts) — mixed · also R18, B01
- [`src/lib/logExport/runner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/runner.ts) — mixed · also R18, R16

### R23 — Extensions, skills, middleware and execution records

- [`src/lib/db/middleware.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/middleware.ts) — repository · also R04
- [`src/lib/db/pluginMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/pluginMetrics.ts) — repository
- [`src/lib/db/plugins.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/plugins.ts) — repository · also R29
- [`src/lib/db/skills.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skills.ts) — repository
- [`src/lib/skills/executor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/executor.ts) — mixed · also R16, R06
- [`src/lib/skills/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/registry.ts) — mixed · also H01

### R24 — Evaluation and assessment records

- [`scripts/router-eval/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/router-eval/index.ts) — support · also R17, R18
- [`src/lib/db/evals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/evals.ts) — repository · also B01, R05

### R25 — Memory documents and search/vector indexes

- [`src/lib/db/memoryVec.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/memoryVec.ts) — cache-index
- [`src/lib/memory/embedding/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/embedding/index.ts) — support · also R08, R09
- [`src/lib/memory/reindex.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/reindex.ts) — mixed · also R16
- [`src/lib/memory/retrieval.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/retrieval.ts) — mixed · also R10, B01, R26
- [`src/lib/memory/store.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/store.ts) — mixed · also H01
- [`src/lib/memory/summarization.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/summarization.ts) — mixed
- [`src/lib/memory/typedDecay.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/typedDecay.ts) — mixed · also R16
- [`src/lib/memory/vectorStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/vectorStore.ts) — cache-index · also B01

### R26 — Semantic/reasoning caches and metrics

- [`src/lib/db/reasoningCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningCache.ts) — cache-index · also R15
- [`src/lib/db/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/semanticCache.ts) — cache-index
- [`src/lib/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/semanticCache.ts) — cache-index · also H01, B01

### R27 — Gamification and community ledgers

- [`src/lib/db/gamification.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/gamification.ts) — repository · also R11
- [`src/lib/gamification/antiCheat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/antiCheat.ts) — mixed
- [`src/lib/gamification/badges.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/badges.ts) — mixed
- [`src/lib/gamification/events.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/events.ts) — mixed
- [`src/lib/gamification/invites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/invites.ts) — mixed · also R11
- [`src/lib/gamification/servers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/servers.ts) — mixed · also R11
- [`src/lib/gamification/streaks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/streaks.ts) — mixed

### R28 — Radar feeds and discovery snapshots

- [`src/lib/db/radar.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/radar.ts) — mixed · also R11, H01
- [`src/lib/radar/referrals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/radar/referrals.ts) — support

### R29 — Bridge/integration and local-tool state

- [`electron/main.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/main.js) — mixed · also H01, B01
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts) — mixed · also L01, R16, R15, R08
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts) — local-integration
- [`scripts/dev/sync-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/sync-env.mjs) — support · also B01, R08
- [`scripts/dev/webdav-handler.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/webdav-handler.mjs) — mixed · also R06, H01, L01
- [`src/app/api/internal/codex-responses-ws/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/internal/codex-responses-ws/route.ts) — mixed · also R16, R10, R08, R05, R25, R12, R18, R20, R04
- [`src/lib/db/agentBridgeBypass.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeBypass.ts) — repository
- [`src/lib/db/agentBridgeMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeMappings.ts) — mixed · also R07
- [`src/lib/db/agentBridgeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeState.ts) — repository
- [`src/lib/db/apiKeyContextSources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyContextSources.ts) — repository · also R10, R11
- [`src/lib/db/cliToolState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cliToolState.ts) — repository
- [`src/lib/db/conductorBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/conductorBridge.ts) — repository
- [`src/lib/db/inspectorCustomHosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorCustomHosts.ts) — repository · also R05
- [`src/lib/db/localCorpus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/localCorpus.ts) — repository · also R06
- [`src/lib/db/notion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/notion.ts) — repository · also R11
- [`src/lib/db/obsidian.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/obsidian.ts) — mixed · also R11, R10
- [`src/lib/db/upstreamProxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/upstreamProxy.ts) — mixed · also R12
- [`src/lib/db/versionManager.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/versionManager.ts) — repository
- [`src/lib/headroom/process.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/headroom/process.ts) — local-integration · also L01
- [`src/lib/obsidianSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidianSync.ts) — mixed · also L01, R11
- [`src/lib/services/installers/bifrost.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/bifrost.ts) — local-integration · also L01
- [`src/lib/services/installers/cliproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/cliproxy.ts) — local-integration · also L01
- [`src/lib/services/installers/dario.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/dario.ts) — local-integration · also L01
- [`src/lib/services/installers/llmlingua.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/llmlingua.ts) — local-integration · also R20, L01
- [`src/lib/services/installers/mux.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/mux.ts) — local-integration · also L01
- [`src/lib/services/installers/ninerouter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/ninerouter.ts) — local-integration · also L01
- [`src/lib/services/installers/openwa.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/openwa.ts) — local-integration · also L01
- [`src/mitm/server.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/server.cjs) — mixed · also R07, R18, B01

### B01 — Backend lifecycle and SQLite maintenance

- [`bin/cli/commands/backup.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/backup.mjs) — backend-ops
- [`bin/cli/commands/doctor.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/doctor.mjs) — backend-ops · also H01, R29
- [`bin/cli/commands/reset-encrypted-columns.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/reset-encrypted-columns.mjs) — backend-ops · also R08
- [`bin/cli/commands/runtime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/runtime.mjs) — backend-ops
- [`bin/cli/commands/sync-import.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/sync-import.mjs) — backend-ops
- [`bin/cli/runtime/nativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/nativeDeps.mjs) — backend-ops
- [`bin/cli/runtime/sqliteRuntime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/sqliteRuntime.mjs) — backend-ops
- [`bin/cli/sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/sqlite.mjs) — mixed · also R08, R11, R06, H01
- [`electron/sqlite-inspection.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/sqlite-inspection.js) — support · also R08
- [`scripts/build/bootstrap-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/bootstrap-env.mjs) — backend-ops · also R08, H01
- [`src/app/api/db-backups/export/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/export/route.ts) — backend-ops · also R08, R10
- [`src/app/api/db-backups/exportAll/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/exportAll/route.ts) — backend-ops · also R18, R08, R10, R04, R06, R05
- [`src/app/api/db-backups/import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/import/route.ts) — backend-ops · also R06, R08, R10
- [`src/app/api/db/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db/health/route.ts) — backend-ops
- [`src/app/api/health/ping/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/health/ping/route.ts) — backend-ops
- [`src/app/api/settings/database/vacuum/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/database/vacuum/route.ts) — backend-ops
- [`src/app/api/settings/import-json/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/import-json/route.ts) — backend-ops · also R06, R08, R10, R04, R17, H01
- [`src/app/api/storage/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/storage/health/route.ts) — backend-ops · also R18
- [`src/domain/assessment/migration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/assessment/migration.ts) — backend-ops · also R04, R24
- [`src/instrumentation-node.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/instrumentation-node.ts) — mixed · also R11, R06, R07, R08, R15, R14, R19, R25, R28, R12, R21
- [`src/lib/db/adapters/betterSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/betterSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/bunSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/bunSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/driverFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/driverFactory.ts) — backend-ops
- [`src/lib/db/adapters/nodeSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/nodeSqliteShared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteShared.ts) — backend-ops
- [`src/lib/db/adapters/sqljsAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/sqljsAdapter.ts) — backend-ops
- [`src/lib/db/adapters/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/types.ts) — backend-ops
- [`src/lib/db/apiKeyColumnFallbacks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyColumnFallbacks.ts) — backend-ops · also R10
- [`src/lib/db/backup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backup.ts) — backend-ops · also R06
- [`src/lib/db/backupPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupPaths.ts) — support · also H01
- [`src/lib/db/backupRetention.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupRetention.ts) — backend-ops · also R06
- [`src/lib/db/cleanup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup.ts) — mixed · also R17, R18, R19, R20, R21, R25, R27, R14, R15, R16
- [`src/lib/db/cleanup/backupPrune.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/backupPrune.ts) — backend-ops
- [`src/lib/db/core.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/core.ts) — backend-ops · also R08, R18, H01
- [`src/lib/db/databaseSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/databaseSettings.ts) — mixed · also R06, R26, R18, H01
- [`src/lib/db/healthCheck.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheck.ts) — backend-ops · also R04, R08, R10, R14, R17, R15
- [`src/lib/db/healthCheckRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckRunner.ts) — backend-ops
- [`src/lib/db/healthCheckWorker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckWorker.ts) — backend-ops
- [`src/lib/db/jsonMigration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration.ts) — backend-ops · also R04, R06, R07, R08, R09, R10, R12, R14, R17
- [`src/lib/db/logExportReadOnly.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportReadOnly.ts) — backend-ops · also R22
- [`src/lib/db/managedBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/managedBackup.ts) — backend-ops
- [`src/lib/db/migrationRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner.ts) — backend-ops
- [`src/lib/db/migrationRunner/extraDirs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/extraDirs.ts) — support · also H01
- [`src/lib/db/migrationRunner/preMigrationBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/preMigrationBackup.ts) — backend-ops
- [`src/lib/db/migrationRunner/schemaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/schemaState.ts) — backend-ops
- [`src/lib/db/optimizationSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/optimizationSettings.ts) — backend-ops
- [`src/lib/db/probeUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/probeUtils.ts) — backend-ops · also H01
- [`src/lib/db/reclaimFreedPages.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reclaimFreedPages.ts) — backend-ops
- [`src/lib/db/recovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/recovery.ts) — backend-ops · also R08
- [`src/lib/db/schemaColumns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/schemaColumns.ts) — backend-ops
- [`src/lib/db/singleton.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/singleton.ts) — backend-ops
- [`src/lib/db/sqliteLoadError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sqliteLoadError.ts) — support · also H01
- [`src/lib/db/stateReset.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stateReset.ts) — support · also H01
- [`src/lib/db/stats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stats.ts) — backend-ops
- [`src/lib/db/vacuumScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/vacuumScheduler.ts) — backend-ops
- [`src/lib/db/walMaintenance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/walMaintenance.ts) — backend-ops
- [`src/lib/gracefulShutdown.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gracefulShutdown.ts) — backend-ops · also R14, R18, R19
- [`src/lib/usage/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/migrations.ts) — backend-ops · also R17, R18, R08

### H01 — Shared mapping, encryption and cache helpers

- [`bin/cli/data-dir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/data-dir.mjs) — support · also B01
- [`bin/cli/privateDataDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/privateDataDir.mjs) — support · also B01
- [`bin/omniroute.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/omniroute.mjs) — mixed · also B01, R29
- [`src/lib/cache/semanticCacheDbBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cache/semanticCacheDbBridge.ts) — support · also R26, R08, R06
- [`src/lib/container.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/container.ts) — support · also B01, R06
- [`src/lib/dataPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/dataPaths.ts) — support · also B01
- [`src/lib/db/_rowTypes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/_rowTypes.ts) — support · also R29
- [`src/lib/db/adapters/runtimeRequire.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/runtimeRequire.ts) — support · also B01
- [`src/lib/db/adapters/slowDiagnostics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/slowDiagnostics.ts) — support · also B01
- [`src/lib/db/apiKeyUsageLimitFields.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyUsageLimitFields.ts) — support · also R10, R14
- [`src/lib/db/apiKeys/modelAccessMode.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelAccessMode.ts) — support · also R10
- [`src/lib/db/apiKeys/modelPermissionCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissionCache.ts) — support · also R10, R07
- [`src/lib/db/apiKeys/permissionsUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/permissionsUpdate.ts) — support · also R10
- [`src/lib/db/apiKeys/rowParsers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/rowParsers.ts) — support · also R10
- [`src/lib/db/apiKeys/secretAtRest.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/secretAtRest.ts) — support · also R10
- [`src/lib/db/apiKeys/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/types.ts) — support · also R10
- [`src/lib/db/cacheSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cacheSecrets.ts) — support · also R06, R26
- [`src/lib/db/caseMapping.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/caseMapping.ts) — support · also B01
- [`src/lib/db/cleanup/usagePurge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/usagePurge.ts) — support · also B01, R18
- [`src/lib/db/compressionContextBudget.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionContextBudget.ts) — support · also R20
- [`src/lib/db/compressionDetailNormalizers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionDetailNormalizers.ts) — support · also R20
- [`src/lib/db/encryption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/encryption.ts) — support · also R08, B01
- [`src/lib/db/filePermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/filePermissions.ts) — support · also B01, R08
- [`src/lib/db/jsonMigration/apiKeysImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/apiKeysImport.ts) — support · also B01, R10
- [`src/lib/db/jsonMigration/columnUpsert.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/columnUpsert.ts) — support · also B01, R08, R10
- [`src/lib/db/jsonMigration/connectionsImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/connectionsImport.ts) — support · also B01, R08
- [`src/lib/db/migrationRunner/constants.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/constants.ts) — support · also B01
- [`src/lib/db/migrationRunner/logger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/logger.ts) — support · also B01
- [`src/lib/db/modelIntelligenceGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligenceGeneration.ts) — support · also R03
- [`src/lib/db/models/capabilityModalities.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/capabilityModalities.ts) — support · also R07
- [`src/lib/db/models/modelCatalogWriteSignals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelCatalogWriteSignals.ts) — support · also R07, B01
- [`src/lib/db/models/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/shared.ts) — support · also R07
- [`src/lib/db/models/synced.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/synced.ts) — support · also R07
- [`src/lib/db/models/syncedCatalogFreshness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedCatalogFreshness.ts) — support · also R07
- [`src/lib/db/providerNodeSelect.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerNodeSelect.ts) — support · also R09
- [`src/lib/db/providers/columns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/columns.ts) — support · also R08, R09
- [`src/lib/db/providers/lazyConnectionView.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/lazyConnectionView.ts) — support · also R08
- [`src/lib/db/providers/providerSpecificData.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificData.ts) — support · also R08, R09
- [`src/lib/db/providers/providerSpecificDataSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataSecrets.ts) — support · also R08, R19
- [`src/lib/db/proxies/mappers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/mappers.ts) — support · also R12
- [`src/lib/db/proxies/registryGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/registryGeneration.ts) — support · also R12
- [`src/lib/db/proxies/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/types.ts) — support · also R12
- [`src/lib/db/readCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/readCache.ts) — support · also R06, R07, R08, R09, R04, R15
- [`src/lib/db/settings/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/shared.ts) — support · also R06
- [`src/lib/db/usageAnalytics/sources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics/sources.ts) — support · also R17
- [`src/lib/db/webSessionDedup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webSessionDedup.ts) — support · also R08
- [`src/lib/instrumentationBootError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/instrumentationBootError.ts) — support · also B01
- [`src/lib/warmupScheduler/circuitBreakerFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerFactory.ts) — support · also R15
- [`src/shared/platform/windowsProcess.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/platform/windowsProcess.ts) — support · also B01
- [`src/shared/schemas/memory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/schemas/memory.ts) — support · also R25, R06
- [`src/shared/utils/globPattern.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/globPattern.ts) — support · also R04

### L01 — Local/vendor database integration

- [`open-sse/utils/cursorVersionDetector.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/utils/cursorVersionDetector.ts) — local-integration · also R29
- [`src/app/api/oauth/kiro/auto-import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/oauth/kiro/auto-import/route.ts) — local-integration · also R29, R08, R12
- [`src/lib/copilot/codegraphKnowledge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/codegraphKnowledge.ts) — local-integration
- [`src/lib/cursor/tokenExtractor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cursor/tokenExtractor.ts) — local-integration · also R29
- [`src/lib/db/omp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/omp.ts) — local-integration · also R29

### X01 — Non-persistence or tooling-only matches

- [`bin/cli/commands/serve.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/serve.mjs) — mixed · also R06
- [`bin/cli/commands/update.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/update.mjs) — excluded
- [`bin/cli/runtime/trayRuntime.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/trayRuntime.ts) — excluded
- [`bin/cli/utils/ensureAndroidCacheDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/utils/ensureAndroidCacheDir.mjs) — excluded
- [`bin/mcpStdioConsoleGuard.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/mcpStdioConsoleGuard.mjs) — excluded
- [`next.config.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/next.config.mjs) — excluded
- [`open-sse/executors/notrack-web.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/executors/notrack-web.ts) — excluded
- [`open-sse/mcp-server/tools/advancedTools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/tools/advancedTools.ts) — support · also R04, R06, R07, R12, R14, R17, R19, R26, B01
- [`open-sse/services/compression/harness/benchmark.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/compression/harness/benchmark.ts) — excluded · also R20
- [`scripts/build/afterpack-copy-node-modules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/afterpack-copy-node-modules.mjs) — excluded · also B01
- [`scripts/build/assembleStandalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/assembleStandalone.mjs) — excluded · also B01
- [`scripts/build/better-sqlite3-stub-flag.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/better-sqlite3-stub-flag.mjs) — excluded · also B01
- [`scripts/build/betterSqlitePrebuildTarget.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/betterSqlitePrebuildTarget.mjs) — excluded · also B01
- [`scripts/build/build-next-isolated.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/build-next-isolated.mjs) — excluded · also B01
- [`scripts/build/electronRebuildPlan.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/electronRebuildPlan.mjs) — excluded · also B01
- [`scripts/build/hydrateNativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/hydrateNativeDeps.mjs) — excluded · also B01
- [`scripts/build/pack-artifact-policy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/pack-artifact-policy.ts) — excluded
- [`scripts/build/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/postinstall.mjs) — excluded · also B01, H01
- [`scripts/build/prepare-electron-standalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/prepare-electron-standalone.mjs) — excluded · also B01
- [`scripts/check/audit-sqlite-coupling.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/audit-sqlite-coupling.mjs) — excluded
- [`scripts/check/check-db-rules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-db-rules.mjs) — excluded · also L01
- [`scripts/check/check-env-doc-sync.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-env-doc-sync.mjs) — excluded
- [`scripts/check/check-install-upgrade.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-install-upgrade.mjs) — excluded · also B01
- [`scripts/check/check-native-deps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-native-deps.mjs) — excluded · also B01
- [`scripts/check/check-route-guard-membership.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-route-guard-membership.ts) — excluded
- [`scripts/check/lib/readmeMigrationCount.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/lib/readmeMigrationCount.mjs) — excluded
- [`scripts/ci/verify-ci-install.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/ci/verify-ci-install.mjs) — excluded
- [`scripts/dev/ensure-native-sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/ensure-native-sqlite.mjs) — excluded · also B01
- [`scripts/dev/run-next.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/run-next.mjs) — excluded · also B01
- [`scripts/dev/smoke-electron-packaged.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/smoke-electron-packaged.mjs) — excluded · also B01
- [`scripts/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/postinstall.mjs) — excluded · also B01
- [`src/app/(dashboard)/dashboard/providers/[id]/components/modals/ImportCodexAuthModal.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/%5Bid%5D/components/modals/ImportCodexAuthModal.tsx) — excluded · also R08, R29
- [`src/app/(dashboard)/dashboard/providers/providerPageUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/providerPageUtils.ts) — excluded
- [`src/app/(dashboard)/dashboard/settings/components/SidebarTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SidebarTab.tsx) — excluded · also R06
- [`src/app/(dashboard)/dashboard/settings/components/SystemStorageTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SystemStorageTab.tsx) — excluded · also B01, R18, R17
- [`src/app/api/system/version/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/system/version/route.ts) — excluded · also B01
- [`src/app/privacy/page.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/privacy/page.tsx) — excluded
- [`src/lib/copilot/systemPrompt.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/systemPrompt.ts) — excluded
- [`src/lib/db/better-sqlite3.stub.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/better-sqlite3.stub.js) — excluded · also B01
- [`src/lib/db/relayProbeStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProbeStats.ts) — excluded · also R12
- [`src/lib/evals/evalRunner/builtinSuites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/evals/evalRunner/builtinSuites.ts) — excluded
- [`src/lib/oauth/services/cursor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/oauth/services/cursor.ts) — excluded · also R29
- [`src/lib/system/autoUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/autoUpdate.ts) — excluded
- [`src/lib/system/globalPackagePath.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/globalPackagePath.ts) — excluded
- [`src/shared/components/compression/CompressionPipelineEditor.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/components/compression/CompressionPipelineEditor.tsx) — excluded · also R20
- [`src/shared/constants/featureFlagDefinitions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/constants/featureFlagDefinitions.ts) — excluded · also R06
- [`src/shared/utils/formatting.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/formatting.ts) — excluded
