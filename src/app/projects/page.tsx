import { ProjectListPage } from "@/features/projects/components/ProjectListPage";
import { requireCurrentUser } from "@/server/auth/session";
import { listProjectsForCurrentUser } from "@/server/projects/projectService";

export const dynamic = "force-dynamic";

type ProjectsRouteProps = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

export default async function ProjectsRoute({ searchParams }: ProjectsRouteProps) {
  const user = await requireCurrentUser("/projects");
  const resolvedSearchParams = await searchParams;
  const projects = await listProjectsForCurrentUser();

  return (
    <ProjectListPage
      authUserEmail={user.email}
      errorMessage={resolvedSearchParams?.error}
      projectCount={projects.length}
      projects={projects}
    />
  );
}
