# AGENTS.md

最后更新：2026-05-08

本文档是给 Codex / AI agent 使用的长期开发规范，不是普通 README。每次进入本仓库执行分析、开发、测试、重构、文档或发布相关任务前，必须先读取并遵守本文档以及本文档列出的事实来源。

当前已确认存在的必读文档：

- `docs/requirements.md`
- `docs/PRD.md`
- `docs/architecture.md`
- `docs/PROJECT_STATUS.md`

如果未来任一必读文档缺失，agent 必须先在任务计划和最终回复中明确标记缺失情况；如果缺失文档会影响需求、架构或验收判断，则必须把它视为阻塞或待补事项，不能凭记忆继续扩大开发范围。

## 1. 项目定位

本项目是一个类似 Claude Design 的 AI Design Workspace。用户通过自然语言描述需求，系统生成可预览、可编辑、可迭代、可导出的多页面网页 / 应用原型。

必须长期遵守以下定位：

- MVP 面向个人自用优先，但产品和工程设计必须保留轻量账号、项目归属、额度记录和未来订阅扩展空间。
- MVP 生成的是前端交互原型，不承诺生成可直接生产上线的完整应用。
- 产品核心不是单页面生成，而是多页面项目、页面跳转、对话式修改、点击局部区域修改、项目级版本快照、回退和导出闭环。
- 用户输入、AI 输出、导出结果都必须清楚表达“原型 / 开发起点”的边界，不能暗示所有按钮、表单、权限、支付或数据同步已经连接真实业务后端。
- 参考站点、品牌、截图或第三方素材只能作为风格、布局和信息架构参考，不能直接复制代码、文案、Logo、商标或受版权保护资产。

## 2. 文档优先级和读取规则

每次开发前必须读取相关事实来源，不允许凭记忆开发。

读取顺序：

1. `docs/PROJECT_STATUS.md`：判断当前阶段、已完成内容、阻塞点、下一步计划和当前不该做什么。
2. `docs/PRD.md`：判断产品功能、页面流程、用户体验、状态设计和验收标准。
3. `docs/architecture.md`：判断技术栈、目录结构、服务端边界、AI 调用、数据库、预览沙盒、测试和部署规则。
4. `docs/requirements.md`：当需求不清、MVP / P1 / P2 边界不清、产品取舍不清时读取。

任务类型与必读文档：

| 任务类型 | 必须读取 |
|---|---|
| 产品功能、页面流程、用户体验、验收标准 | `docs/PRD.md` |
| 技术栈、目录结构、数据库、服务端边界、AI 调用、预览沙盒、测试、部署 | `docs/architecture.md` |
| MVP / P1 / P2 范围判断、需求边界、争议项 | `docs/requirements.md` |
| 当前做到哪一步、下一步做什么、有哪些阻塞 | `docs/PROJECT_STATUS.md` |
| 跨模块功能或高风险改动 | 四份文档都必须读取 |

规则：

- 如果文档之间冲突，不能自行静默选择。必须在计划中列出冲突、推荐处理方式和影响范围。
- 如果 PRD 没有验收标准，不能直接开发 P0 / P1 功能；必须先补充 PRD 或在计划中明确验收假设。
- 如果架构文档没有覆盖某个技术决策，不能直接引入新技术；必须先补充 ADR。
- 如果 PROJECT_STATUS 显示当前阶段不适合做某类功能，不能跳过阶段直接实现复杂能力。

## 3. 技术栈强制约束

当前 MVP 技术栈基线以 `docs/architecture.md` 为准，默认锁定为：

| 维度 | 基线 |
|---|---|
| 前端框架 | Next.js App Router + React |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| UI 组件 | shadcn/ui 风格组件组织 |
| 鉴权 | Supabase Auth |
| 数据库 | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| AI 调用 | 服务端 provider adapter + OpenAI Responses API |
| 运行时校验 | Zod |
| 预览 | Sandpack |
| 测试 | Vitest + Playwright |
| 部署方向 | Vercel |

强制规则：

- 不允许未经 `docs/architecture.md` ADR 记录就替换技术栈。
- 不允许把 OpenAI API key、Supabase service role key 或任何敏感密钥暴露到浏览器。
- 不允许前端组件直接导入 OpenAI SDK、数据库客户端 service role、服务端 repository 或密钥读取逻辑。
- AI 调用、额度校验、项目写入、版本快照、导出打包、数据库访问、权限判断必须在服务端完成。
- `localStorage` 只能用于 UI 临时状态、未提交草稿、面板尺寸、当前选区、最近打开项目等低风险信息，不能作为项目主数据源。
- Sandpack 只负责受控前端原型预览，不负责真实后端执行、真实密钥访问、任意依赖安装或不受控网络访问。
- AI 输出是不可信输入，必须经过 schema 校验、安全清洗、路径检查和权限边界检查后才能保存、预览或导出。

## 4. 开发总流程

每次开发必须严格按以下流程执行：

1. 读取相关文档。
2. 明确任务类型：产品功能、页面 / UI、架构 / 数据模型、服务端逻辑、AI 生成逻辑、预览 / Sandpack、测试、文档、重构、修复 bug。
3. 开发前写出开发计划，必须包含：本次目标、涉及文件、不涉及范围、风险点、验收标准、是否需要子 agent、是否需要测试。
4. 多分支开发或大功能开发前，必须先创建或补充 GitHub Issue。
5. 根据 Issue 创建独立分支。
6. 严格按开发计划完成，不允许临时扩大范围。
7. 开发后运行相关检查。
8. 开发后在当前平台、权限和上层指令允许时启动必要子 agent 做验收。
9. 根据验收结果修复问题。
10. 同步更新相关文档。
11. 按“一次 commit 只提交一个文件”的规则拆分提交。

如果当前 Codex 运行环境的系统 / 开发者指令与本文档的子 agent 或 Git 流程要求冲突，必须服从更高优先级指令，并在计划或最终回复中说明未执行原因和替代验证方式。

## 5. GitHub Issue 规则

每个功能、修复、重构、测试、文档任务都应该先有 Issue。大功能、跨模块改动、高风险修复必须先有 Issue，不能直接开始。

Issue 必须包含：

| 字段 | 要求 |
|---|---|
| 背景 | 为什么现在要做 |
| 目标 | 本次要达成什么 |
| 非目标 | 明确不做什么 |
| 涉及文档 | 关联 `requirements`、`PRD`、`architecture`、`PROJECT_STATUS` 中哪些内容 |
| 涉及模块 | 前端、服务端、AI、预览、导出、版本、认证、数据库等 |
| 验收标准 | 对应 PRD 的 Given / When / Then 或补充验收标准 |
| 测试要求 | 必须跑哪些单元测试、集成测试、E2E 或人工检查 |
| 风险 | 安全、数据、成本、性能、范围风险 |
| 文档更新要求 | 需要同步更新哪些文档 |

Issue 标题建议格式：

- `feat: implement project list page`
- `feat: add workspace preview shell`
- `fix: prevent empty generation request`
- `docs: update architecture ADR for preview sandbox`
- `test: add generation schema tests`
- `refactor: split generation service`

## 6. 分支规则

不允许直接在 `main` 分支开发。开始实际功能、修复、重构、测试或架构改动前，必须基于 Issue 创建独立分支。

分支命名规则：

| 类型 | 格式 |
|---|---|
| 新功能 | `feat/issue-<number>-short-name` |
| 修复 | `fix/issue-<number>-short-name` |
| 文档 | `docs/issue-<number>-short-name` |
| 测试 | `test/issue-<number>-short-name` |
| 重构 | `refactor/issue-<number>-short-name` |

如果当前没有 Issue 编号，必须先创建 Issue 或在计划中标明“待创建 Issue”。不要直接开始大范围开发。

## 7. Commit 规则

本项目采用严格 commit 规则：

- 每一次 commit 只允许提交一个文件。
- 如果一次任务修改多个文件，必须拆成多个 commit。
- 每个 commit message 必须清楚说明该文件的变化。
- 不允许把无关文件混在同一个 commit。
- 不允许提交 `.env`、密钥、临时缓存、构建产物、无关截图。
- 不允许在未运行必要检查前提交功能代码。
- 文档更新和代码变更如果涉及不同文件，必须分别提交。

Commit message 建议格式：

- `docs: add root agent development rules`
- `feat: add project list page shell`
- `test: add project schema unit tests`
- `fix: handle empty prompt validation`
- `chore: add env example`

## 8. 文档同步规则

开发后必须判断是否需要同步文档。

| 变化类型 | 必须更新 |
|---|---|
| 功能行为、用户流程、页面、验收标准变化 | `docs/PRD.md` |
| 技术栈、目录结构、服务端边界、数据模型、AI 调用、预览方案、测试策略变化 | `docs/architecture.md`，并补充 ADR |
| 开发阶段、已完成内容、未完成内容、阻塞点、下一步计划变化 | `docs/PROJECT_STATUS.md` |
| 需求范围、MVP / P1 / P2 边界变化 | `docs/requirements.md` |

规则：

- 文档更新必须和代码变更保持一致，不能只改代码不改文档。
- 如果本次任务只改文档，也必须检查相关文档之间是否产生矛盾。
- 如果新增 ADR，必须记录为什么改、改了什么、影响模块、新风险、是否影响 MVP。
- 如果实现中发现 PRD 验收标准不可执行，必须先更新 PRD 或把问题列为待确认。

## 9. 子 agent 使用规则

子 agent 使用必须服从当前 Codex 运行环境的系统 / 开发者指令。本文档规定的是项目协作要求：当平台、权限和用户授权允许时，以下规则必须执行；如果当前环境禁止或无法启动子 agent，必须在最终回复中说明，并用本地检查清单替代。

### 9.1 必须使用子 agent 的情况

以下情况开发后必须启动子 agent 进行独立验收：

- 实现 PRD 中 P0 功能。
- 修改架构边界、目录结构、数据模型或技术栈。
- 接入 Supabase Auth、数据库、Drizzle migration。
- 接入 OpenAI API 或 prompt / structured output。
- 实现 Sandpack 预览、导出、版本快照、回退。
- 修改权限、额度、用户归属、服务端 API。
- 修改影响多个页面或多个模块的代码。
- 修复高风险 bug。
- 发布前检查。
- 任何涉及安全、密钥、服务端边界的改动。

### 9.2 推荐使用子 agent 的情况

- 写测试。
- 补充边界用例。
- 检查 UI 是否符合 PRD。
- 检查组件命名是否符合规范。
- 检查文档是否同步。
- 检查是否违反技术栈锁定。
- 检查是否误改 MVP 范围之外的内容。

### 9.3 子 agent 类型

| 子 agent | 职责 |
|---|---|
| `review-agent` | 检查代码是否符合 PRD 验收标准、是否超出 Issue 范围、组件命名和文件结构是否合规 |
| `test-agent` | 根据验收标准补充 Vitest / Playwright 测试建议或测试代码，检查空状态、错误状态、加载状态、权限状态 |
| `security-agent` | 检查 API key、服务端边界、权限、数据库写入、导出、路径安全，确认敏感逻辑没有进入浏览器 |
| `docs-agent` | 检查 `PRD.md`、`architecture.md`、`PROJECT_STATUS.md`、`requirements.md` 是否需要同步更新，检查文档冲突 |
| `architecture-agent` | 检查实现是否遵守 `docs/architecture.md`，是否需要新增 ADR，是否引入过早抽象或偏离 MVP |

### 9.4 子 agent 验收输出格式

子 agent 验收必须输出：

- 结论：通过 / 不通过
- 对应 Issue
- 对应 PRD 验收标准
- 检查过的文件
- 发现的问题
- 必须修复项
- 建议修复项
- 是否需要补测试
- 是否需要更新文档
- 是否允许合并

## 10. 测试规则

测试是 MVP 质量边界的一部分，不能只靠人工预览。

强制规则：

- P0 功能必须有测试，或明确说明为什么当前阶段暂时无法测试。
- 数据结构、Zod schema、AI 输出校验、路径安全、额度记录、权限判断必须优先写单元测试。
- 关键用户流程必须逐步补 Playwright E2E。
- 不允许只靠人工预览作为唯一验收方式。
- 测试命名必须能对应功能或 PRD 验收标准。
- 如果当前项目还没有测试框架，必须在 scaffold 阶段补齐 Vitest 和 Playwright 基础配置。

测试重点：

- 空输入不能触发生成。
- 未登录不能访问私有页面。
- 项目必须归属当前用户。
- AI 输出路径不能包含 `..`、绝对路径或敏感文件。
- 修改失败不能破坏旧版本。
- 导出必须基于当前版本和权限校验。
- 页面切换不能丢失项目状态。
- 点击选区后局部修改必须带上选区上下文。
- OpenAI API key、Supabase service role key 不能进入客户端 bundle。
- 回退后必须生成新的当前版本记录。

## 11. 组件命名规则

### 11.1 React 组件

- React 组件使用 PascalCase。
- 文件名和默认导出组件名保持一致。
- 通用 UI 组件放在 `components/ui`。
- 业务组件按 feature 放在 `features/<feature-name>/components`。
- 页面级壳组件命名为 `XxxPage` 或 `XxxScreen`。
- 布局组件命名为 `XxxLayout`。
- 表单组件命名为 `XxxForm`。
- 弹窗组件命名为 `XxxDialog`。
- 卡片组件命名为 `XxxCard`。
- 列表组件命名为 `XxxList`。
- 空状态组件命名为 `XxxEmptyState`。
- 错误状态组件命名为 `XxxErrorState`。
- 加载状态组件命名为 `XxxLoadingState`。

示例：

- `ProjectListPage`
- `ProjectCard`
- `CreateProjectDialog`
- `WorkspaceLayout`
- `PageTreePanel`
- `PreviewCanvas`
- `GenerationInputForm`
- `VersionHistoryDialog`
- `ExportProjectDialog`

### 11.2 Hook 命名

- React hook 必须以 `use` 开头。
- 业务 hook 放在对应 feature 内。
- 不允许把服务端数据源和 UI 临时状态混在同一个 hook 中。
- 读取服务端数据的 hook 必须清楚区分 loading、error、empty、success 状态。

示例：

- `useSelectedPage`
- `usePreviewViewport`
- `useGenerationForm`
- `useWorkspaceSelection`

### 11.3 服务端模块命名

- 服务端逻辑必须放在 `server` 或明确的服务端目录下。
- AI provider 相关命名使用 `provider` 或 `adapter`。
- 数据库访问命名使用 `repository` 或 `repo`。
- 业务编排命名使用 `service`。
- 不允许在客户端组件中直接访问数据库或密钥。

示例：

- `generationService`
- `openaiProvider`
- `projectRepository`
- `versionService`
- `quotaService`
- `exportService`

## 12. 文件和目录组织规则

实际目录以 `docs/architecture.md` 为准。如需调整，必须更新架构文档并记录 ADR。本任务不要求创建这些目录，但未来 scaffold 和开发必须遵守以下分层思想：

| 目录 | 职责 |
|---|---|
| `app/` 或 `src/app/` | Next.js App Router 页面和 route handlers |
| `components/` 或 `src/components/` | 通用 UI 组件 |
| `features/` 或 `src/features/` | 按业务域组织前端业务组件 |
| `server/` 或 `src/server/` | 服务端业务逻辑、AI 调用、数据库访问、导出逻辑 |
| `db/` 或 `src/db/` | Drizzle schema 和 migration |
| `lib/` 或 `src/lib/` | 通用工具函数 |
| `prompts/` 或 `src/prompts/` | AI prompt 模板 |
| `schemas/` 或 `src/schemas/` | Zod schema 和结构化输出 schema |
| `types/` 或 `src/types/` | 共享 TypeScript 类型 |
| `tests/` 或 `src/tests/` | 单元、接口、schema、导出和 E2E 测试 |
| `docs/` | 产品、PRD、架构、状态文档 |

依赖边界：

- `components` 不应直接访问数据库。
- 前端组件不应直接调用 OpenAI SDK。
- `server` 逻辑不应依赖浏览器 API。
- prompt 模板不应散落在 UI 组件里。
- `features` 可以组合 UI 和业务交互，但不能绕过服务端权限和数据边界。
- `schemas` 应被服务端优先使用，前端只能复用非敏感校验。

## 13. PRD 验收标准执行规则

开发 P0 / P1 功能必须对照 PRD 验收标准。

规则：

- 开发 P0 功能时，必须找到对应 PRD 功能 ID 或 Given / When / Then 验收标准。
- 如果 PRD 没有明确验收标准，必须先补充 PRD，再开发。
- 开发完成后，`review-agent` 必须逐条对照验收标准检查；如果当前环境不能启动子 agent，主 agent 必须用同样格式手动检查。
- 不能只实现 happy path，必须覆盖空状态、加载状态、错误状态、权限状态、保存失败、生成失败、用户取消、重试、回退。
- 如果实现与 PRD 不一致，不能通过删除或弱化验收标准让功能“通过”；必须修实现、改需求并记录原因，或列为待确认问题。

最低验收覆盖：

- 用户能看到当前处于哪个项目、哪个页面、哪个版本。
- 用户发起生成、修改、导出时能看到明确状态。
- 失败时用户能看到具体原因、当前数据是否安全、下一步可以做什么。
- 高风险操作必须二次确认。
- 权限不足不能泄露私有项目内容。

## 14. 安全和边界规则

禁止事项：

- 不允许把 API key 写入前端。
- 不允许提交 `.env`。
- 不允许让 AI 输出任意文件路径。
- 不允许生成或执行 shell 脚本作为用户项目的一部分。
- 不允许在浏览器执行真实服务端逻辑。
- 不允许把 `localStorage` 当作项目主数据库。
- 不允许跳过用户身份校验读取项目。
- 不允许没有权限校验就导出项目。
- 不允许未经确认删除项目、页面、版本。
- 不允许生成声称“生产可用”的后端业务能力。
- 不允许把 provider 原始错误、密钥、完整敏感 prompt 或环境变量写进前端错误提示或生产日志。

必须遵守：

- AI 输出是不可信输入，必须经过 schema 校验、安全清洗和路径检查。
- 用户输入是不可信输入，必须经过服务端校验。
- 数据库写入必须绑定当前用户。
- 导出必须校验项目归属和当前版本。
- 所有项目读取必须带用户归属或权限条件。
- Supabase RLS 应作为数据库层保护，服务端也必须做权限校验。
- 文件路径必须拒绝绝对路径、`..`、`.env`、密钥文件、配置密钥文件、shell 脚本和服务端敏感文件。
- 预览内容必须和宿主产品 UI 隔离。

## 15. MVP 范围控制规则

当前 MVP 优先实现：

- 首页 / 登录 / 项目列表 / 工作台基础页面。
- 自然语言生成入口。
- 多页面项目结构。
- 页面清单和页面切换。
- 预览区域。
- 对话式修改入口。
- 点击元素或区块后局部修改的基础交互。
- 项目级版本快照。
- 回退。
- 导出。
- 轻量账号。
- 额度记录。

当前 MVP 不优先实现：

- 完整支付订阅。
- 团队协作。
- Figma 导入。
- 完整图片理解。
- 文件解析。
- 参考站点抓取。
- 真实后端业务逻辑生成。
- 多人实时编辑。
- 企业权限系统。
- 生产级代码质量承诺。
- 公开模板市场。
- 复杂权限系统。
- 任意框选区域修改。
- 版本分支和跨版本合并。

如果开发任务触碰非 MVP 范围，必须先在计划中说明为什么需要做，并更新 PRD 或 requirements。没有明确理由时，应拒绝扩大范围并回到 MVP 主链路。

## 16. 开发完成后的检查清单

每次开发完成后必须检查：

- 是否符合本次 Issue。
- 是否符合开发计划。
- 是否没有扩大范围。
- 是否符合 PRD 验收标准。
- 是否符合 architecture 技术栈。
- 是否需要更新 PRD。
- 是否需要更新 architecture。
- 是否需要更新 PROJECT_STATUS。
- 是否需要更新 requirements。
- 是否有测试。
- 是否运行了可用检查。
- 是否启动了必要的子 agent；如果未启动，是否说明原因和替代检查。
- 是否每个 commit 只包含一个文件。
- 是否没有提交密钥和临时文件。
- 是否没有修改无关文件。
- 是否保留用户已有改动，没有擅自 revert。

完成汇报必须包含：

- 修改了哪些文件。
- 本次完成了什么。
- 运行了哪些检查，结果是什么。
- 未运行哪些检查，原因是什么。
- 是否需要后续 Issue。

## 17. 禁止事项

以下行为禁止：

- 禁止不读文档直接开发。
- 禁止随意更换技术栈。
- 禁止直接在 `main` 分支开发。
- 禁止无 Issue 开始大功能。
- 禁止一次 commit 提交多个文件。
- 禁止把多个无关任务混在一起。
- 禁止只改代码不更新文档。
- 禁止只写 UI happy path。
- 禁止把服务端逻辑放进客户端组件。
- 禁止把 mock 数据伪装成真实功能。
- 禁止关闭 Issue 但不提交代码。
- 禁止通过删除验收标准来让功能“通过”。
- 禁止提交密钥、`.env`、构建产物、缓存目录、无关截图。
- 禁止用 prompt 约束替代服务端安全校验。
- 禁止在未校验权限的情况下读取、导出、删除或回退项目。
- 禁止让 AI 生成真实支付、真实认证、真实数据库连接或真实后端业务承诺。

## 18. 输出要求

Agent 完成任务后的最终回复必须清晰说明：

1. 创建或更新了哪些文件。
2. 本次完成了哪些开发、文档或检查工作。
3. 是否发现现有文档缺失或冲突。
4. 运行了哪些验证命令及结果。
5. 哪些检查无法运行以及原因。
6. 下一步建议做什么。

回复必须简洁、事实化，不能夸大完成范围。未实现的能力必须明确说“未实现”或“待确认”，不能用模糊表述掩盖。
