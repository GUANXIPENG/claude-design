# 项目状态文档

最后更新：2026-05-08

## 1. 当前项目阶段

当前项目处于：**Phase 2 前端闭环已完成，等待 Phase 3 持久化与认证开发**。

理由：

- 仓库中已经完成关键产品与架构文档：`docs/requirements.md`、`docs/PRD.md`、`docs/architecture.md`。
- Phase 1 已新增 `package.json`、`package-lock.json`、`README.md`、`.env.example`、Next.js App Router 页面入口、Tailwind 配置、TypeScript 配置和基础测试脚本。
- 已建立 `src/app`、`src/components`、`src/features`、`src/lib`、`src/server`、`src/schemas`、`src/prompts`、`src/types` 目录边界。
- 已完成 `npm install`、`npm run test`、`npm run typecheck`、`npm run lint`、`npm run build` 和 production server HTTP 验收。
- 当前仍未实现真实 AI、Supabase Auth、数据库、Sandpack、导出、版本回退、额度记录和工作台闭环。

因此，当前重点应从 Phase 2 前端闭环转向 Phase 3：接入轻量账号、项目归属、数据库持久化和基础额度记录，同时继续保持真实 AI、导出、版本回退等能力按后续阶段推进。

## 2. 当前已经完成的内容

| 模块 | 当前状态 | 相关文件 | 备注 |
|---|---|---|---|
| 项目初始化 | Git 仓库已存在，当前开发分支为 `phase-1-scaffold`，远程 `origin` 已配置 | `.git/` | Phase 1 scaffold 改动已准备提交；Issue 编号仍待补 |
| 需求文档 | 已完成第一版产品需求梳理 | `docs/requirements.md` | 覆盖产品定位、MVP/P1/P2、功能需求、非功能需求、导出、多页面、对话修改、局部修改、版本、账号、额度、风险 |
| PRD | 已完成结构化 PRD | `docs/PRD.md` | 覆盖用户角色、用户流程、页面清单、功能列表、Given/When/Then 验收标准、状态设计、视觉风格、信息架构、MVP 边界 |
| 架构草案 | 已完成技术栈锁定与架构基线 | `docs/architecture.md` | 锁定 Next.js、TypeScript、Tailwind、Supabase、Drizzle、OpenAI Responses API、Zod、Sandpack、Vercel、Vitest、Playwright 等方向 |
| 前端页面框架 | Phase 1 最小入口已实现 | `src/app/page.tsx`、`src/app/layout.tsx`、`src/app/globals.css` | 仅为 scaffold 占位页，不包含 Phase 2 工作台闭环 |
| 对话输入区 | 未实现 | 无 | 目前只有 PRD 和需求描述，没有 UI 或状态逻辑 |
| 生成结果展示区 | 未实现 | 无 | 没有预览容器、文件树、代码查看或生成结果结构 |
| live preview / code view | 未实现 | 无 | Sandpack 只在架构文档中作为技术基线，尚未接入 |
| 项目历史 / 本地存储 | 未实现 | 无 | 版本快照、历史、回退和本地草稿均未实现 |
| API route | 未实现 | 无 | 没有服务端路由或 Server Actions |
| OpenAI 调用预留 | 仅有架构文档预留 | `docs/architecture.md` | 没有 SDK、环境变量、服务端 provider adapter 或 prompt 文件 |
| 导出功能 | 未实现 | 无 | 仅 PRD 和架构中定义需求与服务端边界 |
| 测试文件 | Phase 1 scaffold 检查已实现 | `tests/phase1-scaffold.test.mjs` | 仅覆盖 scaffold 存在性；业务、schema、API、E2E 测试仍未建立 |
| README / 文档 | README 已补充 | `README.md`、`docs/requirements.md`、`docs/PRD.md`、`docs/architecture.md`、`docs/PROJECT_STATUS.md` | 已说明 Phase 1 范围、启动方式和未实现能力 |
| 环境变量配置 | 示例已补充 | `.env.example` | 不包含真实密钥；真实 `.env` 仍应本地私有 |
| Git / GitHub / Issue 管理 | 远程已配置；无提交；Issue 状态待确认 | `.git/` | `origin` 指向 `https://github.com/GUANXIPENG/claude-design.git`；未检查 GitHub Issue |

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
| 首页 / 登录 / 项目列表 / 工作台页面 | 页面和布局均未实现 | PRD 的核心用户路径无法验证 | 是 | Phase 2 |
| 对话输入区 | 输入框、提交状态、空值校验、修改模式均未实现 | 是生成和迭代的入口 | 是 | Phase 2 |
| 生成结果展示区 | 页面清单、文件树、代码视图、预览容器未实现 | 无法展示 AI 生成结果 | 是 | Phase 2 |
| Sandpack 预览 | 预览沙盒、文件映射、错误显示未接入 | MVP 要求可预览项目 | 是 | Phase 2 |
| 真实 AI 生成逻辑 | 服务端 OpenAI 调用、prompt、结构化输出、Zod 校验未实现 | 产品核心能力依赖 AI 生成 | 是 | Phase 4 |
| Supabase Auth | 轻量账号登录、会话、访问保护未实现 | 项目归属和私有项目依赖账号 | 是 | Phase 3 |
| 数据库 schema | User、Project、Page、Version、Generation、Quota 等表未建立 | 项目持久化、版本和额度记录无法落地 | 是 | Phase 3 |
| Drizzle ORM | schema、migration、数据库访问层未建立 | 架构基线要求类型化数据访问 | 是 | Phase 3 |
| 多页面项目生成 | 页面地图、页面清单、页面跳转关系未实现 | MVP 不应只生成单页面 | 是 | Phase 4 |
| 项目级版本快照 | 初始版本、修改版本、历史列表、回退未实现 | 用户无法撤回不满意结果 | 是 | Phase 4 |
| 点击选择后局部修改 | 选择模式、选区高亮、选区上下文未实现 | PRD 核心差异化能力之一 | 是 | Phase 4 |
| 导出功能 | 静态文件导出、可编辑项目结构导出、导出记录未实现 | 用户无法带走生成结果 | 是 | Phase 4 |
| 额度限制 | 使用次数记录、额度提示、限制逻辑未实现 | 成本控制和未来商业化需要基础记录 | 是，基础记录阻塞；真实订阅不阻塞 | Phase 3 / Phase 4 |
| 部署配置 | Vercel 配置、环境变量、构建脚本缺失 | 无法部署预览或生产环境 | 是，部署前阻塞 | Phase 5 |
| 测试覆盖 | Vitest、schema fixtures、API 测试、Playwright 未建立 | 无法验证核心流程和安全边界 | 是，至少最小测试阻塞可发布 MVP | Phase 5 |

## 4. 已知问题和阻塞点

### 4.1 阻塞性问题

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| Codex 环境中 `npm run dev` 返回 `spawn EPERM` | 无法在当前沙箱内验证 Next dev server | Next dev 内部使用 `child_process.fork`，当前环境限制 spawn | 在普通本机终端复验 `npm run dev`；当前以 build + `next start` HTTP 验收替代 | P1 |
| 真实业务页面尚未实现 | 用户无法体验项目列表和工作台主流程 | Phase 1 仅建立 scaffold | Phase 2 用 fixture/mock 数据实现前端闭环 | P0 |
| 真实 AI/Auth/DB/导出未接入 | MVP 核心能力仍不可用 | 尚未进入 Phase 3/4 | 按阶段接入 Supabase、Drizzle、OpenAI、Sandpack、导出和版本能力 | P0 |

### 4.2 高优先级问题

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| AI 生成逻辑未接入 | 产品核心能力不可用 | 尚无服务端代码和 OpenAI provider adapter | 先实现 mock/fixture 驱动的生成结果，再接 OpenAI 服务端调用 | P1 |
| Supabase Auth 未接入 | 项目归属、私有项目、额度记录无法落地 | 尚无后端和环境变量 | Phase 3 接入轻量账号和访问保护 | P1 |
| 数据库 schema 未建立 | 项目、页面、版本、对话、导出、额度无法持久化 | 尚未创建 Drizzle schema | 按架构草案建立最小表结构 | P1 |
| Sandpack 预览未接入 | 无法预览生成项目 | 前端工作台未实现 | Phase 2 先接静态 fixture 预览，Phase 4 接 AI 结果 | P1 |
| 版本快照和回退未实现 | 修改风险高，用户无法撤销 | 无持久化和版本模型 | 在 AI 生成前先定义项目级快照结构 | P1 |
| 导出功能未实现 | 用户无法保存或交付生成结果 | 无服务端导出逻辑 | Phase 4 实现当前版本导出，先限制文件范围 | P1 |
| OpenAI key server-only 边界未落地 | 存在未来泄露风险 | 没有服务端实现 | 任何 AI 接入必须只在服务端读取密钥 | P1 |
| 本地存储策略未实现 | 如果后续临时用 localStorage 保存主数据，会有数据丢失风险 | 当前只有架构约束，无代码约束 | 明确 localStorage 只用于草稿和 UI 状态 | P1 |
| Git 远程是否与本地同步待确认 | 可能本地还未推送任何内容 | `main` 无 commit，未执行 fetch/pull 对比 | 文档提交后再确认远程默认分支和同步策略 | P1 |

### 4.3 中低优先级技术债

| 问题描述 | 影响范围 | 可能原因 | 建议解决方式 | 优先级 |
|---|---|---|---|---|
| 产品名称仍为暂定 | 文案、域名、品牌、导出说明 | PRD 标记待确认 | MVP scaffold 可先使用 `AI Design Workspace`，上线前确认 | P2 |
| 额度扣减策略未定 | 成本提示、导出、订阅 | PRD 和架构均保留待确认 | MVP 先按操作次数记录，后续补 token 成本 | P2 |
| 响应式预览是否进入 MVP 待确认 | 工作台控件和验收范围 | PRD 建议 P1 三视口，MVP 可先基础预览 | Phase 2 先保留视口入口或只做桌面预览 | P2 |
| 导出是否消耗额度待确认 | 成本控制和用户预期 | PRD 中明确待确认 | MVP 先记录导出行为，不做真实扣减 | P2 |
| TODO / placeholder / mock 数据主要存在于文档描述，不是代码实现 | 暂不影响运行，但未来实现时要避免 mock 混入生产 | 当前没有代码 | 建立 fixture 与 production 数据边界 | P3 |
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

当前几乎没有代码可评价。仓库只有文档，没有业务代码、组件、服务端逻辑、测试或配置。因此，以下评价更多是“当前工程状态评价”，不是对代码实现质量的评价。

| 评价维度 | 当前评价 | 真实问题 |
|---|---|---|
| 目录结构是否清晰 | 文档目录清晰；源码目录不存在 | 还没有 `src/`、`app/`、`components/`、`features/` 等实际结构 |
| 前后端边界是否清晰 | 文档中边界清晰 | 代码中尚未落地，无法验证是否遵守 |
| 服务端逻辑是否安全 | 架构文档定义了 server-only 原则 | 无服务端代码，无法验证 OpenAI key、数据库访问、日志脱敏 |
| 组件是否过大 | 待确认 | 当前无组件 |
| 状态管理是否合理 | 架构建议合理 | 当前无状态管理实现 |
| 类型定义是否完整 | 架构提出 TypeScript + Zod | 当前无类型定义和 schema 文件 |
| 错误处理是否充分 | PRD 和架构描述充分 | 当前无运行时错误处理实现 |
| 测试是否足够 | 不足 | 当前无测试文件、测试脚本或 CI |
| 是否存在明显重构点 | 最大重构点是从“文档仓库”转为“可运行工程” | 需要先建立 scaffold、目录边界、脚本、README、环境变量示例 |

### 当前代码质量结论

- 文档质量较完整，已经足以指导下一阶段 scaffold。
- 工程质量尚未开始，因为没有应用代码。
- 不应在没有 scaffold 的情况下继续扩展 PRD 或架构细节。
- 下一步最重要的是建立最小可运行项目，并把架构文档中的边界落实到目录、脚本和最小测试中。

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
