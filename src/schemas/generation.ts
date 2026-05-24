import { z } from "zod";

export const generationModeSchema = z.enum(["generate", "iterate", "repair", "explain"]);

export const generatedPageSchema = z.object({
  filePath: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  route: z.string().min(1).startsWith("/")
});

export const generatedFileSchema = z.object({
  content: z.string().min(1),
  path: z.string().min(1)
});

export const generatedProjectSchema = z.object({
  files: z.array(generatedFileSchema).min(1),
  mode: generationModeSchema,
  navigation: z.array(
    z.object({
      from: z.string().min(1),
      label: z.string().min(1),
      to: z.string().min(1)
    })
  ),
  pages: z.array(generatedPageSchema).min(1),
  project: z.object({
    defaultStyle: z.string().min(1),
    description: z.string().min(1),
    name: z.string().min(1)
  }),
  summary: z.string().min(1),
  warnings: z.array(z.string()).default([])
});

export const versionSnapshotSchema = z.object({
  files: z.record(z.string().min(1), z.string().min(1)),
  navigation: generatedProjectSchema.shape.navigation,
  pages: z.array(generatedPageSchema).min(1),
  project: generatedProjectSchema.shape.project,
  prototypeBoundaryNotice: z.string().min(1),
  summary: z.string().min(1)
});

export type GenerationMode = z.infer<typeof generationModeSchema>;
export type GeneratedProject = z.infer<typeof generatedProjectSchema>;
export type VersionSnapshot = z.infer<typeof versionSnapshotSchema>;

const ALLOWED_FILE_EXTENSIONS = [".tsx", ".ts", ".css", ".md"];
const ALLOWED_FILE_PREFIXES = ["app/", "components/", "styles/", "public/", "README.md"];

export const FORBIDDEN_FILE_PATTERNS = [
  ".env",
  "..",
  "\\",
  ".sh",
  ".bash",
  ".cmd",
  ".ps1",
  "actions.ts",
  "actions.tsx",
  "action.ts",
  "action.tsx",
  "middleware.ts",
  "middleware.tsx",
  "package.json",
  "route.ts",
  "route.tsx",
  "server/",
  "src/server/",
  "node_modules/",
  ".git/",
  "drizzle.config",
  "supabase"
];

export function validateGeneratedFilePath(filePath: string): string {
  const normalizedPath = filePath.trim().replaceAll("\\", "/");
  const lowerPath = normalizedPath.toLowerCase();

  if (!normalizedPath || normalizedPath.startsWith("/") || /^[a-z]:/i.test(normalizedPath)) {
    throw new Error(`Generated file path is not allowed: ${filePath}`);
  }

  const forbiddenPattern = FORBIDDEN_FILE_PATTERNS.find((pattern) =>
    lowerPath.includes(pattern.toLowerCase())
  );

  if (forbiddenPattern) {
    throw new Error(`Generated file path contains forbidden pattern: ${forbiddenPattern}`);
  }

  const hasAllowedPrefix = ALLOWED_FILE_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(prefix)
  );
  const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((extension) =>
    lowerPath.endsWith(extension)
  );

  if (!hasAllowedPrefix || !hasAllowedExtension) {
    throw new Error(`Generated file path is outside the Phase 4 allowlist: ${filePath}`);
  }

  if (lowerPath.startsWith("app/") && !lowerPath.endsWith("/page.tsx") && lowerPath !== "app/page.tsx") {
    throw new Error(`Generated app file path must be a front-end page: ${filePath}`);
  }

  if (lowerPath.startsWith("components/") && !lowerPath.endsWith(".tsx")) {
    throw new Error(`Generated component path must be a TSX component: ${filePath}`);
  }

  if (lowerPath.startsWith("styles/") && !lowerPath.endsWith(".css")) {
    throw new Error(`Generated style path must be CSS: ${filePath}`);
  }

  return normalizedPath;
}

export function sanitizeGeneratedProject(input: unknown): GeneratedProject {
  const project = generatedProjectSchema.parse(input);
  const seenPaths = new Set<string>();

  project.files.forEach((file) => {
    const safePath = validateGeneratedFilePath(file.path);

    if (seenPaths.has(safePath)) {
      throw new Error(`Generated file path is duplicated: ${safePath}`);
    }

    seenPaths.add(safePath);
  });

  project.pages.forEach((page) => {
    validateGeneratedFilePath(page.filePath);

    if (!seenPaths.has(page.filePath)) {
      throw new Error(`Generated page references a missing file: ${page.filePath}`);
    }
  });

  return project;
}

export function createVersionSnapshot(project: GeneratedProject): VersionSnapshot {
  return versionSnapshotSchema.parse({
    files: Object.fromEntries(project.files.map((file) => [file.path, file.content])),
    navigation: project.navigation,
    pages: project.pages,
    project: project.project,
    prototypeBoundaryNotice:
      "This export is a front-end prototype and development starting point. It does not include real backend, payment, auth, or data synchronization logic.",
    summary: project.summary
  });
}

export function validateVersionSnapshot(input: unknown): VersionSnapshot {
  const snapshot = versionSnapshotSchema.parse(input);
  const safeFilePaths = new Set<string>();

  Object.keys(snapshot.files).forEach((filePath) => {
    const safePath = validateGeneratedFilePath(filePath);
    safeFilePaths.add(safePath);
  });

  snapshot.pages.forEach((page) => {
    const safePagePath = validateGeneratedFilePath(page.filePath);

    if (!safeFilePaths.has(safePagePath)) {
      throw new Error(`Generated page references a missing file: ${safePagePath}`);
    }
  });

  return snapshot;
}
