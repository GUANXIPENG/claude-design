import "server-only";

import { getDatabase } from "@/server/db/client";
import { quotas } from "@/server/db/schema";
import { quotaUsageSchema, type QuotaUsageInput } from "@/schemas/quota";

export async function recordQuotaUsage(ownerId: string, input: QuotaUsageInput) {
  const db = getDatabase();
  const data = quotaUsageSchema.parse(input);

  if (!db) {
    return null;
  }

  const [record] = await db
    .insert(quotas)
    .values({
      metadata: data.metadata,
      operationType: data.operationType,
      projectId: data.projectId,
      units: data.units,
      userId: ownerId
    })
    .returning();

  return record;
}
