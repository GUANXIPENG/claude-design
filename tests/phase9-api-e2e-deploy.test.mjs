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
  "playwright.config.ts",
  "tests/e2e/protected-routes.spec.ts",
  "src/app/export/route.ts",
  "docs/PROJECT_STATUS.md",
  "docs/architecture.md",
  "README.md",
  ".env.example"
].forEach(assertFile);

const packageJson = JSON.parse(readText("package.json"));
assert.match(packageJson.scripts.start, /next start/);
assert.match(packageJson.scripts.test, /phase9-api-e2e-deploy\.test\.mjs/);
assert.match(packageJson.scripts["test:e2e"], /playwright test/);
assert.doesNotMatch(packageJson.scripts["test:e2e"], /npm\.cmd|npx\.cmd/);
assert.match(packageJson.devDependencies["@playwright/test"], /\d/);

const playwrightConfig = readText("playwright.config.ts");
[
  "defineConfig",
  "testDir: \"./tests/e2e\"",
  "npx next start -p 3000",
  "reuseExistingServer",
  "baseURL"
].forEach((marker) => assert.match(playwrightConfig, new RegExp(marker)));

const protectedRoutes = readText("tests/e2e/protected-routes.spec.ts");
[
  "/projects",
  "/workspace",
  "/export?projectId=test&exportType=static",
  "/export?projectId=test&exportType=unknown",
  "maxRedirects: 0",
  "/login?returnTo=%2Fprojects",
  "/login?returnTo=%2Fworkspace",
  "/login?returnTo=%2Fworkspace%3FprojectId%3Dtest",
  "/workspace?projectId=test&exportError=export_failed"
].forEach((marker) => assert.equal(protectedRoutes.includes(marker), true));

const exportRoute = readText("src/app/export/route.ts");
assert.match(exportRoute, /isRedirectError/);
assert.match(exportRoute, /throw error/);
assert.match(exportRoute, /export_failed/);

const projectStatus = readText("docs/PROJECT_STATUS.md");
assert.match(projectStatus, /Issue #23/);
assert.match(projectStatus, /API\/E2E/i);
assert.match(projectStatus, /Playwright/i);
[
  "Playwright 未建立",
  "构建脚本缺失",
  "API/E2E 加固未实现",
  "Full API/E2E test hardening is not implemented",
  "API/E2E hardening, Playwright coverage, and deployment documentation remain"
].forEach((staleMarker) => assert.equal(projectStatus.includes(staleMarker), false));

const architecture = readText("docs/architecture.md");
assert.match(architecture, /Playwright/i);
assert.match(architecture, /protected routes/i);

const readme = readText("README.md");
assert.match(readme, /Issue #23/);
assert.match(readme, /Phase 1 through Phase 9/);
assert.match(readme, /npm run test:e2e/);
assert.match(readme, /Vercel/i);
assert.match(readme, /Supabase/i);
assert.match(readme, /OpenAI/i);
assert.equal(
  readme.includes("API/E2E hardening and real payment or subscription logic are intentionally not implemented yet."),
  false
);

console.log("Phase 9 API, E2E, and deployment hardening checks passed.");
