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
  "src/features/preview/components/ControlledSandpackPreview.tsx",
  "src/features/preview/lib/createSandpackPreviewModel.ts",
  "src/features/workspace/components/WorkspacePage.tsx"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.equal(packageJson.dependencies["@codesandbox/sandpack-react"], "2.20.0");
assert.match(packageJson.scripts.test, /phase6-sandpack-preview\.test\.mjs/);
assert.match(packageJson.scripts.test, /sandpack-preview\.behavior\.test\.ts/);

const previewComponent = readText(
  "src/features/preview/components/ControlledSandpackPreview.tsx"
);
[
  "\"use client\"",
  "@codesandbox/sandpack-react",
  "SandpackProvider",
  "SandpackPreview",
  "template=\"react-ts\"",
  "createSandpackPreviewModel",
  "Prototype boundary"
].forEach((marker) => assert.match(previewComponent, new RegExp(marker)));
assert.doesNotMatch(previewComponent, /customSetup/);
assert.doesNotMatch(previewComponent, /package\.json/);
assert.doesNotMatch(previewComponent, /OpenAI/);
assert.doesNotMatch(previewComponent, /service_role|SERVICE_ROLE/i);

const previewModel = readText("src/features/preview/lib/createSandpackPreviewModel.ts");
[
  "VersionSnapshot",
  "createSandpackPreviewModel",
  "/src/App.tsx",
  "/src/main.tsx",
  "/src/styles.css",
  "selectedFilePath",
  "status: \"ready\"",
  "status: \"empty\"",
  "status: \"error\""
].forEach((marker) => assert.match(previewModel, new RegExp(marker)));
assert.doesNotMatch(previewModel, /package\.json/);

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
[
  "ControlledSandpackPreview",
  "Live preview",
  "Code view"
].forEach((marker) => assert.match(workspace, new RegExp(marker)));
assert.doesNotMatch(workspace, /Sandpack pending/);
assert.doesNotMatch(workspace, /Preview metadata/);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0009/);
assert.match(architecture, /Sandpack controlled preview/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #20/);
assert.match(projectStatus, /Sandpack controlled preview/);

console.log("Phase 6 Sandpack controlled preview checks passed.");
