import "server-only";

import {
  buildProjectExportArchive,
  type ProjectExportArchive,
  type ProjectExportType
} from "@/server/export/exportArchive";
import { recordExportRequest } from "@/server/export/exportRepository";
import { recordQuotaUsage } from "@/server/quota/quotaService";
import {
  validateGeneratedFilePath,
  validateVersionSnapshot,
  type VersionSnapshot
} from "@/schemas/generation";

export type { ProjectExportArchive, ProjectExportType } from "@/server/export/exportArchive";

export type ProjectExportManifest = {
  exportType: ProjectExportType;
  files: Array<{
    content: string;
    path: string;
  }>;
  projectId: string;
  prototypeBoundaryNotice: string;
  versionId?: string | null;
  versionNumber: number;
};

export async function prepareProjectExport(input: {
  exportType: ProjectExportType;
  ownerId: string;
  projectId: string;
  snapshot: VersionSnapshot;
  versionId?: string | null;
  versionNumber: number;
}): Promise<ProjectExportManifest> {
  const snapshot = validateVersionSnapshot(input.snapshot);
  const files = Object.entries(snapshot.files).map(([filePath, content]) => ({
    content,
    path: validateGeneratedFilePath(filePath)
  }));

  await recordQuotaUsage(input.ownerId, {
    metadata: { exportType: input.exportType, versionNumber: input.versionNumber },
    operationType: "export",
    projectId: input.projectId,
    units: 1
  });
  await recordExportRequest({
    exportType: input.exportType,
    ownerId: input.ownerId,
    projectId: input.projectId,
    status: "succeeded",
    versionId: input.versionId
  });

  return {
    exportType: input.exportType,
    files,
    projectId: input.projectId,
    prototypeBoundaryNotice: snapshot.prototypeBoundaryNotice,
    versionId: input.versionId,
    versionNumber: input.versionNumber
  };
}

export async function createProjectExportZip(input: {
  exportType: ProjectExportType;
  ownerId: string;
  projectId: string;
  snapshot: VersionSnapshot;
  versionId?: string | null;
  versionNumber: number;
}): Promise<ProjectExportArchive> {
  const archive = buildProjectExportArchive({
    exportType: input.exportType,
    projectId: input.projectId,
    snapshot: input.snapshot,
    versionNumber: input.versionNumber
  });

  await recordQuotaUsage(input.ownerId, {
    metadata: { exportType: input.exportType, versionNumber: input.versionNumber },
    operationType: "export",
    projectId: input.projectId,
    units: 1
  });
  await recordExportRequest({
    exportType: input.exportType,
    ownerId: input.ownerId,
    projectId: input.projectId,
    status: "succeeded",
    versionId: input.versionId
  });

  return archive;
}
