import "server-only";

import { recordExportRequest } from "@/server/export/exportRepository";
import { recordQuotaUsage } from "@/server/quota/quotaService";
import { validateGeneratedFilePath, type VersionSnapshot } from "@/schemas/generation";

export type ProjectExportManifest = {
  exportType: "static" | "editable-project";
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
  exportType: "static" | "editable-project";
  ownerId: string;
  projectId: string;
  snapshot: VersionSnapshot;
  versionId?: string | null;
  versionNumber: number;
}): Promise<ProjectExportManifest> {
  const files = Object.entries(input.snapshot.files).map(([filePath, content]) => ({
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
    prototypeBoundaryNotice: input.snapshot.prototypeBoundaryNotice,
    versionId: input.versionId,
    versionNumber: input.versionNumber
  };
}
