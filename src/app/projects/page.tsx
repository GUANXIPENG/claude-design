import { ProjectListPage } from "@/features/projects/components/ProjectListPage";
import { requireCurrentUser } from "@/server/auth/session";
import { listProjectsForCurrentUser } from "@/server/projects/projectService";

export const dynamic = "force-dynamic";

export default async function ProjectsRoute() {
  const user = await requireCurrentUser("/projects");
  const projects = await listProjectsForCurrentUser();

  return (
    <ProjectListPage
      authUserEmail={user.email}
      projectCount={projects.length}
      projects={projects}
    />
  );
}
