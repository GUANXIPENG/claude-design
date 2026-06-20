import "server-only";

import { requireCurrentUser } from "@/server/auth/session";
import {
  createProjectExportZip,
  type ProjectExportArchive,
  type ProjectExportType
} from "@/server/export/exportService";
import {
  createProjectForOwner,
  getProjectWorkspaceByOwner,
  listProjectsByOwner,
  type ProjectWorkspaceRecord,
  type ProjectSummary
} from "@/server/projects/projectRepository";
import {
  getProjectVersionByOwner,
  listProjectVersionsByOwner,
  rollbackProjectVersionByOwner,
  type ProjectVersionHistoryRecord
} from "@/server/versions/versionRepository";
import { projectCreateSchema, type ProjectCreateInput } from "@/schemas/project";

export async function listProjectsForCurrentUser(): Promise<ProjectSummary[]> {
  const user = await requireCurrentUser("/projects");
  return listProjectsByOwner(user.id);
}

export async function createProjectForCurrentUser(input: ProjectCreateInput) {
  const user = await requireCurrentUser("/projects");
  const data = projectCreateSchema.parse(input);

  return createProjectForOwner(user.id, data);
}

export async function getWorkspaceProjectForCurrentUser(
  projectId: string
): Promise<ProjectWorkspaceRecord | null> {
  const user = await requireCurrentUser(`/workspace?projectId=${projectId}`);
  return getProjectWorkspaceByOwner(user.id, projectId);
}

export async function listProjectVersionsForCurrentUser(
  projectId: string
): Promise<ProjectVersionHistoryRecord[]> {
  const user = await requireCurrentUser(`/workspace?projectId=${projectId}`);
  return listProjectVersionsByOwner(user.id, projectId);
}

export async function rollbackProjectVersionForCurrentUser(input: {
  projectId: string;
  versionId: string;
}) {
  const user = await requireCurrentUser(`/workspace?projectId=${input.projectId}`);

  return rollbackProjectVersionByOwner({
    ownerId: user.id,
    projectId: input.projectId,
    versionId: input.versionId
  });
}

export async function exportProjectVersionForCurrentUser(input: {
  exportType: ProjectExportType;
  projectId: string;
  versionId?: string | null;
}): Promise<ProjectExportArchive> {
  const user = await requireCurrentUser(`/workspace?projectId=${input.projectId}`);
  const version = input.versionId
    ? await getProjectVersionByOwner({
        ownerId: user.id,
        projectId: input.projectId,
        versionId: input.versionId
      })
    : (await getProjectWorkspaceByOwner(user.id, input.projectId))?.currentVersion;

  if (!version) {
    throw new Error("Export version not found for current user.");
  }

  return createProjectExportZip({
    exportType: input.exportType,
    ownerId: user.id,
    projectId: input.projectId,
    snapshot: version.snapshot,
    versionId: version.id,
    versionNumber: version.versionNumber
  });
}
