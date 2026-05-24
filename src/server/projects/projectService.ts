import "server-only";

import { requireCurrentUser } from "@/server/auth/session";
import {
  createProjectForOwner,
  getProjectWorkspaceByOwner,
  listProjectsByOwner,
  type ProjectWorkspaceRecord,
  type ProjectSummary
} from "@/server/projects/projectRepository";
import { projectCreateSchema, type ProjectCreateInput } from "@/schemas/project";

export async function listProjectsForCurrentUser(): Promise<ProjectSummary[]> {
  const user = await requireCurrentUser("/projects");
  return listProjectsByOwner(user.id);
}

export async function createProjectForCurrentUser(input: ProjectCreateInput) {
  const user = await requireCurrentUser("/projects");
  const data = projectCreateSchema.parse(input);

  return createProjectForOwner(user.id, data);
}

export async function getWorkspaceProjectForCurrentUser(
  projectId: string
): Promise<ProjectWorkspaceRecord | null> {
  const user = await requireCurrentUser(`/workspace?projectId=${projectId}`);
  return getProjectWorkspaceByOwner(user.id, projectId);
}
