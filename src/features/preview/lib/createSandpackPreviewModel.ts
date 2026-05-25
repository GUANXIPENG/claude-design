import type { VersionSnapshot } from "@/schemas/generation";

type CreateSandpackPreviewModelInput = {
  selectedFilePath: string | null;
  snapshot: VersionSnapshot | null;
};

type SandpackPreviewReadyModel = {
  activeFile: "/src/App.tsx";
  boundaryNotice: string;
  files: Record<string, string>;
  pagePurpose: string;
  status: "ready";
};

type SandpackPreviewMessageModel = {
  message: string;
  status: "empty" | "error";
};

export type SandpackPreviewModel =
  | SandpackPreviewMessageModel
  | SandpackPreviewReadyModel;

const FIXED_REACT_ENTRY = `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

const BASE_STYLES = `:root {
  color: #17202a;
  background: #f6f8fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

* {
  box-sizing: border-box;
}
`;

function mapSnapshotPathToSandpackPath(path: string): string | null {
  if (path.startsWith("components/")) {
    return `/src/${path}`;
  }

  if (path.startsWith("styles/")) {
    return `/src/${path}`;
  }

  return null;
}

export function createSandpackPreviewModel({
  selectedFilePath,
  snapshot
}: CreateSandpackPreviewModelInput): SandpackPreviewModel {
  if (!snapshot) {
    return {
      message: "No current version snapshot is available for preview.",
      status: "empty"
    };
  }

  if (!selectedFilePath || !snapshot.files[selectedFilePath]) {
    return {
      message: "The selected page file is missing from the validated snapshot.",
      status: "error"
    };
  }

  const selectedPage =
    snapshot.pages.find((page) => page.filePath === selectedFilePath) ?? snapshot.pages[0];
  const files: Record<string, string> = {
    "/src/App.tsx": snapshot.files[selectedFilePath],
    "/src/main.tsx": FIXED_REACT_ENTRY,
    "/src/styles.css": BASE_STYLES
  };

  Object.entries(snapshot.files).forEach(([path, content]) => {
    const sandpackPath = mapSnapshotPathToSandpackPath(path);

    if (sandpackPath) {
      files[sandpackPath] = content;
    }
  });

  return {
    activeFile: "/src/App.tsx",
    boundaryNotice: snapshot.prototypeBoundaryNotice,
    files,
    pagePurpose: selectedPage?.purpose ?? snapshot.summary,
    status: "ready"
  };
}
