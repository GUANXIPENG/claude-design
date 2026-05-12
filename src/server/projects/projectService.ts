import "server-only";

import { requireCurrentUser } from "@/server/auth/session";
import {
  createProjectForOwner,
  listProjectsByOwner,
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
