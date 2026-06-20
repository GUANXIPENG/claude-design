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
  "src/server/versions/actions.ts",
  "src/server/versions/versionRepository.ts",
  "src/server/versions/versionService.ts",
  "src/server/projects/projectService.ts",
  "src/features/workspace/components/WorkspacePage.tsx"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase7-version-history-rollback\.test\.mjs/);
assert.match(packageJson.scripts.test, /version-history-rollback\.behavior\.test\.ts/);

const versionRepository = readText("src/server/versions/versionRepository.ts");
[
  "listProjectVersionsByOwner",
  "getProjectVersionByOwner",
  "rollbackProjectVersionByOwner",
  "validateVersionSnapshot",
  "projects.ownerId, ownerId",
  "projectVersions.projectId, input.projectId",
  "projectVersions.id, input.versionId",
  "persistProjectVersion",
  "rollbackProjectVersion"
].forEach((marker) => assert.match(versionRepository, new RegExp(marker)));

const projectService = readText("src/server/projects/projectService.ts");
[
  "listProjectVersionsForCurrentUser",
  "rollbackProjectVersionForCurrentUser",
  "requireCurrentUser",
  "listProjectVersionsByOwner",
  "rollbackProjectVersionByOwner"
].forEach((marker) => assert.match(projectService, new RegExp(marker)));
assert.doesNotMatch(projectService, /ownerId: input\.ownerId/);

const versionActions = readText("src/server/versions/actions.ts");
[
  "\"use server\"",
  "rollbackVersionAction",
  "FormData",
  "rollbackProjectVersionForCurrentUser",
  "redirect",
  "/workspace\\?projectId="
].forEach((marker) => assert.match(versionActions, new RegExp(marker)));
assert.doesNotMatch(versionActions, /ownerId/);
assert.doesNotMatch(versionActions, /snapshot/);

const workspaceRoute = readText("src/app/workspace/page.tsx");
[
  "listProjectVersionsForCurrentUser",
  "versionHistory",
  "versionRestored",
  "versionError"
].forEach((marker) => assert.match(workspaceRoute, new RegExp(marker)));

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
[
  "versionHistory",
  "previewVersion",
  "Preview version",
  "Previewing version",
  "Restore this version",
  "Confirm restore",
  "rollbackVersionAction",
  "Current version",
  "No version history yet"
].forEach((marker) => assert.match(workspace, new RegExp(marker)));

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #21/);
assert.match(projectStatus, /version history/i);
assert.match(projectStatus, /rollback/i);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0010/);
assert.match(architecture, /rollback/i);

console.log("Phase 7 version history and rollback checks passed.");
