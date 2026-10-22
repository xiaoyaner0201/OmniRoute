# OmniRoute repository scope and implementation map / Repository 范围与实现地图

**Proposal / 待讨论提案.** Source / 源码：`0482755c5e4faeeb23736b9e56ec293d84809efa`。

## Coverage / 覆盖范围

- Parsed 14,339 tracked script-source files from the frozen Git tree; 6,200 remain after test/fixture exclusions. AST discovery produced 346 persistence/boundary candidates; a complementary SQLite-specific lexical pass added 55. All **401 unique candidate files** have a primary capability assignment. These are **29 business capability areas plus 4 support/non-domain boundary areas**, not 401 repositories or 33 implementation PRs.
- 从固定 Git 树解析 14,339 个受版本控制的脚本源文件，排除测试／夹具后为 6,200 个。AST 筛出 346 个持久化／边界候选，SQLite 专属词法补扫增加 55 个；**401 个唯一候选文件均有主归属**。归为 **29 个业务能力范围和 4 类支撑／非领域边界**，不是 401 个 Repository，也不是预先规定 33 个 PR。
- Corpus: src, open-sse (including vendored source), bin, electron, packages, @omniroute, contrib, docker, config, examples, scripts and exported root JS/TS configuration files. Tests/fixtures are excluded from production counts; docs/public/assets and non-script configuration are not a complete persistence inventory here. 209 migration SQL files are separately inventoried. All 14,339 parsed source blobs matched the pinned Git object bytes.
- 扫描包括以上运行／工具源目录；生产计数排除测试和夹具，文档、静态资源及非脚本配置不在本次完整源文件计数中。另盘点 209 个 SQL 迁移文件。14,339 个已解析源文件全部与固定提交的 Git blob 字节一致。
- The map covers discovered SQLite-coupled surfaces and their related state boundaries, not an assertion that every in-memory/Redis/file-only feature has been exhaustively audited. Counts are per path, not deduplicated mirrored logic. Table-name candidates and imported-symbol counts are discovery signals, not semantic SQL/table/call counts. CommonJS, computed imports and external consumers need per-slice checks.
- 本图覆盖发现的 SQLite 耦合面及相关状态边界，不宣称已穷尽所有纯内存／Redis／文件功能。按路径计数，不将镜像代码去重为业务逻辑数量；SQL 字符串中的表名候选和导入计数只用于定位，不当作真实 SQL／表／调用数。CommonJS、动态生成导入和外部消费者仍要逐切片核对。
- Complete path mapping: [CSV](repository-scope-files.csv). Only source paths/links and planning classifications are published; unverified diagnostic hypotheses are not reported as bugs. Tests are an existing-behavior baseline, not a refactor PASS.
- 完整文件映射见 [CSV](repository-scope-files.csv)。公开的是路径、源码链接和规划分类，不把未复现的诊断猜测写成缺陷；本次测试是旧行为基线，不是重构已通过。

## Full capability map / 全部能力范围

Every row may contain several later PRs. One mixed file may have secondary owners; the CSV preserves those associations.
每行可拆为多份后续 PR；一个混合文件可能有次级归属，CSV 保留这些关系。

| ID | Capability / 能力 | Proposed node / 建议节点 | Primary files / 主归属文件 | Boundary / 能力边界 |
|---|---|---|---:|---|
| R01 | Playground presets / 调试预设 | S1 | 1 | Preset CRUD and serialization; not API authorization or request execution.<br>预设增删改查与序列化；不接管接口鉴权和模型请求执行。 |
| R02 | Prompt templates and small content registries / 提示词模板与小型内容登记 | S2 (verify usage) | 1 | Stored templates/content metadata; verify real call paths before treating unused modules as early wins.<br>模板／内容元数据；先验证真实调用路径，不能把无调用模块当作简单成果。 |
| R03 | Model overrides and candidate policy / 模型覆盖与候选策略 | S2 | 8 | Manual/automatic overrides, provenance and invalidation; model capability resolution remains business logic.<br>手动与自动覆盖、来源与失效；能力解析和候选选择仍属于业务逻辑。 |
| R04 | Combo definitions and model mappings / Combo 定义与模型映射 | EXISTING | 5 | Existing repositories; follow retained sync/settings paths and cross-domain cleanup explicitly.<br>已有 Repository；同步兼容、设置入口和跨域删除清理需显式跟踪。 |
| R05 | Routing, interception and parameter rules / 路由、拦截与参数规则 | S2 | 5 | Rule persistence and reference checks; routing evaluation and policy decisions remain services.<br>规则持久化与引用校验；规则计算、路由选择与策略裁决留在服务层。 |
| R06 | Product settings and feature policies / 产品设置与功能策略 | S2 | 12 | Split key_value by business namespace; no public generic SQL/KV escape hatch; distinguish local settings.<br>按业务拆分 key_value 命名空间，不暴露万能 KV／SQL 接口；区分宿主本地设置。 |
| R07 | Model catalog, aliases, discovery and pricing / 模型目录、别名、发现与价格 | S2 | 16 | Stored catalog state and namespace ownership; external sync and resolution orchestrate repositories.<br>存储目录及其来源、别名和价格；外部同步、解析和更新编排留在服务层。 |
| R08 | Provider connections and credentials / 上游账号连接与凭据 | S3 | 6 | Credential encryption, dedup, deletion, updates and owner-controlled refresh; no credentials in portable DTOs by accident.<br>凭据加密、去重、删除及更新；刷新归属单独设计，避免通用记录无意暴露秘密。 |
| R09 | Provider nodes, plans and limits / 上游节点、套餐与限制 | S3 | 4 | Definitions distinct from live usage, health, backoff and hot counters.<br>节点／套餐／限制定义，与实时用量、健康、退避和热计数分开。 |
| R10 | API keys, groups and permission bindings / API Key、分组与权限绑定 | S3 | 7 | Durable permission/key state and explicit atomic changes; auth decisions and revocation propagation separately verified.<br>持久权限／Key 状态及原子修改；鉴权决策和撤销传播另行验证。 |
| R11 | Access credentials, sync tokens and registrations / 访问凭据、同步令牌与注册 | S3 | 7 | Secret lifecycle, hashing/encryption, expiry and identity scopes; not generic mutable KV.<br>秘密生命周期、哈希／加密、过期与身份范围；不当作普通可变 KV。 |
| R12 | Proxy configuration, subscriptions and assignments / 代理配置、订阅与分配 | S3 | 15 | Persist registry/relationships/secrets; isolate OS config writes, probes and external subscription refresh.<br>存储代理登记、关联和秘密；操作系统配置写入、探测和订阅刷新分离。 |
| R13 | Quota pool/group/allocation/schedule definitions / 额度池、分组、分配与计划定义 | S3 | 4 | Durable policy and membership; separates live counters and scheduled execution ownership.<br>持久额度策略与成员关联；运行计数和定时执行归属另列。 |
| R14 | Quota, token and spend accounting / 额度、Token 与花费记账 | S4 | 9 | Atomic spend/limits/reset/idempotency; advisory counters and hard limits have different failure policies.<br>花费／限制／重置的原子性与幂等；建议性计数和硬上限采用各自失败策略。 |
| R15 | Affinity, continuation and account runtime state / 会话粘性、续接与账号运行态 | S4 | 16 | Feature-specific shared stores; coordinate #16472/#16569, distinguish reconstructible affinity from required continuation evidence.<br>按功能定义共享存储，复用 #16472／#16569；可重建粘性与必需续接证据分开。 |
| R16 | Exclusive leases, execution fences and job ownership / 独占租约、执行围栏与任务归属 | S4 | 7 | Coordination contracts require compare/update, ownership, expiry/recovery; not ordinary CRUD repositories.<br>比较更新、所有权、过期／恢复等协调契约，不按普通 CRUD 处理。 |
| R17 | Usage, cost records and read models / 用量、成本记录与统计读模型 | S5 | 21 | Append/dedupe/retention and query projections; accounting guarantees separate from best-effort telemetry.<br>追加、去重、保留和查询投影；可靠记账与尽力而为的遥测分开。 |
| R18 | Call/detail/proxy logs and export cursors / 调用、明细、代理日志与导出游标 | S5 | 16 | Record/artifact relationship, retention, pagination and stable cursor semantics; shared row does not share local artifacts.<br>记录／制品关联、保留、分页与稳定游标；共享记录不等于共享本地文件。 |
| R19 | Audit and compliance records / 审计与合规记录 | S5 | 4 | Acknowledged durable evidence, tenant/no-log/deletion policies and source linkage; not disposable cache.<br>明确确认持久化的证据、租户／no-log／删除策略及来源关联；不当作可丢弃缓存。 |
| R20 | Compression policies and telemetry / 压缩策略与遥测 | S2/S5 | 7 | Split configuration/pipeline definitions from cache metrics, analytics and execution telemetry.<br>压缩配置／管线定义，与缓存指标、统计和执行遥测拆分。 |
| R21 | Tasks, batches, conversations and file metadata / 任务、批处理、对话与文件元数据 | S5 | 7 | State machines, transitions and linked artifacts; worker/job ownership handled by coordination boundary.<br>状态机、转换和关联制品；工作进程／任务归属交给协调边界。 |
| R22 | Webhooks and log-export destinations/delivery records / Webhook、日志导出目标与投递记录 | S3/S5 | 6 | Separate encrypted destination definitions from cursors/retries/outbox semantics and actual network delivery.<br>含秘密的目标定义，与游标、重试、潜在 outbox 语义和实际网络投递分开。 |
| R23 | Extensions, skills, middleware and execution records / 插件、Skill、中间件与执行记录 | S5 | 6 | Registry/policy/history storage only; plugin execution and sandboxing are not repository methods.<br>只处理登记、策略及历史存储；插件执行与沙箱不放进 Repository。 |
| R24 | Evaluation and assessment records / 评测与评估记录 | S5 | 2 | Suite/case/run provenance and results; execution/scoring remain domain services.<br>评测套件、用例、运行来源与结果；执行和评分保留在业务服务中。 |
| R25 | Memory documents and search/vector indexes / 记忆文档与全文、向量索引 | S6 | 8 | Document repository separate from Search/Vector capabilities; no FTS5/sqlite-vec syntax in generic contract.<br>文档 Repository 与全文／向量能力分开，通用契约不泄漏 FTS5／sqlite-vec 语法。 |
| R26 | Semantic/reasoning caches and metrics / 语义、推理缓存与指标 | S6 | 3 | CacheStore contracts with TTL/capacity/invalidation; distinct from durable control-plane repositories.<br>按 TTL、容量和失效定义 CacheStore，与持久控制数据 Repository 分开。 |
| R27 | Gamification and community ledgers / 积分、社区与激励账本 | S5 | 7 | Badges/invites/community definitions versus atomic XP/credit ledger and derived rankings.<br>徽章、邀请和社区定义，与原子积分／余额账本及派生排行分开。 |
| R28 | Radar feeds and discovery snapshots / Radar 信息流与发现快照 | S2/S6 | 2 | Split configured preferences from recomputable external feed caches and local model state.<br>配置偏好、可重建外部信息流缓存和本机模型状态分开。 |
| R29 | Bridge/integration and local-tool state / 桥接、集成与本地工具状态 | S3/LOCAL | 28 | Persist selected shared integration settings; keep host paths, installed applications and external credential import local.<br>选择可共享的集成设置；宿主路径、已安装应用和外部凭据导入保持本地边界。 |
| B01 | Backend lifecycle and SQLite maintenance / 数据库生命周期与 SQLite 运维 | B | 58 | Driver, schema/migrations, readiness, transaction facilities, backup/restore/WAL/VACUUM; not per-domain repositories.<br>驱动、建表／迁移、就绪、事务设施、备份恢复、WAL／VACUUM；不是逐领域 Repository。 |
| H01 | Shared mapping, encryption and cache helpers / 映射、加密与缓存辅助模块 | SUPPORT | 51 | Supporting dependency belongs beside its owning domain/backend; not one repository per helper.<br>辅助依赖跟随所属领域或后端，不为每个映射、加密或缓存 helper 新建 Repository。 |
| L01 | Local/vendor database integration / 本机或第三方数据库集成 | LOCAL | 5 | Reads external app databases or local machine files; not Omni durable-state backend migration.<br>读取外部应用数据库或本机文件，不属于 Omni 自身持久后端迁移。 |
| X01 | Non-persistence or tooling-only matches / 非持久化或工具性命中 | EXCLUDE | 47 | Lexical false positives, UI prose, eval fixtures, build/check tools; document why excluded.<br>词法误命中、界面说明、评测夹具、构建／检查工具；注明排除理由，工具兼容性仍需验收。 |

## Dependency sketch / 依赖草图

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


---

# 实现节点与第一片范围（待讨论提案）

源码基准：`cheaper-inference/OmniRoute`，`0482755c5e4faeeb23736b9e56ec293d84809efa`。

## 节点顺序与退出条件

- **S0 — 范围与行为基线（本次盘点）。** 将发现的 SQLite 耦合面映射到业务能力，区分 Repository、协调／缓存／索引、后端运行和本机边界，标记已有成果并固定源码。交付文件到能力的映射、依赖节点、首片范围和现有行为证据；不代表维护者已批准。
- **S1 — 一个低风险试点，再按需要做第二片。** 首选 Playground 调试预设。之后可把已是异步接口的自动路由候选偏好作为另一片，并保留其隔离和默认回退测试。不能只因文件短就挑选尚未验证真实调用路径的模块。退出条件：真实调用经过业务接口，SQLite 行为与对外 API 响应不变，同步旧入口有明确兼容方案，一致性与外观层测试通过。
- **S2 — 配置类业务域。** 模型覆盖／目录／别名／定价、路由与参数规则、按业务命名空间划分的产品设置、压缩定义。按完整业务操作拆，不按物理 `key_value` 表拆。退出条件：缓存失效、来源优先级保持不变，跨域引用和多步写入明确。依赖 S1 验证过的模式，此后独立切片可并行。
- **S3 — 身份与持久控制数据。** 上游账号连接／节点、API Key／分组、访问及同步令牌、代理定义、额度定义。退出条件：凭据保护、身份与权限关联、删除连带动作不变；CLI／MCP／独立进程的旁路访问也使用相同边界或有明确兼容适配。依赖已验证的 Repository 模式，以及实际需要的 B 事务原语。
- **S4 — 正确性敏感的共享状态。** 花费／Token 计数、额度重置、会话粘性／续接、账号运行态、独占租约、任务认领与执行围栏。协调复用 #16472／#16569，不另造一套粘性存储。退出条件：归属、原子性、重试／幂等、过期／恢复、各功能失败策略都有测试。依赖所属的 S3 策略域和 B 原语；不能把所有计数器统一成一种一致性策略。
- **S5 — 记录与产品模块。** 用量／成本读模型、调用／明细／代理日志、审计、导出／Webhook、任务／批处理／文件、Skill／插件、评测及社区账本。退出条件：追加／更新／保留／删除和制品关联明确，需要事务和归属保证的能力分别验证。各自依赖稳定后可与 S2–S4 并行，不做一个包揽所有内容的遥测 Repository。
- **S6 — 缓存与检索能力。** 记忆文档与全文／向量索引分开，另列语义／推理缓存、信息流缓存和派生读模型。退出条件：权威文档与可重建索引／缓存分离，后端能力及缺失／降级行为明确。依赖所属文档或配置域，不必等待所有 S5 模块。
- **B — 后端运行接口（横向、渐进）。** 先按真实切片需要建立事务上下文和错误结果分类；对外提供其他数据库前，再补就绪状态、迁移归属、能力发现和备份恢复语义。SQLite 的 WAL／VACUUM／文件恢复留在专属实现中。不是先造一个大型框架，再允许 S1 开始。
- **PG-A — 后端一致性实验。** Repository 契约获接收、必要的 B 子集就绪后，让同一行为套件在 SQLite 和 PostgreSQL 上跑一个有界切片。它证明一个后端实现，不证明部署高可用或完整换库。
- **PG-B — 完整共享控制数据链路。** 依赖 S2／S3 中必要的连接、Key、路由链路，以及 B 的迁移和就绪机制；实测配置／撤销传播、并发写入、副本和数据库恢复。每项启用的能力都须说明其状态是共享、刻意本地保留，还是暂不支持。无需为了完整性等待无关可选模块，但不能默默漏掉已启用能力。
- **PG-C — 运维切换与更多能力。** 面向用户提供切换前，完成导入校验、备份恢复、回滚和持久性策略说明；OAuth 刷新、硬额度限制、定时任务和续接须具备对应的 S4／S5 保证。数据库自身的高可用和入口冗余属于部署责任，不会因有了 Repository 就自动成立。

S 编号用于组织工作，不是发版日期，也不要求前一个编号的所有范围做完后，后面的任何一片才能开始。

## 第一片建议：Playground 调试预设

### 为什么先做它，而不是推理路由

冻结源码中的 `src/lib/db/playgroundPresets.ts` 为 179 行，使用一张 `playground_presets` 表，有五个同步导出的增删改查／列表函数，以及两个直接导入它的生产路由文件。已检查的模块及建表定义不涉及上游凭据加密、路由缓存失效或跨表引用。记录可能包含用户输入的提示词和参数，仍受既有访问策略保护；低风险并不意味着数据可公开。

实际建表文件是 `src/lib/db/migrations/084_playground_presets.sql`。旧注释和测试名称写的是 076；以真实文件而不是过期说明作为证据。

两条真实入口：
- `src/app/api/playground/presets/route.ts`：列表、新建；
- `src/app/api/playground/presets/[id]/route.ts`：读取、修改、删除。

原 Issue 的推理路由候选保留在 S2：它还有跨领域引用校验和带版本的本地缓存。本次盘点调整的是起步顺序，不是长期方向。

### 能力边界

Repository 提供分页列表及总数、按 ID 查询、新建、部分更新、删除。记录保持现有字段含义、JSON 规范化、ID／时间戳以及不存在记录时的返回约定。请求校验、管理／API Key 鉴权、HTTP 状态和错误映射、模型执行留在外部。不强制 ORM，不新增驱动或数据库选择配置，不改表、不部署生产。

现有外观层是同步接口。新的可移植接口应支持 Promise，但不能悄悄将旧导出改成 Promise，也不能给未来的网络数据库伪造同步访问。建议为两个异步路由增加明确的异步入口，经新 Repository 读写；若受支持的调用契约要求兼容，就保留薄的 SQLite-only 同步入口。底下共用一份 SQLite 实现，不复制 SQL。编码前确认受支持的兼容面；仓内调用和测试是证据，不能据此断言不存在外部消费者。

### 必须锁住的行为

- 正常新建／列表／读取／更新／删除，以及未知 ID。
- UUID／时间戳、按创建时间倒序、分页及总数；保留时间戳相同的现有行为，不顺手添加排序规则。
- 更新字段省略、显式 null、空更新、正常／损坏的已存 JSON，以及现有写入影响行数语义。
- 数据库重置和重开后，不持有过期连接。
- 路由鉴权、校验、CORS、错误和 HTTP 响应保持不变，包括集合与单项路由现有的鉴权处理差异；如需改鉴权，另提变化。
- 通用行为测试与直接写入损坏 SQLite 数据的夹具分开；明确 SQLite 驱动覆盖范围。
- 一个可独立审查／撤回的 PR，不改其他路由或上游账号行为。

### 已真实执行的现有基线

固定源码，Node v26.7.0，`node:sqlite` 驱动；四个既有测试文件，**33 通过、0 失败、0 跳过**：
- `tests/unit/db-playground-presets.test.ts`；
- `tests/unit/update-routes-keep-omitted-fields.test.ts`；
- `tests/unit/auto-candidate-overrides-7819.test.ts`；
- `tests/unit/auto-candidate-overrides-regression-7819.test.ts`。

这是现有行为基线，不是重构结果或完整 CI。使用固定源码归档、只读复用既有依赖、隔离的 HOME／临时目录、不继承秘密的环境白名单和只放行本机的网络防护。预期的数据库查询失败用例打印了错误日志并通过；源文件没有变化。本次仅验证 `node:sqlite`，其他运行时驱动仍需后续验证。

## 请维护者确认的节点

确认或修订能力归属图、接收分支／审查入口，以及 S1 的同步兼容处理。先接收一片 S1，用其真实差异和测试结果决定后续 PR 的粒度。本清单不替贡献者派任务，也不承诺进入某一版本。


## Complete file index / 完整文件索引

Each path below is part of the classified candidate set; membership is not a claim that a new repository is needed for that file. / 下列每个路径均已分类，列入清单不代表每个文件都要新建 Repository。

### R01 — Playground presets / 调试预设

- [`src/lib/db/playgroundPresets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/playgroundPresets.ts) — repository

### R02 — Prompt templates and small content registries / 提示词模板与小型内容登记

- [`src/lib/db/prompts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/prompts.ts) — mixed · also / 亦涉及 B01

### R03 — Model overrides and candidate policy / 模型覆盖与候选策略

- [`open-sse/services/autoCombo/taskFitness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/autoCombo/taskFitness.ts) — mixed · also / 亦涉及 R07, H01
- [`src/lib/db/autoCandidateOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/autoCandidateOverrides.ts) — repository · also / 亦涉及 R10
- [`src/lib/db/modelCapabilityOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelCapabilityOverrides.ts) — repository · also / 亦涉及 R07
- [`src/lib/db/modelContextOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelContextOverrides.ts) — repository · also / 亦涉及 R07
- [`src/lib/db/modelIntelligence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligence.ts) — mixed · also / 亦涉及 R07
- [`src/lib/db/models/compat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/compat.ts) — mixed · also / 亦涉及 R07, H01
- [`src/lib/db/models/customVisionOverride.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/customVisionOverride.ts) — mixed · also / 亦涉及 R07
- [`src/lib/db/models/modelPreserveVideoUrl.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelPreserveVideoUrl.ts) — mixed · also / 亦涉及 R07

### R04 — Combo definitions and model mappings / Combo 定义与模型映射

- [`src/lib/db/combos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/combos.ts) — mixed · also / 亦涉及 R06, R08, R15, B01, H01
- [`src/lib/db/modelComboMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelComboMappings.ts) — repository
- [`src/lib/db/repositories/routingConfigRepositories.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/routingConfigRepositories.ts) — support
- [`src/lib/db/repositories/sqliteComboRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteComboRepository.ts) — repository · also / 亦涉及 R12, R15
- [`src/lib/db/repositories/sqliteModelComboMappingRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteModelComboMappingRepository.ts) — mixed · also / 亦涉及 R05

### R05 — Routing, interception and parameter rules / 路由、拦截与参数规则

- [`src/lib/db/interceptionRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/interceptionRules.ts) — mixed
- [`src/lib/db/models/mitmAlias.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/mitmAlias.ts) — repository · also / 亦涉及 R07, R29
- [`src/lib/db/paramFilters.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/paramFilters.ts) — repository · also / 亦涉及 R06
- [`src/lib/db/reasoningRoutingRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningRoutingRules.ts) — repository · also / 亦涉及 R10, R04, R08
- [`src/mitm/_internal/standaloneRouting.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/_internal/standaloneRouting.cjs) — mixed · also / 亦涉及 R07, R29

### R06 — Product settings and feature policies / 产品设置与功能策略

- [`bin/cli/settings-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/settings-store.mjs) — mixed · also / 亦涉及 R11, B01, H01
- [`open-sse/services/ipFilter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/ipFilter.ts) — mixed
- [`src/lib/config/hotReload.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/config/hotReload.ts) — support · also / 亦涉及 B01
- [`src/lib/db/chatAdmissionSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/chatAdmissionSettings.ts) — mixed
- [`src/lib/db/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/featureFlags.ts) — repository · also / 亦涉及 R07, H01
- [`src/lib/db/functionalGatewayMirrors.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/functionalGatewayMirrors.ts) — mixed
- [`src/lib/db/piiSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/piiSettings.ts) — repository
- [`src/lib/db/rootLayoutSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/rootLayoutSettings.ts) — repository
- [`src/lib/db/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings.ts) — mixed · also / 亦涉及 R12, R04, R08, R10, R11, R07, R15, R17, B01
- [`src/lib/db/tierConfig.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tierConfig.ts) — mixed · also / 亦涉及 R07, B01
- [`src/lib/memory/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/settings.ts) — support · also / 亦涉及 R25, H01
- [`src/shared/utils/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/featureFlags.ts) — support · also / 亦涉及 H01

### R07 — Model catalog, aliases, discovery and pricing / 模型目录、别名、发现与价格

- [`open-sse/services/tierResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tierResolver.ts) — mixed · also / 亦涉及 R03, R06, H01
- [`src/lib/arenaEloSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/arenaEloSync.ts) — mixed · also / 亦涉及 R06, B01
- [`src/lib/catalogUserPricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/catalogUserPricing.ts) — mixed · also / 亦涉及 H01
- [`src/lib/db/ccDiscoveryAliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryAliases.ts) — mixed · also / 亦涉及 R06
- [`src/lib/db/discovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discovery.ts) — repository
- [`src/lib/db/discoveryResults.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discoveryResults.ts) — repository
- [`src/lib/db/models.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models.ts) — mixed · also / 亦涉及 R03, R08, R13, R04
- [`src/lib/db/models/activeSyncedCatalog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/activeSyncedCatalog.ts) — mixed · also / 亦涉及 R03, R08, R09
- [`src/lib/db/models/aliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/aliases.ts) — repository
- [`src/lib/db/models/syncedAvailableModelPersistence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelPersistence.ts) — mixed · also / 亦涉及 R03, H01
- [`src/lib/db/models/syncedAvailableModelVision.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelVision.ts) — cache-index · also / 亦涉及 H01
- [`src/lib/db/serviceModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/serviceModels.ts) — repository · also / 亦涉及 R29
- [`src/lib/db/settings/pricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/pricing.ts) — mixed · also / 亦涉及 B01
- [`src/lib/db/validatedModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/validatedModels.ts) — mixed · also / 亦涉及 R08, R09, R12, R06, R23, R16
- [`src/lib/modelsDevSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/modelsDevSync.ts) — mixed · also / 亦涉及 B01, R06, H01
- [`src/lib/pricingSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/pricingSync.ts) — mixed · also / 亦涉及 B01, H01

### R08 — Provider connections and credentials / 上游账号连接与凭据

- [`bin/cli/provider-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/provider-store.mjs) — mixed · also / 亦涉及 B01, R15, H01
- [`src/lib/cloudAgent/credentials.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/credentials.ts) — repository · also / 亦涉及 R29, H01
- [`src/lib/db/providers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers.ts) — mixed · also / 亦涉及 R15, R09, R07, R12, R17, B01, H01
- [`src/lib/db/providers/deletion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/deletion.ts) — mixed · also / 亦涉及 R12, R04, R15, R09, R07, R05
- [`src/lib/db/providers/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/migrations.ts) — mixed · also / 亦涉及 B01, H01
- [`src/lib/omnirouteStatus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/omnirouteStatus.ts) — mixed · also / 亦涉及 R13, R15, B01

### R09 — Provider nodes, plans and limits / 上游节点、套餐与限制

- [`src/lib/db/providerLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerLimits.ts) — cache-index · also / 亦涉及 R15
- [`src/lib/db/providerPlans.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerPlans.ts) — repository
- [`src/lib/db/providers/nodePrefix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodePrefix.ts) — cache-index · also / 亦涉及 H01, R07
- [`src/lib/db/providers/nodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodes.ts) — repository · also / 亦涉及 R08, H01

### R10 — API keys, groups and permission bindings / API Key、分组与权限绑定

- [`src/lib/db/apiKeyAccessAssign.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyAccessAssign.ts) — mixed
- [`src/lib/db/apiKeyGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyGroups.ts) — mixed · also / 亦涉及 R07
- [`src/lib/db/apiKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys.ts) — mixed · also / 亦涉及 R07, R14, R16, R19, B01
- [`src/lib/db/apiKeys/displayNames.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/displayNames.ts) — repository
- [`src/lib/db/apiKeys/modelPermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissions.ts) — support · also / 亦涉及 H01, R06, R07
- [`src/lib/db/apiKeys/publishedModelLookup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/publishedModelLookup.ts) — support · also / 亦涉及 R07, R09
- [`src/lib/db/apiKeys/selfLoopKey.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/selfLoopKey.ts) — support · also / 亦涉及 H01

### R11 — Access credentials, sync tokens and registrations / 访问凭据、同步令牌与注册

- [`src/lib/db/accessTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/accessTokens.ts) — mixed
- [`src/lib/db/commandCodeAuth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/commandCodeAuth.ts) — repository · also / 亦涉及 H01
- [`src/lib/db/registeredKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/registeredKeys.ts) — mixed · also / 亦涉及 R14
- [`src/lib/db/relayProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProxies.ts) — mixed · also / 亦涉及 R14, R17, R18
- [`src/lib/db/secrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/secrets.ts) — repository · also / 亦涉及 H01
- [`src/lib/db/syncTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/syncTokens.ts) — mixed · also / 亦涉及 B01
- [`src/lib/obsidian/api.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidian/api.ts) — mixed · also / 亦涉及 R29

### R12 — Proxy configuration, subscriptions and assignments / 代理配置、订阅与分配

- [`src/lib/db/freeProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/freeProxies.ts) — repository · also / 亦涉及 B01
- [`src/lib/db/oneproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/oneproxy.ts) — repository
- [`src/lib/db/proxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies.ts) — mixed · also / 亦涉及 R18, R17, R08, R15, H01
- [`src/lib/db/proxies/guards.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/guards.ts) — mixed · also / 亦涉及 R06, R08
- [`src/lib/db/proxies/rotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/rotation.ts) — mixed · also / 亦涉及 R15, R18, R08
- [`src/lib/db/proxyLatency.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLatency.ts) — mixed · also / 亦涉及 R18
- [`src/lib/db/proxyOperatorEgress.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyOperatorEgress.ts) — cache-index
- [`src/lib/db/proxySubscriptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxySubscriptions.ts) — repository · also / 亦涉及 B01
- [`src/lib/db/settings/noAuthProxyFallback.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/noAuthProxyFallback.ts) — support · also / 亦涉及 H01
- [`src/lib/proxySubscription/due.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/due.ts) — support
- [`src/lib/proxySubscription/reloadSecret.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/reloadSecret.ts) — mixed · also / 亦涉及 H01
- [`src/lib/proxySubscription/selectorGuard.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorGuard.ts) — mixed · also / 亦涉及 R06
- [`src/lib/proxySubscription/selectorTrigger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorTrigger.ts) — mixed · also / 亦涉及 R16, H01
- [`src/lib/proxySubscription/staleNodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/staleNodes.ts) — support · also / 亦涉及 H01
- [`src/lib/proxySubscription/subscriptionService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/subscriptionService.ts) — mixed · also / 亦涉及 R06, R16, R29, B01

### R13 — Quota pool/group/allocation/schedule definitions / 额度池、分组、分配与计划定义

- [`src/lib/db/quotaGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaGroups.ts) — repository · also / 亦涉及 R07
- [`src/lib/db/quotaModelCaps.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaModelCaps.ts) — repository
- [`src/lib/db/quotaPools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaPools.ts) — mixed · also / 亦涉及 R04, R10, R08, R07, R16
- [`src/lib/db/quotaSchedules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSchedules.ts) — repository

### R14 — Quota, token and spend accounting / 额度、Token 与花费记账

- [`open-sse/services/tokenLimitCounter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tokenLimitCounter.ts) — mixed · also / 亦涉及 R17
- [`src/lib/db/domainState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/domainState.ts) — mixed · also / 亦涉及 R05, R13, R15, R11, R17, B01
- [`src/lib/db/keyQuota.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/keyQuota.ts) — mixed · also / 亦涉及 R10
- [`src/lib/db/quotaConsumption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaConsumption.ts) — repository
- [`src/lib/db/quotaResetEvents.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaResetEvents.ts) — mixed · also / 亦涉及 R15, R17
- [`src/lib/db/tokenLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tokenLimits.ts) — mixed · also / 亦涉及 R10, B01
- [`src/lib/quota/providerQuotaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/providerQuotaState.ts) — repository · also / 亦涉及 R09
- [`src/lib/quota/quotaResetTimers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaResetTimers.ts) — repository
- [`src/lib/usage/apiKeyUsageLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeyUsageLimits.ts) — mixed · also / 亦涉及 R17, R07, R10, R09

### R15 — Affinity, continuation and account runtime state / 会话粘性、续接与账号运行态

- [`open-sse/services/geminiThoughtSignatureStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/geminiThoughtSignatureStore.ts) — cache-index · also / 亦涉及 H01
- [`open-sse/services/usage/antigravity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/usage/antigravity.ts) — mixed · also / 亦涉及 H01, R07, R09, R15, R17
- [`src/lib/db/connectionRuntimeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/connectionRuntimeState.ts) — repository
- [`src/lib/db/contextHandoffs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/contextHandoffs.ts) — repository · also / 亦涉及 R04
- [`src/lib/db/creditBalance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/creditBalance.ts) — cache-index · also / 亦涉及 R14
- [`src/lib/db/providers/codexAccountRecovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountRecovery.ts) — mixed · also / 亦涉及 R08
- [`src/lib/db/providers/codexAccountState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountState.ts) — mixed · also / 亦涉及 R08, H01
- [`src/lib/db/providers/providerSpecificDataMerge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataMerge.ts) — repository · also / 亦涉及 R08, R07
- [`src/lib/db/providers/rateLimit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/rateLimit.ts) — mixed · also / 亦涉及 R08, H01
- [`src/lib/db/responsesContinuationStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/responsesContinuationStore.ts) — mixed · also / 亦涉及 R18, R21
- [`src/lib/db/sessionAccountAffinity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sessionAccountAffinity.ts) — cache-index
- [`src/lib/db/settings/lkgp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/lkgp.ts) — cache-index · also / 亦涉及 R04, R08
- [`src/lib/warmupScheduler/circuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerStore.ts) — coordination
- [`src/lib/warmupScheduler/redisCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/redisCircuitBreakerStore.ts) — coordination
- [`src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts) — coordination
- [`src/sse/services/auth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/sse/services/auth.ts) — mixed · also / 亦涉及 R08, R16, R10, R09, R06, R18

### R16 — Exclusive leases, execution fences and job ownership / 独占租约、执行围栏与任务归属

- [`src/lib/db/codexWakeups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/codexWakeups.ts) — mixed · also / 亦涉及 R21
- [`src/lib/db/exclusiveConnectionLeases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/exclusiveConnectionLeases.ts) — coordination · also / 亦涉及 R08, R10
- [`src/lib/db/skillExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skillExecutionFence.ts) — coordination · also / 亦涉及 R23
- [`src/lib/jobRegistry/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/index.ts) — support · also / 亦涉及 H01
- [`src/lib/jobRegistry/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/registry.ts) — coordination
- [`src/lib/skills/toolExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/toolExecutionFence.ts) — coordination · also / 亦涉及 R23
- [`src/lib/warmupScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler.ts) — mixed · also / 亦涉及 R15, R08, R06, R12

### R17 — Usage, cost records and read models / 用量、成本记录与统计读模型

- [`src/lib/db/ccDiscoveryMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryMetrics.ts) — repository · also / 亦涉及 R07
- [`src/lib/db/comboForecast.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/comboForecast.ts) — repository · also / 亦涉及 R18
- [`src/lib/db/costLedger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/costLedger.ts) — repository · also / 亦涉及 R14, R18
- [`src/lib/db/providerStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerStats.ts) — repository · also / 亦涉及 R18, R09
- [`src/lib/db/providers/usageIdentityReconciliation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/usageIdentityReconciliation.ts) — repository · also / 亦涉及 R08
- [`src/lib/db/quotaSnapshots.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSnapshots.ts) — mixed · also / 亦涉及 R15, R14
- [`src/lib/db/settings/cacheMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/cacheMetrics.ts) — repository
- [`src/lib/db/usageAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics.ts) — repository · also / 亦涉及 R14
- [`src/lib/db/usageSummary.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageSummary.ts) — repository
- [`src/lib/quota/quotaAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaAnalytics.ts) — repository · also / 亦涉及 R14
- [`src/lib/usage/aggregateHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/aggregateHistory.ts) — mixed · also / 亦涉及 R07, B01
- [`src/lib/usage/analyticsResponseCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/analyticsResponseCache.ts) — cache-index · also / 亦涉及 R26
- [`src/lib/usage/apiKeySelfService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeySelfService.ts) — mixed · also / 亦涉及 R10, R14, R08, R09
- [`src/lib/usage/cacheHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/cacheHealth.ts) — mixed · also / 亦涉及 R18
- [`src/lib/usage/comboHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/comboHealth.ts) — mixed · also / 亦涉及 R18, R04, R09
- [`src/lib/usage/connectionSpeedStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/connectionSpeedStats.ts) — mixed · also / 亦涉及 R09
- [`src/lib/usage/providerWindowCosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/providerWindowCosts.ts) — mixed · also / 亦涉及 R14, R09, R10, R07
- [`src/lib/usage/usageHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory.ts) — mixed · also / 亦涉及 R18, H01
- [`src/lib/usage/usageHistory/duplicateEntry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory/duplicateEntry.ts) — support · also / 亦涉及 H01
- [`src/lib/usage/usageStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageStats.ts) — mixed · also / 亦涉及 R14, R07, R08, R10
- [`src/lib/usage/usageWriteRetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageWriteRetry.ts) — mixed · also / 亦涉及 R08, H01

### R18 — Call/detail/proxy logs and export cursors / 调用、明细、代理日志与导出游标

- [`src/lib/db/callLogDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogDetails.ts) — coordination · also / 亦涉及 R16
- [`src/lib/db/callLogStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogStats.ts) — repository · also / 亦涉及 R17, R08
- [`src/lib/db/detailedLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/detailedLogs.ts) — repository · also / 亦涉及 R06, R19
- [`src/lib/db/inspectorSessions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorSessions.ts) — repository
- [`src/lib/db/proxyLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLogs.ts) — repository · also / 亦涉及 R12
- [`src/lib/db/usageLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageLogs.ts) — repository · also / 亦涉及 R17
- [`src/lib/monitoring/providerHealthMatrix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/monitoring/providerHealthMatrix.ts) — mixed · also / 亦涉及 R08, R07, R15, H01
- [`src/lib/proxyLogger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxyLogger.ts) — mixed · also / 亦涉及 B01, H01
- [`src/lib/usage/callLogDetailResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogDetailResolver.ts) — support · also / 亦涉及 H01
- [`src/lib/usage/callLogExportQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportQueries.ts) — repository · also / 亦涉及 R22, R08, R09
- [`src/lib/usage/callLogExportSource.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportSource.ts) — support · also / 亦涉及 R22
- [`src/lib/usage/callLogFilterOptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogFilterOptions.ts) — repository · also / 亦涉及 R08
- [`src/lib/usage/callLogRotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogRotation.ts) — mixed · also / 亦涉及 B01, R16
- [`src/lib/usage/callLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogs.ts) — mixed · also / 亦涉及 R15, R19, R17, R08, R09
- [`src/lib/usage/callLogsBoundedQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogsBoundedQueries.ts) — support · also / 亦涉及 H01
- [`src/lib/usage/completedRequestDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/completedRequestDetails.ts) — cache-index · also / 亦涉及 H01

### R19 — Audit and compliance records / 审计与合规记录

- [`open-sse/mcp-server/audit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/audit.ts) — mixed · also / 亦涉及 B01, H01
- [`src/domain/configAudit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/configAudit.ts) — repository · also / 亦涉及 H01
- [`src/lib/compliance/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/index.ts) — mixed · also / 亦涉及 R17, R18, B01, R06
- [`src/lib/compliance/noLog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/noLog.ts) — mixed · also / 亦涉及 R10

### R20 — Compression policies and telemetry / 压缩策略与遥测

- [`open-sse/mcp-server/server.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/server.ts) — mixed · also / 亦涉及 R19, R23
- [`src/lib/db/ccrBlocks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccrBlocks.ts) — cache-index · also / 亦涉及 R26
- [`src/lib/db/compression.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compression.ts) — mixed · also / 亦涉及 H01, B01
- [`src/lib/db/compressionAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionAnalytics.ts) — mixed · also / 亦涉及 R17, B01
- [`src/lib/db/compressionCacheStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCacheStats.ts) — repository · also / 亦涉及 R17
- [`src/lib/db/compressionCombos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCombos.ts) — mixed · also / 亦涉及 R04, B01
- [`src/lib/db/compressionRunTelemetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionRunTelemetry.ts) — mixed · also / 亦涉及 R17, B01

### R21 — Tasks, batches, conversations and file metadata / 任务、批处理、对话与文件元数据

- [`open-sse/services/conversationTurnContent.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/conversationTurnContent.ts) — mixed · also / 亦涉及 R18
- [`src/lib/cloudAgent/db.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/db.ts) — mixed · also / 亦涉及 B01
- [`src/lib/db/a2aTasks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/a2aTasks.ts) — repository
- [`src/lib/db/agenticConversations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agenticConversations.ts) — mixed · also / 亦涉及 R18, R15
- [`src/lib/db/batches.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/batches.ts) — repository · also / 亦涉及 R16
- [`src/lib/db/files.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/files.ts) — repository
- [`src/lib/db/jobRegistryDb.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jobRegistryDb.ts) — repository · also / 亦涉及 R16

### R22 — Webhooks and log-export destinations/delivery records / Webhook、日志导出目标与投递记录

- [`src/lib/db/logExportDestinations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportDestinations.ts) — repository · also / 亦涉及 R18
- [`src/lib/db/webhookDeliveries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhookDeliveries.ts) — repository
- [`src/lib/db/webhooks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhooks.ts) — repository
- [`src/lib/logExport/childRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/childRunner.ts) — support · also / 亦涉及 R18
- [`src/lib/logExport/exportChild.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/exportChild.ts) — mixed · also / 亦涉及 R18, B01
- [`src/lib/logExport/runner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/runner.ts) — mixed · also / 亦涉及 R18, R16

### R23 — Extensions, skills, middleware and execution records / 插件、Skill、中间件与执行记录

- [`src/lib/db/middleware.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/middleware.ts) — repository · also / 亦涉及 R04
- [`src/lib/db/pluginMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/pluginMetrics.ts) — repository
- [`src/lib/db/plugins.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/plugins.ts) — repository · also / 亦涉及 R29
- [`src/lib/db/skills.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skills.ts) — repository
- [`src/lib/skills/executor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/executor.ts) — mixed · also / 亦涉及 R16, R06
- [`src/lib/skills/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/registry.ts) — mixed · also / 亦涉及 H01

### R24 — Evaluation and assessment records / 评测与评估记录

- [`scripts/router-eval/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/router-eval/index.ts) — support · also / 亦涉及 R17, R18
- [`src/lib/db/evals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/evals.ts) — repository · also / 亦涉及 B01, R05

### R25 — Memory documents and search/vector indexes / 记忆文档与全文、向量索引

- [`src/lib/db/memoryVec.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/memoryVec.ts) — cache-index
- [`src/lib/memory/embedding/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/embedding/index.ts) — support · also / 亦涉及 R08, R09
- [`src/lib/memory/reindex.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/reindex.ts) — mixed · also / 亦涉及 R16
- [`src/lib/memory/retrieval.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/retrieval.ts) — mixed · also / 亦涉及 R10, B01, R26
- [`src/lib/memory/store.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/store.ts) — mixed · also / 亦涉及 H01
- [`src/lib/memory/summarization.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/summarization.ts) — mixed
- [`src/lib/memory/typedDecay.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/typedDecay.ts) — mixed · also / 亦涉及 R16
- [`src/lib/memory/vectorStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/vectorStore.ts) — cache-index · also / 亦涉及 B01

### R26 — Semantic/reasoning caches and metrics / 语义、推理缓存与指标

- [`src/lib/db/reasoningCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningCache.ts) — cache-index · also / 亦涉及 R15
- [`src/lib/db/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/semanticCache.ts) — cache-index
- [`src/lib/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/semanticCache.ts) — cache-index · also / 亦涉及 H01, B01

### R27 — Gamification and community ledgers / 积分、社区与激励账本

- [`src/lib/db/gamification.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/gamification.ts) — repository · also / 亦涉及 R11
- [`src/lib/gamification/antiCheat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/antiCheat.ts) — mixed
- [`src/lib/gamification/badges.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/badges.ts) — mixed
- [`src/lib/gamification/events.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/events.ts) — mixed
- [`src/lib/gamification/invites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/invites.ts) — mixed · also / 亦涉及 R11
- [`src/lib/gamification/servers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/servers.ts) — mixed · also / 亦涉及 R11
- [`src/lib/gamification/streaks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/streaks.ts) — mixed

### R28 — Radar feeds and discovery snapshots / Radar 信息流与发现快照

- [`src/lib/db/radar.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/radar.ts) — mixed · also / 亦涉及 R11, H01
- [`src/lib/radar/referrals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/radar/referrals.ts) — support

### R29 — Bridge/integration and local-tool state / 桥接、集成与本地工具状态

- [`electron/main.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/main.js) — mixed · also / 亦涉及 H01, B01
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts) — mixed · also / 亦涉及 L01, R16, R15, R08
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts) — local-integration
- [`scripts/dev/sync-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/sync-env.mjs) — support · also / 亦涉及 B01, R08
- [`scripts/dev/webdav-handler.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/webdav-handler.mjs) — mixed · also / 亦涉及 R06, H01, L01
- [`src/app/api/internal/codex-responses-ws/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/internal/codex-responses-ws/route.ts) — mixed · also / 亦涉及 R16, R10, R08, R05, R25, R12, R18, R20, R04
- [`src/lib/db/agentBridgeBypass.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeBypass.ts) — repository
- [`src/lib/db/agentBridgeMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeMappings.ts) — mixed · also / 亦涉及 R07
- [`src/lib/db/agentBridgeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeState.ts) — repository
- [`src/lib/db/apiKeyContextSources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyContextSources.ts) — repository · also / 亦涉及 R10, R11
- [`src/lib/db/cliToolState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cliToolState.ts) — repository
- [`src/lib/db/conductorBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/conductorBridge.ts) — repository
- [`src/lib/db/inspectorCustomHosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorCustomHosts.ts) — repository · also / 亦涉及 R05
- [`src/lib/db/localCorpus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/localCorpus.ts) — repository · also / 亦涉及 R06
- [`src/lib/db/notion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/notion.ts) — repository · also / 亦涉及 R11
- [`src/lib/db/obsidian.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/obsidian.ts) — mixed · also / 亦涉及 R11, R10
- [`src/lib/db/upstreamProxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/upstreamProxy.ts) — mixed · also / 亦涉及 R12
- [`src/lib/db/versionManager.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/versionManager.ts) — repository
- [`src/lib/headroom/process.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/headroom/process.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/obsidianSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidianSync.ts) — mixed · also / 亦涉及 L01, R11
- [`src/lib/services/installers/bifrost.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/bifrost.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/services/installers/cliproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/cliproxy.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/services/installers/dario.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/dario.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/services/installers/llmlingua.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/llmlingua.ts) — local-integration · also / 亦涉及 R20, L01
- [`src/lib/services/installers/mux.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/mux.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/services/installers/ninerouter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/ninerouter.ts) — local-integration · also / 亦涉及 L01
- [`src/lib/services/installers/openwa.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/openwa.ts) — local-integration · also / 亦涉及 L01
- [`src/mitm/server.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/server.cjs) — mixed · also / 亦涉及 R07, R18, B01

### B01 — Backend lifecycle and SQLite maintenance / 数据库生命周期与 SQLite 运维

- [`bin/cli/commands/backup.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/backup.mjs) — backend-ops
- [`bin/cli/commands/doctor.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/doctor.mjs) — backend-ops · also / 亦涉及 H01, R29
- [`bin/cli/commands/reset-encrypted-columns.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/reset-encrypted-columns.mjs) — backend-ops · also / 亦涉及 R08
- [`bin/cli/commands/runtime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/runtime.mjs) — backend-ops
- [`bin/cli/commands/sync-import.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/sync-import.mjs) — backend-ops
- [`bin/cli/runtime/nativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/nativeDeps.mjs) — backend-ops
- [`bin/cli/runtime/sqliteRuntime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/sqliteRuntime.mjs) — backend-ops
- [`bin/cli/sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/sqlite.mjs) — mixed · also / 亦涉及 R08, R11, R06, H01
- [`electron/sqlite-inspection.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/sqlite-inspection.js) — support · also / 亦涉及 R08
- [`scripts/build/bootstrap-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/bootstrap-env.mjs) — backend-ops · also / 亦涉及 R08, H01
- [`src/app/api/db-backups/export/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/export/route.ts) — backend-ops · also / 亦涉及 R08, R10
- [`src/app/api/db-backups/exportAll/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/exportAll/route.ts) — backend-ops · also / 亦涉及 R18, R08, R10, R04, R06, R05
- [`src/app/api/db-backups/import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/import/route.ts) — backend-ops · also / 亦涉及 R06, R08, R10
- [`src/app/api/db/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db/health/route.ts) — backend-ops
- [`src/app/api/health/ping/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/health/ping/route.ts) — backend-ops
- [`src/app/api/settings/database/vacuum/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/database/vacuum/route.ts) — backend-ops
- [`src/app/api/settings/import-json/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/import-json/route.ts) — backend-ops · also / 亦涉及 R06, R08, R10, R04, R17, H01
- [`src/app/api/storage/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/storage/health/route.ts) — backend-ops · also / 亦涉及 R18
- [`src/domain/assessment/migration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/assessment/migration.ts) — backend-ops · also / 亦涉及 R04, R24
- [`src/instrumentation-node.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/instrumentation-node.ts) — mixed · also / 亦涉及 R11, R06, R07, R08, R15, R14, R19, R25, R28, R12, R21
- [`src/lib/db/adapters/betterSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/betterSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/bunSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/bunSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/driverFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/driverFactory.ts) — backend-ops
- [`src/lib/db/adapters/nodeSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteAdapter.ts) — backend-ops
- [`src/lib/db/adapters/nodeSqliteShared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteShared.ts) — backend-ops
- [`src/lib/db/adapters/sqljsAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/sqljsAdapter.ts) — backend-ops
- [`src/lib/db/adapters/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/types.ts) — backend-ops
- [`src/lib/db/apiKeyColumnFallbacks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyColumnFallbacks.ts) — backend-ops · also / 亦涉及 R10
- [`src/lib/db/backup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backup.ts) — backend-ops · also / 亦涉及 R06
- [`src/lib/db/backupPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupPaths.ts) — support · also / 亦涉及 H01
- [`src/lib/db/backupRetention.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupRetention.ts) — backend-ops · also / 亦涉及 R06
- [`src/lib/db/cleanup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup.ts) — mixed · also / 亦涉及 R17, R18, R19, R20, R21, R25, R27, R14, R15, R16
- [`src/lib/db/cleanup/backupPrune.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/backupPrune.ts) — backend-ops
- [`src/lib/db/core.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/core.ts) — backend-ops · also / 亦涉及 R08, R18, H01
- [`src/lib/db/databaseSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/databaseSettings.ts) — mixed · also / 亦涉及 R06, R26, R18, H01
- [`src/lib/db/healthCheck.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheck.ts) — backend-ops · also / 亦涉及 R04, R08, R10, R14, R17, R15
- [`src/lib/db/healthCheckRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckRunner.ts) — backend-ops
- [`src/lib/db/healthCheckWorker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckWorker.ts) — backend-ops
- [`src/lib/db/jsonMigration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration.ts) — backend-ops · also / 亦涉及 R04, R06, R07, R08, R09, R10, R12, R14, R17
- [`src/lib/db/logExportReadOnly.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportReadOnly.ts) — backend-ops · also / 亦涉及 R22
- [`src/lib/db/managedBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/managedBackup.ts) — backend-ops
- [`src/lib/db/migrationRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner.ts) — backend-ops
- [`src/lib/db/migrationRunner/extraDirs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/extraDirs.ts) — support · also / 亦涉及 H01
- [`src/lib/db/migrationRunner/preMigrationBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/preMigrationBackup.ts) — backend-ops
- [`src/lib/db/migrationRunner/schemaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/schemaState.ts) — backend-ops
- [`src/lib/db/optimizationSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/optimizationSettings.ts) — backend-ops
- [`src/lib/db/probeUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/probeUtils.ts) — backend-ops · also / 亦涉及 H01
- [`src/lib/db/reclaimFreedPages.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reclaimFreedPages.ts) — backend-ops
- [`src/lib/db/recovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/recovery.ts) — backend-ops · also / 亦涉及 R08
- [`src/lib/db/schemaColumns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/schemaColumns.ts) — backend-ops
- [`src/lib/db/singleton.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/singleton.ts) — backend-ops
- [`src/lib/db/sqliteLoadError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sqliteLoadError.ts) — support · also / 亦涉及 H01
- [`src/lib/db/stateReset.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stateReset.ts) — support · also / 亦涉及 H01
- [`src/lib/db/stats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stats.ts) — backend-ops
- [`src/lib/db/vacuumScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/vacuumScheduler.ts) — backend-ops
- [`src/lib/db/walMaintenance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/walMaintenance.ts) — backend-ops
- [`src/lib/gracefulShutdown.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gracefulShutdown.ts) — backend-ops · also / 亦涉及 R14, R18, R19
- [`src/lib/usage/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/migrations.ts) — backend-ops · also / 亦涉及 R17, R18, R08

### H01 — Shared mapping, encryption and cache helpers / 映射、加密与缓存辅助模块

- [`bin/cli/data-dir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/data-dir.mjs) — support · also / 亦涉及 B01
- [`bin/cli/privateDataDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/privateDataDir.mjs) — support · also / 亦涉及 B01
- [`bin/omniroute.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/omniroute.mjs) — mixed · also / 亦涉及 B01, R29
- [`src/lib/cache/semanticCacheDbBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cache/semanticCacheDbBridge.ts) — support · also / 亦涉及 R26, R08, R06
- [`src/lib/container.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/container.ts) — support · also / 亦涉及 B01, R06
- [`src/lib/dataPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/dataPaths.ts) — support · also / 亦涉及 B01
- [`src/lib/db/_rowTypes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/_rowTypes.ts) — support · also / 亦涉及 R29
- [`src/lib/db/adapters/runtimeRequire.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/runtimeRequire.ts) — support · also / 亦涉及 B01
- [`src/lib/db/adapters/slowDiagnostics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/slowDiagnostics.ts) — support · also / 亦涉及 B01
- [`src/lib/db/apiKeyUsageLimitFields.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyUsageLimitFields.ts) — support · also / 亦涉及 R10, R14
- [`src/lib/db/apiKeys/modelAccessMode.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelAccessMode.ts) — support · also / 亦涉及 R10
- [`src/lib/db/apiKeys/modelPermissionCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissionCache.ts) — support · also / 亦涉及 R10, R07
- [`src/lib/db/apiKeys/permissionsUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/permissionsUpdate.ts) — support · also / 亦涉及 R10
- [`src/lib/db/apiKeys/rowParsers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/rowParsers.ts) — support · also / 亦涉及 R10
- [`src/lib/db/apiKeys/secretAtRest.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/secretAtRest.ts) — support · also / 亦涉及 R10
- [`src/lib/db/apiKeys/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/types.ts) — support · also / 亦涉及 R10
- [`src/lib/db/cacheSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cacheSecrets.ts) — support · also / 亦涉及 R06, R26
- [`src/lib/db/caseMapping.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/caseMapping.ts) — support · also / 亦涉及 B01
- [`src/lib/db/cleanup/usagePurge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/usagePurge.ts) — support · also / 亦涉及 B01, R18
- [`src/lib/db/compressionContextBudget.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionContextBudget.ts) — support · also / 亦涉及 R20
- [`src/lib/db/compressionDetailNormalizers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionDetailNormalizers.ts) — support · also / 亦涉及 R20
- [`src/lib/db/encryption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/encryption.ts) — support · also / 亦涉及 R08, B01
- [`src/lib/db/filePermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/filePermissions.ts) — support · also / 亦涉及 B01, R08
- [`src/lib/db/jsonMigration/apiKeysImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/apiKeysImport.ts) — support · also / 亦涉及 B01, R10
- [`src/lib/db/jsonMigration/columnUpsert.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/columnUpsert.ts) — support · also / 亦涉及 B01, R08, R10
- [`src/lib/db/jsonMigration/connectionsImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/connectionsImport.ts) — support · also / 亦涉及 B01, R08
- [`src/lib/db/migrationRunner/constants.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/constants.ts) — support · also / 亦涉及 B01
- [`src/lib/db/migrationRunner/logger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/logger.ts) — support · also / 亦涉及 B01
- [`src/lib/db/modelIntelligenceGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligenceGeneration.ts) — support · also / 亦涉及 R03
- [`src/lib/db/models/capabilityModalities.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/capabilityModalities.ts) — support · also / 亦涉及 R07
- [`src/lib/db/models/modelCatalogWriteSignals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelCatalogWriteSignals.ts) — support · also / 亦涉及 R07, B01
- [`src/lib/db/models/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/shared.ts) — support · also / 亦涉及 R07
- [`src/lib/db/models/synced.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/synced.ts) — support · also / 亦涉及 R07
- [`src/lib/db/models/syncedCatalogFreshness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedCatalogFreshness.ts) — support · also / 亦涉及 R07
- [`src/lib/db/providerNodeSelect.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerNodeSelect.ts) — support · also / 亦涉及 R09
- [`src/lib/db/providers/columns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/columns.ts) — support · also / 亦涉及 R08, R09
- [`src/lib/db/providers/lazyConnectionView.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/lazyConnectionView.ts) — support · also / 亦涉及 R08
- [`src/lib/db/providers/providerSpecificData.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificData.ts) — support · also / 亦涉及 R08, R09
- [`src/lib/db/providers/providerSpecificDataSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataSecrets.ts) — support · also / 亦涉及 R08, R19
- [`src/lib/db/proxies/mappers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/mappers.ts) — support · also / 亦涉及 R12
- [`src/lib/db/proxies/registryGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/registryGeneration.ts) — support · also / 亦涉及 R12
- [`src/lib/db/proxies/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/types.ts) — support · also / 亦涉及 R12
- [`src/lib/db/readCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/readCache.ts) — support · also / 亦涉及 R06, R07, R08, R09, R04, R15
- [`src/lib/db/settings/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/shared.ts) — support · also / 亦涉及 R06
- [`src/lib/db/usageAnalytics/sources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics/sources.ts) — support · also / 亦涉及 R17
- [`src/lib/db/webSessionDedup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webSessionDedup.ts) — support · also / 亦涉及 R08
- [`src/lib/instrumentationBootError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/instrumentationBootError.ts) — support · also / 亦涉及 B01
- [`src/lib/warmupScheduler/circuitBreakerFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerFactory.ts) — support · also / 亦涉及 R15
- [`src/shared/platform/windowsProcess.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/platform/windowsProcess.ts) — support · also / 亦涉及 B01
- [`src/shared/schemas/memory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/schemas/memory.ts) — support · also / 亦涉及 R25, R06
- [`src/shared/utils/globPattern.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/globPattern.ts) — support · also / 亦涉及 R04

### L01 — Local/vendor database integration / 本机或第三方数据库集成

- [`open-sse/utils/cursorVersionDetector.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/utils/cursorVersionDetector.ts) — local-integration · also / 亦涉及 R29
- [`src/app/api/oauth/kiro/auto-import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/oauth/kiro/auto-import/route.ts) — local-integration · also / 亦涉及 R29, R08, R12
- [`src/lib/copilot/codegraphKnowledge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/codegraphKnowledge.ts) — local-integration
- [`src/lib/cursor/tokenExtractor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cursor/tokenExtractor.ts) — local-integration · also / 亦涉及 R29
- [`src/lib/db/omp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/omp.ts) — local-integration · also / 亦涉及 R29

### X01 — Non-persistence or tooling-only matches / 非持久化或工具性命中

- [`bin/cli/commands/serve.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/serve.mjs) — mixed · also / 亦涉及 R06
- [`bin/cli/commands/update.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/update.mjs) — excluded
- [`bin/cli/runtime/trayRuntime.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/trayRuntime.ts) — excluded
- [`bin/cli/utils/ensureAndroidCacheDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/utils/ensureAndroidCacheDir.mjs) — excluded
- [`bin/mcpStdioConsoleGuard.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/mcpStdioConsoleGuard.mjs) — excluded
- [`next.config.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/next.config.mjs) — excluded
- [`open-sse/executors/notrack-web.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/executors/notrack-web.ts) — excluded
- [`open-sse/mcp-server/tools/advancedTools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/tools/advancedTools.ts) — support · also / 亦涉及 R04, R06, R07, R12, R14, R17, R19, R26, B01
- [`open-sse/services/compression/harness/benchmark.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/compression/harness/benchmark.ts) — excluded · also / 亦涉及 R20
- [`scripts/build/afterpack-copy-node-modules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/afterpack-copy-node-modules.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/assembleStandalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/assembleStandalone.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/better-sqlite3-stub-flag.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/better-sqlite3-stub-flag.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/betterSqlitePrebuildTarget.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/betterSqlitePrebuildTarget.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/build-next-isolated.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/build-next-isolated.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/electronRebuildPlan.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/electronRebuildPlan.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/hydrateNativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/hydrateNativeDeps.mjs) — excluded · also / 亦涉及 B01
- [`scripts/build/pack-artifact-policy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/pack-artifact-policy.ts) — excluded
- [`scripts/build/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/postinstall.mjs) — excluded · also / 亦涉及 B01, H01
- [`scripts/build/prepare-electron-standalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/prepare-electron-standalone.mjs) — excluded · also / 亦涉及 B01
- [`scripts/check/audit-sqlite-coupling.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/audit-sqlite-coupling.mjs) — excluded
- [`scripts/check/check-db-rules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-db-rules.mjs) — excluded · also / 亦涉及 L01
- [`scripts/check/check-env-doc-sync.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-env-doc-sync.mjs) — excluded
- [`scripts/check/check-install-upgrade.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-install-upgrade.mjs) — excluded · also / 亦涉及 B01
- [`scripts/check/check-native-deps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-native-deps.mjs) — excluded · also / 亦涉及 B01
- [`scripts/check/check-route-guard-membership.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-route-guard-membership.ts) — excluded
- [`scripts/check/lib/readmeMigrationCount.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/lib/readmeMigrationCount.mjs) — excluded
- [`scripts/ci/verify-ci-install.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/ci/verify-ci-install.mjs) — excluded
- [`scripts/dev/ensure-native-sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/ensure-native-sqlite.mjs) — excluded · also / 亦涉及 B01
- [`scripts/dev/run-next.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/run-next.mjs) — excluded · also / 亦涉及 B01
- [`scripts/dev/smoke-electron-packaged.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/smoke-electron-packaged.mjs) — excluded · also / 亦涉及 B01
- [`scripts/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/postinstall.mjs) — excluded · also / 亦涉及 B01
- [`src/app/(dashboard)/dashboard/providers/[id]/components/modals/ImportCodexAuthModal.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/%5Bid%5D/components/modals/ImportCodexAuthModal.tsx) — excluded · also / 亦涉及 R08, R29
- [`src/app/(dashboard)/dashboard/providers/providerPageUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/providerPageUtils.ts) — excluded
- [`src/app/(dashboard)/dashboard/settings/components/SidebarTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SidebarTab.tsx) — excluded · also / 亦涉及 R06
- [`src/app/(dashboard)/dashboard/settings/components/SystemStorageTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SystemStorageTab.tsx) — excluded · also / 亦涉及 B01, R18, R17
- [`src/app/api/system/version/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/system/version/route.ts) — excluded · also / 亦涉及 B01
- [`src/app/privacy/page.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/privacy/page.tsx) — excluded
- [`src/lib/copilot/systemPrompt.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/systemPrompt.ts) — excluded
- [`src/lib/db/better-sqlite3.stub.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/better-sqlite3.stub.js) — excluded · also / 亦涉及 B01
- [`src/lib/db/relayProbeStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProbeStats.ts) — excluded · also / 亦涉及 R12
- [`src/lib/evals/evalRunner/builtinSuites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/evals/evalRunner/builtinSuites.ts) — excluded
- [`src/lib/oauth/services/cursor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/oauth/services/cursor.ts) — excluded · also / 亦涉及 R29
- [`src/lib/system/autoUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/autoUpdate.ts) — excluded
- [`src/lib/system/globalPackagePath.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/globalPackagePath.ts) — excluded
- [`src/shared/components/compression/CompressionPipelineEditor.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/components/compression/CompressionPipelineEditor.tsx) — excluded · also / 亦涉及 R20
- [`src/shared/constants/featureFlagDefinitions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/constants/featureFlagDefinitions.ts) — excluded · also / 亦涉及 R06
- [`src/shared/utils/formatting.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/formatting.ts) — excluded
