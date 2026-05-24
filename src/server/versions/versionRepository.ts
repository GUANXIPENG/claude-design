import "server-only";

import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/server/db/client";
import { projects, projectVersions } from "@/server/db/schema";
import type { ProjectVersionRecord } from "@/server/versions/versionService";

export type PersistedProjectVersionRecord = ProjectVersionRecord & {
  id: string | null;
};

export async function persistProjectVersion(
  versionRecord: ProjectVersionRecord
): Promise<PersistedProjectVersionRecord> {
  const db = getDatabase();

  if (!db) {
    return {
      ...versionRecord,
      id: null
    };
  }

  const [record] = await db
    .insert(projectVersions)
    .values({
      createdById: versionRecord.createdById,
      projectId: versionRecord.projectId,
      snapshot: versionRecord.snapshot as unknown as Record<string, unknown>,
      summary: versionRecord.summary,
      versionNumber: versionRecord.versionNumber
    })
    .returning({ id: projectVersions.id });

  if (record) {
    await db
      .update(projects)
      .set({
        currentVersionId: record.id,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(projects.id, versionRecord.projectId),
          eq(projects.ownerId, versionRecord.createdById)
        )
      );
  }

  return {
    ...versionRecord,
    id: record?.id ?? null
  };
}
