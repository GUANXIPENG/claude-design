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
  "src/app/login/page.tsx",
  "src/app/projects/page.tsx",
  "src/app/workspace/page.tsx",
  "src/features/projects/components/ProjectListPage.tsx",
  "src/features/workspace/components/WorkspacePage.tsx",
  "src/lib/fixtures/workspace.ts"
].forEach(assertFile);

const fixture = readText("src/lib/fixtures/workspace.ts");
assert.match(fixture, /fixtureProjects/);
assert.match(fixture, /pages/);
assert.match(fixture, /files/);
assert.match(fixture, /Prototype only/);

const home = readText("src/app/page.tsx");
assert.match(home, /href="\/projects"/);
assert.match(home, /href="\/workspace"/);

const projectList = readText("src/features/projects/components/ProjectListPage.tsx");
assert.match(projectList, /ProjectListPage/);
assert.match(projectList, /fixtureProjects/);
assert.match(projectList, /Mock data/);
assert.match(projectList, /Open workspace/);

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
assert.match(workspace, /"use client"/);
assert.match(workspace, /WorkspacePage/);
assert.match(workspace, /selectedPageId/);
assert.match(workspace, /draft/);
assert.match(workspace, /setSelectedPageId/);
assert.match(workspace, /Please describe what to generate or change/);
assert.match(workspace, /Generating fixture preview/);
assert.match(workspace, /Fixture update ready/);
assert.match(workspace, /This is mock fixture output/);
assert.match(workspace, /Code view/);

console.log("Phase 2 workspace checks passed.");
