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
    expect(validateGeneratedFilePath("app\\dashboard//page.tsx")).toBe(
      "app/dashboard/page.tsx"
    );
    expect(validateGeneratedFilePath("app/dashboard/page.tsx")).toBe(
      "app/dashboard/page.tsx"
    );
    expect(validateGeneratedFilePath("components/HeroSection.tsx")).toBe(
      "components/HeroSection.tsx"
    );
    expect(validateGeneratedFilePath("styles/theme.css")).toBe("styles/theme.css");
    expect(validateGeneratedFilePath("README.md")).toBe("README.md");
  });

  it("returns canonical file paths from generated project sanitization", async () => {
    const { sanitizeGeneratedProject } = await import("../src/schemas/generation");

    const project = sanitizeGeneratedProject({
      files: [
        {
          content: "export default function Dashboard() { return <main />; }",
          path: "app\\dashboard//page.tsx"
        }
      ],
      mode: "generate",
      navigation: [],
      pages: [
        {
          filePath: "app/dashboard/page.tsx",
          id: "dashboard",
          name: "Dashboard",
          purpose: "Main dashboard",
          route: "/dashboard"
        }
      ],
      project: {
        defaultStyle: "Clean",
        description: "Canonical path project",
        name: "Canonical Project"
      },
      summary: "Canonical output",
      warnings: []
    });

    expect(project.files[0]?.path).toBe("app/dashboard/page.tsx");
    expect(project.pages[0]?.filePath).toBe("app/dashboard/page.tsx");
  });

  it("rejects duplicate generated paths after canonicalization", async () => {
    const { sanitizeGeneratedProject } = await import("../src/schemas/generation");

    expect(() =>
      sanitizeGeneratedProject({
        files: [
          {
            content: "export default function Page() { return <main />; }",
            path: "app\\dashboard/page.tsx"
          },
          {
            content: "export default function OtherPage() { return <main />; }",
            path: "app/dashboard//page.tsx"
          }
        ],
        mode: "generate",
        navigation: [],
        pages: [
          {
            filePath: "app/dashboard/page.tsx",
            id: "dashboard",
            name: "Dashboard",
            purpose: "Main dashboard",
            route: "/dashboard"
          }
        ],
        project: {
          defaultStyle: "Clean",
          description: "Duplicate path project",
          name: "Duplicate Project"
        },
        summary: "Duplicate output",
        warnings: []
      })
    ).toThrow(/duplicated/i);
  });

  it("rejects generated projects that exceed file count or byte limits", async () => {
    const { sanitizeGeneratedProject } = await import("../src/schemas/generation");

    const baseProject = {
      mode: "generate",
      navigation: [],
      pages: [
        {
          filePath: "app/page.tsx",
          id: "home",
          name: "Home",
          purpose: "Home page",
          route: "/"
        }
      ],
      project: {
        defaultStyle: "Clean",
        description: "File limits project",
        name: "File Limits"
      },
      summary: "File limit output",
      warnings: []
    } as const;

    expect(() =>
      sanitizeGeneratedProject({
        ...baseProject,
        files: [
          {
            content: "export default function Home() { return <main />; }",
            path: "app/page.tsx"
          },
          ...Array.from({ length: 30 }, (_, index) => ({
            content: "export function Component() { return null; }",
            path: `components/Extra${index}.tsx`
          }))
        ]
      })
    ).toThrow(/30 files/i);

    expect(() =>
      sanitizeGeneratedProject({
        ...baseProject,
        files: [
          {
            content: "x".repeat(200 * 1024 + 1),
            path: "app/page.tsx"
          }
        ]
      })
    ).toThrow(/200KB/i);

    expect(() =>
      sanitizeGeneratedProject({
        ...baseProject,
        files: [
          {
            content: "export default function Home() { return <main />; }",
            path: "app/page.tsx"
          },
          ...Array.from({ length: 6 }, (_, index) => ({
            content: "x".repeat(180 * 1024),
            path: `components/Large${index}.tsx`
          }))
        ]
      })
    ).toThrow(/1MB/i);
  });

  it("rejects empty and overlong generation prompts at schema level", async () => {
    const { validateGenerationPrompt } = await import("../src/schemas/generation");

    expect(() => validateGenerationPrompt("   ")).toThrow(/prompt/i);
    expect(() => validateGenerationPrompt("x".repeat(4001))).toThrow(/4000/i);
    expect(validateGenerationPrompt("  Build a CRM prototype  ")).toBe(
      "Build a CRM prototype"
    );
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

  it("returns canonical snapshot file keys and page references", async () => {
    const { validateVersionSnapshot } = await import("../src/schemas/generation");

    const snapshot = validateVersionSnapshot({
      files: {
        "app\\dashboard//page.tsx": "export default function Dashboard() { return <main />; }"
      },
      navigation: [],
      pages: [
        {
          filePath: "app/dashboard/page.tsx",
          id: "dashboard",
          name: "Dashboard",
          purpose: "Dashboard page",
          route: "/dashboard"
        }
      ],
      project: {
        defaultStyle: "Clean",
        description: "Canonical snapshot",
        name: "Canonical Snapshot"
      },
      prototypeBoundaryNotice: "Prototype only.",
      summary: "Canonical snapshot"
    });

    expect(Object.keys(snapshot.files)).toEqual(["app/dashboard/page.tsx"]);
    expect(snapshot.pages[0]?.filePath).toBe("app/dashboard/page.tsx");
  });

  it("rejects duplicate snapshot file keys after canonicalization", async () => {
    const { validateVersionSnapshot } = await import("../src/schemas/generation");

    expect(() =>
      validateVersionSnapshot({
        files: {
          "app\\dashboard/page.tsx": "export default function Dashboard() { return <main />; }",
          "app/dashboard//page.tsx":
            "export default function OtherDashboard() { return <main />; }"
        },
        navigation: [],
        pages: [
          {
            filePath: "app/dashboard/page.tsx",
            id: "dashboard",
            name: "Dashboard",
            purpose: "Dashboard page",
            route: "/dashboard"
          }
        ],
        project: {
          defaultStyle: "Clean",
          description: "Duplicate snapshot",
          name: "Duplicate Snapshot"
        },
        prototypeBoundaryNotice: "Prototype only.",
        summary: "Duplicate snapshot"
      })
    ).toThrow(/duplicated/i);
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
