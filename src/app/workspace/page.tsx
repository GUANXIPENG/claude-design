import { WorkspacePage } from "@/features/workspace/components/WorkspacePage";
import { requireCurrentUser } from "@/server/auth/session";
import { getWorkspaceProjectForCurrentUser } from "@/server/projects/projectService";

export const dynamic = "force-dynamic";

type WorkspaceRouteProps = {
  searchParams?: Promise<{ projectId?: string }> | { projectId?: string };
};

export default async function WorkspaceRoute({ searchParams }: WorkspaceRouteProps) {
  const user = await requireCurrentUser("/workspace");
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedSearchParams?.projectId;
  const workspaceProject = projectId
    ? await getWorkspaceProjectForCurrentUser(projectId)
    : null;
  const serializedWorkspaceProject = workspaceProject
    ? {
        currentVersion: workspaceProject.currentVersion,
        project: {
          ...workspaceProject.project,
          updatedAt: workspaceProject.project.updatedAt.toISOString()
        }
      }
    : null;

  return (
    <WorkspacePage
      authUserEmail={user.email}
      workspaceProject={serializedWorkspaceProject}
    />
  );
}
