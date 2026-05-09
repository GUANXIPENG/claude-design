# 项目状态文档

最后更新：2026-05-09

## 1. 当前项目阶段

当前项目处于：**Phase 4 生成、版本与导出基础层已完成，Supabase migration/RLS 本地文件已补齐，等待真实 Supabase 执行验证、真实 OpenAI、Sandpack runtime 和导出打包落地**。

理由：

- 仓库中已经完成关键产品与架构文档：`docs/requirements.md`、`docs/PRD.md`、`docs/architecture.md`。
- Phase 1 已新增 `package.json`、`package-lock.json`、`README.md`、`.env.example`、Next.js App Router 页面入口、Tailwind 配置、TypeScript 配置和基础测试脚本。
- 已建立 `src/app`、`src/components`、`src/features`、`src/lib`、`src/server`、`src/schemas`、`src/prompts`、`src/types` 目录边界。
- 已完成 `npm install`、`npm run test`、`npm run typecheck`、`npm run lint`、`npm run build` 和 production server HTTP 验收。
- 当前已实现 fixture/mock 驱动的前端工作台闭环，并新增 Supabase Auth 服务端边界、Drizzle 最小 schema、受保护项目/工作台路由、项目归属服务边界和基础额度记录 schema。
- 当前已新增 Phase 4 的生成输出 schema、路径安全校验、mock AI provider、生成/迭代编排、版本快照/回退数据边界、导出 manifest 边界和工作台 Phase 4 状态入口。
- 当前已新增 Supabase 初始 schema migration SQL 和项目归属 RLS policy SQL。
- 当前仍未实现真实 OpenAI 网络调用、真实 Sandpack runtime、导出 zip 下载、版本记录数据库写入、真实数据库 migration/RLS 远程执行验证和生产部署配置。

因此，当前重点应从 Phase 4 基础边界转向真实 Supabase migration/RLS 执行验证、版本/导出持久化、真实 OpenAI provider、Sandpack 受控预览和最终导出打包。

## 2. 当前已经完成的内容

| 模块 | 当前状态 | 相关文件 | 备注 |
|---|---|---|---|
| 项目初始化 | Git 仓库已存在，当前开发分支为 `feat-issue-6-supabase-migration-rls`，远程 `origin` 已配置 | `.git/` | Issue #6 用于补 Supabase migration/RLS；历史 Issue #2/#3/#4/#5 已完成 |
| 需求文档 | 已完成第一版产品需求梳理 | `docs/requirements.md` | 覆盖产品定位、MVP/P1/P2、功能需求、非功能需求、导出、多页面、对话修改、局部修改、版本、账号、额度、风险 |
| PRD | 已完成结构化 PRD | `docs/PRD.md` | 覆盖用户角色、用户流程、页面清单、功能列表、Given/When/Then 验收标准、状态设计、视觉风格、信息架构、MVP 边界 |
| 架构草案 | 已完成技术栈锁定与架构基线 | `docs/architecture.md` | 锁定 Next.js、TypeScript、Tailwind、Supabase、Drizzle、OpenAI Responses API、Zod、Sandpack、Vercel、Vitest、Playwright 等方向 |
| 前端页面框架 | Phase 2 首页、项目列表和工作台入口已实现；Phase 3 登录页和受保护项目/工作台路由已接入服务端 Auth 边界 | `src/app/page.tsx`、`src/app/login/page.tsx`、`src/app/projects/page.tsx`、`src/app/workspace/page.tsx`、`src/app/layout.tsx`、`src/app/globals.css` | 项目列表读取服务端持久化边界；工作台预览仍使用 fixture/mock；不包含真实 AI、Sandpack、导出或回退 |
| 对话输入区 | Phase 2 mock 输入区已实现 | `src/features/workspace/components/WorkspacePage.tsx` | 支持草稿、空输入提示、生成中和成功占位状态；不触发真实 AI |
| 生成结果展示区 | Phase 2 fixture 预览和代码视图已实现 | `src/features/workspace/components/WorkspacePage.tsx`、`src/lib/fixtures/workspace.ts` | 展示 fixture 页面内容和文件内容；不是真实生成结果 |
| live preview / code view | 代码视图和静态预览已实现；真实 Sandpack 未接入 | `src/features/workspace/components/WorkspacePage.tsx`、`src/lib/fixtures/workspace.ts` | Sandpack 仍只在架构文档中作为后续技术基线 |
| 项目历史 / 本地存储 | 部分建立数据结构 | `src/server/db/schema.ts` | 已有 `project_versions` 最小 schema；版本历史 UI、回退和真实快照写入仍未实现 |
| API route / Server Actions | Phase 3 认证入口已实现 | `src/app/auth/callback/route.ts`、`src/server/auth/actions.ts` | 仅包含 Supabase Auth callback、登录和退出；生成、保存、导出 API 尚未实现 |
| OpenAI 调用预留 | Phase 4 已建立服务端 provider adapter 和 mock provider；真实 OpenAI Responses API 尚未接入 | `src/server/ai/provider.ts`、`src/prompts/generation.ts`、`docs/architecture.md` | OpenAI key 仍保持 server-only；当前不发真实网络请求 |
| 导出功能 | Phase 4 已建立服务端导出 manifest 边界；真实 zip/静态包下载尚未实现 | `src/server/export/exportService.ts` | 导出前会复用路径 allowlist 并记录 export 使用次数；当前不生成下载文件 |
| 测试文件 | Phase 1/2/3/4 脚本级检查已实现 | `tests/phase1-scaffold.test.mjs`、`tests/phase2-workspace.test.mjs`、`tests/phase3-persistence-auth.test.mjs`、`tests/phase4-generation-preview-export.test.mjs` | 覆盖 scaffold、workspace、auth/db 基础层、Phase 4 schema/path/provider/version/export 边界；Vitest、API、E2E 测试仍未建立 |
| README / 文档 | 架构和项目状态文档已同步 Phase 4 基础层 | `README.md`、`docs/architecture.md`、`docs/PROJECT_STATUS.md` | requirements 和 PRD 范围未变化；README 尚可在后续真实运行能力接入后继续更新 |
| 环境变量配置 | 示例已补充 Supabase Auth、Supabase database、OpenAI 占位 | `.env.example` | 不包含真实密钥；真实 `.env` 仍应本地私有 |
| Git / GitHub / Issue 管理 | 远程已配置；Issue #2 已关闭；本地已有 Phase 2 单文件 commits | `.git/` | `origin` 指向 `https://github.com/GUANXIPENG/claude-design.git`；当前分支尚未 push |

### 2.1 2026-05-08 Phase 2 已完成内容

本次已完成 Issue #2 的 Phase 2 前端闭环：

- 首页已从 Phase 1 scaffold 占位更新为 Phase 2 入口页，提供进入项目列表和工作台的导航。
- 新增登录占位页，用于明确 Phase 3 才会接入 Supabase Auth；当前不包含真实会话、私有项目访问或额度持久化。
- 新增项目列表页，使用 fixture 项目展示项目名称、描述、更新时间、页面数、版本数和打开工作台入口。
- 新增工作台页，包含顶部操作栏、左侧页面列表、中间预览、代码视图和右侧对话输入面板。
- 新增 `src/lib/fixtures/workspace.ts`，用静态 fixture 数据表达多页面项目、页面路由、预览内容和代码视图内容。
- 工作台支持基于 fixture 的页面切换；切换页面会更新预览和代码视图，但不会清空右侧输入草稿。
- 工作台支持空输入提示、生成中状态和成功占位状态；所有状态均明确标注为 mock/fixture，不会触发真实 AI 请求。
- `npm run test` 已扩展为同时运行 Phase 1 scaffold 检查和 Phase 2 workspace 检查。

本次未实现：

- 未接入真实 OpenAI、Supabase Auth、Supabase PostgreSQL、Drizzle、Sandpack、导出、版本回退或额度扣减。
- 未实现真实项目持久化；fixture 只用于前端闭环验证，不作为项目主数据源。
- 未实现真实登录保护；登录页仅作为 Phase 3 的可见占位。

## 3. 当前未完成的内容

| 未完成项 | 缺什么 | 为什么重要 | 是否阻塞 MVP | 建议何时做 |
|---|---|---|---|---|
| MVP Scaffold | 已完成 Phase 1 最小 scaffold；后续需补真实业务页面 | 当前只具备最小首页和目录边界，尚无产品闭环 | 否，Phase 1 已解除；Phase 2 继续扩展 | Phase 2 |
| 包管理器与依赖 | 已安装 Node/npm 并生成 `package-lock.json` | Codex 环境下 `npm run dev` 仍因 `spawn EPERM` 受限 | 否，构建与 production server 验收已通过 | Phase 2 前在普通终端复验 |
| README | 已补充启动、开发、环境变量、脚本说明 | 后续阶段需持续同步新增功能 | 否 | 持续更新 |
| `.env.example` | 已补充 Supabase、OpenAI、站点 URL 等变量示例 | 后续接入服务时需确认变量是否完整 | 否 | Phase 3 / Phase 4 |
| 首页 / 登录 / 项目列表 / 工作台页面 | Phase 2 fixture/mock 页面和布局已实现；真实 Auth/DB 仍未接入 | PRD 核心用户路径已有前端壳，可继续接持久化 | 否，前端壳已解除；真实私有项目仍阻塞 MVP | Phase 3 |
| 对话输入区 | Phase 2 mock 输入区已实现；真实 AI 修改模式未接入 | 生成和迭代入口已有 UI，后续需接服务端生成 | 否，UI 已解除；真实生成仍阻塞 MVP | Phase 4 |
| 生成结果展示区 | Phase 2 fixture 页面清单、预览和代码视图已实现；真实 AI 文件树未接入 | 可展示 mock 生成结果，后续需接 schema 校验后的 AI 输出 | 否，前端壳已解除；真实生成仍阻塞 MVP | Phase 4 |
| Sandpack 预览 | Phase 2 静态预览和代码视图已实现；真实 Sandpack 沙盒未接入 | MVP 最终需要受控运行生成文件 | 是 | Phase 4 |
| 真实 AI 生成逻辑 | Phase 4 已实现 prompt、Zod generation schema、mock provider 和服务端编排；真实 OpenAI Responses API 网络调用未实现 | 产品核心能力依赖真实模型调用 | 是 | Phase 4 后续 |
| Supabase Auth | 服务端会话边界、登录/退出 action、受保护路由已建立；真实 Supabase 项目配置后可验证完整登录闭环 | 项目归属和私有项目依赖账号 | 否，基础层已解除；真实环境配置和 RLS 仍是上线前阻塞 | Phase 3 已完成基础层，后续补配置验证 |
| 数据库 schema | UserProfile、Project、Page、ProjectVersion、ConversationMessage、GenerationRequest、GenerationResult、ExportRecord、Quota 最小 schema 已建立 | 项目持久化、版本和额度记录可继续落地 | 否，schema 基础层已解除；migration/RLS 仍阻塞生产落地 | Phase 3 已完成基础层，后续补 migration/RLS |
| Drizzle ORM | 已安装 Drizzle 依赖、配置 `drizzle.config.ts`，并新增 server db client | 架构基线要求类型化数据访问 | 否，基础层已解除；真实迁移执行仍未完成 | Phase 3 已完成基础层，后续补 migration |
| 多页面项目生成 | Phase 4 mock provider 可返回多页面项目结构；真实 OpenAI 生成和数据库保存未实现 | MVP 不应只生成单页面 | 是 | Phase 4 后续 |
| 项目级版本快照 | Phase 4 已实现快照和 rollback 数据边界；历史列表 UI、数据库写入和真实回退闭环未实现 | 用户无法在真实项目中撤回不满意结果 | 是 | Phase 4 后续 |
| 点击选择后局部修改 | 工作台已展示 Selection context 基础状态；真实预览点击识别、选区高亮和局部修改闭环未实现 | PRD 核心差异化能力之一 | 是 | Phase 4 后续 |
| 导出功能 | Phase 4 已建立导出 manifest 服务边界；静态文件 zip、可编辑项目结构下载和导出记录持久化仍未实现 | 用户还无法真正下载生成结果 | 是 | Phase 4 后续 |
| 额度限制 | 已建立 quota schema 和 `recordQuotaUsage` 基础记录服务；额度提示、限制和扣减策略未实现 | 成本控制和未来商业化需要基础记录 | 否，基础记录边界已建立；真实限制逻辑仍需后续补齐 | Phase 3 已完成基础记录，Phase 4/5 补限制与 UI |
| 部署配置 | Vercel 配置、环境变量、构建脚本缺失 | 无法部署预览或生产环境 | 是，部署前阻塞 | Phase 5 |
| 测试覆盖 | Phase 1/2/3/4 脚本检查已建立；Supabase migration/RLS 文件检查已补；Vitest、schema fixtures、API 测试、Playwright 未建立 | 目前能验证 scaffold、前端壳、Auth/DB 基础层、Phase 4 服务边界和 RLS SQL 存在性；仍无法验证真实远程 RLS 行为、API 和 E2E | 是，至少最小业务/安全测试阻塞可发布 MVP | Phase 5 |

## 4. 已知问题和阻塞点

### 4.1 阻塞性问题

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| Codex 环境中 `npm run dev` 返回 `spawn EPERM` | 无法在当前沙箱内验证 Next dev server | Next dev 内部使用 `child_process.fork`，当前环境限制 spawn | 在普通本机终端复验 `npm run dev`；当前以 build + `next start` HTTP 验收替代 | P1 |
| 真实业务页面持久化闭环未完成 | 项目列表已接服务端持久化读取边界，但还没有真实项目创建 UI、migration/RLS 和远程数据库验证 | Phase 3 只完成基础层，尚未完成端到端项目创建 | 下一步补 Supabase migration/RLS 和最小项目创建流程 | P0 |
| 真实 AI/Sandpack/导出未完整接入 | MVP 核心生成、预览运行和交付能力仍不可完整使用 | Phase 4 已完成基础边界；真实 OpenAI、Sandpack runtime、zip 导出和持久化闭环尚未接入 | 按后续 Issue 接入真实 provider、受控预览、版本/导出持久化和下载能力 | P0 |

### 4.2 高优先级问题

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| AI 生成逻辑未完整接入 | 产品核心能力仍不可真实调用 | Phase 4 已有 mock provider、schema 和服务编排；真实 OpenAI provider 尚未接入 | 用真实 OpenAI Responses API provider 替换 mock provider，并保留 schema/path 校验 | P1 |
| Supabase Auth 真实环境未验证 | 服务端边界已建立，但没有真实 Supabase 项目配置时无法完成登录闭环 | 缺少真实环境变量和 Supabase 项目 | 配置 Supabase Auth 后复验 magic link 登录、退出和受保护路由 | P1 |
| 数据库 migration / RLS 未远程验证 | 本地 migration SQL 和 RLS policy SQL 已建立，但尚未在真实 Supabase 项目执行和验证 | 当前环境没有真实 Supabase 项目连接 | 在 Supabase 执行 migration/RLS，并验证跨用户隔离 | P1 |
| Sandpack 预览未接入 | 当前只能静态预览 fixture，无法运行生成项目文件 | Phase 2 只实现前端壳和代码视图 | Phase 4 接 Sandpack 和 AI 结果 | P1 |
| 版本快照和回退未完整实现 | 修改风险高，用户还无法在真实项目中撤销 | Phase 4 已有项目级快照和 rollback 数据边界；数据库写入和 UI 历史弹窗尚未接入 | 将版本服务接入 Supabase，并补历史版本 UI 和回退确认 | P1 |
| 导出功能未完整实现 | 用户无法保存或交付生成结果 | Phase 4 已有服务端导出 manifest；zip/下载和导出记录持久化尚未接入 | 基于当前 manifest 实现静态包/可编辑项目结构下载 | P1 |
| OpenAI key server-only 边界部分落地 | 存在未来真实 provider 接入时泄露风险 | Phase 4 provider adapter 在服务端；真实 OpenAI SDK/环境变量读取尚未实现 | 真实 provider 只能在服务端读取 `OPENAI_API_KEY`，前端不得导入 SDK | P1 |
| 本地存储策略需要继续守住 | Phase 3 代码没有把项目主数据写入 localStorage；后续开发仍需防止回退 | 项目主数据已转向服务端/数据库边界 | 保持 localStorage 只用于草稿和 UI 状态 | P1 |
| Git 远程是否与本地同步待确认 | 可能本地还未推送任何内容 | `main` 无 commit，未执行 fetch/pull 对比 | 文档提交后再确认远程默认分支和同步策略 | P1 |

### 4.3 中低优先级技术债

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| 产品名称仍为暂定 | 文案、域名、品牌、导出说明 | PRD 标记待确认 | MVP scaffold 可先使用 `AI Design Workspace`，上线前确认 | P2 |
| 额度扣减策略未定 | 成本提示、导出、订阅 | PRD 和架构均保留待确认 | MVP 先按操作次数记录，后续补 token 成本 | P2 |
| 响应式预览是否进入 MVP 待确认 | 工作台控件和验收范围 | PRD 建议 P1 三视口，MVP 可先基础预览 | Phase 2 先保留视口入口或只做桌面预览 | P2 |
| 导出是否消耗额度待确认 | 成本控制和用户预期 | PRD 中明确待确认 | MVP 先记录导出行为，不做真实扣减 | P2 |
| TODO / placeholder / mock 数据仍保留在工作台预览 | 项目列表已转向服务端持久化读取，但工作台预览仍使用 `primaryFixtureProject` | Phase 4 前仍需要 fixture 表达预览壳 | Phase 4 接 AI/Sandpack 前继续保持 fixture 与 production 数据边界清晰 | P3 |
| 项目边界文档未单独存在 | 新开发者需要从多份文档拼上下文 | 需求、PRD、架构已分散覆盖边界 | 如后续需要，可新增独立边界文档或在 README 汇总 | P3 |

## 5. 下一步开发计划

### Phase 1：恢复可运行环境

目标：

- 从“只有文档的仓库”进入“可运行的最小应用”。
- 建立项目脚本、README、环境变量示例和基础目录。

验收标准：

- 存在 `package.json`，包含 dev、build、typecheck、lint、test 至少一种可执行基础脚本。
- 存在 Next.js + TypeScript + Tailwind 的最小页面。
- 存在 `README.md`，说明启动方式、环境变量和当前阶段。
- 存在 `.env.example`，不包含真实密钥。
- 本地能启动 dev server 并看到首页占位。
- `git status` 中能清晰区分文档、源码和配置变更。

涉及文件：

- `package.json`
- `README.md`
- `.env.example`
- `src/app`
- `src/components`
- `src/features`
- `src/lib`
- `src/server`
- `src/schemas`
- `src/prompts`
- `src/types`

注意事项：

- 先不要接真实 AI、Supabase 或导出。
- 先建立目录和边界，避免把业务逻辑直接写进页面。
- 不要把真实 API key 写入仓库。

### Phase 2：补齐核心 MVP 前端闭环

目标：

- 实现用户可见的主流程壳：首页、登录占位、项目列表、工作台三栏、输入区、预览区、代码视图区。
- 使用静态 fixture 或内存 mock 展示工作台，不接真实后端。

验收标准：

- 首页可以进入项目列表或工作台占位。
- 工作台包含左侧页面列表、中间预览、右侧对话面板、顶部操作栏。
- 用户可以输入需求并看到生成中 / 空状态 / 成功占位状态。
- 页面列表和预览可以基于 fixture 切换。
- 代码视图能展示 fixture 文件内容。
- UI 状态不会因为切换页面而丢失输入草稿。

涉及文件：

- `src/app`
- `src/features/workspace`
- `src/features/projects`
- `src/components`
- `src/lib/fixtures`

注意事项：

- mock/fixture 必须明确标注，不能伪装成真实 AI。
- 前端状态只处理 UI，不把项目主数据长期保存在 localStorage。
- 先做可验证交互，不急着做复杂视觉动画。

### Phase 3：接入持久化与认证

目标：

- 接入轻量账号、项目归属、数据库持久化和基础额度记录。
- 建立服务端边界。

验收标准：

- 用户可以登录 / 退出。
- 未登录用户无法访问项目列表和工作台私有内容。
- 项目可以保存到数据库并重新打开。
- 建立 Project、Page、ProjectVersion、ConversationMessage、GenerationRequest、GenerationResult、ExportRecord、Quota 的最小 schema。
- 服务端读取当前用户，不信任前端传入 userId。
- localStorage 只保留草稿或 UI 偏好。

涉及文件：

- `src/server/auth`
- `src/server/db`
- `src/server/projects`
- `src/schemas`
- Drizzle schema / migration 文件
- Supabase 配置说明

注意事项：

- 优先保证用户数据隔离。
- 不要一开始实现团队、分享、复杂角色权限。
- 额度先按操作次数记录，不接真实支付。

### Phase 4：增强生成、编辑、回退能力

目标：

- 接入服务端 AI 生成、结构化输出校验、Sandpack 预览、局部选择、版本快照、回退和导出。

验收标准：

- AI 请求只从服务端发起，OpenAI key 不进入浏览器。
- `generate` 能创建多页面项目文件结构。
- `iterate` 能基于当前项目和用户输入生成新版本。
- AI 输出经过 schema 和路径 allowlist 校验。
- Sandpack 能预览受控文件，并显示运行错误。
- 每次生成 / 修改都形成项目级版本快照。
- 用户可以预览历史版本并回退。
- 导出当前版本时绑定项目、版本和权限。

涉及文件：

- `src/server/generation`
- `src/server/ai`
- `src/server/versions`
- `src/server/export`
- `src/prompts`
- `src/schemas`
- `src/features/workspace`
- `src/features/preview`

注意事项：

- AI 输出不合法时优先 repair 或失败回滚，不能覆盖当前可用版本。
- 禁止生成 `.env`、服务端密钥、shell 脚本和不受控依赖安装指令。
- MVP 只支持点击元素 / 区块选择，不做任意框选。

### Phase 4 后续细分路线

Phase 4 foundation 已完成，但它只建立了服务端安全边界，不等于完整产品闭环。后续必须按以下顺序拆分 Issue，避免在真实模型、预览、数据库和导出之间互相污染边界。

| 顺序 | 建议 Issue 标题 | 目标 | 非目标 | 验收标准 | 必跑检查 |
|---|---|---|---|---|---|
| 1 | `feat: add supabase migration and rls policies` | 生成并验证数据库 migration 与 RLS policy，覆盖 projects、pages、versions、messages、generation、export、quota 表 | 不接真实 OpenAI；不改工作台 UI；不做团队权限 | migration 文件存在；RLS policy 明确按 `owner_id` / 用户归属隔离；文档说明本地和远程执行步骤 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint` |
| 2 | `feat: persist project versions and generation records` | 将 Phase 4 的版本快照、generation request/result、conversation message 写入 Supabase/Drizzle 服务层 | 不接 Sandpack；不做 zip 导出；不做复杂版本 diff | generate/iterate 成功后能形成数据库版本记录；失败不覆盖当前版本；服务端不信任前端 userId | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、必要 schema/service 测试 |
| 3 | `feat: connect openai responses provider` | 用真实 OpenAI Responses API provider 替换 mock provider，并保留 `AiProvider` 接口、Zod 校验和路径 allowlist | 不把 OpenAI SDK 放进前端；不放宽文件 allowlist；不实现 streaming UI | 服务端读取 `OPENAI_API_KEY`；provider 原始错误脱敏；AI 输出必须通过 schema 才能返回 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` |
| 4 | `feat: expose generation route and workspace submit flow` | 新增服务端生成入口，把工作台提交从 fixture 状态接到服务端 generate/iterate flow | 不接 Sandpack runtime；不做真实下载；不做任意框选 | 空输入不能触发请求；未登录不能生成；生成中/失败/成功状态清晰；失败保留旧版本 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` |
| 5 | `feat: add sandpack preview runtime` | 将通过 schema 校验的受控文件树载入 Sandpack 预览，并显示运行错误 | 不允许任意依赖安装；不允许真实后端执行；不开放不受控网络访问 | Sandpack 只运行 allowlist 文件；运行错误可见；代码视图与当前版本一致 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`，必要时 Playwright 截图检查 |
| 6 | `feat: implement version history and rollback ui` | 增加版本历史入口、历史版本预览、二次确认和 rollback 创建新当前版本 | 不做版本分支；不做视觉 diff；不做局部页面回退 | 用户能看到版本摘要；回退前确认；回退后生成新版本记录；失败不破坏当前版本 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` |
| 7 | `feat: implement export zip download` | 基于 export manifest 生成静态文件包和可继续编辑项目结构下载 | 不生成真实后端业务代码；不导出密钥/敏感配置；不做后台队列 | 导出绑定项目、版本和权限；路径重新校验；导出说明标明原型边界 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` |
| 8 | `test: add phase 4 api and e2e coverage` | 用 Vitest/Playwright 补生成、修改、回退、导出关键路径覆盖 | 不新增产品功能 | 覆盖鉴权、空输入、非法 AI 路径、版本回退、导出前校验 | `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`、Playwright |

执行规则：

- 每个 Issue 必须创建独立分支。
- 每个 Issue 开发前必须确认对应 PRD 验收标准。
- 每个 Issue 完成后必须更新 `docs/PROJECT_STATUS.md`；如果改变架构或边界，必须更新 `docs/architecture.md` 并补 ADR。
- 每个 Issue 至少运行 `npm.cmd run test`、`npm.cmd run typecheck`、`npm.cmd run lint`；涉及构建或 UI 的 Issue 还必须运行 `npm.cmd run build`。
- 涉及真实 OpenAI、Sandpack、权限、RLS、版本、导出的 Issue 完成后必须启动子 agent 做独立验收；若平台限制不能启动，主 agent 必须按同格式手动验收。

### Phase 5：部署与测试加固

目标：

- 建立可重复验证的测试和部署流程。

验收标准：

- Vitest 覆盖 schema 校验、路径清洗、额度规则、导出文件列表。
- API route 测试覆盖鉴权、生成入口、保存、回退、导出前校验。
- Playwright 覆盖登录、新建项目、生成、修改、回退、导出的关键路径。
- Vercel 部署配置和环境变量文档完成。
- README 更新为可跟随执行的开发、测试、部署指南。
- 构建、类型检查和测试在本地或 CI 中可运行。

涉及文件：

- `src/tests`
- `playwright.config`
- `vitest.config`
- Vercel 配置
- README
- GitHub Actions 或其他 CI 配置

注意事项：

- 不要等功能全部完成后才补测试。
- E2E 中应 mock AI 或使用稳定 fixture，避免成本和不稳定性。
- 部署前检查 API key、Supabase key、日志脱敏和 RLS。

## 6. 当前项目边界

### MVP 必须做

- 用户输入自然语言需求。
- 服务端调用 AI。
- 生成多文件项目结构。
- 生成多页面页面地图。
- 展示预览。
- 展示代码。
- 支持继续对话修改。
- 支持点击元素 / 区块后局部修改。
- 支持项目历史。
- 支持项目级版本快照和回退。
- 支持导出静态文件。
- 支持导出可继续编辑的项目结构。
- 支持轻量账号。
- 支持项目归属和基础私有保护。
- 支持基础额度 / 使用次数记录。
- 支持生成失败、修改失败、导出失败的恢复提示。

### MVP 可以暂缓

- 真实付费订阅。
- 团队协作。
- 复杂权限系统。
- 公开分享。
- 公开模板市场。
- 完整风控系统。
- 复杂用量计费。
- 企业级日志审计。
- 图片上传理解。
- 文件上传解析。
- 参考 URL 抓取。
- 响应式三视口完整预览。
- 项目复制。
- 搜索 / 排序。
- 版本视觉 diff。

### 明确不做

- Figma 导入。
- 复杂设计系统导入。
- 参考站点自动抓取和复制。
- 任意依赖安装。
- 真实后端业务生成。
- 真实支付功能生成。
- 生产级代码质量承诺。
- 团队实时协作。
- 模板市场。
- 插件市场。
- 企业组织管理。
- 任意框选区域修改。
- 版本分支和跨版本合并。
- 从截图自动还原完整页面。

## 7. 风险清单

| 风险 | 影响 | 概率 | 严重程度 | 缓解方案 |
|---|---|---|---|---|
| 技术风险：项目尚无 scaffold | 无法运行、构建、测试或部署 | 高 | 高 | Phase 1 优先建立最小可运行应用 |
| 技术风险：AI 输出不稳定 | 生成结果可能无法预览或破坏项目结构 | 高 | 高 | 使用 Structured Outputs、Zod 校验、repair 模式、版本回退 |
| 技术风险：Sandpack 边界误用 | 可能把预览沙盒当成完整安全隔离 | 中 | 高 | 明确只运行受控前端文件，服务端负责校验和导出 |
| 产品风险：MVP 范围过大 | 开发迟迟无法闭环 | 高 | 高 | 先完成文本输入、生成、预览、修改、版本、导出主链路；暂缓 P1/P2 |
| 产品风险：局部修改误伤 | 用户只想改局部，系统改动全局 | 中 | 高 | 选区上下文 + 修改范围提示 + 版本快照回退 |
| 成本风险：AI 调用成本不可控 | 免费用户或错误循环导致成本上升 | 中 | 高 | 登录后生成、额度记录、repair 次数限制、大范围修改确认 |
| 成本风险：大项目版本快照膨胀 | 数据库存储和导出成本上升 | 中 | 中 | MVP 限制文件数量和版本数量，后续评估增量快照 |
| 安全风险：OpenAI key 泄露 | 直接造成密钥滥用和费用风险 | 中 | 高 | 只在服务端读取 key，前端不得导入 AI SDK |
| 安全风险：XSS 或危险代码 | 用户生成代码可能影响宿主页面或导出内容 | 中 | 高 | 预览隔离、输出清洗、文件 allowlist、禁止危险脚本 |
| 安全风险：用户数据隔离不严 | 私有项目泄露 | 中 | 高 | Supabase RLS、服务端权限校验、不信任前端 userId |
| 数据风险：使用 localStorage 保存主数据 | 刷新、换设备或清缓存导致项目丢失 | 中 | 高 | localStorage 只做草稿和 UI 状态；项目主数据进数据库 |
| 数据风险：无版本回退 | AI 修改失败会破坏已有结果 | 中 | 高 | 每次生成 / 修改前后创建项目级快照 |
| 可维护性风险：业务逻辑堆在页面中 | 后续难测试、难扩展 | 中 | 中 | 按 `features`、`server`、`schemas`、`prompts` 分层 |
| 可维护性风险：Prompt 散落在 UI 中 | AI 行为不可审计、难迭代 | 中 | 中 | Prompt 统一放入 `src/prompts` |
| 部署风险：Vercel serverless 长任务超时 | 大项目生成或导出失败 | 中 | 中 | MVP 限制项目规模；后续预留队列或 worker |
| 部署风险：环境变量缺失 | 线上无法调用 AI/Auth/DB | 高 | 高 | Phase 1 建立 `.env.example`，部署前检查必需变量 |

## 8. 当前代码质量评价

当前已有 Phase 1 scaffold、Phase 2 fixture/mock 前端代码、Phase 3 认证/持久化基础层，以及 Phase 4 生成输出校验、mock provider、版本快照、导出 manifest 服务边界和本地 Supabase migration/RLS 文件。以下评价聚焦当前工程状态：前端壳已可运行，服务端 Auth/DB/schema/AI 输出校验边界已建立，本地 migration/RLS SQL 已补齐；真实 OpenAI、Sandpack runtime、导出 zip、版本回退 UI、真实 Supabase 执行/跨用户 RLS 验证和生产部署配置仍未实现。

| 评价维度 | 当前评价 | 真实问题 |
|---|---|---|
| 目录结构是否清晰 | 已建立 `src/app`、`src/features`、`src/lib/fixtures`、`src/server/auth`、`src/server/db`、`src/server/projects`、`src/server/quota`、`src/server/ai`、`src/server/generation`、`src/server/export`、`src/server/versions` 和 `src/prompts` 等结构 | 后续需要把 mock provider、版本和导出边界接入真实 OpenAI、数据库持久化和 Sandpack |
| 前后端边界是否清晰 | Phase 3 已把 Auth、DB、project ownership 和 quota 基础记录放在 server 侧；Phase 4 已把 AI provider、输出校验、版本和导出 manifest 放在 server 侧 | 后续接真实 OpenAI/Sandpack/导出下载时仍需继续验证 server-only 边界 |
| 服务端逻辑是否安全 | Auth 和项目归属基础边界已建立；Phase 4 已增加 AI 输出 schema、路径 allowlist、版本快照和导出 manifest 校验 | 仍需真实 Supabase RLS、migration、日志脱敏、真实 OpenAI 错误脱敏和导出权限持久化校验 |
| 组件是否过大 | 当前组件规模可接受 | `WorkspacePage` 后续接真实 Sandpack、版本、导出时需要继续拆分 |
| 状态管理是否合理 | 当前只用 React 本地状态处理页面选择、草稿和 mock 生成状态 | 真实项目数据仍需服务端/数据库作为主数据源 |
| 类型定义是否完整 | 已有 fixture 类型、Zod project/quota schema、Drizzle 数据库 schema、Phase 4 generation schema 和版本快照 schema | 仍缺真实 OpenAI response fixture、API route schema 和 zip 导出 fixture 测试 |
| 错误处理是否充分 | 登录页可提示 Supabase 配置缺失；Phase 2 覆盖空输入和 mock 状态提示 | 尚未覆盖真实网络、AI、保存、权限、导出失败 |
| 测试是否足够 | 已有 Phase 1/2/3/4 脚本检查 | 仍缺 Vitest、Playwright、API 集成测试、真实 OpenAI mock fixture、RLS 验证和安全测试 |
| 是否存在明显重构点 | 下一步重点是从 Phase 4 基础边界转向真实 OpenAI、Sandpack runtime、Supabase 持久化和导出 zip | 需要避免 mock provider 和工作台 fixture 被误认为真实生成/预览能力 |

### 当前代码质量结论

- 文档质量较完整，已经同步 Phase 4 基础层，并继续指导后续真实 OpenAI、Sandpack runtime、Supabase migration/RLS 与导出打包。
- 工程已有可运行 scaffold、Phase 2 前端壳、Phase 3 认证/持久化基础层和 Phase 4 生成/版本/导出服务边界。
- 不应把 Phase 2 fixture 或 Phase 4 mock provider 误认为真实 AI、Sandpack、导出下载或版本回退闭环；项目列表已不再使用 fixture 作为生产数据源。
- 下一步最重要的是执行并验证真实 Supabase migration/RLS、接入版本/导出持久化、真实 OpenAI provider 和 Sandpack 受控预览。

## 9. 持续更新规则

每次开发完成后，应更新本文档：

- 更新当前阶段。
- 将已完成内容从“未完成”移动到“已完成”。
- 新增发现的问题和技术债。
- 更新下一步计划的优先级。
- 更新风险概率和缓解状态。
- 如果架构变化，必须同步更新 `docs/architecture.md` 的 ADR。

## 10. 2026-05-08 Phase 1 开发更新

本次已完成 Phase 1 的最小工程 scaffold：

- 新增 `package.json`，定义 `dev`、`build`、`typecheck`、`lint`、`test` 基础脚本。
- 新增 Next.js App Router + TypeScript + Tailwind CSS 的最小页面入口。
- 新增 `src/app`、`src/components`、`src/features`、`src/lib`、`src/server`、`src/schemas`、`src/prompts`、`src/types` 目录边界。
- 新增 `README.md`，说明当前 Phase 1 范围、启动方式、检查命令和未实现能力。
- 新增 `.env.example`，列出 Supabase、OpenAI 和站点 URL 占位变量，不包含真实密钥。
- 新增 `tests/phase1-scaffold.test.mjs`，用于验证 Phase 1 scaffold 文件、脚本和环境变量占位。
- 新增 `.gitignore`，排除 `node_modules`、`.next`、`.env`、日志和本地 worktree 目录。

本次验收结果：

- 已通过 `winget` 安装 Node.js LTS，当前可用 `node` 和 `npm`。
- 已执行 `npm install`，生成 `package-lock.json`。
- 已执行 `npm run test`，通过 Phase 1 scaffold 检查。
- 已执行 `npm run typecheck`，TypeScript 校验通过。
- 已执行 `npm run lint`，ESLint 校验通过。
- 已执行 `npm run build`，Next.js production build 通过。
- 已执行 `npm audit --audit-level=high`，无 high severity 阻塞项；当前仍有 Next 依赖链中的 moderate PostCSS advisory，需后续跟随 Next 修复版本处理。
- 已执行 `next start -p 3000` 并请求 `http://127.0.0.1:3000`，返回 200 且页面包含 `AI Design Workspace`。

当前仍存在的环境限制：

- 在当前 Codex Windows 执行环境中，`npm run dev` 触发 Next dev 内部 `child_process.fork` 后返回 `spawn EPERM`。
- 该限制与本环境对子进程 spawn 的限制一致；独立 `typecheck`、`lint`、`build` 和 production server HTTP 验收均已通过。
- Next build 同样需要 worker 配置，因此 `next.config.mjs` 中将 production build 限制为 `experimental.cpus = 1` 且启用 `experimental.workerThreads = true`；内置 build typecheck 被跳过，类型校验由独立 `npm run typecheck` 负责。

下一阶段建议：

- 在普通本机终端重新执行 `npm run dev`，确认开发服务器在非 Codex sandbox 环境下可启动。
- 进入 Phase 2 前端闭环前，优先补项目列表和工作台 fixture 页面，继续保持真实 AI、Supabase 和导出能力不接入。

## 11. 2026-05-08 Phase 2 开发更新

本次已完成 Phase 2 的 fixture/mock 前端闭环：

- 创建 GitHub Issue #2：`feat: implement phase 2 frontend workspace loop`。
- 创建独立开发分支：`feat-issue-2-phase-2-frontend-loop`。因当前 Git refs 写入环境无法创建 `feat/issue-2-...` 斜杠分支名，本次使用等价的独立分支名。
- 新增 `/login`、`/projects`、`/workspace` 路由。
- 更新首页 `/`，提供进入项目列表和工作台的 Phase 2 主入口。
- 新增 `ProjectListPage`，展示 fixture 项目列表和打开工作台入口。
- 新增 `WorkspacePage`，实现三栏工作台、页面切换、预览、代码视图、对话输入、空输入提示、生成中状态和成功占位状态。
- 新增 `src/lib/fixtures/workspace.ts`，集中维护 Phase 2 fixture 项目、页面、文件和 prototype 边界说明。
- 新增 `tests/phase2-workspace.test.mjs`，验证 Phase 2 文件、fixture 数据和关键工作台行为标记。
- 更新 `tests/phase1-scaffold.test.mjs` 和 `package.json`，让 `npm run test` 同时覆盖 Phase 1 和 Phase 2 检查。
- 更新 `tsconfig.json`，排除 `.next` 构建产物，避免独立 `tsc --noEmit` 在 build 后扫描生成文件导致类型检查不稳定。

本次验收结果：

- 已执行 `npm.cmd run test`，Phase 1 scaffold 检查和 Phase 2 workspace 检查均通过。
- 已执行 `npm.cmd run typecheck`，TypeScript 校验通过。
- 已执行 `npm.cmd run lint`，ESLint 校验通过。
- 已执行 `npm.cmd run build`，Next.js production build 通过，静态路由包含 `/`、`/login`、`/projects`、`/workspace`。

当前仍存在的环境限制：

- PowerShell 直接执行 `npm run ...` 会被本机执行策略拦截 `npm.ps1`，本次改用 `npm.cmd run ...` 执行同等 npm 脚本。
- `npm run dev` 在当前 Codex Windows 执行环境中仍可能因 `spawn EPERM` 受限，开发服务器建议继续在普通本机终端复验。

下一阶段建议：

- 进入 Phase 3：接入 Supabase Auth、项目归属、数据库持久化和基础额度记录。
- 在 Phase 3 前补充最小认证/项目持久化 Issue，明确未登录访问、项目归属和 localStorage 仅用于草稿/UI 状态的验收标准。
- 保持 Phase 2 fixture 边界清晰，避免把 mock 项目数据误当作真实持久化数据源。

## 12. 2026-05-08 Phase 3 开发更新

本次完成 Issue #3：`feat: implement phase 3 persistence and auth foundation`。

已完成内容：

- 创建独立开发分支：`feat-issue-3-phase-3-persistence-auth`。因当前 Git refs 写入环境无法创建 `feat/issue-3-...` 斜杠分支名，本次继续使用等价短横线分支名。
- 新增 Supabase Auth 服务端边界：`src/server/auth/session.ts` 和 `src/server/auth/actions.ts`。
- 新增 `/auth/callback` route handler，用于处理 Supabase magic link 回调。
- `/projects` 和 `/workspace` 已改为受保护页面，未登录用户会跳转到 `/login`。
- 登录页已从 Phase 2 占位更新为 Supabase Auth 邮箱登录入口，并在环境变量缺失时显示配置提示。
- 新增 Drizzle schema：`user_profiles`、`projects`、`pages`、`project_versions`、`conversation_messages`、`generation_requests`、`generation_results`、`export_records`、`quotas`。
- 新增 `src/server/projects` 项目 repository/service，项目读取和创建绑定当前 authenticated owner，不信任前端传入用户身份。
- 新增 `src/server/quota/quotaService.ts`，为 generate、iterate、repair、export 操作记录基础使用次数。
- 新增 `src/schemas/project.ts` 和 `src/schemas/quota.ts`，用于 Phase 3 输入结构校验。
- 新增 `drizzle.config.ts` 和 `SUPABASE_DATABASE_URL` 环境变量占位。
- 新增 `tests/phase3-persistence-auth.test.mjs`，并把 `npm run test` 扩展为覆盖 Phase 1、Phase 2 和 Phase 3 检查。
- 更新 `README.md` 和 `docs/architecture.md`，记录 Phase 3 当前能力、边界和 ADR-0002。

本次未实现：

- 未接入真实 OpenAI 生成、AI structured output、prompt 模板或 provider adapter。
- 未接入 Sandpack 运行时预览。
- 未实现导出打包、导出下载、版本回退 UI 或真实版本历史页面。
- 当时未创建真实 Supabase migration 文件，未在远程数据库执行 schema，未配置 RLS policy；当前本地 SQL/RLS 文件已在 Issue #6 补齐，真实远程执行仍未完成。
- 未实现真实项目创建 UI；项目列表现在读取服务端持久化边界，未配置数据库或未创建项目时显示空状态。
- 未接入真实订阅、支付或额度扣减策略；当前只建立操作次数记录边界。

本次验收结果：

- 已执行 `node tests\phase3-persistence-auth.test.mjs`，先确认测试因缺失 Phase 3 文件失败，再实现到通过。
- 后续完整验收以本次最终回复中的命令结果为准。

当前仍存在的环境限制：

- 没有真实 Supabase 项目和数据库连接时，登录和项目读取只能验证服务端边界与配置缺失提示，无法完成真实用户会话闭环。
- 真实上线前必须创建 Drizzle migration、执行数据库变更，并配置 Supabase RLS，确保项目、页面、版本、对话、导出和额度记录按用户隔离。

下一阶段建议：

- 补 Issue：创建并验证 Supabase migration 与 RLS policy。
- 补 Issue：实现最小项目创建流程，把真实项目写入 `projects` 和 `pages`。
- Phase 4 已补 AI 输出 schema、路径 allowlist 和版本快照/导出边界测试；下一步接真实 provider、Sandpack runtime、持久化和 zip 导出。

## 13. 2026-05-09 Phase 4 开发更新

本次完成 Issue #4：`feat: implement phase 4 generation preview version export foundation`。

已完成内容：

- 创建独立开发分支：`feat-issue-4-phase-4-generation-preview-export`。
- 新增 `src/schemas/generation.ts`，定义生成结果、页面、文件、版本快照 schema，并实现 `sanitizeGeneratedProject` 与 `validateGeneratedFilePath`。
- 新增路径安全 allowlist，拒绝绝对路径、`..`、`.env`、shell 脚本、server 目录、依赖目录和敏感配置相关路径。
- 新增 `src/prompts/generation.ts`，集中记录 Phase 4 生成提示和原型边界。
- 新增 `src/server/ai/provider.ts`，定义服务端 `AiProvider` adapter，并提供当前可测试的 mock provider。
- 新增 `src/server/generation/generationService.ts`，编排 generate / iterate、schema 校验、额度记录和版本快照创建。
- 新增 `src/server/versions/versionService.ts`，提供项目级版本快照和 rollback 数据边界；rollback 会创建新的当前版本记录。
- 新增 `src/server/export/exportService.ts`，基于版本快照准备安全导出 manifest，并记录导出使用次数。
- 更新工作台 UI，展示 Phase 4 generation foundation、选区上下文、回退记录语义、导出当前版本和 Sandpack 待接入状态。
- 新增 `tests/phase4-generation-preview-export.test.mjs`，并把 `npm run test` 扩展到 Phase 4 检查。
- 更新 `docs/architecture.md`，新增 ADR-0003。

本次未实现：

- 未接入真实 OpenAI Responses API 网络调用；当前 provider 仍为 mock provider。
- 未接入真实 Sandpack runtime 或错误 overlay；工作台预览仍使用 fixture。
- 未把版本快照、生成记录或导出记录写入真实数据库。
- 未生成 zip 下载或静态包文件；当前导出服务只准备安全 manifest。
- 当时未创建 Supabase migration 或 RLS policy；当前本地 SQL/RLS 文件已在 Issue #6 补齐，真实远程执行仍未完成。

当前仍存在的环境限制：

- 没有真实 OpenAI key 和 Supabase 项目时，只能验证服务端边界、schema、路径安全、mock provider 和 UI 状态。
- `npm run dev` 在当前 Codex Windows 环境仍可能受 `spawn EPERM` 限制，继续以 `npm.cmd run build` 和脚本检查作为主要验收。

下一阶段建议：

- 补 Issue：接入真实 OpenAI Responses API provider，并保留当前 `AiProvider` 接口和 schema 校验。
- 补 Issue：接入 Sandpack，把通过校验的文件树载入受控预览。
- 补 Issue：将版本快照、生成记录、导出记录写入 Supabase，并基于 Issue #6 的 migration/RLS 文件执行真实数据库验证。
- 补 Issue：实现导出 zip / 静态包下载。

## 14. 2026-05-09 Phase 4 后续路线拆分

本次完成 Issue #5：`docs: split phase 4 follow-up development roadmap`。

已完成内容：

- 将 Phase 4 后续工作拆成 8 个顺序 Issue：Supabase migration/RLS、版本/生成记录持久化、真实 OpenAI provider、工作台生成入口、Sandpack runtime、版本历史/回退 UI、导出 zip 下载、API/E2E 测试加固。
- 明确每个 Issue 的目标、非目标、验收标准和必跑检查。
- 明确后续开发必须逐 Issue 独立分支、逐步提交、逐步更新文档。

本次未实现：

- 未接真实 OpenAI。
- 未接 Sandpack runtime。
- 未执行 Supabase migration/RLS。
- 未实现数据库持久化、zip 导出或 E2E。

下一步建议：

- 创建 Issue：`feat: add supabase migration and rls policies`。
- 基于该 Issue 新建独立分支。
- 先补本地 migration/RLS 文件与验证脚本，再进入真实 provider 或 Sandpack 开发。

## 15. 2026-05-09 Supabase migration/RLS 开发更新

本次完成 Issue #6：`feat: add supabase migration and rls policies`。

已完成内容：

- 新增 `drizzle/0001_initial_schema.sql`，覆盖当前 Drizzle schema 对应的 enum、table、foreign key 和 index。
- 新增 `supabase/policies/0001_project_rls.sql`，为 `user_profiles`、`projects`、`pages`、`project_versions`、`conversation_messages`、`generation_requests`、`generation_results`、`export_records`、`quotas` 启用 RLS。
- RLS policy 按 `auth.uid()` 和项目归属限制私有项目、页面、版本、对话、生成记录、导出记录和额度记录访问。
- 新增 `tests/phase4-supabase-migration-rls.test.mjs`，检查 migration/RLS 文件、关键表、policy 和文档同步标记。

本次未实现：

- 未连接真实 Supabase 项目执行 SQL。
- 未验证真实跨用户 RLS 行为。
- 未改动工作台 UI、OpenAI provider、Sandpack runtime 或导出下载。

下一步建议：

- 在真实 Supabase 项目执行 `drizzle/0001_initial_schema.sql` 和 `supabase/policies/0001_project_rls.sql`。
- 补 Issue：`feat: persist project versions and generation records`，把 Phase 4 版本快照、生成记录和导出记录写入数据库服务层。
