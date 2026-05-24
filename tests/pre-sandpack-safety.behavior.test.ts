import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("pre-Sandpack generated file safety", () => {
  it("rejects server route handlers before generated files can be previewed", async () => {
    const { sanitizeGeneratedProject } = await import("../src/schemas/generation");

    expect(() =>
      sanitizeGeneratedProject({
        files: [
          {
            content: "export async function GET() { return Response.json({ ok: true }); }",
            path: "app/api/secret/route.ts"
          }
        ],
        mode: "generate",
        navigation: [],
        pages: [
          {
            filePath: "app/api/secret/route.ts",
            id: "api",
            name: "API",
            purpose: "Unsafe server route",
            route: "/api/secret"
          }
        ],
        project: {
          defaultStyle: "Unsafe",
          description: "Unsafe server output",
          name: "Unsafe Project"
        },
        summary: "Unsafe output",
        warnings: []
      })
    ).toThrow(/server|route|allowlist|not allowed/i);
  });

  it("rejects package manifests so generated code cannot request arbitrary dependencies or scripts", async () => {
    const { validateGeneratedFilePath } = await import("../src/schemas/generation");

    expect(() => validateGeneratedFilePath("package.json")).toThrow(
      /package|allowlist|not allowed/i
    );
  });

  it("keeps ordinary front-end page and component files valid", async () => {
    const { validateGeneratedFilePath } = await import("../src/schemas/generation");

    expect(validateGeneratedFilePath("app/page.tsx")).toBe("app/page.tsx");
    expect(validateGeneratedFilePath("app/dashboard/page.tsx")).toBe(
      "app/dashboard/page.tsx"
    );
    expect(validateGeneratedFilePath("components/HeroSection.tsx")).toBe(
      "components/HeroSection.tsx"
    );
    expect(validateGeneratedFilePath("styles/theme.css")).toBe("styles/theme.css");
    expect(validateGeneratedFilePath("README.md")).toBe("README.md");
  });
});

describe("pre-Sandpack snapshot safety", () => {
  it("revalidates persisted snapshots before returning them to the workspace", async () => {
    const { validateVersionSnapshot } = await import("../src/schemas/generation");

    expect(() =>
      validateVersionSnapshot({
        files: {
          "app/api/secret/route.ts": "export async function GET() {}"
        },
        navigation: [],
        pages: [
          {
            filePath: "app/api/secret/route.ts",
            id: "api",
            name: "API",
            purpose: "Unsafe server route",
            route: "/api/secret"
          }
        ],
        project: {
          defaultStyle: "Unsafe",
          description: "Unsafe server output",
          name: "Unsafe Project"
        },
        prototypeBoundaryNotice: "Prototype only.",
        summary: "Unsafe output"
      })
    ).toThrow(/server|route|allowlist|not allowed/i);
  });

  it("rejects snapshots when a page references a missing file", async () => {
    const { validateVersionSnapshot } = await import("../src/schemas/generation");

    expect(() =>
      validateVersionSnapshot({
        files: {
          "app/page.tsx": "export default function Home() { return <main />; }"
        },
        navigation: [],
        pages: [
          {
            filePath: "app/missing/page.tsx",
            id: "missing",
            name: "Missing",
            purpose: "Missing file reference",
            route: "/missing"
          }
        ],
        project: {
          defaultStyle: "Clean",
          description: "Missing file snapshot",
          name: "Missing Project"
        },
        prototypeBoundaryNotice: "Prototype only.",
        summary: "Missing file"
      })
    ).toThrow(/missing file/i);
  });
});

describe("auth profile safety", () => {
  it("upserts the current auth user profile before project-owned writes", async () => {
    const { ensureUserProfile } = await import("../src/server/auth/userProfile");
    const calls: Array<unknown> = [];
    const db = {
      insert(table: unknown) {
        calls.push({ table });
        return {
          values(value: unknown) {
            calls.push({ value });
            return {
              onConflictDoUpdate(update: unknown) {
                calls.push({ update });
                return Promise.resolve();
              }
            };
          }
        };
      }
    };

    await ensureUserProfile({
      db,
      user: {
        email: "creator@example.com",
        id: "00000000-0000-4000-8000-000000000001"
      }
    });

    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: expect.objectContaining({
            email: "creator@example.com",
            id: "00000000-0000-4000-8000-000000000001"
          })
        }),
        expect.objectContaining({
          update: expect.objectContaining({
            target: expect.anything()
          })
        })
      ])
    );
  });
});

describe("auth redirect safety", () => {
  it("only allows same-origin returnTo paths for login callbacks and magic links", async () => {
    const { sanitizeReturnTo } = await import("../src/server/auth/returnTo");

    expect(sanitizeReturnTo("/workspace?projectId=abc#preview")).toBe(
      "/workspace?projectId=abc#preview"
    );
    expect(sanitizeReturnTo("//attacker.example")).toBe("/projects");
    expect(sanitizeReturnTo("https://attacker.example/projects")).toBe("/projects");
    expect(sanitizeReturnTo("/\\attacker.example")).toBe("/projects");
    expect(sanitizeReturnTo("projects")).toBe("/projects");
  });
});
