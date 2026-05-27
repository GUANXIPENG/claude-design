import { describe, expect, it, vi } from "vitest";
import {
  buildProjectExportArchive,
  type ProjectExportType
} from "../src/server/export/exportArchive";
import type { VersionSnapshot } from "../src/schemas/generation";

vi.mock("server-only", () => ({}));

const snapshot: VersionSnapshot = {
  files: {
    "README.md": "Model generated readme",
    "app/page.tsx": "export default function Home() { return <main>Hello</main>; }",
    "components/Hero.tsx": "export function Hero() { return <section />; }",
    "styles/theme.css": "body { color: #17202a; }"
  },
  navigation: [
    {
      from: "/",
      label: "Home",
      to: "/"
    }
  ],
  pages: [
    {
      filePath: "app/page.tsx",
      id: "home",
      name: "Home",
      purpose: "Landing page",
      route: "/"
    }
  ],
  project: {
    defaultStyle: "Clean",
    description: "Export target",
    name: "Export Project"
  },
  prototypeBoundaryNotice: "Prototype only. Not a production application.",
  summary: "Exportable prototype"
};

function archiveText(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("utf8");
}

function buildArchive(exportType: ProjectExportType) {
  return buildProjectExportArchive({
    exportType,
    projectId: "project-1",
    snapshot,
    versionNumber: 3
  });
}

describe("zip and static export behavior", () => {
  it("creates a static zip with boundary README, page html, and source files", () => {
    const archive = buildArchive("static");
    const text = archiveText(archive.zipBytes);

    expect(archive.fileName).toBe("project-1-v3-static.zip");
    expect(archive.zipBytes[0]).toBe(0x50);
    expect(archive.zipBytes[1]).toBe(0x4b);
    expect(text).toContain("README.md");
    expect(text).toContain("index.html");
    expect(text).toContain("pages/index.html");
    expect(text).toContain("prototype-files/app/page.tsx");
    expect(text).toContain("Prototype only. Not a production application.");
  });

  it("creates an editable zip with a manifest and editable source tree", () => {
    const archive = buildArchive("editable-project");
    const text = archiveText(archive.zipBytes);

    expect(archive.fileName).toBe("project-1-v3-editable-project.zip");
    expect(text).toContain("README.md");
    expect(text).toContain("prototype-manifest.json");
    expect(text).toContain("app/page.tsx");
    expect(text).toContain("components/Hero.tsx");
    expect(text).toContain("prototype-source/README.generated.md");
    expect(text).toContain("development starting point");
  });

  it("rejects invalid snapshot paths before archive creation", () => {
    expect(() =>
      buildProjectExportArchive({
        exportType: "static",
        projectId: "project-1",
        snapshot: {
          ...snapshot,
          files: {
            "../secret.tsx": "export default function Secret() { return null; }",
            "app/page.tsx": snapshot.files["app/page.tsx"]
          }
        },
        versionNumber: 3
      })
    ).toThrow(/not allowed|forbidden/i);
  });

  it("rejects duplicate normalized paths before archive creation", () => {
    expect(() =>
      buildProjectExportArchive({
        exportType: "editable-project",
        projectId: "project-1",
        snapshot: {
          ...snapshot,
          files: {
            "./app/page.tsx": "export default function Duplicate() { return null; }",
            "app/page.tsx": snapshot.files["app/page.tsx"]
          }
        },
        versionNumber: 3
      })
    ).toThrow(/duplicated/i);
  });
});
