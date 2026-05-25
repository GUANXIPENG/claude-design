import { describe, expect, it } from "vitest";
import type { VersionSnapshot } from "../src/schemas/generation";
import { createSandpackPreviewModel } from "../src/features/preview/lib/createSandpackPreviewModel";

const snapshot: VersionSnapshot = {
  files: {
    "app/page.tsx": "export default function Home() { return <main>Home</main>; }",
    "components/Hero.tsx": "export function Hero() { return <section>Hero</section>; }",
    "styles/theme.css": "main { color: #17202a; }"
  },
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
    description: "A controlled preview snapshot.",
    name: "Preview Project"
  },
  prototypeBoundaryNotice: "Prototype only.",
  summary: "Preview-ready project"
};

describe("Sandpack controlled preview model", () => {
  it("maps a validated version snapshot to a fixed React template file tree", () => {
    const model = createSandpackPreviewModel({
      selectedFilePath: "app/page.tsx",
      snapshot
    });

    expect(model.status).toBe("ready");

    if (model.status !== "ready") {
      throw new Error("Expected a ready Sandpack preview model.");
    }

    expect(model.files["/src/App.tsx"]).toBe(snapshot.files["app/page.tsx"]);
    expect(model.files["/src/components/Hero.tsx"]).toBe(
      snapshot.files["components/Hero.tsx"]
    );
    expect(model.files["/src/styles/theme.css"]).toBe(snapshot.files["styles/theme.css"]);
    expect(model.files["/src/main.tsx"]).toContain("createRoot");
    expect(model.files).not.toHaveProperty("package.json");
    expect(model.activeFile).toBe("/src/App.tsx");
    expect(model.boundaryNotice).toBe("Prototype only.");
  });

  it("returns an empty state when no snapshot is available", () => {
    expect(
      createSandpackPreviewModel({
        selectedFilePath: null,
        snapshot: null
      })
    ).toEqual({
      message: "No current version snapshot is available for preview.",
      status: "empty"
    });
  });

  it("returns an error state when the selected page file is missing", () => {
    expect(
      createSandpackPreviewModel({
        selectedFilePath: "app/missing/page.tsx",
        snapshot
      })
    ).toEqual({
      message: "The selected page file is missing from the validated snapshot.",
      status: "error"
    });
  });
});
