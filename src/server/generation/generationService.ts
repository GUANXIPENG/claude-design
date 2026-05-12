import "server-only";

import type { AiProvider } from "@/server/ai/provider";
import { createMockAiProvider } from "@/server/ai/provider";
import { recordQuotaUsage } from "@/server/quota/quotaService";
import { createProjectVersionSnapshot } from "@/server/versions/versionService";
import {
  sanitizeGeneratedProject,
  type GeneratedProject
} from "@/schemas/generation";

export type GenerationServiceResult = {
  generatedProject: GeneratedProject;
  version: ReturnType<typeof createProjectVersionSnapshot>;
};

export async function generateProjectVersion(input: {
  ownerId: string;
  prompt: string;
  projectId: string;
  provider?: AiProvider;
  versionNumber: number;
}): Promise<GenerationServiceResult> {
  const provider = input.provider ?? createMockAiProvider();
  const generatedProject = sanitizeGeneratedProject(
    await provider.generateProject({ mode: "generate", prompt: input.prompt, projectId: input.projectId })
  );

  await recordQuotaUsage(input.ownerId, {
    metadata: { mode: "generate", projectId: input.projectId },
    operationType: "generate",
    projectId: input.projectId,
    units: 1
  });

  return {
    generatedProject,
    version: createProjectVersionSnapshot({
      createdById: input.ownerId,
      generatedProject,
      projectId: input.projectId,
      reason: "generate",
      versionNumber: input.versionNumber
    })
  };
}

export async function iterateProjectVersion(input: {
  ownerId: string;
  prompt: string;
  projectId: string;
  provider?: AiProvider;
  selectedContext?: string;
  versionNumber: number;
}): Promise<GenerationServiceResult> {
  const provider = input.provider ?? createMockAiProvider();
  const generatedProject = sanitizeGeneratedProject(
    await provider.iterateProject({
      mode: "iterate",
      prompt: input.prompt,
      projectId: input.projectId,
      selectedContext: input.selectedContext
    })
  );

  await recordQuotaUsage(input.ownerId, {
    metadata: { mode: "iterate", projectId: input.projectId, selectedContext: input.selectedContext },
    operationType: "iterate",
    projectId: input.projectId,
    units: 1
  });

  return {
    generatedProject,
    version: createProjectVersionSnapshot({
      createdById: input.ownerId,
      generatedProject,
      projectId: input.projectId,
      reason: "iterate",
      versionNumber: input.versionNumber
    })
  };
}
