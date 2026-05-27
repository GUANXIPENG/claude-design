import {
  validateGeneratedFilePath,
  validateVersionSnapshot,
  type VersionSnapshot
} from "@/schemas/generation";
import { createZipArchive, type ZipEntry } from "@/server/export/zipWriter";

export type ProjectExportType = "static" | "editable-project";

export type ProjectExportArchive = {
  fileName: string;
  files: ZipEntry[];
  zipBytes: Uint8Array;
};

type BuildProjectExportArchiveInput = {
  exportType: ProjectExportType;
  projectId: string;
  snapshot: VersionSnapshot;
  versionNumber: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugifyRoute(route: string): string {
  const slug = route
    .replace(/^\/+/, "")
    .replace(/\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "index";
}

function createPrototypeReadme(input: {
  exportType: ProjectExportType;
  snapshot: VersionSnapshot;
  versionNumber: number;
}): string {
  return `# ${input.snapshot.project.name}

Export type: ${input.exportType}
Version: v${input.versionNumber}

${input.snapshot.prototypeBoundaryNotice}

This package is a front-end prototype and development starting point. Buttons,
forms, auth, payment, permissions, and data synchronization are not connected to
real business backends unless implemented separately after export.

Pages:
${input.snapshot.pages.map((page) => `- ${page.name} (${page.route})`).join("\n")}
`;
}

function createStaticIndex(input: {
  snapshot: VersionSnapshot;
  versionNumber: number;
}): string {
  const pageLinks = input.snapshot.pages
    .map(
      (page) =>
        `<li><a href="./pages/${slugifyRoute(page.route)}.html">${escapeHtml(page.name)}</a> - ${escapeHtml(page.route)}</li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.snapshot.project.name)} prototype export</title>
    <style>
      body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #17202a; }
      main { max-width: 920px; margin: 0 auto; padding: 40px 20px; }
      .notice { border: 1px solid #d9e0e8; background: #fff; border-radius: 8px; padding: 16px; }
      a { color: #2457a6; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(input.snapshot.project.name)}</h1>
      <p>Version v${input.versionNumber} static prototype export.</p>
      <div class="notice">${escapeHtml(input.snapshot.prototypeBoundaryNotice)}</div>
      <h2>Pages</h2>
      <ul>
        ${pageLinks}
      </ul>
    </main>
  </body>
</html>
`;
}

function createStaticPage(input: {
  fileContent: string;
  pageName: string;
  purpose: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.pageName)}</title>
    <style>
      body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #17202a; }
      main { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
      pre { overflow: auto; border-radius: 8px; background: #17202a; color: #e6edf3; padding: 16px; }
    </style>
  </head>
  <body>
    <main>
      <a href="../index.html">Back to index</a>
      <h1>${escapeHtml(input.pageName)}</h1>
      <p>${escapeHtml(input.purpose)}</p>
      <pre><code>${escapeHtml(input.fileContent)}</code></pre>
    </main>
  </body>
</html>
`;
}

function buildStaticFiles(input: {
  snapshot: VersionSnapshot;
  versionNumber: number;
}): ZipEntry[] {
  const sourceFiles = Object.entries(input.snapshot.files).map(([filePath, content]) => ({
    content,
    path: `prototype-files/${validateGeneratedFilePath(filePath)}`
  }));
  const pageFiles = input.snapshot.pages.map((page) => ({
    content: createStaticPage({
      fileContent: input.snapshot.files[page.filePath] ?? "",
      pageName: page.name,
      purpose: page.purpose
    }),
    path: `pages/${slugifyRoute(page.route)}.html`
  }));

  return [
    {
      content: createPrototypeReadme({
        exportType: "static",
        snapshot: input.snapshot,
        versionNumber: input.versionNumber
      }),
      path: "README.md"
    },
    {
      content: createStaticIndex(input),
      path: "index.html"
    },
    ...pageFiles,
    ...sourceFiles
  ];
}

function buildEditableProjectFiles(input: {
  snapshot: VersionSnapshot;
  versionNumber: number;
}): ZipEntry[] {
  const snapshotFiles = Object.entries(input.snapshot.files).map(([filePath, content]) => ({
    content,
    path:
      validateGeneratedFilePath(filePath) === "README.md"
        ? "prototype-source/README.generated.md"
        : validateGeneratedFilePath(filePath)
  }));

  return [
    {
      content: createPrototypeReadme({
        exportType: "editable-project",
        snapshot: input.snapshot,
        versionNumber: input.versionNumber
      }),
      path: "README.md"
    },
    {
      content: JSON.stringify(
        {
          navigation: input.snapshot.navigation,
          pages: input.snapshot.pages,
          project: input.snapshot.project,
          summary: input.snapshot.summary,
          versionNumber: input.versionNumber
        },
        null,
        2
      ),
      path: "prototype-manifest.json"
    },
    ...snapshotFiles
  ];
}

export function buildProjectExportArchive(
  input: BuildProjectExportArchiveInput
): ProjectExportArchive {
  const snapshot = validateVersionSnapshot(input.snapshot);
  const files =
    input.exportType === "static"
      ? buildStaticFiles({ snapshot, versionNumber: input.versionNumber })
      : buildEditableProjectFiles({ snapshot, versionNumber: input.versionNumber });
  const fileName = `${input.projectId}-v${input.versionNumber}-${input.exportType}.zip`;

  return {
    fileName,
    files,
    zipBytes: createZipArchive(files)
  };
}
