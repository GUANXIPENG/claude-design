# AI Design Workspace 技术栈锁定与架构草案

最后更新：2026-05-24

## 1. 文档定位与当前仓库状态

本文档是当前 MVP 阶段的技术决策基线，用于指导“类似 Claude Design 的 AI 设计生成网站”的持续实现。它不是永久架构，也不是最终工程实现说明。后续每次重要架构变化都必须在本文档的 ADR 记录中说明：为什么要改、改了什么、影响哪些模块、是否引入新风险、是否影响 MVP 范围。

当前仓库已经包含 Phase 1 scaffold、Phase 2 前端工作台壳、Phase 3 Supabase Auth/Drizzle 基础层、Phase 4 生成输出校验、mock provider、版本快照、导出 manifest 服务边界、版本/生成/对话/导出记录持久化边界、Issue #15 server-only OpenAI Responses provider 与 P0 项目生成入口、Issue #18 pre-Sandpack user profile upsert、严格生成文件路径校验、persisted snapshot 运行时校验和 auth callback returnTo 站内路径限制，以及已在真实 Supabase 项目验证通过的 migration/RLS。本文档同时保留早期 ADR 以解释技术栈来源，并在后续 ADR 中记录已落地变化。

### 1.1 已读取的仓库内容

当前仓库中可用的产品与状态文档：

- `docs/requirements.md`：产品需求文档。
- `docs/PRD.md`：结构化 PRD。
- `docs/PROJECT_STATUS.md`：阶段状态、已完成内容、阻塞点和下一步计划。
- `docs/architecture.md`：本文档，记录技术栈基线与 ADR。

当前仓库已建立的工程基础：

- `README.md`。
- `package.json` 和 `package-lock.json`。
- `src/app`、`src/features`、`src/server`、`src/schemas`、`src/prompts` 等源码目录。
- Supabase Auth、Drizzle schema、项目/额度服务边界。
- Phase 4 生成 schema、AI provider adapter、generation/version/export 服务边界。
- Phase 1 到 Phase 4 的脚本级测试。

当前已补齐本地 Supabase migration/RLS SQL 文件，并已在真实 Supabase 项目 `qhetmxcgwdifgkpvqrri` 执行和验证跨用户 RLS 隔离；server-only OpenAI provider 与 P0 项目生成入口已落地。仍未完成 Sandpack runtime、导出 zip 下载、版本历史/回退 UI、Playwright E2E 和生产部署配置。

### 1.2 架构目标

- 支持自然语言生成多页面网页 / 应用原型。
- 支持项目预览、页面切换、点击元素 / 区块选择、对话式迭代修改。
- 支持项目持久化、版本快照、回退、导出、额度记录。
- 明确前端、服务端、数据库、AI 调用和预览沙盒边界。
- 避免 API key、数据库写入、计费校验、导出打包等敏感能力暴露到浏览器。
- 为后续图片 / 文件 / URL 输入、订阅、团队协作、复杂权限保留扩展空间。

### 1.3 参考资料

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase server-side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Drizzle PostgreSQL docs](https://orm.drizzle.team/docs/get-started-postgresql)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses/create?api-mode=responses)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses)
- [OpenAI API key quickstart](https://platform.openai.com/docs/quickstart/using-the-api)
- [Sandpack docs](https://sandpack.codesandbox.io/)
- [Zod docs](https://zod.dev/)
- [Vitest docs](https://vitest.dev/)
- [Playwright docs](https://playwright.dev/docs/intro)
- [Vercel Next.js docs](https://vercel.com/docs/frameworks/nextjs)

## 2. 技术栈锁定

本节锁定当前阶段建议技术栈。锁定含义是“作为 MVP 实现基线”，不是永久不可变。若后续变更，必须通过第 5 节 ADR 机制记录。

### 2.1 前端技术栈

| 选择项 | 当前锁定 | 为什么选择 | 替代方案 | 为什么暂时不选替代方案 | 对 MVP 的好处 | 可能风险 |
|---|---|---|---|---|---|---|
| 框架 | Next.js App Router + React | 产品需要首页、登录、项目列表、工作台、设置页、服务端入口和鉴权保护；Next.js 可以统一承载页面和服务端路由 | Vite SPA、Remix、Astro | Vite SPA 需要额外服务端；Remix 迁移心智更强；Astro 更适合内容站，不适合复杂交互工作台 | 快速搭建全栈 MVP，减少前后端分裂 | App Router 学习曲线和服务端 / 客户端边界容易混用 |
| 语言 | TypeScript | 项目包含 AI 输出结构、页面文件、版本快照、导出记录等复杂数据，类型约束能降低错误 | JavaScript | 动态类型更快起步，但后续 AI 输出和数据模型风险高 | 让数据模型、Zod schema、AI 结果结构保持一致 | 类型过度抽象会拖慢早期开发 |
| 样式方案 | Tailwind CSS | PRD 需要克制浅色、卡片、细边框、工作台布局，Tailwind 适合快速构建一致视觉 | CSS Modules、Styled Components、纯 CSS | CSS Modules 组织成本更高；Styled Components 运行时成本和风格偏重；纯 CSS 难控一致性 | 快速做出专业安静的界面，并便于响应式调整 | 类名过长、设计 token 失控 |
| UI 组件 | shadcn/ui 风格组件组织 | 适合细边框、圆角、轻阴影、表单、弹窗、按钮、菜单、Tabs 等后台/工作台 UI | Ant Design、MUI、从零写组件 | Ant/MUI 视觉气质较强，容易偏离 PRD；从零写组件成本高 | 快速覆盖登录、项目卡片、弹窗、版本历史、导出弹窗等基础组件 | 组件复制后维护责任在项目内，容易形成隐性设计系统 |
| 状态管理 | React 本地状态 + URL 状态 + 轻量全局 store | 工作台有当前页面、选区、保存状态、预览视口、对话输入等 UI 状态；真实项目数据以服务端为准 | Redux Toolkit、MobX、只用 React Context | Redux 对 MVP 偏重；MobX 心智不一致；只用 Context 容易导致渲染和组织混乱 | 保持 UI 响应快，同时不把持久化数据塞进前端状态 | 全局 store 滥用会造成数据源不清 |
| 页面路由 | Next.js App Router 文件路由 | 与 Next.js 基线一致，适合首页、登录、项目列表、工作台、设置、受保护路由 | React Router | React Router 更适合 SPA，不能天然提供服务端页面与路由处理 | 页面和服务端能力统一组织 | 动态路由、布局和 Server Components 边界需要规范 |
| 组件组织 | `components` 放通用 UI，`features` 按业务域组织 | PRD 模块明显：auth、projects、workspace、generation、versions、export | 按页面堆放、按技术类型堆放 | 页面堆放会让工作台膨胀；技术类型堆放会让业务逻辑分散 | 便于拆 Issue 和多人协作 | feature 边界设计不清会重复封装 |
| 预览区域 | Sandpack 嵌入式预览 + 受控文件输入 | 产品核心是“生成可预览前端原型”；Sandpack 提供浏览器内前端预览能力 | iframe 手写预览、StackBlitz WebContainers、自建远程容器 | 手写 iframe 需要自建打包与错误处理；WebContainers 更重；远程容器成本和安全复杂度高 | 快速实现 React/Vite 预览、错误展示、文件视图 | Sandpack 不是安全边界的全部，不能执行真实服务端逻辑 |

### 2.2 后端技术栈

| 选择项 | 当前锁定 | 为什么选择 | 替代方案 | 为什么暂时不选替代方案 | 对 MVP 的好处 | 可能风险 |
|---|---|---|---|---|---|---|
| API 方案 | Next.js Route Handlers / Server Actions | 与 Next.js 同栈，适合处理生成、迭代、保存、回退、导出等请求 | 独立 Express/Fastify 服务、tRPC、GraphQL | 独立服务增加部署和鉴权复杂度；tRPC/GraphQL 初期不是必需 | 减少服务拆分，明确服务端边界 | Route Handler 膨胀，需要早期抽到 `src/server` |
| 服务端生成逻辑 | `server/generation` 统一编排 | AI 生成需要鉴权、额度、prompt、模型调用、校验、保存版本 | 写在 API route 中 | API route 直接写业务会导致不可测试、难复用 | 生成、修改、修复、解释模式可统一治理 | 编排层过胖，需要按模式拆分 |
| AI 调用逻辑 | 服务端 provider adapter + OpenAI Responses API | API key 不能暴露到浏览器；Responses API 支持文本输出、结构化输出和流式能力 | 前端直连 OpenAI、LangChain 全量引入、其他模型供应商 SDK | 前端直连不安全；LangChain 对 MVP 过重；多供应商初期会增加抽象 | 先跑通核心生成，同时保留 provider 切换空间 | provider adapter 设计过早泛化会增加复杂度 |
| 鉴权逻辑 | Supabase Auth + 服务端用户校验 | PRD 需要轻量账号、项目归属、私有项目和额度记录 | NextAuth/Auth.js、自建账号、Clerk | 自建账号风险高；Clerk 商业依赖更强；NextAuth 仍需数据库和权限设计 | 快速获得登录、会话和用户身份 | Supabase 客户端和服务端会话处理需要严格区分 |
| 文件导出逻辑 | 服务端生成 zip / 静态包 | 导出必须绑定当前项目、版本、权限和额度；不能只靠前端拼接 | 浏览器内打包、远程队列打包 | 前端打包易受文件大小和权限影响；远程队列 MVP 可先不做 | 能统一校验版本、权限和导出内容 | 大项目导出可能超时，后续需要后台任务 |
| 数据校验逻辑 | Zod schema 服务端优先，前端复用非敏感校验 | AI 输出和用户输入都不可信，需要结构化校验 | 手写校验、只靠 TypeScript | TypeScript 不校验运行时数据；手写校验易漏 | 保护数据库、预览沙盒和导出流程 | schema 过严可能导致 AI 输出频繁失败 |

#### 2.2.1 必须在服务端执行的逻辑

- OpenAI API key 读取和 OpenAI API 调用。
- 用户身份校验。
- 项目读取、创建、更新、删除。
- 页面、版本、对话、生成记录、导出记录写入。
- 额度和订阅状态校验。
- 敏感配置读取。
- Prompt 组装和模式选择。
- AI 输出结构校验与清洗。
- 生成结果安全检查。
- 导出 zip 或静态包打包。
- 敏感日志过滤。
- 数据库访问。

### 2.3 数据库与持久化

| 选择项 | 当前锁定 | 为什么选择 | 替代方案 | 为什么暂时不选替代方案 | 对 MVP 的好处 | 可能风险 |
|---|---|---|---|---|---|---|
| 主持久化 | Supabase PostgreSQL | 需求明确要求账号归属、项目持久化、版本快照、额度记录；PostgreSQL 适合结构化数据和 JSON 文件快照 | localStorage、SQLite、本地文件、Firebase | localStorage 不能跨设备和账号隔离；SQLite/文件不适合云端多用户；Firebase 查询和关系建模不如 PostgreSQL 清晰 | MVP 一开始就具备账号级数据隔离和可扩展表结构 | 需要设计 RLS、备份和迁移 |
| 认证数据 | Supabase Auth | 与 Supabase Postgres 集成，支持轻量账号和后续社交/SSO 扩展 | 自建用户表 + 密码、第三方 Auth SaaS | 自建安全成本高；第三方 Auth SaaS 增加外部依赖 | 快速满足登录、会话和用户身份 | Auth 与业务用户 profile 的映射需明确 |
| ORM | Drizzle ORM | TypeScript 友好、贴近 SQL、适合明确表结构和迁移管理 | Prisma、Kysely、直接 SQL | Prisma 生成层较重；Kysely 更偏查询构建；直接 SQL 类型保障弱 | 保持类型、schema 和迁移可追踪 | 团队需遵守迁移流程，避免手改数据库 |
| 本地存储 | 仅用于草稿和 UI 临时状态 | 选区、未提交输入、面板尺寸可本地保存；项目真实数据必须进数据库 | 完全不用 localStorage、local-first | 完全不用会降低 UX；local-first 对 MVP 过重 | 改善刷新恢复和输入体验 | 不能让 localStorage 成为事实数据源 |
| 文件内容存储 | MVP 可存数据库 JSON / JSONB，后续评估对象存储 | 项目文件、版本快照初期可作为结构化 JSON 保存 | Supabase Storage、S3/R2、Git-like object store | 对象存储更适合大文件，但 MVP 初期会增加一致性设计 | 快速完成生成、版本和回退闭环 | 大项目和多版本会导致数据库膨胀 |

#### 2.3.1 当前是否只使用 localStorage

不建议。localStorage 只能用于：

- 未提交输入草稿。
- 当前选区 UI 状态。
- 面板尺寸。
- 最近打开项目 ID。
- 临时视口偏好。

不能用于：

- 用户账号。
- 项目主数据。
- 页面代码。
- 版本快照。
- 对话历史。
- 导出记录。
- 额度和订阅状态。

#### 2.3.2 当前需要的表

- `users` 或业务侧 `user_profiles`：关联 Supabase Auth 用户。
- `projects`：项目基本信息和归属。
- `pages`：项目页面。
- `project_versions`：项目级版本快照。
- `conversation_messages`：对话记录。
- `generation_requests`：生成 / 修改请求记录。
- `generation_results`：AI 输出结果和校验状态。
- `export_records`：导出记录。
- `quotas`：MVP 额度 / 使用次数记录。

#### 2.3.3 未来预留表

- `subscriptions`：真实订阅套餐和状态。
- `teams`：团队工作区。
- `team_members`：团队成员和角色。
- `share_links`：公开或私有分享链接。
- `assets`：图片、文件、品牌资产。
- `reference_inputs`：参考图、文件、URL 输入记录。
- `audit_logs`：企业级审计日志。

### 2.4 AI 生成技术栈

| 选择项 | 当前锁定 | 为什么选择 | 替代方案 | 为什么暂时不选替代方案 | 对 MVP 的好处 | 可能风险 |
|---|---|---|---|---|---|---|
| AI 请求发起位置 | 服务端 | API key、额度、用户身份、prompt 和输出校验都必须在可信环境 | 浏览器直接发起 | 会暴露 key，无法可靠控制额度和数据写入 | 安全边界清楚 | 服务端响应慢时需要更好状态设计 |
| AI Provider | OpenAI Responses API + provider adapter | 官方 Responses API 支持结构化输出和多模式扩展；adapter 避免业务绑定具体 SDK | 直接散落调用 SDK、多供应商同时接入 | 散落调用难维护；多供应商初期复杂 | 先锁一个可用基线，后续可替换 provider | adapter 不能过度抽象 |
| Prompt 模板 | `src/prompts` 按模式组织 | generate、iterate、repair、explain 的上下文和输出要求不同 | Prompt 写在 UI 或 API route 中 | 分散 prompt 难审计、难迭代、难测试 | 便于版本管理和 prompt regression 测试 | Prompt 文件过多时需要命名规范 |
| 输出结构 | Structured Outputs / JSON Schema + Zod 二次校验 | AI 输出必须能转成项目文件、页面地图、摘要和版本数据 | 纯文本、非严格 JSON | 纯文本难解析；普通 JSON 不保证结构符合 | 降低保存和预览失败率 | schema 太复杂会降低生成成功率 |
| 文件路径安全 | 服务端 allowlist + 路径规范化 | AI 可能输出非法路径、穿越路径或危险文件 | 只靠 prompt 约束 | Prompt 不能作为安全机制 | 防止污染导出包和预览文件树 | 过严规则可能拒绝有效输出 |
| 代码安全 | 只允许前端项目文件子集 | 预览目标是前端原型，不应生成服务端密钥或危险脚本 | 允许任意项目文件 | 任意文件会扩大安全面和导出风险 | 保持 MVP 可控 | 用户可能要求更复杂项目时受限 |
| 生成模式 | `generate`、`iterate`、`repair`、`explain` | PRD 明确有新建、修改、修复失败、解释改动等场景 | 单一 generate prompt | 单 prompt 容易上下文混乱 | 每种模式输入输出更清晰 | 模式路由需要稳定判断 |

#### 2.4.1 AI 输出建议结构

AI 生成结果建议统一为结构化对象，包含：

- `mode`：`generate`、`iterate`、`repair`、`explain`。
- `project`：项目标题、描述、默认风格摘要。
- `pages`：页面名称、route、用途、文件引用。
- `files`：安全路径到文件内容的映射。
- `navigation`：页面间跳转关系。
- `summary`：用户可读改动摘要。
- `warnings`：未完成能力、原型模拟、风险提示。
- `validationHints`：供服务端校验和 repair 使用的提示。

#### 2.4.2 AI 输出校验原则

- 先用 JSON Schema / Structured Outputs 约束形状。
- 再用 Zod 校验运行时结构。
- 文件路径必须：
  - 以允许的项目根路径开头。
  - 不包含 `..`。
  - 不包含绝对路径。
  - 不包含系统路径。
  - 不包含服务端配置文件路径。
- 文件类型必须限制在 MVP 允许范围，例如页面、组件、样式、静态资源说明。
- 不允许 AI 输出：
  - `.env`。
  - 服务端密钥。
  - API key。
  - 任意 shell 脚本。
  - 危险 HTML 脚本。
  - 后端数据库连接代码。
  - 不受控远程依赖安装指令。

### 2.5 预览与代码执行方案

| 选择项 | 当前锁定 | 为什么选择 | 替代方案 | 为什么暂时不选替代方案 | 对 MVP 的好处 | 可能风险 |
|---|---|---|---|---|---|---|
| 预览沙盒 | Sandpack | 浏览器内预览 React/Vite 类前端项目，适合工作台实时预览 | 自研 iframe 打包、远程容器、WebContainers | 自研成本高；远程容器安全和成本复杂；WebContainers 重 | 快速获得预览、错误 overlay、文件映射能力 | 不能把 Sandpack 当成完整安全隔离 |
| 运行内容 | 受控前端文件 | MVP 生成目标是前端原型 | 允许全栈代码 | 全栈代码涉及密钥、数据库、服务端执行 | 降低安全风险 | 复杂应用表达能力有限 |
| 网络访问 | 默认禁止或最小化 | 防止生成代码访问外部资源、泄露数据或滥用 | 默认允许网络 | 不利于安全和可重复预览 | 预览稳定、可控 | 远程图片/字体等体验受限 |
| 依赖安装 | MVP 使用固定依赖 allowlist | 避免 AI 任意引入大依赖或恶意依赖 | 用户/AI 任意安装依赖 | 安全、体积和稳定性风险高 | 预览更快，导出更可控 | 生成能力受 allowlist 限制 |
| 错误修复 | Sandpack 错误 + `repair` 模式 | 预览失败时把错误摘要交给服务端修复 | 用户手动修改代码 | MVP 用户未必懂代码 | 增强可用性 | repair 可能循环失败，需要次数限制 |

#### 2.5.1 Sandpack 负责什么

- 在浏览器内运行受控前端项目预览。
- 展示生成页面。
- 展示运行时错误。
- 支持受控文件树。
- 支持预览刷新。
- 支持部分依赖和模板能力。

#### 2.5.2 Sandpack 不能负责什么

- 不能保护 OpenAI API key。
- 不能执行真实服务端业务逻辑。
- 不能直接访问生产数据库。
- 不能作为计费、权限或导出的可信来源。
- 不能允许任意网络、任意依赖和任意脚本。
- 不能替代服务端输出校验。

### 2.6 测试技术栈

| 测试类型 | 当前锁定 | 覆盖范围 | MVP 必要性 | 风险 |
|---|---|---|---|---|
| 单元测试 | Vitest | 纯函数、schema 校验、路径清洗、额度规则 | P0 | 如果只测 UI，不测生成校验，风险仍高 |
| API route 测试 | Vitest + request handler 测试工具 | 鉴权、生成入口、保存、回退、导出前校验 | P0 | mock AI 和数据库要保持真实边界 |
| 生成结果 schema 测试 | Vitest + Zod fixtures | AI 输出合法/非法样例、repair 输入 | P0 | fixture 不足会漏掉真实模型边界 |
| 导出 zip 测试 | Vitest | 导出文件列表、路径安全、版本绑定 | P0 | 大项目导出性能仍需后续压测 |
| UI 交互测试 | React Testing Library 或等价方案 | 表单、按钮状态、选区状态、弹窗 | P1 | 工作台复杂交互只靠单元测试不够 |
| E2E 测试 | Playwright | 登录、新建项目、生成、修改、回退、导出主流程 | P1 / 后续 | 依赖稳定测试环境和 mock AI |
| 可观测性验证 | 日志字段测试 / 手动检查 | 敏感日志过滤、错误上下文 | P1 | 容易被忽略，需 ADR 约束 |

## 3. 架构草案

### 3.1 目录分层建议

推荐目录结构：

```text
src/
  app/
  components/
  features/
  lib/
  server/
  schemas/
  prompts/
  types/
  tests/
```

#### 3.1.1 各层职责

| 目录 | 职责 |
|---|---|
| `src/app` | Next.js 页面、布局、路由入口、Route Handlers。只做路由编排，不堆业务逻辑 |
| `src/components` | 通用 UI 组件，例如 Button、Dialog、Input、Card、Tabs、Tooltip、EmptyState |
| `src/features` | 按业务功能组织模块，例如 auth、projects、workspace、generation、versions、export |
| `src/lib` | 通用纯工具函数，例如日期格式化、路径工具、对象处理、非敏感前端 helper |
| `src/server` | 只在服务端运行的逻辑，例如 AI 调用、数据库访问、鉴权、额度、导出、日志 |
| `src/schemas` | Zod schema、AI 输出 schema、请求/响应结构、运行时校验 |
| `src/prompts` | AI prompt 模板和 prompt 片段，按模式和版本组织 |
| `src/types` | 共享 TypeScript 类型，优先从 schema 推导，避免重复定义 |
| `src/tests` | 单元、API、schema、导出、E2E 测试和 fixtures |

#### 3.1.2 依赖边界

- `components` 不应直接访问数据库。
- `components` 不应直接调用 OpenAI SDK。
- `components` 不应依赖 `server`。
- `features` 的前端子模块可以依赖 `components`、`lib`、`schemas` 的非敏感部分。
- `server` 可以依赖 `schemas`、`types`、`prompts`、数据库客户端和 provider adapter。
- `server` 不应依赖浏览器 API，例如 `window`、`document`、localStorage。
- `prompts` 不应散落在 UI 组件或 route handler 中。
- `schemas` 应尽量不依赖业务服务，保持可测试。
- API route 只做请求解析、鉴权入口、调用 server service、返回结果。

### 3.2 核心模块

| 模块 | 职责 | 输入 | 输出 | 依赖 |
|---|---|---|---|---|
| User/Auth | 登录、会话、用户身份、访问保护 | 登录信息、会话 cookie、请求上下文 | 当前用户、鉴权结果、权限错误 | Supabase Auth、server auth helper |
| Project | 项目创建、读取、更新、删除、归属校验 | userId、projectId、项目标题/描述 | Project 数据、项目列表、操作结果 | Database、Auth、Validation |
| Page | 页面清单、页面路由、页面代码、页面关系 | projectId、pageId、页面名称、route、code | 页面列表、页面详情、页面地图 | Project、Validation、Database |
| Version/Snapshot | 项目级快照、版本列表、预览历史、回退 | projectId、files、prompt、reason | Snapshot、恢复后的项目状态 | Project、Page、Database、Validation |
| AI Generation | generate、iterate、repair、explain 编排 | userPrompt、project context、mode、selection | 结构化生成结果、改动摘要、警告 | OpenAI adapter、Prompts、Validation、Quota |
| Preview Sandbox | 前端预览、选区映射、运行错误收集 | files、currentPage、viewport、selection | 预览状态、错误摘要、选区信息 | Sandpack、Workspace state |
| Export | 静态文件导出、可编辑项目结构导出、导出记录 | projectId、versionId、exportType | zip / export artifact、导出记录 | Project、Version、Validation、Quota |
| Validation | 请求校验、AI 输出校验、路径清洗、文件 allowlist | unknown input、AI output、file paths | typed data、validation errors | Zod、path rules |
| Billing/Quota | 额度记录、使用限制、未来订阅预留 | userId、operation type、estimated cost | quota status、allow/deny、usage record | Auth、Database |
| Logging/Observability | 记录请求、错误、生成状态、敏感信息过滤 | requestId、userId、operation、error | sanitized logs、metrics、trace id | Server services |

### 3.3 数据模型草案

本节只描述未来表结构方向，不等于 migration，不要求立即实现全部字段。

#### 3.3.1 User

| 字段 | 说明 |
|---|---|
| `id` | 用户唯一 ID，关联认证系统 |
| `email` | 用户邮箱 |
| `createdAt` | 创建时间 |

#### 3.3.2 Project

| 字段 | 说明 |
|---|---|
| `id` | 项目 ID |
| `userId` | 创建者用户 ID |
| `title` | 项目标题 |
| `description` | 项目描述 |
| `defaultStyle` | 默认风格文本摘要 |
| `currentVersionId` | 当前版本 ID |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

#### 3.3.3 Page

| 字段 | 说明 |
|---|---|
| `id` | 页面 ID |
| `projectId` | 所属项目 ID |
| `name` | 页面名称 |
| `route` | 页面路由 |
| `code` | 页面入口代码或文件引用 |
| `isHome` | 是否为默认首页 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

#### 3.3.4 ProjectVersion / Snapshot

| 字段 | 说明 |
|---|---|
| `id` | 快照 ID |
| `projectId` | 所属项目 ID |
| `versionNumber` | 版本序号 |
| `files` | 当前版本文件树快照 |
| `pageMap` | 页面地图快照 |
| `prompt` | 触发版本的用户输入 |
| `reason` | 版本产生原因，例如 generate、iterate、rollback |
| `summary` | 用户可读摘要 |
| `createdAt` | 创建时间 |

#### 3.3.5 ConversationMessage

| 字段 | 说明 |
|---|---|
| `id` | 消息 ID |
| `projectId` | 所属项目 ID |
| `versionId` | 可选关联版本 ID |
| `role` | user / assistant / system-summary |
| `content` | 消息内容 |
| `selectionContext` | 可选选区上下文 |
| `createdAt` | 创建时间 |

#### 3.3.6 GenerationRequest

| 字段 | 说明 |
|---|---|
| `id` | 请求 ID |
| `projectId` | 关联项目 ID；新项目生成时可先为空或延后绑定 |
| `userId` | 请求用户 ID |
| `mode` | generate / iterate / repair / explain |
| `userPrompt` | 用户输入 |
| `selectionContext` | 可选选区信息 |
| `status` | pending / running / succeeded / failed / cancelled |
| `createdAt` | 创建时间 |

#### 3.3.7 GenerationResult

| 字段 | 说明 |
|---|---|
| `id` | 结果 ID |
| `requestId` | 关联 GenerationRequest |
| `files` | AI 输出文件 |
| `summary` | 改动摘要 |
| `warnings` | 风险和限制提示 |
| `validationStatus` | valid / repaired / invalid |
| `validationErrors` | 校验错误摘要 |
| `createdAt` | 创建时间 |

#### 3.3.8 ExportRecord

| 字段 | 说明 |
|---|---|
| `id` | 导出记录 ID |
| `projectId` | 项目 ID |
| `versionId` | 导出版本 ID |
| `userId` | 操作用户 ID |
| `exportType` | static / editable-project |
| `status` | pending / succeeded / failed |
| `artifactRef` | 导出产物引用 |
| `createdAt` | 创建时间 |

#### 3.3.9 Quota / Subscription 预留

| 字段 | 说明 |
|---|---|
| `id` | 额度记录 ID |
| `userId` | 用户 ID |
| `plan` | free / personal / team / enterprise |
| `monthlyLimit` | 月度限制 |
| `usedCount` | 已使用次数 |
| `periodStart` | 当前周期开始 |
| `periodEnd` | 当前周期结束 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

### 3.4 数据流

#### 3.4.1 generate 新项目

1. 用户在前端输入自然语言需求。
2. 前端做非敏感校验，例如非空、长度提示。
3. 前端提交到服务端生成入口。
4. 服务端校验用户身份。
5. 服务端检查额度。
6. 服务端校验请求结构。
7. 服务端组装 `generate` prompt。
8. 服务端调用 OpenAI。
9. 服务端校验 AI 输出结构。
10. 如输出不合法，进入 `repair` 或返回可恢复错误。
11. 服务端保存 Project、Page、ProjectVersion、ConversationMessage、GenerationRequest、GenerationResult。
12. 服务端返回项目 ID、当前版本、页面地图和文件树。
13. 前端进入工作台。
14. Sandpack 载入受控文件并预览。

#### 3.4.2 iterate 修改已有项目

1. 用户在工作台输入修改要求。
2. 前端附带当前项目、当前页面、选区或范围上下文。
3. 服务端校验用户对项目的访问权限。
4. 服务端读取当前项目、页面、版本和必要对话摘要。
5. 服务端检查额度。
6. 服务端组装 `iterate` prompt。
7. 服务端调用 OpenAI。
8. 服务端校验输出结构、文件路径和变更范围。
9. 服务端保存新版本快照和修改记录。
10. 前端刷新预览和改动摘要。
11. Sandpack 重新加载当前版本文件。

#### 3.4.3 rollback 回退版本

1. 用户打开版本历史。
2. 用户选择历史版本预览。
3. 前端请求服务端读取该版本。
4. 服务端校验用户权限。
5. 用户确认恢复该版本。
6. 服务端读取历史快照。
7. 服务端创建新的当前版本记录，`reason` 标记为 rollback。
8. 服务端更新项目当前版本。
9. 前端切换到恢复后的版本。
10. Sandpack 载入恢复后的文件树。

#### 3.4.4 export 导出项目

1. 用户点击导出。
2. 前端展示导出前检查项。
3. 用户选择导出类型。
4. 服务端校验用户权限、项目状态、版本 ID、额度。
5. 服务端读取指定版本文件和页面地图。
6. 服务端再次执行路径和文件 allowlist 校验。
7. 服务端生成静态包或可编辑项目结构。
8. 服务端保存 ExportRecord。
9. 前端显示导出成功或失败状态。

#### 3.4.5 login 用户登录

1. 用户在登录页提交邮箱或其他轻量账号方式。
2. Auth 服务完成身份验证。
3. 服务端通过 cookie / session 获取用户。
4. 访问项目列表或工作台时，服务端重新校验用户。
5. 前端只显示当前用户可访问的项目。

#### 3.4.6 save 保存项目

1. 用户触发项目名称、页面、设置或当前版本变化。
2. 前端显示保存中。
3. 服务端校验用户和项目归属。
4. 服务端校验请求结构。
5. 服务端写入项目或页面数据。
6. 服务端返回保存成功。
7. 前端显示已保存和时间。
8. 若失败，前端保留当前 UI 内容并提示重试。

### 3.5 服务端边界

#### 3.5.1 必须在服务端的逻辑

- OpenAI API 调用。
- OpenAI API key 管理。
- 用户鉴权和项目权限校验。
- 项目保存。
- 页面保存。
- 版本保存。
- 对话记录保存。
- 额度检查和使用记录。
- 支付状态检查。
- 生成结果安全校验。
- AI 输出 repair。
- 导出 zip / 静态包生成。
- 敏感日志过滤。
- 数据库访问。
- 订阅状态读取。
- 导出产物权限控制。

#### 3.5.2 可以在前端的逻辑

- 输入表单状态。
- 非敏感输入校验，例如空值和长度提示。
- UI 状态，例如当前页面、当前选区、当前视口、面板展开状态。
- 预览切换。
- 选择模式和选区高亮。
- 代码查看。
- 本地草稿。
- 导出弹窗交互。
- 错误提示展示。
- 已保存 / 保存中状态展示。

## 4. 安全、性能、成本、可用性思考

### 4.1 安全

#### 4.1.1 API key 泄露

- OpenAI API key 只能存在服务端环境变量中。
- 前端不得导入 OpenAI SDK。
- 日志不得打印完整请求头、环境变量或模型调用配置。
- 错误响应不得包含 provider 原始敏感信息。

#### 4.1.2 用户生成代码的安全边界

- 用户生成代码只在 Sandpack 预览沙盒中运行。
- MVP 禁止生成服务端代码、密钥文件、shell 脚本和数据库连接代码。
- 依赖必须来自 allowlist。
- 网络访问默认禁止或最小化。
- 导出前必须重新校验文件路径和文件类型。

#### 4.1.3 XSS

- AI 输出不能直接作为未清洗 HTML 注入产品 UI。
- 预览内容与宿主产品 UI 必须隔离。
- 对话摘要、错误消息、项目标题、页面名称展示时应转义。
- 用户输入和 AI 输出都视为不可信。

#### 4.1.4 Prompt injection

- 用户输入、项目内容、参考内容不得覆盖系统安全规则。
- Prompt 中需要明确文件 allowlist、禁止输出内容和输出结构。
- 服务端校验必须独立于 prompt。
- 对“忽略之前规则”“输出密钥”“生成后端代码”等请求进行拒绝或降级。

#### 4.1.5 文件路径注入

- 禁止绝对路径。
- 禁止 `..`。
- 禁止系统路径。
- 禁止 `.env`、配置密钥文件、脚本文件。
- 导出时再次规范化路径。

#### 4.1.6 数据库权限与用户隔离

- 所有项目查询必须带 userId 或权限条件。
- Supabase RLS 应作为数据库层保护。
- 服务端不能信任前端传来的 userId。
- 分享和团队协作进入后续版本前，不允许跨用户访问项目。

#### 4.1.7 日志安全

- 日志记录 requestId、operation、status、耗时、错误类型。
- 不记录 API key。
- 不记录完整用户敏感输入。
- 不记录完整生成文件内容，除非在安全的调试环境中显式开启。
- 生产日志中对邮箱、项目内容、prompt 进行截断或脱敏。

### 4.2 性能

#### 4.2.1 AI 响应慢

- 前端必须展示生成中阶段。
- 服务端可支持流式状态更新。
- MVP 可先同步处理，但需要超时提示和重试。
- 后续可引入后台任务队列。

#### 4.2.2 首屏加载

- 首页应尽量静态化。
- 工作台按需加载 Sandpack。
- 登录状态和项目列表可以使用服务端加载。
- 大型编辑器和预览依赖不要进入首页首屏包。

#### 4.2.3 预览区域卡顿

- 限制文件数量和文件大小。
- 修改时只更新当前版本文件树。
- 对 Sandpack 重新加载做节流。
- 大项目后续考虑文件懒加载。

#### 4.2.4 大项目文件过多

- MVP 限制页面数量、文件数量、单文件大小。
- 版本快照保存摘要和文件树时需要记录大小。
- 超出限制时提示用户缩小范围。

#### 4.2.5 版本历史过大

- MVP 可保存完整快照，但必须保留未来压缩或增量快照空间。
- 对免费层限制版本数量。
- 删除项目时同步处理版本和导出记录。

#### 4.2.6 导出 zip 耗时

- MVP 可同步导出小项目。
- 大项目导出需要超时提示。
- 后续可切换后台任务和导出完成通知。

#### 4.2.7 流式响应和后台任务队列

- 流式响应适合生成状态和长文本摘要。
- 后台任务队列适合大项目生成、repair、多轮校验、导出。
- MVP 可预留接口形态，但不强制引入队列基础设施。

### 4.3 成本

#### 4.3.1 AI token 成本

- generate、iterate、repair、explain 都需要记录使用次数。
- Prompt 中只包含必要上下文，不把完整历史无限塞入。
- 项目上下文需要摘要化。
- 多页面大范围修改应提示用户确认。

#### 4.3.2 用户滥用

- 未登录用户不能触发高成本生成。
- 每个用户需要生成 / 修改次数限制。
- 同一用户短时间大量请求需要限制。
- repair 循环需要最大次数。

#### 4.3.3 免费额度

- MVP 至少记录 usedCount。
- 用户可见基础额度或使用次数。
- 额度不足时阻止高成本操作。
- 真实订阅支付后续再接入。

#### 4.3.4 日志和数据库成本

- 不保存无用完整模型原始响应。
- 对版本快照大小设限制。
- 日志保留周期后续需要策略。
- 导出产物后续需要过期策略。

#### 4.3.5 预览沙盒资源成本

- Sandpack 在用户浏览器运行，服务端成本较低。
- 但大型依赖和文件树会影响客户端性能。
- 需要限制依赖和文件大小。

#### 4.3.6 部署平台成本

- Vercel 适合 MVP 快速部署。
- AI 生成和导出可能触发 serverless 时长限制。
- 长任务后续可能需要队列或独立 worker。

### 4.4 可用性

#### 4.4.1 生成失败

- 保留用户输入。
- 显示失败原因。
- 提供重试、缩小需求、恢复上一个版本。
- 不消耗或明确说明是否消耗额度。

#### 4.4.2 AI 输出不合法

- 服务端返回可理解错误，不显示原始 stack。
- 自动尝试 `repair`，但限制次数。
- repair 失败时保留原版本。
- 错误可进入可观测日志。

#### 4.4.3 用户回退

- 回退前预览历史版本。
- 回退前二次确认。
- 回退后创建新版本记录。
- 回退失败不破坏当前版本。

#### 4.4.4 用户保存

- 自动保存关键变化。
- 显示保存中、已保存、保存失败。
- 未保存离开时提醒。
- 保存失败保留前端编辑状态。

#### 4.4.5 用户继续编辑

- 对话历史和版本摘要帮助恢复上下文。
- 当前页面、选区和范围要清晰。
- 切换页面不丢失输入草稿。

#### 4.4.6 当前版本识别

- 工作台顶部显示当前版本状态。
- 版本历史标记当前版本。
- 导出弹窗显示导出版本。
- 回退后标记来自哪个历史版本。

#### 4.4.7 生成过程理解

- 显示阶段：规划页面、生成文件、校验输出、保存版本、准备预览。
- 对长任务显示仍在处理。
- 对失败显示下一步建议。

#### 4.4.8 页面状态

- 空状态：告诉用户如何开始。
- 加载状态：告诉用户系统正在做什么。
- 错误状态：告诉用户发生了什么、数据是否安全、下一步怎么恢复。
- 禁用状态：告诉用户为什么暂时不可操作。

## 5. 架构迭代机制

### 5.1 规则

每次架构发生重要变化时，必须在本文档记录 ADR。

重要变化包括：

- 更换前端框架、后端框架、数据库、ORM、Auth、AI provider、预览沙盒或部署平台。
- 新增服务端 worker、队列、对象存储、团队权限、订阅支付。
- 改变数据模型核心表。
- 改变 AI 输出结构或 prompt 模式。
- 改变安全边界，例如允许网络访问或允许更多文件类型。
- 改变 MVP 范围。

每次记录必须包含：

1. 为什么要改。
2. 改了什么。
3. 影响哪些模块。
4. 是否引入新风险。
5. 是否影响 MVP 范围。

### 5.2 ADR 模板

ADR 应按以下字段记录：

| 字段 | 内容要求 |
|---|---|
| 标题 | `ADR-0001: 技术决策标题` |
| 状态 | Proposed / Accepted / Deprecated / Replaced |
| 背景 | 为什么现在需要这个决策 |
| 决策 | 我们选择什么方案 |
| 备选方案 | 还有哪些可选方案 |
| 取舍原因 | 为什么选当前方案，而不是其他方案 |
| 影响范围 | 影响哪些模块、目录、数据模型或接口 |
| 风险 | 这个决策带来什么风险 |
| 是否影响 MVP 范围 | 是 / 否，并说明影响 |
| 后续动作 | 接下来需要做什么 |

### 5.3 ADR 记录

#### ADR-0001: 锁定 MVP 初始技术栈基线

##### 状态

Accepted

##### 背景

仓库已有需求文档和 PRD，但没有源码、README、package 配置或现有架构。为了后续实现不在基础技术选择上反复摇摆，需要锁定一套 MVP 技术基线。

##### 决策

MVP 基线采用：

- Next.js App Router + React + TypeScript。
- Tailwind CSS + shadcn/ui 风格组件组织。
- Supabase Auth + Supabase PostgreSQL。
- Drizzle ORM。
- OpenAI Responses API + Structured Outputs。
- Zod 运行时校验。
- Sandpack 预览沙盒。
- Vercel 部署。
- Vitest + Playwright 测试基线。

##### 备选方案

- Vite SPA + 独立后端。
- Remix。
- Firebase。
- 自建 Auth。
- Prisma。
- WebContainers / 远程容器预览。
- 自托管部署。

##### 取舍原因

当前产品需要同时覆盖复杂工作台 UI、服务端 AI 调用、鉴权、持久化、版本、导出和预览。Next.js + Supabase + Sandpack 的组合能以较少服务拆分支持 MVP 闭环。替代方案不是不可用，而是会增加 MVP 的服务端、鉴权、部署或安全复杂度。

##### 影响范围

- 前端目录结构。
- 服务端边界。
- 数据库模型。
- AI provider adapter。
- 预览沙盒。
- 导出流程。
- 测试策略。

##### 风险

- App Router 服务端 / 客户端边界混乱。
- Supabase RLS 配置不严导致数据隔离风险。
- Sandpack 被误认为完整安全边界。
- OpenAI 输出 schema 过严或过松都会影响生成体验。
- Vercel serverless 对长任务和导出有时长限制。

##### 是否影响 MVP 范围

否。该决策用于支撑现有 MVP 范围，不新增产品能力。

##### 后续动作

- 实现前创建实际项目结构和依赖配置。
- 建立 schema、prompt、server service 的边界。
- 为生成、迭代、回退、导出写最小测试。
- 在实现长任务前评估是否需要队列。

## 6. 冲突与待确认问题

### 6.1 当前仓库与文档之间的冲突

| 问题 | 说明 | 推荐处理 |
|---|---|---|
| PRD 曾避免技术选型 | PRD 明确不讨论工程实现，而架构文档需要锁定技术栈 | 不冲突；PRD 是产品文档，本文档是架构基线 |
| Phase 4/Issue #15 基础层不等于完整 MVP 闭环 | 当前已有 schema、mock provider、server-only OpenAI provider、P0 生成入口、版本/生成/对话/导出持久化边界和导出 manifest 服务边界，但 Sandpack runtime、版本历史 UI、完整迭代修改和 zip 下载尚未完成 | 在 PROJECT_STATUS 中持续区分“生成入口已实现”和“完整 MVP 闭环未实现” |
| Supabase RLS 已验证但仍有性能优化项 | 真实 Supabase migration/RLS 已执行并验证跨用户隔离；performance advisor 提示 `auth_rls_initplan` | Issue #14 优化 policy 中适用的 `auth.uid()` 调用为 `(select auth.uid())` 并复跑 advisor |

### 6.2 待确认问题

| ID | 问题 | 为什么重要 | 推荐默认答案 | 不同选择的影响 |
|---|---|---|---|---|
| Q-001 | 是否确认 Next.js 作为唯一应用框架 | 影响项目初始化和部署方式 | 确认使用 Next.js App Router | 若改 Vite，需要独立后端和部署设计 |
| Q-002 | Supabase 是否作为正式 MVP 后端服务 | 影响 Auth、数据库、RLS、环境变量 | 确认 Supabase Auth + PostgreSQL | 若不用 Supabase，需要另选 Auth 和数据库 |
| Q-003 | Drizzle 是否必须从第一版引入 | 影响迁移和表结构维护 | 从第一版引入 | 若延后，早期 SQL/SDK 写法后续迁移成本更高 |
| Q-004 | OpenAI 是否是 MVP 唯一 AI provider | 影响 provider adapter 深度 | OpenAI 为唯一实际 provider，但保留 adapter | 多 provider 会增加测试、成本和 prompt 差异 |
| Q-005 | Sandpack 是否允许网络访问 | 影响预览安全和外部素材能力 | MVP 默认禁止或最小化 | 允许网络会提升素材能力，但增加泄露和不可控风险 |
| Q-006 | AI 生成文件 allowlist 具体包含哪些文件类型 | 影响生成能力和安全 | MVP 只允许前端页面、组件、样式、静态资源说明 | 放宽会提升能力，但增加执行和导出风险 |
| Q-007 | 版本快照保存完整文件还是增量 diff | 影响数据库成本和回退复杂度 | MVP 保存完整快照 | 增量更省空间，但实现复杂 |
| Q-008 | 导出是否必须在 serverless 内完成 | 影响 Vercel 可行性和超时风险 | MVP 小项目同步导出，后续预留队列 | 大项目需要 worker 或后台任务 |
| Q-009 | 额度是否按次数还是 token 估算 | 影响成本模型和用户提示 | MVP 按操作次数记录，后续补 token 成本 | token 更准确但实现和解释更复杂 |
| Q-010 | 是否需要从第一版接入错误追踪服务 | 影响可观测性成熟度 | MVP 先结构化日志，P1 接入错误追踪 | 不接入会降低线上排障效率 |

## 7. 当前基线总结

当前 MVP 技术栈锁定为：

- 前端：Next.js App Router、React、TypeScript、Tailwind CSS、shadcn/ui 风格组件。
- 后端：Next.js Route Handlers / Server Actions + `src/server` 服务层。
- 数据库：Supabase PostgreSQL。
- 鉴权：Supabase Auth。
- ORM：Drizzle ORM。
- AI：服务端 OpenAI Responses API，Structured Outputs，Zod 二次校验。
- 预览：Sandpack，仅运行受控前端项目文件。
- 导出：服务端导出当前项目版本。
- 部署：Vercel。
- 测试：Vitest 为单元/API/schema/导出测试基线，Playwright 作为 E2E 预留。

当前必须坚持的边界：

- OpenAI API key 不进浏览器。
- 前端组件不访问数据库。
- UI 不直接调用 AI provider。
- 生成结果必须服务端校验后才能保存、预览和导出。
- localStorage 不能作为项目主存储。
- Sandpack 不是完整安全策略，只是预览运行环境的一部分。
- 架构变化必须写 ADR。

## 8. Phase 3 实施记录

### ADR-0002: 建立 Supabase Auth 与 Drizzle 持久化基础层

#### 状态

Accepted

#### 背景

Phase 2 已完成 fixture/mock 驱动的前端闭环，但 PROJECT_STATUS 明确下一阶段需要接入轻量账号、项目归属、数据库持久化和基础额度记录。没有这一层，项目列表、工作台私有内容、额度记录和后续版本/导出能力都无法绑定到真实用户。

#### 决策

Phase 3 基础层采用：

- `@supabase/ssr` 和 `@supabase/supabase-js` 建立 server-side Supabase Auth 会话边界。
- `/projects` 和 `/workspace` 通过 `requireCurrentUser` 读取当前用户；未登录用户跳转 `/login`。
- `drizzle-orm`、`postgres` 和 `drizzle-kit` 建立 PostgreSQL schema 与迁移工具基础。
- `src/server/db/schema.ts` 定义 `user_profiles`、`projects`、`pages`、`project_versions`、`conversation_messages`、`generation_requests`、`generation_results`、`export_records`、`quotas` 的最小表结构。
- `src/server/projects` 只接受当前 session 推导出的 owner，不信任前端传入的用户身份。
- `src/server/quota` 先记录操作次数，不接真实订阅或支付。

#### 备选方案

- 继续使用 fixture/mock 项目数据：无法满足 Phase 3 的项目归属和持久化目标。
- 直接使用 Supabase client 查询而不引入 Drizzle：迁移和类型边界较弱，偏离既定架构基线。
- 自建 Auth：安全成本和实现范围超过 MVP。

#### 取舍原因

该方案沿用 ADR-0001 的技术栈，不引入新的产品范围。Supabase Auth 解决轻量账号和 session 问题，Drizzle 提供后续版本、导出、额度和生成记录需要的类型化 schema。当前只建立基础边界，避免提前实现团队、分享、订阅、真实 AI 或导出打包。

#### 影响范围

- `src/server/auth`
- `src/server/db`
- `src/server/projects`
- `src/server/quota`
- `src/schemas`
- `/login`、`/projects`、`/workspace`
- `.env.example`
- `package.json` / `package-lock.json`
- `drizzle.config.ts`

#### 风险

- 本地未配置 Supabase 环境变量时无法真实登录，页面会显示配置缺失提示。
- ADR-0002 完成时尚未创建真实数据库 migration 文件或 RLS policy；当前已由 ADR-0004 补齐本地 SQL/RLS 文件，并已在 Issue #13 中完成真实 Supabase 远程执行与 RLS 验证。
- 项目列表已经转为服务端持久化读取，未配置数据库时会显示空状态，不再显示 fixture 项目卡片。

#### 是否影响 MVP 范围

否。该决策实现既定 MVP 的 Phase 3 基础能力，不新增 P1/P2 能力。

#### 后续动作

- 本地 Drizzle migration SQL 已由 ADR-0004 补齐，并已在真实 Supabase 项目执行验证。
- 本地 Supabase RLS policy SQL 已由 ADR-0004 补齐，并已在真实 Supabase 项目验证项目、页面、版本、对话、生成、导出和额度记录按用户隔离。
- 在 Phase 4 接入真实 AI 生成前，把生成结果 schema、路径安全和版本快照写入同一服务端边界。

## 9. Phase 4 实施记录

### ADR-0003: 建立生成输出校验、版本快照与导出服务基础层

#### 状态

Accepted

#### 背景

PROJECT_STATUS 明确 Phase 4 需要接入服务端 AI 生成、结构化输出校验、Sandpack 预览、项目级版本快照、回退和导出。真实 OpenAI 和真实 Sandpack 运行时接入前，必须先建立可测试的服务端安全边界，避免后续把不可信 AI 输出直接保存、预览或导出。

#### 决策

Phase 4 基础层采用：

- `src/schemas/generation.ts` 定义生成结果、页面、文件、版本快照 schema。
- `sanitizeGeneratedProject` 和 `validateGeneratedFilePath` 在服务端校验 AI 输出结构、路径 allowlist、重复文件和页面文件引用。
- `src/server/ai/provider.ts` 定义 `AiProvider` adapter，并提供 `createMockAiProvider` 作为当前可测试 provider。
- `src/prompts/generation.ts` 集中维护 Phase 4 生成系统提示，明确原型边界和禁止生成内容。
- `src/server/generation/generationService.ts` 编排 generate / iterate，调用 provider、校验输出、记录额度并创建版本快照。
- `src/server/versions/versionService.ts` 提供项目级版本快照和 rollback 记录边界；rollback 创建新的当前版本记录，不改写历史版本。
- `src/server/export/exportService.ts` 基于版本快照准备安全导出 manifest，并记录 export 使用次数。
- 工作台 UI 展示 Phase 4 的选区上下文、版本回退和导出状态，但仍明确预览内容来自 fixture，真实 Sandpack 运行时待接入。

#### 备选方案

- 直接接 OpenAI Responses API：会在 schema、路径安全和版本边界稳定前扩大风险。
- 直接在前端组装生成结果：会违反 OpenAI key 和 AI 输出校验必须在服务端的边界。
- 先做 Sandpack UI 再做服务端校验：会让不可信文件树更早进入预览路径。

#### 取舍原因

先做 mock provider + schema + 服务端编排可以用测试锁住安全边界，同时不阻塞后续替换为真实 OpenAI provider。版本和导出服务先返回可持久化的数据结构，避免当前阶段依赖未配置的 Supabase migration/RLS。

#### 影响范围

- `src/schemas/generation.ts`
- `src/prompts/generation.ts`
- `src/server/ai`
- `src/server/generation`
- `src/server/versions`
- `src/server/export`
- `src/features/workspace/components/WorkspacePage.tsx`
- `tests/phase4-generation-preview-export.test.mjs`

#### 风险

- 当前 provider 是 mock provider，不能代表真实模型质量或 OpenAI Responses API 行为。
- 当前导出服务只准备 manifest，还没有生成 zip 或下载文件。
- 当前版本服务只建立快照/rollback 数据边界，还没有写入数据库。
- 当前工作台仍使用 fixture 预览，真实 Sandpack 运行时和错误 overlay 待后续 Issue 接入。

#### 是否影响 MVP 范围

否。该决策实现 Phase 4 的基础服务边界，不新增 P1/P2 能力。

#### 后续动作

- 用真实 OpenAI Responses API provider 替换 mock provider，并保留同一 `AiProvider` 接口。
- 接入 Sandpack，把通过 schema 校验的文件树载入受控预览。
- 版本快照、生成记录、对话记录和导出记录写入 Supabase 的 repository 边界已由 ADR-0005 落地；真实数据库 schema/RLS 验证已由 Issue #13 完成。
- 实现导出 zip / 静态包下载。

### ADR-0004: 补齐 Supabase migration 与 RLS policy 基础层

#### 状态

Accepted

#### 背景

Issue #6 对应 Phase 4 后续落地顺序的第 1 步：在真实 OpenAI、Sandpack runtime、版本持久化和导出打包之前，先把 Supabase PostgreSQL schema migration 与 RLS policy 文件落到仓库中。Phase 3 已有 Drizzle schema 和服务端项目归属边界，但缺少可执行 SQL 与数据库层隔离策略，无法支撑后续真实持久化和上线前权限验收。

#### 决策

本阶段新增：

- `drizzle/0001_initial_schema.sql`：定义 `generation_mode`、`generation_status`、`quota_operation` enum，并创建 `user_profiles`、`projects`、`pages`、`project_versions`、`conversation_messages`、`generation_requests`、`generation_results`、`export_records`、`quotas` 表、外键和常用索引。
- `supabase/policies/0001_project_rls.sql`：为业务表启用 RLS，并按 `auth.uid()`、`projects.owner_id`、`generation_requests.requested_by_id`、`quotas.user_id` 等归属条件限制读取和写入。
- `tests/phase4-supabase-migration-rls.test.mjs`：用脚本级检查锁定 migration/RLS 文件、关键 policy 名称、owner/user 隔离条件和文档同步标记。

服务端仍必须继续执行权限校验；RLS 是数据库层兜底，不替代 `src/server` 中的 owner 校验。Supabase service role key 仍只允许在服务端受控使用，不能进入浏览器 bundle。

#### 备选方案

- 只依赖 Drizzle schema 自动推导迁移：无法在当前仓库中明确审查 RLS policy 和安全边界。
- 等真实 Supabase 项目准备好后再写 SQL：会阻塞后续版本、生成记录和导出记录持久化开发。
- 只靠服务端 owner 校验不配置 RLS：数据库层缺少最后一道隔离边界，不符合架构和 AGENTS 安全要求。

#### 取舍原因

先提交本地 migration/RLS 文件可以让后续持久化服务在稳定表结构上开发，也让权限策略进入代码审查和测试范围。真实 Supabase 远程执行已在 Issue #13 中补做并通过跨用户隔离验证；该 ADR 本身仍只记录本地 SQL/RLS 文件落地决策。

#### 影响范围

- `drizzle/0001_initial_schema.sql`
- `supabase/policies/0001_project_rls.sql`
- `tests/phase4-supabase-migration-rls.test.mjs`
- `docs/PROJECT_STATUS.md`
- `package.json`

#### 风险

- 当前 SQL 已在真实 Supabase 项目 `qhetmxcgwdifgkpvqrri` 执行并验证；后续 schema 变更仍需通过新的 migration 或可审计 SQL 管理。
- RLS policy 文件已覆盖当前 MVP 表，但后续新增分享、团队、公开模板或协作时必须重新设计权限模型。
- 当前检查能验证 SQL 文件包含关键策略，不能替代真实多用户集成测试。

#### 是否影响 MVP 范围

否。该决策只补齐既定 MVP 的数据库和权限基础，不新增团队协作、公开分享或企业权限能力。

#### 后续动作

- Issue #13 已在真实 Supabase 项目执行 `drizzle/0001_initial_schema.sql` 和 `supabase/policies/0001_project_rls.sql`，并验证跨用户隔离。
- Issue #13 已用不同用户验证 projects/pages/versions/messages/generation/export/quota 的跨用户隔离。
- 版本快照、generation request/result、conversation message 和 export record 的 repository 边界已由 ADR-0005 落地。

### 9.2 Phase 4 后续落地顺序

Phase 4 后续实现必须遵守依赖顺序。真实模型、预览 runtime、版本持久化和导出打包不能并行混做，否则会让安全校验、权限校验和用户可见状态难以验收。

| 顺序 | 架构落点 | 依赖 | 必须保持的边界 |
|---|---|---|---|
| 1. Supabase migration/RLS | `src/server/db`、migration 文件、Supabase policy 文档 | Phase 3 Drizzle schema | 数据库层 RLS 与服务端权限校验同时存在；不信任前端 userId |
| 2. 版本/生成记录持久化 | `src/server/versions`、`src/server/generation`、repositories | migration/RLS | 已补服务端持久化边界；生成失败不能覆盖当前版本；rollback 必须创建新版本记录 |
| 3. OpenAI Responses provider | `src/server/ai` | Phase 4 schema 和 prompt | OpenAI key server-only；provider 错误脱敏；输出必须过 Zod 和路径 allowlist |
| 4. 生成 route / Server Action | `src/app` route handlers 或 server actions、`src/server/generation` | 持久化服务、provider | 未登录不可生成；空输入不可生成；前端不直接调用 provider |
| 5. Sandpack runtime | `src/features/preview`、`src/features/workspace` | schema 校验后的文件树 | Sandpack 只运行受控前端文件；不执行真实后端；不允许任意依赖安装 |
| 6. 版本历史 / rollback UI | `src/features/versions`、`src/server/versions` | 版本持久化 | 回退前二次确认；回退失败不破坏当前版本 |
| 7. 导出 zip / 静态包 | `src/server/export`、route handler | export manifest、版本持久化 | 导出重新校验路径；导出绑定项目、版本和权限；导出说明原型边界 |
| 8. API/E2E 测试加固 | `tests`、Playwright/Vitest 配置 | 上述闭环 | AI 使用 mock 或稳定 fixture；覆盖鉴权、非法路径、失败恢复和导出前校验 |

该顺序不改变 MVP 范围；它只是把 ADR-0003 后续动作拆成可验证的工程步骤。

注：第 3、4 项已由 ADR-0006 / Issue #15 完成。当前剩余 MVP 路线从 Sandpack 受控预览开始，随后是版本 UI、导出 zip 和 API/E2E 加固。

### ADR-0005: 落地版本、生成、对话和导出记录持久化服务边界

#### 状态

Accepted

#### 背景

ADR-0003 已建立生成输出校验、版本快照和导出 manifest 基础层，ADR-0004 已补齐本地 Supabase migration/RLS 文件。后续真实 OpenAI provider、工作台生成入口、版本历史 UI 和导出下载都需要先有稳定的数据库写入边界，确保生成成功、生成失败、对话摘要、版本快照和导出行为能被服务端记录。

#### 决策

新增服务端 repository 边界：

- `src/server/generation/generationRepository.ts`：记录 generation request/result，成功标记 succeeded，失败标记 failed 并写入脱敏错误。
- `src/server/versions/versionRepository.ts`：保存项目版本快照，并在 owner 条件下更新 `projects.current_version_id`。
- `src/server/conversations/conversationRepository.ts`：记录用户 prompt 和 assistant summary，可关联成功版本。
- `src/server/export/exportRepository.ts`：记录导出请求结果。

`generationService` 在 provider 和 Zod/path 校验成功后才持久化版本并更新当前版本；失败只记录 failed result，不覆盖当前版本。数据库未配置时 repository 保持 no-op，以便本地无 Supabase 环境时继续运行脚本检查。

#### 备选方案

- 继续只返回内存数据边界：无法支撑后续版本历史、生成记录和导出记录。
- 在 route handler 内直接写表：会让 API 层承担业务编排和持久化细节，降低可测试性。
- 等真实 OpenAI 接入后再写持久化：会把 provider、校验、持久化和 UI 入口混在同一个高风险 Issue。

#### 影响范围

- `src/server/generation`
- `src/server/versions`
- `src/server/conversations`
- `src/server/export`
- `tests/phase4-persistence-records.test.mjs`
- `docs/PROJECT_STATUS.md`

#### 风险

- 真实 Supabase migration/RLS 已在 Issue #13 中验证；端到端业务写入仍需等生成 route / Server Action 接入后继续复验。
- 失败记录只保存脱敏错误摘要，后续真实 provider 接入时仍需继续避免泄露原始 provider 错误、密钥或敏感 prompt。
- 数据库 no-op 便于本地开发，但真实环境必须配置 `SUPABASE_DATABASE_URL` 才能获得持久化效果。

#### 是否影响 MVP 范围

否。该决策落实既定 MVP 的版本、生成记录、对话记录和导出记录持久化边界，不新增 P1/P2 能力。

#### 后续动作

- 接入真实 OpenAI Responses API provider。
- 暴露服务端生成入口，并将工作台提交流接入持久化生成服务。
- 按 Issue #14 优化 RLS policy 的 `auth.uid()` 调用并复跑 Supabase performance advisor。
## ADR-0006: P0 project generation entry with OpenAI Responses API

### Status

Accepted

### Context

Issue #15 implements the first real P0 generation loop after the Phase 4
persistence boundary. A logged-in user can submit a natural-language prompt from
the project list, the server can call the OpenAI Responses API through a
server-only provider, and validated output can be persisted as a project,
pages, an initial version snapshot, generation records, conversation messages,
and quota usage.

### Decision

- Add `src/server/ai/openaiProvider.ts` as the OpenAI Responses API adapter.
- Keep `OPENAI_API_KEY` and `OPENAI_MODEL` server-only. The default model is
  `gpt-5.5`, overridable by `OPENAI_MODEL`.
- Request JSON Schema structured output from Responses API, then run the result
  through existing Zod schemas and file path allowlist validation before any
  project write.
- Add `src/server/generation/projectGenerationService.ts` to orchestrate new
  project generation and persistence.
- Add a server action in `src/server/generation/actions.ts`; frontend components
  submit form data only and never import the OpenAI SDK.
- Load `/workspace?projectId=<id>` from the persisted current version snapshot
  instead of presenting fixture data as a real generated result.

### Consequences

- The first P0 generation entry is now connected to the existing auth, project,
  version, conversation, generation-result, and quota boundaries.
- Sandpack runtime, zip export, version history UI, rollback UI, and full
  iterative modification remain separate MVP stages.
- Provider failures are surfaced to the project list as a generic user-facing
  error. Raw provider errors and keys are not exposed to browser code.

### Risks

- Real provider execution still requires a valid local `OPENAI_API_KEY`; tests
  must use mock provider/client paths and must not depend on network calls.
- Database persistence requires configured Supabase/Postgres environment
  variables. Without them, authenticated UI and end-to-end writes cannot be
  fully exercised locally.

### MVP Scope Impact

No P1/P2 scope is added. This ADR implements the existing P0 generation entry
and keeps preview runtime, export packaging, and version UI for later stages.

## ADR-0007: Pre-Sandpack Safety Boundary Hardening

### Status

Accepted

### Context

Issue #18 addresses safety gaps found before connecting persisted generated
files to a live Sandpack runtime. The P0 generation entry can now persist
version snapshots, so the workspace preview path must treat database snapshots
as untrusted runtime data instead of relying on TypeScript casts.

### Decision

- Add `ensureUserProfile` in `src/server/auth/userProfile.ts` and call it from
  protected session resolution and the Supabase auth callback. First-time auth
  users now get an idempotent `user_profiles` upsert before project writes.
- Add shared auth `returnTo` sanitization so login callbacks and magic-link
  redirects only accept same-origin paths.
- Tighten generated file validation in `src/schemas/generation.ts`. Generated
  files are limited to prototype front-end files and explicitly reject server
  routes, actions, middleware, package manifests, scripts, dependency folders,
  environment files, and other sensitive paths.
- Add `validateVersionSnapshot` and use it in the project repository before a
  persisted current version snapshot reaches the workspace UI.
- Keep Sandpack runtime, export zip packaging, version history UI, and rollback
  UI as later MVP stages.

### Consequences

- The next Sandpack issue can start from a stricter, tested snapshot boundary.
- Invalid persisted snapshots now fail during workspace load instead of being
  passed through as trusted `VersionSnapshot` data.
- User profile creation is no longer an implicit prerequisite that can break
  first project generation for a newly authenticated user.

### Risks

- The file allowlist is intentionally conservative. Some legitimate prototype
  assets may need explicit support in a future issue before Sandpack or export
  can use them.
- Real Supabase Auth and OpenAI provider calls still require valid local
  environment variables for end-to-end manual verification.

### MVP Scope Impact

No P1/P2 scope is added. This ADR only hardens the existing P0 generation,
auth, persistence, and preview-read boundaries before the Sandpack stage.
