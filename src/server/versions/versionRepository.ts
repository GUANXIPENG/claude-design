import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/server/db/client";
import { projects, projectVersions } from "@/server/db/schema";
import {
  rollbackProjectVersion,
  type ProjectVersionRecord
} from "@/server/versions/versionService";
import {
  validateVersionSnapshot,
  type VersionSnapshot
} from "@/schemas/generation";

export type PersistedProjectVersionRecord = ProjectVersionRecord & {
  id: string | null;
};

export type ProjectVersionHistoryRecord = {
  createdAt: Date;
  id: string;
  isCurrent: boolean;
  projectId: string;
  snapshot: VersionSnapshot;
  summary: string;
  versionNumber: number;
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

export async function listProjectVersionsByOwner(
  ownerId: string,
  projectId: string
): Promise<ProjectVersionHistoryRecord[]> {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  const [project] = await db
    .select({
      currentVersionId: projects.currentVersionId,
      id: projects.id
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
    return [];
  }

  const rows = await db
    .select({
      createdAt: projectVersions.createdAt,
      id: projectVersions.id,
      projectId: projectVersions.projectId,
      snapshot: projectVersions.snapshot,
      summary: projectVersions.summary,
      versionNumber: projectVersions.versionNumber
    })
    .from(projectVersions)
    .where(eq(projectVersions.projectId, project.id))
    .orderBy(desc(projectVersions.versionNumber));

  return rows.map((row) => ({
    ...row,
    isCurrent: row.id === project.currentVersionId,
    snapshot: validateVersionSnapshot(row.snapshot)
  }));
}

export async function getProjectVersionByOwner(input: {
  ownerId: string;
  projectId: string;
  versionId: string;
}): Promise<ProjectVersionHistoryRecord | null> {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  const [project] = await db
    .select({
      currentVersionId: projects.currentVersionId,
      id: projects.id
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, input.projectId),
        eq(projects.ownerId, input.ownerId),
        eq(projects.isArchived, false)
      )
    )
    .limit(1);

  if (!project) {
    return null;
  }

  const [version] = await db
    .select({
      createdAt: projectVersions.createdAt,
      id: projectVersions.id,
      projectId: projectVersions.projectId,
      snapshot: projectVersions.snapshot,
      summary: projectVersions.summary,
      versionNumber: projectVersions.versionNumber
    })
    .from(projectVersions)
    .where(
      and(
        eq(projectVersions.projectId, input.projectId),
        eq(projectVersions.id, input.versionId)
      )
    )
    .limit(1);

  return version
    ? {
        ...version,
        isCurrent: version.id === project.currentVersionId,
        snapshot: validateVersionSnapshot(version.snapshot)
      }
    : null;
}

export async function rollbackProjectVersionByOwner(input: {
  ownerId: string;
  projectId: string;
  versionId: string;
}): Promise<PersistedProjectVersionRecord> {
  const [versions, targetVersion] = await Promise.all([
    listProjectVersionsByOwner(input.ownerId, input.projectId),
    getProjectVersionByOwner(input)
  ]);

  if (!targetVersion) {
    throw new Error("Version not found for current user.");
  }

  const latestVersionNumber = versions[0]?.versionNumber ?? 0;
  const rollbackVersionRecord = rollbackProjectVersion({
    createdById: input.ownerId,
    projectId: input.projectId,
    targetSnapshot: targetVersion.snapshot,
    targetVersionNumber: targetVersion.versionNumber,
    versionNumber: latestVersionNumber + 1
  });

  return persistProjectVersion(rollbackVersionRecord);
}
