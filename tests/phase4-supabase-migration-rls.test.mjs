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

const migrationPath = "drizzle/0001_initial_schema.sql";
const rlsPath = "supabase/policies/0001_project_rls.sql";

assertFile(migrationPath);
assertFile(rlsPath);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.test, /phase4-supabase-migration-rls\.test\.mjs/);

const migration = readText(migrationPath);
[
  "CREATE TYPE generation_mode",
  "CREATE TYPE generation_status",
  "CREATE TYPE quota_operation",
  "CREATE TABLE user_profiles",
  "CREATE TABLE projects",
  "CREATE TABLE pages",
  "CREATE TABLE project_versions",
  "CREATE TABLE conversation_messages",
  "CREATE TABLE generation_requests",
  "CREATE TABLE generation_results",
  "CREATE TABLE export_records",
  "CREATE TABLE quotas",
  "REFERENCES user_profiles",
  "REFERENCES projects",
  "REFERENCES project_versions",
  "REFERENCES generation_requests",
  "CREATE INDEX projects_owner_id_idx",
  "CREATE INDEX pages_project_id_idx",
  "CREATE INDEX project_versions_project_id_idx",
  "CREATE INDEX conversation_messages_project_id_idx",
  "CREATE INDEX generation_requests_requested_by_id_idx",
  "CREATE INDEX export_records_project_id_idx",
  "CREATE INDEX quotas_user_id_idx"
].forEach((marker) => assert.match(migration, new RegExp(marker)));

const rls = readText(rlsPath);
[
  "ALTER TABLE projects ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE pages ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE generation_results ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE export_records ENABLE ROW LEVEL SECURITY",
  "ALTER TABLE quotas ENABLE ROW LEVEL SECURITY",
  "auth.uid()",
  "projects.owner_id",
  "generation_requests.requested_by_id",
  "quotas.user_id",
  "WITH CHECK",
  "USING"
].forEach((marker) => assert.match(rls, new RegExp(marker)));

[
  "projects_owner_select",
  "pages_project_owner_select",
  "project_versions_project_owner_select",
  "conversation_messages_project_owner_select",
  "generation_requests_requester_select",
  "generation_results_requester_select",
  "export_records_project_owner_select",
  "quotas_user_select"
].forEach((policyName) => assert.match(rls, new RegExp(policyName)));

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #6/);
assert.match(projectStatus, /Supabase migration/);
assert.match(projectStatus, /RLS/);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0004/);
assert.match(architecture, /RLS/);

console.log("Phase 4 Supabase migration and RLS checks passed.");
