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
  "src/app/export/route.ts",
  "src/server/export/exportArchive.ts",
  "src/server/export/exportService.ts",
  "src/server/export/zipWriter.ts",
  "src/server/projects/projectService.ts",
  "src/features/workspace/components/WorkspacePage.tsx"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase8-zip-static-export\.test\.mjs/);
assert.match(packageJson.scripts.test, /export-zip\.behavior\.test\.ts/);

const exportArchive = readText("src/server/export/exportArchive.ts");
[
  "buildProjectExportArchive",
  "validateVersionSnapshot",
  "validateGeneratedFilePath",
  "createZipArchive",
  "README.md",
  "prototypeBoundaryNotice",
  "editable-project",
  "static",
  "prototype-manifest.json",
  "prototype-files/"
].forEach((marker) => assert.match(exportArchive, new RegExp(marker)));

const exportService = readText("src/server/export/exportService.ts");
[
  "createProjectExportZip",
  "buildProjectExportArchive",
  "recordQuotaUsage",
  "recordExportRequest",
  "operationType: \"export\"",
  "status: \"succeeded\""
].forEach((marker) => assert.match(exportService, new RegExp(marker)));

const projectService = readText("src/server/projects/projectService.ts");
[
  "exportProjectVersionForCurrentUser",
  "requireCurrentUser",
  "getProjectVersionByOwner",
  "getProjectWorkspaceByOwner",
  "createProjectExportZip",
  "ownerId: user.id",
  "snapshot: version.snapshot"
].forEach((marker) => assert.match(projectService, new RegExp(marker)));
assert.doesNotMatch(projectService, /ownerId: input\.ownerId/);
assert.doesNotMatch(projectService, /snapshot: input\.snapshot/);

const exportRoute = readText("src/app/export/route.ts");
[
  "exportProjectVersionForCurrentUser",
  "projectId",
  "versionId",
  "exportType",
  "Content-Disposition",
  "application/zip",
  "Cache-Control",
  "Buffer.from"
].forEach((marker) => assert.match(exportRoute, new RegExp(marker)));
assert.doesNotMatch(exportRoute, /ownerId/);
assert.doesNotMatch(exportRoute, /snapshot/);

const workspaceRoute = readText("src/app/workspace/page.tsx");
assert.match(workspaceRoute, /exportError/);
assert.match(workspaceRoute, /exportMessage/);

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
[
  "Download static ZIP",
  "Download editable ZIP",
  "exportType=static",
  "exportType=editable-project",
  "server-generated ZIP",
  "prototype boundary notes"
].forEach((marker) => assert.match(workspace, new RegExp(marker)));

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #22/);
assert.match(projectStatus, /zip/i);
assert.match(projectStatus, /export/i);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0011/);
assert.match(architecture, /zip/i);
assert.match(architecture, /export/i);

console.log("Phase 8 zip and static export checks passed.");
