import "server-only";

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
  versionNumber: number;
};

export async function prepareProjectExport(input: {
  exportType: "static" | "editable-project";
  ownerId: string;
  projectId: string;
  snapshot: VersionSnapshot;
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

  return {
    exportType: input.exportType,
    files,
    projectId: input.projectId,
    prototypeBoundaryNotice: input.snapshot.prototypeBoundaryNotice,
    versionNumber: input.versionNumber
  };
}
