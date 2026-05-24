import "server-only";

import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/server/db/client";
import {
  conversationMessages,
  generationRequests,
  generationResults,
  pages,
  projects,
  projectVersions,
  quotas
} from "@/server/db/schema";
import type { GenerationRequestRecord } from "@/server/generation/generationRepository";
import { createVersionSnapshot, type GeneratedProject } from "@/schemas/generation";

export async function persistSuccessfulProjectGeneration(input: {
  generatedProject: GeneratedProject;
  initialPrompt: string;
  ownerId: string;
  request: GenerationRequestRecord;
}) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database is not configured");
  }

  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        defaultStyle: input.generatedProject.project.defaultStyle,
        description: input.generatedProject.project.description,
        initialPrompt: input.initialPrompt,
        name: input.generatedProject.project.name,
        ownerId: input.ownerId
      })
      .returning({ id: projects.id });

    if (!project) {
      throw new Error("Project could not be created");
    }

    await tx.insert(pages).values(
      input.generatedProject.pages.map((page, index) => ({
        content: { purpose: page.purpose },
        filePath: page.filePath,
        isHome: page.route === "/" || index === 0,
        name: page.name,
        orderIndex: index,
        projectId: project.id,
        route: page.route
      }))
    );

    const snapshot = createVersionSnapshot(input.generatedProject);
    const [version] = await tx
      .insert(projectVersions)
      .values({
        createdById: input.ownerId,
        projectId: project.id,
        snapshot: snapshot as unknown as Record<string, unknown>,
        summary: input.generatedProject.summary,
        versionNumber: 1
      })
      .returning({ id: projectVersions.id });

    if (!version) {
      throw new Error("Project version could not be created");
    }

    await tx
      .update(projects)
      .set({
        currentVersionId: version.id,
        updatedAt: new Date()
      })
      .where(and(eq(projects.id, project.id), eq(projects.ownerId, input.ownerId)));

    if (input.request) {
      await tx
        .update(generationRequests)
        .set({ projectId: project.id, status: "succeeded" })
        .where(eq(generationRequests.id, input.request.id));

      await tx.insert(generationResults).values({
        requestId: input.request.id,
        result: input.generatedProject as unknown as Record<string, unknown>,
        validationStatus: "valid"
      });
    }

    await tx.insert(conversationMessages).values([
      {
        content: input.initialPrompt,
        projectId: project.id,
        role: "user",
        versionId: version.id
      },
      {
        content: input.generatedProject.summary,
        projectId: project.id,
        role: "assistant",
        versionId: version.id
      }
    ]);

    await tx.insert(quotas).values({
      metadata: { mode: "generate", projectId: project.id, source: "p0-entry" },
      operationType: "generate",
      projectId: project.id,
      units: 1,
      userId: input.ownerId
    });

    return {
      projectId: project.id,
      versionId: version.id
    };
  });
}
