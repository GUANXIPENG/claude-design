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
  "src/server/generation/generationRepository.ts",
  "src/server/versions/versionRepository.ts",
  "src/server/conversations/conversationRepository.ts",
  "src/server/export/exportRepository.ts"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase4-persistence-records\.test\.mjs/);

const generationRepository = readText("src/server/generation/generationRepository.ts");
[
  "server-only",
  "createGenerationRequestRecord",
  "markGenerationRequestSucceeded",
  "markGenerationRequestFailed",
  "generationRequests",
  "generationResults",
  "status: \"running\"",
  "status: \"succeeded\"",
  "status: \"failed\"",
  "sanitizePersistenceErrorMessage"
].forEach((marker) => assert.match(generationRepository, new RegExp(marker)));
assert.doesNotMatch(generationRepository, /NEXT_PUBLIC_OPENAI/);

const versionRepository = readText("src/server/versions/versionRepository.ts");
[
  "server-only",
  "persistProjectVersion",
  "projectVersions",
  "projects",
  "currentVersionId",
  "versionRecord.snapshot"
].forEach((marker) => assert.match(versionRepository, new RegExp(marker)));
assert.match(versionRepository, /eq\(projects\.ownerId, versionRecord\.createdById\)/);

const conversationRepository = readText("src/server/conversations/conversationRepository.ts");
[
  "server-only",
  "recordConversationMessage",
  "recordGenerationConversation",
  "conversationMessages",
  "role: \"user\"",
  "role: \"assistant\"",
  "versionId"
].forEach((marker) => assert.match(conversationRepository, new RegExp(marker)));

const exportRepository = readText("src/server/export/exportRepository.ts");
[
  "server-only",
  "recordExportRequest",
  "exportRecords",
  "status: \"succeeded\"",
  "requestedById"
].forEach((marker) => assert.match(exportRepository, new RegExp(marker)));

const generationService = readText("src/server/generation/generationService.ts");
[
  "createGenerationRequestRecord",
  "markGenerationRequestSucceeded",
  "markGenerationRequestFailed",
  "persistProjectVersion",
  "recordGenerationConversation",
  "try",
  "catch",
  "persistedVersion"
].forEach((marker) => assert.match(generationService, new RegExp(marker)));
assert.match(generationService, /markGenerationRequestFailed[\s\S]*throw error/);

const exportService = readText("src/server/export/exportService.ts");
assert.match(exportService, /recordExportRequest/);
assert.match(exportService, /versionId/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /persist project versions and generation records/);
assert.match(projectStatus, /Issue 待创建/);

console.log("Phase 4 persistence record checks passed.");
