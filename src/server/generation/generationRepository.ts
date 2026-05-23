import "server-only";

import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { getDatabase } from "@/server/db/client";
import { generationRequests, generationResults } from "@/server/db/schema";
import type { GeneratedProject, GenerationMode } from "@/schemas/generation";

export type GenerationRequestRecord = {
  id: string;
} | null;

export async function createGenerationRequestRecord(input: {
  mode: Extract<GenerationMode, "generate" | "iterate">;
  ownerId: string;
  projectId?: string | null;
  prompt: string;
}): Promise<GenerationRequestRecord> {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  const [record] = await db
    .insert(generationRequests)
    .values({
      mode: input.mode,
      projectId: input.projectId ?? null,
      prompt: input.prompt,
      requestedById: input.ownerId,
      status: "running"
    })
    .returning({ id: generationRequests.id });

  return record ?? null;
}

export async function attachGenerationRequestToProject(input: {
  projectId: string;
  request: GenerationRequestRecord;
}) {
  const db = getDatabase();

  if (!db || !input.request) {
    return null;
  }

  const [record] = await db
    .update(generationRequests)
    .set({ projectId: input.projectId })
    .where(eq(generationRequests.id, input.request.id))
    .returning({ id: generationRequests.id });

  return record ?? null;
}

export async function markGenerationRequestSucceeded(input: {
  generatedProject: GeneratedProject;
  request: GenerationRequestRecord;
}) {
  const db = getDatabase();

  if (!db || !input.request) {
    return null;
  }

  await db
    .update(generationRequests)
    .set({ status: "succeeded" })
    .where(eq(generationRequests.id, input.request.id));

  const [record] = await db
    .insert(generationResults)
    .values({
      requestId: input.request.id,
      result: input.generatedProject as unknown as Record<string, unknown>,
      validationStatus: "valid"
    })
    .returning();

  return record ?? null;
}

export async function markGenerationRequestFailed(input: {
  error: unknown;
  request: GenerationRequestRecord;
}) {
  const db = getDatabase();

  if (!db || !input.request) {
    return null;
  }

  await db
    .update(generationRequests)
    .set({ status: "failed" })
    .where(eq(generationRequests.id, input.request.id));

  const [record] = await db
    .insert(generationResults)
    .values({
      errorMessage: sanitizePersistenceErrorMessage(input.error),
      requestId: input.request.id,
      validationStatus: "invalid"
    })
    .returning();

  return record ?? null;
}

export function sanitizePersistenceErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return "validation_failed";
  }

  if (error instanceof Error) {
    if (/path|schema|json|validation|parse/i.test(error.message)) {
      return "validation_failed";
    }

    if (/database|project|version|quota|conversation|persist/i.test(error.message)) {
      return "persistence_failed";
    }

    return "provider_failed";
  }

  return "generation_failed";
}
