import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { getDatabase } from "@/server/db/client";
import { pages, projects, projectVersions } from "@/server/db/schema";
import {
  validateVersionSnapshot,
  type GeneratedProject,
  type VersionSnapshot
} from "@/schemas/generation";
import { projectCreateSchema, type ProjectCreateInput } from "@/schemas/project";

export type ProjectSummary = {
  id: string;
  description: string | null;
  name: string;
  pageCount: number;
  updatedAt: Date;
};

export type ProjectWorkspaceRecord = {
  currentVersion: {
    id: string;
    snapshot: VersionSnapshot;
    summary: string;
    versionNumber: number;
  } | null;
  project: {
    description: string | null;
    id: string;
    name: string;
    updatedAt: Date;
  };
};

export async function listProjectsByOwner(ownerId: string): Promise<ProjectSummary[]> {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  const rows = await db
    .select({
      description: projects.description,
      id: projects.id,
      name: projects.name,
      updatedAt: projects.updatedAt
    })
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.isArchived, false)))
    .orderBy(desc(projects.updatedAt));

  const projectIds = rows.map((row) => row.id);
  const pageRows =
    projectIds.length > 0
      ? await db
          .select({ projectId: pages.projectId })
          .from(pages)
          .where(inArray(pages.projectId, projectIds))
      : [];
  const pageCounts = pageRows.reduce<Record<string, number>>((counts, page) => {
    counts[page.projectId] = (counts[page.projectId] ?? 0) + 1;
    return counts;
  }, {});

  return rows.map((row) => ({
    ...row,
    pageCount: pageCounts[row.id] ?? 0
  }));
}

export async function createProjectForOwner(ownerId: string, input: ProjectCreateInput) {
  const db = getDatabase();
  const data = projectCreateSchema.parse(input);

  if (!db) {
    throw new Error("Database is not configured");
  }

  const [project] = await db
    .insert(projects)
    .values({
      defaultStyle: data.defaultStyle,
      description: data.description,
      initialPrompt: data.initialPrompt,
      name: data.name,
      ownerId
    })
    .returning();

  if (data.pages.length > 0) {
    await db.insert(pages).values(
      data.pages.map((page) => ({
        filePath: page.filePath,
        isHome: page.isHome,
        name: page.name,
        orderIndex: page.orderIndex,
        projectId: project.id,
        route: page.route
      }))
    );
  }

  return project;
}

export async function createProjectFromGeneratedProject(input: {
  generatedProject: GeneratedProject;
  initialPrompt: string;
  ownerId: string;
}) {
  return createProjectForOwner(input.ownerId, {
    defaultStyle: input.generatedProject.project.defaultStyle,
    description: input.generatedProject.project.description,
    initialPrompt: input.initialPrompt,
    name: input.generatedProject.project.name,
    pages: input.generatedProject.pages.map((page, index) => ({
      filePath: page.filePath,
      isHome: page.route === "/" || index === 0,
      name: page.name,
      orderIndex: index,
      route: page.route
    }))
  });
}

export async function getProjectWorkspaceByOwner(
  ownerId: string,
  projectId: string
): Promise<ProjectWorkspaceRecord | null> {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  const [project] = await db
    .select({
      currentVersionId: projects.currentVersionId,
      description: projects.description,
      id: projects.id,
      name: projects.name,
      updatedAt: projects.updatedAt
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, ownerId),
        eq(projects.isArchived, false)
      )
    )
    .limit(1);

  if (!project) {
    return null;
  }

  const [currentVersion] = project.currentVersionId
    ? await db
        .select({
          id: projectVersions.id,
          snapshot: projectVersions.snapshot,
          summary: projectVersions.summary,
          versionNumber: projectVersions.versionNumber
        })
        .from(projectVersions)
        .where(
          and(
            eq(projectVersions.id, project.currentVersionId),
            eq(projectVersions.projectId, project.id)
          )
        )
        .limit(1)
    : [];

  return {
    currentVersion: currentVersion
      ? {
          id: currentVersion.id,
          snapshot: validateVersionSnapshot(currentVersion.snapshot),
          summary: currentVersion.summary,
          versionNumber: currentVersion.versionNumber
        }
      : null,
    project: {
      description: project.description,
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt
    }
  };
}
