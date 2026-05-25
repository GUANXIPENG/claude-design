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

export const MAX_GENERATION_PROMPT_LENGTH = 4000;
export const MAX_GENERATED_FILES = 30;
export const MAX_GENERATED_FILE_BYTES = 200 * 1024;
export const MAX_GENERATED_TOTAL_BYTES = 1024 * 1024;

export const generationPromptSchema = z
  .string()
  .trim()
  .min(1, "Generation prompt is required.")
  .max(
    MAX_GENERATION_PROMPT_LENGTH,
    `Generation prompt must be ${MAX_GENERATION_PROMPT_LENGTH} characters or fewer.`
  );

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

export function validateGenerationPrompt(input: unknown): string {
  return generationPromptSchema.parse(input);
}

function normalizeGeneratedFilePath(filePath: string): string {
  let normalizedPath = filePath.trim().replaceAll("\\", "/").replace(/\/+/g, "/");

  while (normalizedPath.startsWith("./")) {
    normalizedPath = normalizedPath.slice(2);
  }

  return normalizedPath;
}

function getContentByteLength(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

function assertGeneratedFileLimits(files: Array<{ content: string; path: string }>): void {
  if (files.length > MAX_GENERATED_FILES) {
    throw new Error(`Generated project cannot contain more than ${MAX_GENERATED_FILES} files.`);
  }

  let totalBytes = 0;

  files.forEach((file) => {
    const byteLength = getContentByteLength(file.content);

    if (byteLength > MAX_GENERATED_FILE_BYTES) {
      throw new Error("Generated file exceeds the 200KB per-file limit.");
    }

    totalBytes += byteLength;
  });

  if (totalBytes > MAX_GENERATED_TOTAL_BYTES) {
    throw new Error("Generated project exceeds the 1MB total file limit.");
  }
}

export function validateGeneratedFilePath(filePath: string): string {
  const normalizedPath = normalizeGeneratedFilePath(filePath);
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
  const files = project.files.map((file) => {
    const safePath = validateGeneratedFilePath(file.path);

    if (seenPaths.has(safePath)) {
      throw new Error(`Generated file path is duplicated: ${safePath}`);
    }

    seenPaths.add(safePath);

    return {
      ...file,
      path: safePath
    };
  });
  assertGeneratedFileLimits(files);

  const pages = project.pages.map((page) => {
    const safePagePath = validateGeneratedFilePath(page.filePath);

    if (!seenPaths.has(safePagePath)) {
      throw new Error(`Generated page references a missing file: ${safePagePath}`);
    }

    return {
      ...page,
      filePath: safePagePath
    };
  });

  return generatedProjectSchema.parse({
    ...project,
    files,
    pages
  });
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
  const files = Object.entries(snapshot.files).map(([filePath, content]) => {
    const safePath = validateGeneratedFilePath(filePath);

    if (safeFilePaths.has(safePath)) {
      throw new Error(`Generated file path is duplicated: ${safePath}`);
    }

    safeFilePaths.add(safePath);

    return {
      content,
      path: safePath
    };
  });
  assertGeneratedFileLimits(files);

  const pages = snapshot.pages.map((page) => {
    const safePagePath = validateGeneratedFilePath(page.filePath);

    if (!safeFilePaths.has(safePagePath)) {
      throw new Error(`Generated page references a missing file: ${safePagePath}`);
    }

    return {
      ...page,
      filePath: safePagePath
    };
  });

  return versionSnapshotSchema.parse({
    ...snapshot,
    files: Object.fromEntries(files.map((file) => [file.path, file.content])),
    pages
  });
}
