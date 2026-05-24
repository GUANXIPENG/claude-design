import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function readText(filePath) {
  return readFileSync(path.join(root, filePath), "utf8");
}

function assertFile(filePath) {
  assert.equal(existsSync(path.join(root, filePath)), true, `${filePath} should exist`);
}

[
  "src/server/ai/openaiProvider.ts",
  "src/server/generation/projectGenerationService.ts",
  "src/server/generation/actions.ts",
  "src/features/projects/components/CreateProjectForm.tsx",
  "src/features/workspace/components/WorkspacePage.tsx"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase5-p0-generation-entry\.test\.mjs/);
assert.match(packageJson.scripts.test, /phase5-p0-generation-entry\.behavior\.test\.ts/);
assert.ok(packageJson.dependencies.openai, "openai SDK should be a server-side dependency");
assert.ok(packageJson.devDependencies.vitest, "Vitest should cover P0 service behavior");

const openaiProvider = readText("src/server/ai/openaiProvider.ts");
[
  "server-only",
  "OpenAI",
  "responses.create",
  "json_schema",
  "gpt-5.5",
  "OPENAI_MODEL",
  "sanitizeGeneratedProject",
  "AiProvider"
].forEach((marker) => assert.match(openaiProvider, new RegExp(marker)));
assert.doesNotMatch(openaiProvider, /NEXT_PUBLIC_OPENAI/);

const projectGenerationService = readText("src/server/generation/projectGenerationService.ts");
[
  "server-only",
  "createProjectFromPrompt",
  "ProjectGenerationPersistence",
  "persistSuccessfulProjectGeneration",
  "prompt.trim()",
  "Generated project prompt is required",
  "createOpenAiResponsesProvider"
].forEach((marker) => assert.match(projectGenerationService, new RegExp(marker)));

const projectGenerationRepository = readText("src/server/generation/projectGenerationRepository.ts");
[
  "server-only",
  "transaction",
  "generationRequests",
  "generationResults",
  "conversationMessages",
  "quotas",
  "projectVersions",
  "currentVersionId"
].forEach((marker) => assert.match(projectGenerationRepository, new RegExp(marker)));

const generationActions = readText("src/server/generation/actions.ts");
[
  "\"use server\"",
  "requireCurrentUser",
  "redirect",
  "FormData",
  "createProjectFromPrompt",
  "/workspace\\?projectId="
].forEach((marker) => assert.match(generationActions, new RegExp(marker)));
assert.doesNotMatch(generationActions, /OpenAI/);

const generationRepository = readText("src/server/generation/generationRepository.ts");
assert.match(generationRepository, /projectId\?: string \| null/);
assert.match(generationRepository, /projectId: input\.projectId \?\? null/);
assert.match(generationRepository, /provider_failed/);
assert.match(generationRepository, /validation_failed/);
assert.doesNotMatch(generationRepository, /error\.message\.slice/);

const projectRepository = readText("src/server/projects/projectRepository.ts");
[
  "createProjectFromGeneratedProject",
  "getProjectWorkspaceByOwner",
  "ownerId",
  "currentVersionId",
  "generatedProject.pages.map"
].forEach((marker) => assert.match(projectRepository, new RegExp(marker)));

const projectListPage = readText("src/features/projects/components/ProjectListPage.tsx");
[
  "CreateProjectForm",
  "/workspace\\?projectId=\\$\\{project.id\\}",
  "errorMessage"
].forEach((marker) => assert.match(projectListPage, new RegExp(marker)));

const workspacePage = readText("src/features/workspace/components/WorkspacePage.tsx");
[
  "workspaceProject",
  "currentVersion",
  "snapshot",
  "ProjectWorkspaceSnapshot",
  "selectedPageId"
].forEach((marker) => assert.match(workspacePage, new RegExp(marker)));
assert.doesNotMatch(workspacePage, /primaryFixtureProject/);

const homePage = readText("src/app/page.tsx");
assert.match(homePage, /P0 generation entry/);
assert.doesNotMatch(homePage, /Phase 2 front-end loop/);
assert.doesNotMatch(homePage, /fixture-driven prototype shell/);

const loginPage = readText("src/app/login/page.tsx");
assert.match(loginPage, /server-side generation/);
assert.doesNotMatch(loginPage, /AI generation remains a later Phase 4 capability/);

const envExample = readText(".env.example");
assert.match(envExample, /OPENAI_MODEL=gpt-5\.5/);

const readme = readText("README.md");
assert.match(readme, /OPENAI_MODEL/);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0006/);
assert.match(architecture, /OpenAI Responses API/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #15/);
assert.match(projectStatus, /P0 project generation entry/);

console.log("Phase 5 P0 generation entry checks passed.");
