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
  "src/server/auth/session.ts",
  "src/server/auth/actions.ts",
  "src/server/db/schema.ts",
  "src/server/projects/projectRepository.ts",
  "src/server/projects/projectService.ts",
  "src/server/quota/quotaService.ts",
  "src/schemas/project.ts",
  "src/schemas/quota.ts",
  "src/app/auth/callback/route.ts"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.ok(packageJson.dependencies["@supabase/ssr"], "Supabase SSR dependency is required");
assert.ok(packageJson.dependencies["@supabase/supabase-js"], "Supabase JS dependency is required");
assert.ok(packageJson.dependencies["drizzle-orm"], "Drizzle ORM dependency is required");
assert.ok(packageJson.dependencies["postgres"], "Postgres driver dependency is required");
assert.ok(packageJson.devDependencies["drizzle-kit"], "Drizzle Kit dev dependency is required");
assert.match(packageJson.scripts.test, /phase3-persistence-auth\.test\.mjs/);

const envExample = readText(".env.example");
[
  "NEXT_PUBLIC_SUPABASE_URL=",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
  "SUPABASE_DATABASE_URL=",
  "SUPABASE_SERVICE_ROLE_KEY="
].forEach((marker) => assert.match(envExample, new RegExp(marker)));

const authSession = readText("src/server/auth/session.ts");
assert.match(authSession, /server-only/);
assert.match(authSession, /getCurrentUser/);
assert.match(authSession, /requireCurrentUser/);
assert.doesNotMatch(authSession, /userId:\s*string/);

const authActions = readText("src/server/auth/actions.ts");
assert.match(authActions, /"use server"/);
assert.match(authActions, /signInWithOtp|signInWithPassword/);
assert.match(authActions, /signOut/);

const dbSchema = readText("src/server/db/schema.ts");
[
  "userProfiles",
  "projects",
  "pages",
  "projectVersions",
  "conversationMessages",
  "generationRequests",
  "generationResults",
  "exportRecords",
  "quotas"
].forEach((tableName) => assert.match(dbSchema, new RegExp(tableName)));
assert.match(dbSchema, /ownerId/);
assert.match(dbSchema, /projectId/);

const projectRepository = readText("src/server/projects/projectRepository.ts");
assert.match(projectRepository, /server-only/);
assert.match(projectRepository, /ownerId/);
assert.doesNotMatch(projectRepository, /localStorage/);

const projectService = readText("src/server/projects/projectService.ts");
assert.match(projectService, /requireCurrentUser/);
assert.doesNotMatch(projectService, /userId:\s*string/);

const quotaService = readText("src/server/quota/quotaService.ts");
assert.match(quotaService, /recordQuotaUsage/);
assert.match(quotaService, /operationType/);

const projectSchema = readText("src/schemas/project.ts");
assert.match(projectSchema, /projectCreateSchema/);
assert.match(projectSchema, /projectPageSchema/);
assert.match(projectSchema, /projectVersionSchema/);

const quotaSchema = readText("src/schemas/quota.ts");
assert.match(quotaSchema, /quotaOperationSchema/);
assert.match(quotaSchema, /generate/);
assert.match(quotaSchema, /iterate/);
assert.match(quotaSchema, /export/);

const projectsRoute = readText("src/app/projects/page.tsx");
assert.match(projectsRoute, /requireCurrentUser/);
assert.match(projectsRoute, /listProjectsForCurrentUser/);

const workspaceRoute = readText("src/app/workspace/page.tsx");
assert.match(workspaceRoute, /requireCurrentUser/);

const loginRoute = readText("src/app/login/page.tsx");
assert.match(loginRoute, /signInWithEmail/);
assert.match(loginRoute, /Supabase Auth/);

const projectList = readText("src/features/projects/components/ProjectListPage.tsx");
assert.match(projectList, /ProjectListPage/);
assert.doesNotMatch(projectList, /fixtureProjects/);
assert.match(projectList, /projectCount/);

const workspace = readText("src/features/workspace/components/WorkspacePage.tsx");
assert.match(workspace, /authUserEmail/);
assert.match(workspace, /workspaceProject/);
assert.doesNotMatch(workspace, /localStorage/);

const readme = readText("README.md");
assert.match(readme, /Phase 3/);
assert.match(readme, /Supabase Auth/);
assert.match(readme, /Drizzle/);
assert.match(readme, /SUPABASE_DATABASE_URL/);

const architecture = readText("docs/architecture.md");
assert.match(architecture, /ADR-0002/);
assert.match(architecture, /Phase 3/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #3/);
assert.match(projectStatus, /Phase 3/);

console.log("Phase 3 persistence and auth checks passed.");
