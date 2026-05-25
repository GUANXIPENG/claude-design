import "server-only";

import type { AiProvider } from "@/server/ai/provider";
import { createOpenAiResponsesProvider } from "@/server/ai/openaiProvider";
import {
  createGenerationRequestRecord,
  markGenerationRequestFailed,
  type GenerationRequestRecord
} from "@/server/generation/generationRepository";
import { persistSuccessfulProjectGeneration } from "@/server/generation/projectGenerationRepository";
import {
  sanitizeGeneratedProject,
  validateGenerationPrompt,
  type GeneratedProject
} from "@/schemas/generation";

export type ProjectGenerationResult = {
  generatedProject: GeneratedProject;
  projectId: string;
  versionId: string | null;
};

type ProjectGenerationPersistence = {
  createGenerationRequest(input: {
    mode: "generate";
    ownerId: string;
    projectId: null;
    prompt: string;
  }): Promise<GenerationRequestRecord>;
  markGenerationFailed(input: {
    error: unknown;
    request: GenerationRequestRecord;
  }): Promise<unknown>;
  persistSuccessfulGeneration(input: {
    generatedProject: GeneratedProject;
    initialPrompt: string;
    ownerId: string;
    request: GenerationRequestRecord;
  }): Promise<{ projectId: string; versionId: string | null }>;
};

const defaultProjectGenerationPersistence: ProjectGenerationPersistence = {
  createGenerationRequest: createGenerationRequestRecord,
  markGenerationFailed: markGenerationRequestFailed,
  persistSuccessfulGeneration: persistSuccessfulProjectGeneration
};

export async function createProjectFromPrompt(input: {
  ownerId: string;
  persistence?: ProjectGenerationPersistence;
  prompt: string;
  provider?: AiProvider;
}): Promise<ProjectGenerationResult> {
  const prompt = validateGenerationPrompt(input.prompt);

  const provider = input.provider ?? createOpenAiResponsesProvider();
  const persistence = input.persistence ?? defaultProjectGenerationPersistence;
  const request = await persistence.createGenerationRequest({
    mode: "generate",
    ownerId: input.ownerId,
    projectId: null,
    prompt
  });

  try {
    const generatedProject = sanitizeGeneratedProject(
      await provider.generateProject({
        mode: "generate",
        prompt
      })
    );
    const persistedGeneration = await persistence.persistSuccessfulGeneration({
      generatedProject,
      initialPrompt: prompt,
      ownerId: input.ownerId,
      request
    });

    return {
      generatedProject,
      projectId: persistedGeneration.projectId,
      versionId: persistedGeneration.versionId
    };
  } catch (error) {
    await persistence.markGenerationFailed({ error, request });
    throw error;
  }
}
