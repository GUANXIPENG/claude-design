import { z } from "zod";

export const projectPageSchema = z.object({
  filePath: z.string().min(1).optional(),
  isHome: z.boolean().default(false),
  name: z.string().min(1).max(120),
  orderIndex: z.number().int().min(0).default(0),
  route: z.string().min(1).startsWith("/")
});

export const projectVersionSchema = z.object({
  snapshot: z.record(z.unknown()),
  summary: z.string().min(1).max(500),
  versionNumber: z.number().int().positive()
});

export const projectCreateSchema = z.object({
  defaultStyle: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  initialPrompt: z.string().max(4000).optional(),
  name: z.string().min(1).max(120),
  pages: z.array(projectPageSchema).default([])
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
