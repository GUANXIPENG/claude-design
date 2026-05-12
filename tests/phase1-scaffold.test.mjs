import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath) {
  return JSON.parse(readFileSync(path.join(root, filePath), "utf8"));
}

function readText(filePath) {
  return readFileSync(path.join(root, filePath), "utf8");
}

const pkg = readJson("package.json");

assert.equal(pkg.private, true);
assert.equal(pkg.scripts.dev, "next dev");
assert.equal(pkg.scripts.build, "next build");
assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
assert.equal(pkg.scripts.lint, "eslint src --ext .ts,.tsx");
assert.equal(
  pkg.scripts.test,
  "node tests/phase1-scaffold.test.mjs && node tests/phase2-workspace.test.mjs"
);
assert.ok(pkg.dependencies.next);
assert.ok(pkg.dependencies.react);
assert.ok(pkg.dependencies["react-dom"]);
assert.ok(pkg.devDependencies.typescript);
assert.ok(pkg.devDependencies.tailwindcss);

[
      "src/app/page.tsx",
      "src/app/layout.tsx",
      "src/app/globals.css",
      "next.config.mjs",
      "package-lock.json",
      "src/components",
  "src/features",
  "src/lib",
  "src/server",
  "src/schemas",
  "src/prompts",
  "src/types"
].forEach((entry) => {
  assert.equal(existsSync(path.join(root, entry)), true, `${entry} should exist`);
});

const readme = readText("README.md");
const env = readText(".env.example");

assert.match(readme, /Phase 1/i);
assert.match(readme, /npm run dev/);
assert.match(readme, /OPENAI_API_KEY/);
assert.match(env, /NEXT_PUBLIC_SITE_URL=/);
assert.match(env, /NEXT_PUBLIC_SUPABASE_URL=/);
assert.match(env, /NEXT_PUBLIC_SUPABASE_ANON_KEY=/);
assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/);
assert.match(env, /OPENAI_API_KEY=/);

console.log("Phase 1 scaffold checks passed.");
