import "server-only";

import {
  createVersionSnapshot,
  type GeneratedProject,
  type VersionSnapshot
} from "@/schemas/generation";

export type ProjectVersionRecord = {
  createdById: string;
  projectId: string;
  reason: "generate" | "iterate" | "rollback";
  snapshot: VersionSnapshot;
  summary: string;
  versionNumber: number;
};

export function createProjectVersionSnapshot(input: {
  createdById: string;
  generatedProject: GeneratedProject;
  projectId: string;
  reason: "generate" | "iterate";
  versionNumber: number;
}): ProjectVersionRecord {
  return {
    createdById: input.createdById,
    projectId: input.projectId,
    reason: input.reason,
    snapshot: createVersionSnapshot(input.generatedProject),
    summary: input.generatedProject.summary,
    versionNumber: input.versionNumber
  };
}

export function rollbackProjectVersion(input: {
  createdById: string;
  projectId: string;
  targetSnapshot: VersionSnapshot;
  targetVersionNumber: number;
  versionNumber: number;
}): ProjectVersionRecord {
  return {
    createdById: input.createdById,
    projectId: input.projectId,
    reason: "rollback",
    snapshot: input.targetSnapshot,
    summary: `Rolled back to version ${input.targetVersionNumber}.`,
    versionNumber: input.versionNumber
  };
}
