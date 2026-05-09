import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/server/db/client";
import { pages, projects } from "@/server/db/schema";
import { projectCreateSchema, type ProjectCreateInput } from "@/schemas/project";

export type ProjectSummary = {
  id: string;
  description: string | null;
  name: string;
  pageCount: number;
  updatedAt: Date;
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

  return rows.map((row) => ({
    ...row,
    pageCount: 0
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
