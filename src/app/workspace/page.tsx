import { WorkspacePage } from "@/features/workspace/components/WorkspacePage";
import { requireCurrentUser } from "@/server/auth/session";
import {
  getWorkspaceProjectForCurrentUser,
  listProjectVersionsForCurrentUser
} from "@/server/projects/projectService";

export const dynamic = "force-dynamic";

type WorkspaceRouteProps = {
  searchParams?:
    | Promise<{
        exportError?: string;
        projectId?: string;
        versionError?: string;
        versionRestored?: string;
      }>
    | {
        exportError?: string;
        projectId?: string;
        versionError?: string;
        versionRestored?: string;
      };
};

export default async function WorkspaceRoute({ searchParams }: WorkspaceRouteProps) {
  const user = await requireCurrentUser("/workspace");
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedSearchParams?.projectId;
  const workspaceProject = projectId
    ? await getWorkspaceProjectForCurrentUser(projectId)
    : null;
  const versionHistory = projectId ? await listProjectVersionsForCurrentUser(projectId) : [];
  const serializedWorkspaceProject = workspaceProject
    ? {
        currentVersion: workspaceProject.currentVersion,
        project: {
          ...workspaceProject.project,
          updatedAt: workspaceProject.project.updatedAt.toISOString()
        }
      }
    : null;
  const serializedVersionHistory = versionHistory.map((version) => ({
    ...version,
    createdAt: version.createdAt.toISOString()
  }));
  const versionMessage = resolvedSearchParams?.versionRestored
    ? "Version restored. A new current version was created."
    : resolvedSearchParams?.versionError
      ? "Version restore failed. The current version was not changed."
      : null;
  const exportMessage = resolvedSearchParams?.exportError
    ? "Export failed. The current project and version were not changed."
    : null;

  return (
    <WorkspacePage
      authUserEmail={user.email}
      exportMessage={exportMessage}
      versionHistory={serializedVersionHistory}
      versionMessage={versionMessage}
      workspaceProject={serializedWorkspaceProject}
    />
  );
}
