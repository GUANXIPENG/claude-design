import "server-only";

import type { AiProvider } from "@/server/ai/provider";
import { createMockAiProvider } from "@/server/ai/provider";
import { recordGenerationConversation } from "@/server/conversations/conversationRepository";
import {
  createGenerationRequestRecord,
  markGenerationRequestFailed,
  markGenerationRequestSucceeded
} from "@/server/generation/generationRepository";
import { recordQuotaUsage } from "@/server/quota/quotaService";
import {
  persistProjectVersion,
  type PersistedProjectVersionRecord
} from "@/server/versions/versionRepository";
import { createProjectVersionSnapshot } from "@/server/versions/versionService";
import {
  sanitizeGeneratedProject,
  validateGenerationPrompt,
  type GeneratedProject
} from "@/schemas/generation";

export type GenerationServiceResult = {
  generatedProject: GeneratedProject;
  version: PersistedProjectVersionRecord;
};

export async function generateProjectVersion(input: {
  ownerId: string;
  prompt: string;
  projectId: string;
  provider?: AiProvider;
  versionNumber: number;
}): Promise<GenerationServiceResult> {
  const prompt = validateGenerationPrompt(input.prompt);
  const provider = input.provider ?? createMockAiProvider();
  const request = await createGenerationRequestRecord({
    mode: "generate",
    ownerId: input.ownerId,
    projectId: input.projectId,
    prompt
  });

  try {
    const generatedProject = sanitizeGeneratedProject(
      await provider.generateProject({
        mode: "generate",
        prompt,
        projectId: input.projectId
      })
    );

    const version = createProjectVersionSnapshot({
      createdById: input.ownerId,
      generatedProject,
      projectId: input.projectId,
      reason: "generate",
      versionNumber: input.versionNumber
    });
    const persistedVersion = await persistProjectVersion(version);

    await markGenerationRequestSucceeded({ generatedProject, request });
    await recordGenerationConversation({
      assistantSummary: generatedProject.summary,
      projectId: input.projectId,
      userPrompt: prompt,
      versionId: persistedVersion.id
    });
    await recordQuotaUsage(input.ownerId, {
      metadata: { mode: "generate", projectId: input.projectId },
      operationType: "generate",
      projectId: input.projectId,
      units: 1
    });

    return {
      generatedProject,
      version: persistedVersion
    };
  } catch (error) {
    await markGenerationRequestFailed({ error, request });
    throw error;
  }
}

export async function iterateProjectVersion(input: {
  ownerId: string;
  prompt: string;
  projectId: string;
  provider?: AiProvider;
  selectedContext?: string;
  versionNumber: number;
}): Promise<GenerationServiceResult> {
  const prompt = validateGenerationPrompt(input.prompt);
  const provider = input.provider ?? createMockAiProvider();
  const request = await createGenerationRequestRecord({
    mode: "iterate",
    ownerId: input.ownerId,
    projectId: input.projectId,
    prompt
  });

  try {
    const generatedProject = sanitizeGeneratedProject(
      await provider.iterateProject({
        mode: "iterate",
        prompt,
        projectId: input.projectId,
        selectedContext: input.selectedContext
      })
    );

    const version = createProjectVersionSnapshot({
      createdById: input.ownerId,
      generatedProject,
      projectId: input.projectId,
      reason: "iterate",
      versionNumber: input.versionNumber
    });
    const persistedVersion = await persistProjectVersion(version);

    await markGenerationRequestSucceeded({ generatedProject, request });
    await recordGenerationConversation({
      assistantSummary: generatedProject.summary,
      projectId: input.projectId,
      userPrompt: prompt,
      versionId: persistedVersion.id
    });
    await recordQuotaUsage(input.ownerId, {
      metadata: { mode: "iterate", projectId: input.projectId, selectedContext: input.selectedContext },
      operationType: "iterate",
      projectId: input.projectId,
      units: 1
    });

    return {
      generatedProject,
      version: persistedVersion
    };
  } catch (error) {
    await markGenerationRequestFailed({ error, request });
    throw error;
  }
}
