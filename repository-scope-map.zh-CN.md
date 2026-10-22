# OmniRoute Repository 范围与实现地图

**待讨论提案。** 源码：`0482755c5e4faeeb23736b9e56ec293d84809efa`。英文版：[repository-scope-map.en.md](repository-scope-map.en.md)。

## 覆盖范围

- 从固定 Git 树解析 14,339 个受版本控制的脚本源文件，排除测试／夹具后为 6,200 个。AST 筛出 346 个持久化／边界候选，SQLite 专属词法补扫增加 55 个；**401 个唯一候选文件均有主归属**。它们归为 **29 个业务能力范围和 4 类支撑／非领域边界**，不是 401 个 Repository，也不预先规定 33 个 PR。
- 扫描范围：src、open-sse（含 vendored 源码）、bin、electron、packages、@omniroute、contrib、docker、config、examples、scripts 及根目录导出的 JS／TS 配置文件。生产计数排除测试和夹具；文档、静态资源及非脚本配置不在本次源文件计数中。另行盘点 209 个 SQL 迁移文件。14,339 个已解析源文件全部与固定提交的 Git 对象一致。
- 本图覆盖已发现的 SQLite 耦合面及相关状态边界，不宣称穷尽所有纯内存、纯 Redis 或纯文件功能。按路径计数；SQL 字符串中的表名候选和导入计数只用于定位，不当作真实 SQL／表／调用次数。CommonJS、动态生成导入和外部消费者仍需逐切片核对。
- 完整文件映射见 [repository-scope-files.zh-CN.csv](repository-scope-files.zh-CN.csv)。公开内容只有源码路径、链接和规划分类，不把未复现的诊断猜测写成缺陷；本次测试是旧行为基线，不是重构结果。

## 能力地图

每行之后可能拆成多份 PR；混合职责文件可有次级归属，CSV 中保留这些关系。

| 编号 | 能力 | 建议节点 | 主归属文件 | 能力边界 |
|---|---|---|---:|---|
| R01 | 调试预设 | S1 | 1 | 预设增删改查与序列化；不接管接口鉴权和模型请求执行。 |
| R02 | 提示词模板与小型内容登记 | S2（需核实调用） | 1 | 模板／内容元数据；先验证真实调用路径，不能把无调用模块当作简单成果。 |
| R03 | 模型覆盖与候选策略 | S2 | 8 | 手动与自动覆盖、来源与失效；能力解析和候选选择仍属于业务逻辑。 |
| R04 | Combo 定义与模型映射 | 已存在 | 5 | 已有 Repository；同步兼容、设置入口和跨域删除清理需显式跟踪。 |
| R05 | 路由、拦截与参数规则 | S2 | 5 | 规则持久化与引用校验；规则计算、路由选择与策略裁决留在服务层。 |
| R06 | 产品设置与功能策略 | S2 | 12 | 按业务拆分 key_value 命名空间，不暴露万能 KV／SQL 接口；区分宿主本地设置。 |
| R07 | 模型目录、别名、发现与价格 | S2 | 16 | 存储目录及其来源、别名和价格；外部同步、解析和更新编排留在服务层。 |
| R08 | 上游账号连接与凭据 | S3 | 6 | 凭据加密、去重、删除及更新；刷新归属单独设计，避免通用记录无意暴露秘密。 |
| R09 | 上游节点、套餐与限制 | S3 | 4 | 节点／套餐／限制定义，与实时用量、健康、退避和热计数分开。 |
| R10 | API Key、分组与权限绑定 | S3 | 7 | 持久权限／Key 状态及原子修改；鉴权决策和撤销传播另行验证。 |
| R11 | 访问凭据、同步令牌与注册 | S3 | 7 | 秘密生命周期、哈希／加密、过期与身份范围；不当作普通可变 KV。 |
| R12 | 代理配置、订阅与分配 | S3 | 15 | 存储代理登记、关联和秘密；操作系统配置写入、探测和订阅刷新分离。 |
| R13 | 额度池、分组、分配与计划定义 | S3 | 4 | 持久额度策略与成员关联；运行计数和定时执行归属另列。 |
| R14 | 额度、Token 与花费记账 | S4 | 9 | 花费／限制／重置的原子性与幂等；建议性计数和硬上限采用各自失败策略。 |
| R15 | 会话粘性、续接与账号运行态 | S4 | 16 | 按功能定义共享存储，复用 #16472／#16569；可重建粘性与必需续接证据分开。 |
| R16 | 独占租约、执行围栏与任务归属 | S4 | 7 | 比较更新、所有权、过期／恢复等协调契约，不按普通 CRUD 处理。 |
| R17 | 用量、成本记录与统计读模型 | S5 | 21 | 追加、去重、保留和查询投影；可靠记账与尽力而为的遥测分开。 |
| R18 | 调用、明细、代理日志与导出游标 | S5 | 16 | 记录／制品关联、保留、分页与稳定游标；共享记录不等于共享本地文件。 |
| R19 | 审计与合规记录 | S5 | 4 | 明确确认持久化的证据、租户／no-log／删除策略及来源关联；不当作可丢弃缓存。 |
| R20 | 压缩策略与遥测 | S2／S5 | 7 | 压缩配置／管线定义，与缓存指标、统计和执行遥测拆分。 |
| R21 | 任务、批处理、对话与文件元数据 | S5 | 7 | 状态机、转换和关联制品；工作进程／任务归属交给协调边界。 |
| R22 | Webhook、日志导出目标与投递记录 | S3／S5 | 6 | 含秘密的目标定义，与游标、重试、潜在 outbox 语义和实际网络投递分开。 |
| R23 | 插件、Skill、中间件与执行记录 | S5 | 6 | 只处理登记、策略及历史存储；插件执行与沙箱不放进 Repository。 |
| R24 | 评测与评估记录 | S5 | 2 | 评测套件、用例、运行来源与结果；执行和评分保留在业务服务中。 |
| R25 | 记忆文档与全文、向量索引 | S6 | 8 | 文档 Repository 与全文／向量能力分开，通用契约不泄漏 FTS5／sqlite-vec 语法。 |
| R26 | 语义、推理缓存与指标 | S6 | 3 | 按 TTL、容量和失效定义 CacheStore，与持久控制数据 Repository 分开。 |
| R27 | 积分、社区与激励账本 | S5 | 7 | 徽章、邀请和社区定义，与原子积分／余额账本及派生排行分开。 |
| R28 | Radar 信息流与发现快照 | S2／S6 | 2 | 配置偏好、可重建外部信息流缓存和本机模型状态分开。 |
| R29 | 桥接、集成与本地工具状态 | S3／本机 | 28 | 选择可共享的集成设置；宿主路径、已安装应用和外部凭据导入保持本地边界。 |
| B01 | 数据库生命周期与 SQLite 运维 | B | 58 | 驱动、建表／迁移、就绪、事务设施、备份恢复、WAL／VACUUM；不是逐领域 Repository。 |
| H01 | 映射、加密与缓存辅助模块 | 支撑 | 51 | 辅助依赖跟随所属领域或后端，不为每个映射、加密或缓存 helper 新建 Repository。 |
| L01 | 本机或第三方数据库集成 | 本机 | 5 | 读取外部应用数据库或本机文件，不属于 Omni 自身持久后端迁移。 |
| X01 | 非持久化或工具性命中 | 排除 | 47 | 词法误命中、界面说明、评测夹具、构建／检查工具；注明排除理由，工具兼容性仍需验收。 |

## 依赖草图

```text
S0 盘点 → S1 简单试点 → 模式获接收 → S2／S3／S5／S6 按依赖推进
                              ↘ B：最小后端运行契约
S3 所属策略 + B → S4 正确性敏感存储
获接收的有界 Repository + B 子集 → PG-A 后端一致性实验
必要的 S2／S3 + B + 传播／恢复证据 → PG-B 共享控制数据链路
验证过的导入／回滚 + 已启用功能的 S4／S5 保证 → PG-C 运维切换
```

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


## 完整文件索引

下列路径均已分类；列入清单不代表每个文件都要新建 Repository。

### R01 — 调试预设

- [`src/lib/db/playgroundPresets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/playgroundPresets.ts) — 业务 Repository

### R02 — 提示词模板与小型内容登记

- [`src/lib/db/prompts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/prompts.ts) — 混合职责，亦涉及 B01

### R03 — 模型覆盖与候选策略

- [`open-sse/services/autoCombo/taskFitness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/autoCombo/taskFitness.ts) — 混合职责，亦涉及 R07、H01
- [`src/lib/db/autoCandidateOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/autoCandidateOverrides.ts) — 业务 Repository，亦涉及 R10
- [`src/lib/db/modelCapabilityOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelCapabilityOverrides.ts) — 业务 Repository，亦涉及 R07
- [`src/lib/db/modelContextOverrides.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelContextOverrides.ts) — 业务 Repository，亦涉及 R07
- [`src/lib/db/modelIntelligence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligence.ts) — 混合职责，亦涉及 R07
- [`src/lib/db/models/compat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/compat.ts) — 混合职责，亦涉及 R07、H01
- [`src/lib/db/models/customVisionOverride.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/customVisionOverride.ts) — 混合职责，亦涉及 R07
- [`src/lib/db/models/modelPreserveVideoUrl.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelPreserveVideoUrl.ts) — 混合职责，亦涉及 R07

### R04 — Combo 定义与模型映射

- [`src/lib/db/combos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/combos.ts) — 混合职责，亦涉及 R06、R08、R15、B01、H01
- [`src/lib/db/modelComboMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelComboMappings.ts) — 业务 Repository
- [`src/lib/db/repositories/routingConfigRepositories.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/routingConfigRepositories.ts) — 支撑辅助
- [`src/lib/db/repositories/sqliteComboRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteComboRepository.ts) — 业务 Repository，亦涉及 R12、R15
- [`src/lib/db/repositories/sqliteModelComboMappingRepository.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/repositories/sqliteModelComboMappingRepository.ts) — 混合职责，亦涉及 R05

### R05 — 路由、拦截与参数规则

- [`src/lib/db/interceptionRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/interceptionRules.ts) — 混合职责
- [`src/lib/db/models/mitmAlias.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/mitmAlias.ts) — 业务 Repository，亦涉及 R07、R29
- [`src/lib/db/paramFilters.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/paramFilters.ts) — 业务 Repository，亦涉及 R06
- [`src/lib/db/reasoningRoutingRules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningRoutingRules.ts) — 业务 Repository，亦涉及 R10、R04、R08
- [`src/mitm/_internal/standaloneRouting.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/_internal/standaloneRouting.cjs) — 混合职责，亦涉及 R07、R29

### R06 — 产品设置与功能策略

- [`bin/cli/settings-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/settings-store.mjs) — 混合职责，亦涉及 R11、B01、H01
- [`open-sse/services/ipFilter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/ipFilter.ts) — 混合职责
- [`src/lib/config/hotReload.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/config/hotReload.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/chatAdmissionSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/chatAdmissionSettings.ts) — 混合职责
- [`src/lib/db/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/featureFlags.ts) — 业务 Repository，亦涉及 R07、H01
- [`src/lib/db/functionalGatewayMirrors.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/functionalGatewayMirrors.ts) — 混合职责
- [`src/lib/db/piiSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/piiSettings.ts) — 业务 Repository
- [`src/lib/db/rootLayoutSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/rootLayoutSettings.ts) — 业务 Repository
- [`src/lib/db/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings.ts) — 混合职责，亦涉及 R12、R04、R08、R10、R11、R07、R15、R17、B01
- [`src/lib/db/tierConfig.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tierConfig.ts) — 混合职责，亦涉及 R07、B01
- [`src/lib/memory/settings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/settings.ts) — 支撑辅助，亦涉及 R25、H01
- [`src/shared/utils/featureFlags.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/featureFlags.ts) — 支撑辅助，亦涉及 H01

### R07 — 模型目录、别名、发现与价格

- [`open-sse/services/tierResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tierResolver.ts) — 混合职责，亦涉及 R03、R06、H01
- [`src/lib/arenaEloSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/arenaEloSync.ts) — 混合职责，亦涉及 R06、B01
- [`src/lib/catalogUserPricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/catalogUserPricing.ts) — 混合职责，亦涉及 H01
- [`src/lib/db/ccDiscoveryAliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryAliases.ts) — 混合职责，亦涉及 R06
- [`src/lib/db/discovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discovery.ts) — 业务 Repository
- [`src/lib/db/discoveryResults.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/discoveryResults.ts) — 业务 Repository
- [`src/lib/db/models.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models.ts) — 混合职责，亦涉及 R03、R08、R13、R04
- [`src/lib/db/models/activeSyncedCatalog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/activeSyncedCatalog.ts) — 混合职责，亦涉及 R03、R08、R09
- [`src/lib/db/models/aliases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/aliases.ts) — 业务 Repository
- [`src/lib/db/models/syncedAvailableModelPersistence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelPersistence.ts) — 混合职责，亦涉及 R03、H01
- [`src/lib/db/models/syncedAvailableModelVision.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedAvailableModelVision.ts) — 缓存／索引，亦涉及 H01
- [`src/lib/db/serviceModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/serviceModels.ts) — 业务 Repository，亦涉及 R29
- [`src/lib/db/settings/pricing.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/pricing.ts) — 混合职责，亦涉及 B01
- [`src/lib/db/validatedModels.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/validatedModels.ts) — 混合职责，亦涉及 R08、R09、R12、R06、R23、R16
- [`src/lib/modelsDevSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/modelsDevSync.ts) — 混合职责，亦涉及 B01、R06、H01
- [`src/lib/pricingSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/pricingSync.ts) — 混合职责，亦涉及 B01、H01

### R08 — 上游账号连接与凭据

- [`bin/cli/provider-store.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/provider-store.mjs) — 混合职责，亦涉及 B01、R15、H01
- [`src/lib/cloudAgent/credentials.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/credentials.ts) — 业务 Repository，亦涉及 R29、H01
- [`src/lib/db/providers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers.ts) — 混合职责，亦涉及 R15、R09、R07、R12、R17、B01、H01
- [`src/lib/db/providers/deletion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/deletion.ts) — 混合职责，亦涉及 R12、R04、R15、R09、R07、R05
- [`src/lib/db/providers/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/migrations.ts) — 混合职责，亦涉及 B01、H01
- [`src/lib/omnirouteStatus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/omnirouteStatus.ts) — 混合职责，亦涉及 R13、R15、B01

### R09 — 上游节点、套餐与限制

- [`src/lib/db/providerLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerLimits.ts) — 缓存／索引，亦涉及 R15
- [`src/lib/db/providerPlans.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerPlans.ts) — 业务 Repository
- [`src/lib/db/providers/nodePrefix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodePrefix.ts) — 缓存／索引，亦涉及 H01、R07
- [`src/lib/db/providers/nodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/nodes.ts) — 业务 Repository，亦涉及 R08、H01

### R10 — API Key、分组与权限绑定

- [`src/lib/db/apiKeyAccessAssign.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyAccessAssign.ts) — 混合职责
- [`src/lib/db/apiKeyGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyGroups.ts) — 混合职责，亦涉及 R07
- [`src/lib/db/apiKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys.ts) — 混合职责，亦涉及 R07、R14、R16、R19、B01
- [`src/lib/db/apiKeys/displayNames.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/displayNames.ts) — 业务 Repository
- [`src/lib/db/apiKeys/modelPermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissions.ts) — 支撑辅助，亦涉及 H01、R06、R07
- [`src/lib/db/apiKeys/publishedModelLookup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/publishedModelLookup.ts) — 支撑辅助，亦涉及 R07、R09
- [`src/lib/db/apiKeys/selfLoopKey.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/selfLoopKey.ts) — 支撑辅助，亦涉及 H01

### R11 — 访问凭据、同步令牌与注册

- [`src/lib/db/accessTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/accessTokens.ts) — 混合职责
- [`src/lib/db/commandCodeAuth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/commandCodeAuth.ts) — 业务 Repository，亦涉及 H01
- [`src/lib/db/registeredKeys.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/registeredKeys.ts) — 混合职责，亦涉及 R14
- [`src/lib/db/relayProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProxies.ts) — 混合职责，亦涉及 R14、R17、R18
- [`src/lib/db/secrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/secrets.ts) — 业务 Repository，亦涉及 H01
- [`src/lib/db/syncTokens.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/syncTokens.ts) — 混合职责，亦涉及 B01
- [`src/lib/obsidian/api.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidian/api.ts) — 混合职责，亦涉及 R29

### R12 — 代理配置、订阅与分配

- [`src/lib/db/freeProxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/freeProxies.ts) — 业务 Repository，亦涉及 B01
- [`src/lib/db/oneproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/oneproxy.ts) — 业务 Repository
- [`src/lib/db/proxies.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies.ts) — 混合职责，亦涉及 R18、R17、R08、R15、H01
- [`src/lib/db/proxies/guards.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/guards.ts) — 混合职责，亦涉及 R06、R08
- [`src/lib/db/proxies/rotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/rotation.ts) — 混合职责，亦涉及 R15、R18、R08
- [`src/lib/db/proxyLatency.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLatency.ts) — 混合职责，亦涉及 R18
- [`src/lib/db/proxyOperatorEgress.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyOperatorEgress.ts) — 缓存／索引
- [`src/lib/db/proxySubscriptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxySubscriptions.ts) — 业务 Repository，亦涉及 B01
- [`src/lib/db/settings/noAuthProxyFallback.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/noAuthProxyFallback.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/proxySubscription/due.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/due.ts) — 支撑辅助
- [`src/lib/proxySubscription/reloadSecret.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/reloadSecret.ts) — 混合职责，亦涉及 H01
- [`src/lib/proxySubscription/selectorGuard.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorGuard.ts) — 混合职责，亦涉及 R06
- [`src/lib/proxySubscription/selectorTrigger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/selectorTrigger.ts) — 混合职责，亦涉及 R16、H01
- [`src/lib/proxySubscription/staleNodes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/staleNodes.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/proxySubscription/subscriptionService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxySubscription/subscriptionService.ts) — 混合职责，亦涉及 R06、R16、R29、B01

### R13 — 额度池、分组、分配与计划定义

- [`src/lib/db/quotaGroups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaGroups.ts) — 业务 Repository，亦涉及 R07
- [`src/lib/db/quotaModelCaps.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaModelCaps.ts) — 业务 Repository
- [`src/lib/db/quotaPools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaPools.ts) — 混合职责，亦涉及 R04、R10、R08、R07、R16
- [`src/lib/db/quotaSchedules.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSchedules.ts) — 业务 Repository

### R14 — 额度、Token 与花费记账

- [`open-sse/services/tokenLimitCounter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/tokenLimitCounter.ts) — 混合职责，亦涉及 R17
- [`src/lib/db/domainState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/domainState.ts) — 混合职责，亦涉及 R05、R13、R15、R11、R17、B01
- [`src/lib/db/keyQuota.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/keyQuota.ts) — 混合职责，亦涉及 R10
- [`src/lib/db/quotaConsumption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaConsumption.ts) — 业务 Repository
- [`src/lib/db/quotaResetEvents.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaResetEvents.ts) — 混合职责，亦涉及 R15、R17
- [`src/lib/db/tokenLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/tokenLimits.ts) — 混合职责，亦涉及 R10、B01
- [`src/lib/quota/providerQuotaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/providerQuotaState.ts) — 业务 Repository，亦涉及 R09
- [`src/lib/quota/quotaResetTimers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaResetTimers.ts) — 业务 Repository
- [`src/lib/usage/apiKeyUsageLimits.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeyUsageLimits.ts) — 混合职责，亦涉及 R17、R07、R10、R09

### R15 — 会话粘性、续接与账号运行态

- [`open-sse/services/geminiThoughtSignatureStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/geminiThoughtSignatureStore.ts) — 缓存／索引，亦涉及 H01
- [`open-sse/services/usage/antigravity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/usage/antigravity.ts) — 混合职责，亦涉及 H01、R07、R09、R15、R17
- [`src/lib/db/connectionRuntimeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/connectionRuntimeState.ts) — 业务 Repository
- [`src/lib/db/contextHandoffs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/contextHandoffs.ts) — 业务 Repository，亦涉及 R04
- [`src/lib/db/creditBalance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/creditBalance.ts) — 缓存／索引，亦涉及 R14
- [`src/lib/db/providers/codexAccountRecovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountRecovery.ts) — 混合职责，亦涉及 R08
- [`src/lib/db/providers/codexAccountState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/codexAccountState.ts) — 混合职责，亦涉及 R08、H01
- [`src/lib/db/providers/providerSpecificDataMerge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataMerge.ts) — 业务 Repository，亦涉及 R08、R07
- [`src/lib/db/providers/rateLimit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/rateLimit.ts) — 混合职责，亦涉及 R08、H01
- [`src/lib/db/responsesContinuationStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/responsesContinuationStore.ts) — 混合职责，亦涉及 R18、R21
- [`src/lib/db/sessionAccountAffinity.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sessionAccountAffinity.ts) — 缓存／索引
- [`src/lib/db/settings/lkgp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/lkgp.ts) — 缓存／索引，亦涉及 R04、R08
- [`src/lib/warmupScheduler/circuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerStore.ts) — 协调契约
- [`src/lib/warmupScheduler/redisCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/redisCircuitBreakerStore.ts) — 协调契约
- [`src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/sqliteCircuitBreakerStore.ts) — 协调契约
- [`src/sse/services/auth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/sse/services/auth.ts) — 混合职责，亦涉及 R08、R16、R10、R09、R06、R18

### R16 — 独占租约、执行围栏与任务归属

- [`src/lib/db/codexWakeups.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/codexWakeups.ts) — 混合职责，亦涉及 R21
- [`src/lib/db/exclusiveConnectionLeases.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/exclusiveConnectionLeases.ts) — 协调契约，亦涉及 R08、R10
- [`src/lib/db/skillExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skillExecutionFence.ts) — 协调契约，亦涉及 R23
- [`src/lib/jobRegistry/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/index.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/jobRegistry/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/jobRegistry/registry.ts) — 协调契约
- [`src/lib/skills/toolExecutionFence.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/toolExecutionFence.ts) — 协调契约，亦涉及 R23
- [`src/lib/warmupScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler.ts) — 混合职责，亦涉及 R15、R08、R06、R12

### R17 — 用量、成本记录与统计读模型

- [`src/lib/db/ccDiscoveryMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccDiscoveryMetrics.ts) — 业务 Repository，亦涉及 R07
- [`src/lib/db/comboForecast.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/comboForecast.ts) — 业务 Repository，亦涉及 R18
- [`src/lib/db/costLedger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/costLedger.ts) — 业务 Repository，亦涉及 R14、R18
- [`src/lib/db/providerStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerStats.ts) — 业务 Repository，亦涉及 R18、R09
- [`src/lib/db/providers/usageIdentityReconciliation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/usageIdentityReconciliation.ts) — 业务 Repository，亦涉及 R08
- [`src/lib/db/quotaSnapshots.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/quotaSnapshots.ts) — 混合职责，亦涉及 R15、R14
- [`src/lib/db/settings/cacheMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/cacheMetrics.ts) — 业务 Repository
- [`src/lib/db/usageAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics.ts) — 业务 Repository，亦涉及 R14
- [`src/lib/db/usageSummary.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageSummary.ts) — 业务 Repository
- [`src/lib/quota/quotaAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/quota/quotaAnalytics.ts) — 业务 Repository，亦涉及 R14
- [`src/lib/usage/aggregateHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/aggregateHistory.ts) — 混合职责，亦涉及 R07、B01
- [`src/lib/usage/analyticsResponseCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/analyticsResponseCache.ts) — 缓存／索引，亦涉及 R26
- [`src/lib/usage/apiKeySelfService.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/apiKeySelfService.ts) — 混合职责，亦涉及 R10、R14、R08、R09
- [`src/lib/usage/cacheHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/cacheHealth.ts) — 混合职责，亦涉及 R18
- [`src/lib/usage/comboHealth.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/comboHealth.ts) — 混合职责，亦涉及 R18、R04、R09
- [`src/lib/usage/connectionSpeedStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/connectionSpeedStats.ts) — 混合职责，亦涉及 R09
- [`src/lib/usage/providerWindowCosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/providerWindowCosts.ts) — 混合职责，亦涉及 R14、R09、R10、R07
- [`src/lib/usage/usageHistory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory.ts) — 混合职责，亦涉及 R18、H01
- [`src/lib/usage/usageHistory/duplicateEntry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageHistory/duplicateEntry.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/usage/usageStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageStats.ts) — 混合职责，亦涉及 R14、R07、R08、R10
- [`src/lib/usage/usageWriteRetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/usageWriteRetry.ts) — 混合职责，亦涉及 R08、H01

### R18 — 调用、明细、代理日志与导出游标

- [`src/lib/db/callLogDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogDetails.ts) — 协调契约，亦涉及 R16
- [`src/lib/db/callLogStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/callLogStats.ts) — 业务 Repository，亦涉及 R17、R08
- [`src/lib/db/detailedLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/detailedLogs.ts) — 业务 Repository，亦涉及 R06、R19
- [`src/lib/db/inspectorSessions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorSessions.ts) — 业务 Repository
- [`src/lib/db/proxyLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxyLogs.ts) — 业务 Repository，亦涉及 R12
- [`src/lib/db/usageLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageLogs.ts) — 业务 Repository，亦涉及 R17
- [`src/lib/monitoring/providerHealthMatrix.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/monitoring/providerHealthMatrix.ts) — 混合职责，亦涉及 R08、R07、R15、H01
- [`src/lib/proxyLogger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/proxyLogger.ts) — 混合职责，亦涉及 B01、H01
- [`src/lib/usage/callLogDetailResolver.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogDetailResolver.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/usage/callLogExportQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportQueries.ts) — 业务 Repository，亦涉及 R22、R08、R09
- [`src/lib/usage/callLogExportSource.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogExportSource.ts) — 支撑辅助，亦涉及 R22
- [`src/lib/usage/callLogFilterOptions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogFilterOptions.ts) — 业务 Repository，亦涉及 R08
- [`src/lib/usage/callLogRotation.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogRotation.ts) — 混合职责，亦涉及 B01、R16
- [`src/lib/usage/callLogs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogs.ts) — 混合职责，亦涉及 R15、R19、R17、R08、R09
- [`src/lib/usage/callLogsBoundedQueries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/callLogsBoundedQueries.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/usage/completedRequestDetails.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/completedRequestDetails.ts) — 缓存／索引，亦涉及 H01

### R19 — 审计与合规记录

- [`open-sse/mcp-server/audit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/audit.ts) — 混合职责，亦涉及 B01、H01
- [`src/domain/configAudit.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/configAudit.ts) — 业务 Repository，亦涉及 H01
- [`src/lib/compliance/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/index.ts) — 混合职责，亦涉及 R17、R18、B01、R06
- [`src/lib/compliance/noLog.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/compliance/noLog.ts) — 混合职责，亦涉及 R10

### R20 — 压缩策略与遥测

- [`open-sse/mcp-server/server.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/server.ts) — 混合职责，亦涉及 R19、R23
- [`src/lib/db/ccrBlocks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/ccrBlocks.ts) — 缓存／索引，亦涉及 R26
- [`src/lib/db/compression.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compression.ts) — 混合职责，亦涉及 H01、B01
- [`src/lib/db/compressionAnalytics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionAnalytics.ts) — 混合职责，亦涉及 R17、B01
- [`src/lib/db/compressionCacheStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCacheStats.ts) — 业务 Repository，亦涉及 R17
- [`src/lib/db/compressionCombos.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionCombos.ts) — 混合职责，亦涉及 R04、B01
- [`src/lib/db/compressionRunTelemetry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionRunTelemetry.ts) — 混合职责，亦涉及 R17、B01

### R21 — 任务、批处理、对话与文件元数据

- [`open-sse/services/conversationTurnContent.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/conversationTurnContent.ts) — 混合职责，亦涉及 R18
- [`src/lib/cloudAgent/db.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cloudAgent/db.ts) — 混合职责，亦涉及 B01
- [`src/lib/db/a2aTasks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/a2aTasks.ts) — 业务 Repository
- [`src/lib/db/agenticConversations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agenticConversations.ts) — 混合职责，亦涉及 R18、R15
- [`src/lib/db/batches.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/batches.ts) — 业务 Repository，亦涉及 R16
- [`src/lib/db/files.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/files.ts) — 业务 Repository
- [`src/lib/db/jobRegistryDb.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jobRegistryDb.ts) — 业务 Repository，亦涉及 R16

### R22 — Webhook、日志导出目标与投递记录

- [`src/lib/db/logExportDestinations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportDestinations.ts) — 业务 Repository，亦涉及 R18
- [`src/lib/db/webhookDeliveries.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhookDeliveries.ts) — 业务 Repository
- [`src/lib/db/webhooks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webhooks.ts) — 业务 Repository
- [`src/lib/logExport/childRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/childRunner.ts) — 支撑辅助，亦涉及 R18
- [`src/lib/logExport/exportChild.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/exportChild.ts) — 混合职责，亦涉及 R18、B01
- [`src/lib/logExport/runner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/logExport/runner.ts) — 混合职责，亦涉及 R18、R16

### R23 — 插件、Skill、中间件与执行记录

- [`src/lib/db/middleware.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/middleware.ts) — 业务 Repository，亦涉及 R04
- [`src/lib/db/pluginMetrics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/pluginMetrics.ts) — 业务 Repository
- [`src/lib/db/plugins.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/plugins.ts) — 业务 Repository，亦涉及 R29
- [`src/lib/db/skills.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/skills.ts) — 业务 Repository
- [`src/lib/skills/executor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/executor.ts) — 混合职责，亦涉及 R16、R06
- [`src/lib/skills/registry.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/skills/registry.ts) — 混合职责，亦涉及 H01

### R24 — 评测与评估记录

- [`scripts/router-eval/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/router-eval/index.ts) — 支撑辅助，亦涉及 R17、R18
- [`src/lib/db/evals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/evals.ts) — 业务 Repository，亦涉及 B01、R05

### R25 — 记忆文档与全文、向量索引

- [`src/lib/db/memoryVec.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/memoryVec.ts) — 缓存／索引
- [`src/lib/memory/embedding/index.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/embedding/index.ts) — 支撑辅助，亦涉及 R08、R09
- [`src/lib/memory/reindex.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/reindex.ts) — 混合职责，亦涉及 R16
- [`src/lib/memory/retrieval.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/retrieval.ts) — 混合职责，亦涉及 R10、B01、R26
- [`src/lib/memory/store.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/store.ts) — 混合职责，亦涉及 H01
- [`src/lib/memory/summarization.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/summarization.ts) — 混合职责
- [`src/lib/memory/typedDecay.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/typedDecay.ts) — 混合职责，亦涉及 R16
- [`src/lib/memory/vectorStore.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/memory/vectorStore.ts) — 缓存／索引，亦涉及 B01

### R26 — 语义、推理缓存与指标

- [`src/lib/db/reasoningCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reasoningCache.ts) — 缓存／索引，亦涉及 R15
- [`src/lib/db/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/semanticCache.ts) — 缓存／索引
- [`src/lib/semanticCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/semanticCache.ts) — 缓存／索引，亦涉及 H01、B01

### R27 — 积分、社区与激励账本

- [`src/lib/db/gamification.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/gamification.ts) — 业务 Repository，亦涉及 R11
- [`src/lib/gamification/antiCheat.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/antiCheat.ts) — 混合职责
- [`src/lib/gamification/badges.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/badges.ts) — 混合职责
- [`src/lib/gamification/events.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/events.ts) — 混合职责
- [`src/lib/gamification/invites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/invites.ts) — 混合职责，亦涉及 R11
- [`src/lib/gamification/servers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/servers.ts) — 混合职责，亦涉及 R11
- [`src/lib/gamification/streaks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gamification/streaks.ts) — 混合职责

### R28 — Radar 信息流与发现快照

- [`src/lib/db/radar.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/radar.ts) — 混合职责，亦涉及 R11、H01
- [`src/lib/radar/referrals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/radar/referrals.ts) — 支撑辅助

### R29 — 桥接、集成与本地工具状态

- [`electron/main.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/main.js) — 混合职责，亦涉及 H01、B01
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/browser-worker.ts) — 混合职责，亦涉及 L01、R16、R15、R08
- [`open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/launcher-helper-client.ts) — 本机集成
- [`scripts/dev/sync-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/sync-env.mjs) — 支撑辅助，亦涉及 B01、R08
- [`scripts/dev/webdav-handler.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/webdav-handler.mjs) — 混合职责，亦涉及 R06、H01、L01
- [`src/app/api/internal/codex-responses-ws/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/internal/codex-responses-ws/route.ts) — 混合职责，亦涉及 R16、R10、R08、R05、R25、R12、R18、R20、R04
- [`src/lib/db/agentBridgeBypass.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeBypass.ts) — 业务 Repository
- [`src/lib/db/agentBridgeMappings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeMappings.ts) — 混合职责，亦涉及 R07
- [`src/lib/db/agentBridgeState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/agentBridgeState.ts) — 业务 Repository
- [`src/lib/db/apiKeyContextSources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyContextSources.ts) — 业务 Repository，亦涉及 R10、R11
- [`src/lib/db/cliToolState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cliToolState.ts) — 业务 Repository
- [`src/lib/db/conductorBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/conductorBridge.ts) — 业务 Repository
- [`src/lib/db/inspectorCustomHosts.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/inspectorCustomHosts.ts) — 业务 Repository，亦涉及 R05
- [`src/lib/db/localCorpus.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/localCorpus.ts) — 业务 Repository，亦涉及 R06
- [`src/lib/db/notion.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/notion.ts) — 业务 Repository，亦涉及 R11
- [`src/lib/db/obsidian.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/obsidian.ts) — 混合职责，亦涉及 R11、R10
- [`src/lib/db/upstreamProxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/upstreamProxy.ts) — 混合职责，亦涉及 R12
- [`src/lib/db/versionManager.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/versionManager.ts) — 业务 Repository
- [`src/lib/headroom/process.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/headroom/process.ts) — 本机集成，亦涉及 L01
- [`src/lib/obsidianSync.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/obsidianSync.ts) — 混合职责，亦涉及 L01、R11
- [`src/lib/services/installers/bifrost.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/bifrost.ts) — 本机集成，亦涉及 L01
- [`src/lib/services/installers/cliproxy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/cliproxy.ts) — 本机集成，亦涉及 L01
- [`src/lib/services/installers/dario.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/dario.ts) — 本机集成，亦涉及 L01
- [`src/lib/services/installers/llmlingua.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/llmlingua.ts) — 本机集成，亦涉及 R20、L01
- [`src/lib/services/installers/mux.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/mux.ts) — 本机集成，亦涉及 L01
- [`src/lib/services/installers/ninerouter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/ninerouter.ts) — 本机集成，亦涉及 L01
- [`src/lib/services/installers/openwa.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/services/installers/openwa.ts) — 本机集成，亦涉及 L01
- [`src/mitm/server.cjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/mitm/server.cjs) — 混合职责，亦涉及 R07、R18、B01

### B01 — 数据库生命周期与 SQLite 运维

- [`bin/cli/commands/backup.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/backup.mjs) — 后端运行
- [`bin/cli/commands/doctor.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/doctor.mjs) — 后端运行，亦涉及 H01、R29
- [`bin/cli/commands/reset-encrypted-columns.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/reset-encrypted-columns.mjs) — 后端运行，亦涉及 R08
- [`bin/cli/commands/runtime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/runtime.mjs) — 后端运行
- [`bin/cli/commands/sync-import.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/sync-import.mjs) — 后端运行
- [`bin/cli/runtime/nativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/nativeDeps.mjs) — 后端运行
- [`bin/cli/runtime/sqliteRuntime.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/sqliteRuntime.mjs) — 后端运行
- [`bin/cli/sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/sqlite.mjs) — 混合职责，亦涉及 R08、R11、R06、H01
- [`electron/sqlite-inspection.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/electron/sqlite-inspection.js) — 支撑辅助，亦涉及 R08
- [`scripts/build/bootstrap-env.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/bootstrap-env.mjs) — 后端运行，亦涉及 R08、H01
- [`src/app/api/db-backups/export/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/export/route.ts) — 后端运行，亦涉及 R08、R10
- [`src/app/api/db-backups/exportAll/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/exportAll/route.ts) — 后端运行，亦涉及 R18、R08、R10、R04、R06、R05
- [`src/app/api/db-backups/import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db-backups/import/route.ts) — 后端运行，亦涉及 R06、R08、R10
- [`src/app/api/db/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/db/health/route.ts) — 后端运行
- [`src/app/api/health/ping/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/health/ping/route.ts) — 后端运行
- [`src/app/api/settings/database/vacuum/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/database/vacuum/route.ts) — 后端运行
- [`src/app/api/settings/import-json/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/settings/import-json/route.ts) — 后端运行，亦涉及 R06、R08、R10、R04、R17、H01
- [`src/app/api/storage/health/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/storage/health/route.ts) — 后端运行，亦涉及 R18
- [`src/domain/assessment/migration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/domain/assessment/migration.ts) — 后端运行，亦涉及 R04、R24
- [`src/instrumentation-node.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/instrumentation-node.ts) — 混合职责，亦涉及 R11、R06、R07、R08、R15、R14、R19、R25、R28、R12、R21
- [`src/lib/db/adapters/betterSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/betterSqliteAdapter.ts) — 后端运行
- [`src/lib/db/adapters/bunSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/bunSqliteAdapter.ts) — 后端运行
- [`src/lib/db/adapters/driverFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/driverFactory.ts) — 后端运行
- [`src/lib/db/adapters/nodeSqliteAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteAdapter.ts) — 后端运行
- [`src/lib/db/adapters/nodeSqliteShared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/nodeSqliteShared.ts) — 后端运行
- [`src/lib/db/adapters/sqljsAdapter.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/sqljsAdapter.ts) — 后端运行
- [`src/lib/db/adapters/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/types.ts) — 后端运行
- [`src/lib/db/apiKeyColumnFallbacks.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyColumnFallbacks.ts) — 后端运行，亦涉及 R10
- [`src/lib/db/backup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backup.ts) — 后端运行，亦涉及 R06
- [`src/lib/db/backupPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupPaths.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/db/backupRetention.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/backupRetention.ts) — 后端运行，亦涉及 R06
- [`src/lib/db/cleanup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup.ts) — 混合职责，亦涉及 R17、R18、R19、R20、R21、R25、R27、R14、R15、R16
- [`src/lib/db/cleanup/backupPrune.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/backupPrune.ts) — 后端运行
- [`src/lib/db/core.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/core.ts) — 后端运行，亦涉及 R08、R18、H01
- [`src/lib/db/databaseSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/databaseSettings.ts) — 混合职责，亦涉及 R06、R26、R18、H01
- [`src/lib/db/healthCheck.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheck.ts) — 后端运行，亦涉及 R04、R08、R10、R14、R17、R15
- [`src/lib/db/healthCheckRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckRunner.ts) — 后端运行
- [`src/lib/db/healthCheckWorker.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/healthCheckWorker.ts) — 后端运行
- [`src/lib/db/jsonMigration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration.ts) — 后端运行，亦涉及 R04、R06、R07、R08、R09、R10、R12、R14、R17
- [`src/lib/db/logExportReadOnly.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/logExportReadOnly.ts) — 后端运行，亦涉及 R22
- [`src/lib/db/managedBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/managedBackup.ts) — 后端运行
- [`src/lib/db/migrationRunner.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner.ts) — 后端运行
- [`src/lib/db/migrationRunner/extraDirs.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/extraDirs.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/db/migrationRunner/preMigrationBackup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/preMigrationBackup.ts) — 后端运行
- [`src/lib/db/migrationRunner/schemaState.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/schemaState.ts) — 后端运行
- [`src/lib/db/optimizationSettings.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/optimizationSettings.ts) — 后端运行
- [`src/lib/db/probeUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/probeUtils.ts) — 后端运行，亦涉及 H01
- [`src/lib/db/reclaimFreedPages.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/reclaimFreedPages.ts) — 后端运行
- [`src/lib/db/recovery.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/recovery.ts) — 后端运行，亦涉及 R08
- [`src/lib/db/schemaColumns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/schemaColumns.ts) — 后端运行
- [`src/lib/db/singleton.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/singleton.ts) — 后端运行
- [`src/lib/db/sqliteLoadError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/sqliteLoadError.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/db/stateReset.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stateReset.ts) — 支撑辅助，亦涉及 H01
- [`src/lib/db/stats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/stats.ts) — 后端运行
- [`src/lib/db/vacuumScheduler.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/vacuumScheduler.ts) — 后端运行
- [`src/lib/db/walMaintenance.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/walMaintenance.ts) — 后端运行
- [`src/lib/gracefulShutdown.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/gracefulShutdown.ts) — 后端运行，亦涉及 R14、R18、R19
- [`src/lib/usage/migrations.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/usage/migrations.ts) — 后端运行，亦涉及 R17、R18、R08

### H01 — 映射、加密与缓存辅助模块

- [`bin/cli/data-dir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/data-dir.mjs) — 支撑辅助，亦涉及 B01
- [`bin/cli/privateDataDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/privateDataDir.mjs) — 支撑辅助，亦涉及 B01
- [`bin/omniroute.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/omniroute.mjs) — 混合职责，亦涉及 B01、R29
- [`src/lib/cache/semanticCacheDbBridge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cache/semanticCacheDbBridge.ts) — 支撑辅助，亦涉及 R26、R08、R06
- [`src/lib/container.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/container.ts) — 支撑辅助，亦涉及 B01、R06
- [`src/lib/dataPaths.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/dataPaths.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/_rowTypes.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/_rowTypes.ts) — 支撑辅助，亦涉及 R29
- [`src/lib/db/adapters/runtimeRequire.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/runtimeRequire.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/adapters/slowDiagnostics.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/adapters/slowDiagnostics.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/apiKeyUsageLimitFields.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeyUsageLimitFields.ts) — 支撑辅助，亦涉及 R10、R14
- [`src/lib/db/apiKeys/modelAccessMode.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelAccessMode.ts) — 支撑辅助，亦涉及 R10
- [`src/lib/db/apiKeys/modelPermissionCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/modelPermissionCache.ts) — 支撑辅助，亦涉及 R10、R07
- [`src/lib/db/apiKeys/permissionsUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/permissionsUpdate.ts) — 支撑辅助，亦涉及 R10
- [`src/lib/db/apiKeys/rowParsers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/rowParsers.ts) — 支撑辅助，亦涉及 R10
- [`src/lib/db/apiKeys/secretAtRest.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/secretAtRest.ts) — 支撑辅助，亦涉及 R10
- [`src/lib/db/apiKeys/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/apiKeys/types.ts) — 支撑辅助，亦涉及 R10
- [`src/lib/db/cacheSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cacheSecrets.ts) — 支撑辅助，亦涉及 R06、R26
- [`src/lib/db/caseMapping.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/caseMapping.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/cleanup/usagePurge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/cleanup/usagePurge.ts) — 支撑辅助，亦涉及 B01、R18
- [`src/lib/db/compressionContextBudget.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionContextBudget.ts) — 支撑辅助，亦涉及 R20
- [`src/lib/db/compressionDetailNormalizers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/compressionDetailNormalizers.ts) — 支撑辅助，亦涉及 R20
- [`src/lib/db/encryption.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/encryption.ts) — 支撑辅助，亦涉及 R08、B01
- [`src/lib/db/filePermissions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/filePermissions.ts) — 支撑辅助，亦涉及 B01、R08
- [`src/lib/db/jsonMigration/apiKeysImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/apiKeysImport.ts) — 支撑辅助，亦涉及 B01、R10
- [`src/lib/db/jsonMigration/columnUpsert.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/columnUpsert.ts) — 支撑辅助，亦涉及 B01、R08、R10
- [`src/lib/db/jsonMigration/connectionsImport.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/jsonMigration/connectionsImport.ts) — 支撑辅助，亦涉及 B01、R08
- [`src/lib/db/migrationRunner/constants.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/constants.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/migrationRunner/logger.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/migrationRunner/logger.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/db/modelIntelligenceGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/modelIntelligenceGeneration.ts) — 支撑辅助，亦涉及 R03
- [`src/lib/db/models/capabilityModalities.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/capabilityModalities.ts) — 支撑辅助，亦涉及 R07
- [`src/lib/db/models/modelCatalogWriteSignals.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/modelCatalogWriteSignals.ts) — 支撑辅助，亦涉及 R07、B01
- [`src/lib/db/models/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/shared.ts) — 支撑辅助，亦涉及 R07
- [`src/lib/db/models/synced.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/synced.ts) — 支撑辅助，亦涉及 R07
- [`src/lib/db/models/syncedCatalogFreshness.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/models/syncedCatalogFreshness.ts) — 支撑辅助，亦涉及 R07
- [`src/lib/db/providerNodeSelect.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providerNodeSelect.ts) — 支撑辅助，亦涉及 R09
- [`src/lib/db/providers/columns.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/columns.ts) — 支撑辅助，亦涉及 R08、R09
- [`src/lib/db/providers/lazyConnectionView.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/lazyConnectionView.ts) — 支撑辅助，亦涉及 R08
- [`src/lib/db/providers/providerSpecificData.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificData.ts) — 支撑辅助，亦涉及 R08、R09
- [`src/lib/db/providers/providerSpecificDataSecrets.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/providers/providerSpecificDataSecrets.ts) — 支撑辅助，亦涉及 R08、R19
- [`src/lib/db/proxies/mappers.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/mappers.ts) — 支撑辅助，亦涉及 R12
- [`src/lib/db/proxies/registryGeneration.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/registryGeneration.ts) — 支撑辅助，亦涉及 R12
- [`src/lib/db/proxies/types.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/proxies/types.ts) — 支撑辅助，亦涉及 R12
- [`src/lib/db/readCache.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/readCache.ts) — 支撑辅助，亦涉及 R06、R07、R08、R09、R04、R15
- [`src/lib/db/settings/shared.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/settings/shared.ts) — 支撑辅助，亦涉及 R06
- [`src/lib/db/usageAnalytics/sources.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/usageAnalytics/sources.ts) — 支撑辅助，亦涉及 R17
- [`src/lib/db/webSessionDedup.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/webSessionDedup.ts) — 支撑辅助，亦涉及 R08
- [`src/lib/instrumentationBootError.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/instrumentationBootError.ts) — 支撑辅助，亦涉及 B01
- [`src/lib/warmupScheduler/circuitBreakerFactory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/warmupScheduler/circuitBreakerFactory.ts) — 支撑辅助，亦涉及 R15
- [`src/shared/platform/windowsProcess.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/platform/windowsProcess.ts) — 支撑辅助，亦涉及 B01
- [`src/shared/schemas/memory.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/schemas/memory.ts) — 支撑辅助，亦涉及 R25、R06
- [`src/shared/utils/globPattern.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/globPattern.ts) — 支撑辅助，亦涉及 R04

### L01 — 本机或第三方数据库集成

- [`open-sse/utils/cursorVersionDetector.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/utils/cursorVersionDetector.ts) — 本机集成，亦涉及 R29
- [`src/app/api/oauth/kiro/auto-import/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/oauth/kiro/auto-import/route.ts) — 本机集成，亦涉及 R29、R08、R12
- [`src/lib/copilot/codegraphKnowledge.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/codegraphKnowledge.ts) — 本机集成
- [`src/lib/cursor/tokenExtractor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/cursor/tokenExtractor.ts) — 本机集成，亦涉及 R29
- [`src/lib/db/omp.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/omp.ts) — 本机集成，亦涉及 R29

### X01 — 非持久化或工具性命中

- [`bin/cli/commands/serve.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/serve.mjs) — 混合职责，亦涉及 R06
- [`bin/cli/commands/update.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/commands/update.mjs) — 排除
- [`bin/cli/runtime/trayRuntime.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/runtime/trayRuntime.ts) — 排除
- [`bin/cli/utils/ensureAndroidCacheDir.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/cli/utils/ensureAndroidCacheDir.mjs) — 排除
- [`bin/mcpStdioConsoleGuard.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/bin/mcpStdioConsoleGuard.mjs) — 排除
- [`next.config.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/next.config.mjs) — 排除
- [`open-sse/executors/notrack-web.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/executors/notrack-web.ts) — 排除
- [`open-sse/mcp-server/tools/advancedTools.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/mcp-server/tools/advancedTools.ts) — 支撑辅助，亦涉及 R04、R06、R07、R12、R14、R17、R19、R26、B01
- [`open-sse/services/compression/harness/benchmark.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/open-sse/services/compression/harness/benchmark.ts) — 排除，亦涉及 R20
- [`scripts/build/afterpack-copy-node-modules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/afterpack-copy-node-modules.mjs) — 排除，亦涉及 B01
- [`scripts/build/assembleStandalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/assembleStandalone.mjs) — 排除，亦涉及 B01
- [`scripts/build/better-sqlite3-stub-flag.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/better-sqlite3-stub-flag.mjs) — 排除，亦涉及 B01
- [`scripts/build/betterSqlitePrebuildTarget.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/betterSqlitePrebuildTarget.mjs) — 排除，亦涉及 B01
- [`scripts/build/build-next-isolated.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/build-next-isolated.mjs) — 排除，亦涉及 B01
- [`scripts/build/electronRebuildPlan.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/electronRebuildPlan.mjs) — 排除，亦涉及 B01
- [`scripts/build/hydrateNativeDeps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/hydrateNativeDeps.mjs) — 排除，亦涉及 B01
- [`scripts/build/pack-artifact-policy.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/pack-artifact-policy.ts) — 排除
- [`scripts/build/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/postinstall.mjs) — 排除，亦涉及 B01、H01
- [`scripts/build/prepare-electron-standalone.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/build/prepare-electron-standalone.mjs) — 排除，亦涉及 B01
- [`scripts/check/audit-sqlite-coupling.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/audit-sqlite-coupling.mjs) — 排除
- [`scripts/check/check-db-rules.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-db-rules.mjs) — 排除，亦涉及 L01
- [`scripts/check/check-env-doc-sync.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-env-doc-sync.mjs) — 排除
- [`scripts/check/check-install-upgrade.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-install-upgrade.mjs) — 排除，亦涉及 B01
- [`scripts/check/check-native-deps.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-native-deps.mjs) — 排除，亦涉及 B01
- [`scripts/check/check-route-guard-membership.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/check-route-guard-membership.ts) — 排除
- [`scripts/check/lib/readmeMigrationCount.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/check/lib/readmeMigrationCount.mjs) — 排除
- [`scripts/ci/verify-ci-install.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/ci/verify-ci-install.mjs) — 排除
- [`scripts/dev/ensure-native-sqlite.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/ensure-native-sqlite.mjs) — 排除，亦涉及 B01
- [`scripts/dev/run-next.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/run-next.mjs) — 排除，亦涉及 B01
- [`scripts/dev/smoke-electron-packaged.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/dev/smoke-electron-packaged.mjs) — 排除，亦涉及 B01
- [`scripts/postinstall.mjs`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/scripts/postinstall.mjs) — 排除，亦涉及 B01
- [`src/app/(dashboard)/dashboard/providers/[id]/components/modals/ImportCodexAuthModal.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/%5Bid%5D/components/modals/ImportCodexAuthModal.tsx) — 排除，亦涉及 R08、R29
- [`src/app/(dashboard)/dashboard/providers/providerPageUtils.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/providers/providerPageUtils.ts) — 排除
- [`src/app/(dashboard)/dashboard/settings/components/SidebarTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SidebarTab.tsx) — 排除，亦涉及 R06
- [`src/app/(dashboard)/dashboard/settings/components/SystemStorageTab.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/%28dashboard%29/dashboard/settings/components/SystemStorageTab.tsx) — 排除，亦涉及 B01、R18、R17
- [`src/app/api/system/version/route.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/api/system/version/route.ts) — 排除，亦涉及 B01
- [`src/app/privacy/page.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/app/privacy/page.tsx) — 排除
- [`src/lib/copilot/systemPrompt.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/copilot/systemPrompt.ts) — 排除
- [`src/lib/db/better-sqlite3.stub.js`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/better-sqlite3.stub.js) — 排除，亦涉及 B01
- [`src/lib/db/relayProbeStats.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/db/relayProbeStats.ts) — 排除，亦涉及 R12
- [`src/lib/evals/evalRunner/builtinSuites.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/evals/evalRunner/builtinSuites.ts) — 排除
- [`src/lib/oauth/services/cursor.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/oauth/services/cursor.ts) — 排除，亦涉及 R29
- [`src/lib/system/autoUpdate.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/autoUpdate.ts) — 排除
- [`src/lib/system/globalPackagePath.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/lib/system/globalPackagePath.ts) — 排除
- [`src/shared/components/compression/CompressionPipelineEditor.tsx`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/components/compression/CompressionPipelineEditor.tsx) — 排除，亦涉及 R20
- [`src/shared/constants/featureFlagDefinitions.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/constants/featureFlagDefinitions.ts) — 排除，亦涉及 R06
- [`src/shared/utils/formatting.ts`](https://github.com/cheaper-inference/OmniRoute/blob/0482755c5e4faeeb23736b9e56ec293d84809efa/src/shared/utils/formatting.ts) — 排除
