import { z } from "zod";

export const quotaOperationSchema = z.enum(["generate", "iterate", "repair", "export"]);

export const quotaUsageSchema = z.object({
  metadata: z.record(z.unknown()).default({}),
  operationType: quotaOperationSchema,
  projectId: z.string().uuid().optional(),
  units: z.number().int().positive().default(1)
});

export type QuotaUsageInput = z.infer<typeof quotaUsageSchema>;
