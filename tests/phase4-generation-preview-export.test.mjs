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
  "src/schemas/generation.ts",
  "src/server/ai/provider.ts",
  "src/server/generation/generationService.ts",
  "src/server/versions/versionService.ts",
  "src/server/export/exportService.ts",
  "src/prompts/generation.ts"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase4-generation-preview-export\.test\.mjs/);

const generationSchema = readText("src/schemas/generation.ts");
[
  "generatedProjectSchema",
  "generatedPageSchema",
  "generatedFileSchema",
  "versionSnapshotSchema",
  "sanitizeGeneratedProject",
  "validateGeneratedFilePath",
  "FORBIDDEN_FILE_PATTERNS"
].forEach((marker) => assert.match(generationSchema, new RegExp(marker)));
assert.match(generationSchema, /\.env/);
assert.match(generationSchema, /\.\./);
assert.match(generationSchema, /\.sh/);
assert.match(generationSchema, /server/);

const provider = readText("src/server/ai/provider.ts");
assert.match(provider, /server-only/);
assert.match(provider, /AiProvider/);
assert.match(provider, /createMockAiProvider/);
assert.match(provider, /generateProject/);
assert.match(provider, /iterateProject/);
assert.doesNotMatch(provider, /NEXT_PUBLIC_OPENAI/);

const prompt = readText("src/prompts/generation.ts");
assert.match(prompt, /PHASE_4_GENERATION_SYSTEM_PROMPT/);
assert.match(prompt, /prototype/);
assert.match(prompt, /Do not generate/);

const generationService = readText("src/server/generation/generationService.ts");
assert.match(generationService, /server-only/);
assert.match(generationService, /generateProjectVersion/);
assert.match(generationService, /iterateProjectVersion/);
assert.match(generationService, /sanitizeGeneratedProject/);
assert.match(generationService, /createProjectVersionSnapshot/);
assert.match(generationService, /recordQuotaUsage/);

const versionService = readText("src/server/versions/versionService.ts");
assert.match(versionService, /server-only/);
assert.match(versionService, /createProjectVersionSnapshot/);
assert.match(versionService, /rollbackProjectVersion/);
assert.match(versionService, /rollback/);

const exportService = readText("src/server/export/exportService.ts");
assert.match(exportService, /server-only/);
assert.match(exportService, /prepareProjectExport/);
assert.match(exportService, /prototypeBoundaryNotice/);
assert.match(exportService, /validateGeneratedFilePath/);
assert.match(exportService, /recordQuotaUsage/);

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
[
  "P0 project workspace",
  "Selection context",
  "Version history",
  "Export current version",
  "ControlledSandpackPreview",
  "Live preview"
].forEach((marker) => assert.match(workspace, new RegExp(marker)));

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0003/);
assert.match(architecture, /Phase 4/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #4/);
assert.match(projectStatus, /Phase 4/);

console.log("Phase 4 generation, version, export checks passed.");
