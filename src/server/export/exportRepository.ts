import "server-only";

import { getDatabase } from "@/server/db/client";
import { exportRecords } from "@/server/db/schema";

export async function recordExportRequest(input: {
  exportType: "static" | "editable-project";
  ownerId: string;
  projectId: string;
  status: "succeeded" | "failed";
  versionId?: string | null;
}) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  const [record] = await db
    .insert(exportRecords)
    .values({
      exportType: input.exportType,
      projectId: input.projectId,
      requestedById: input.ownerId,
      status: input.status,
      versionId: input.versionId
    })
    .returning();

  return record ?? null;
}
