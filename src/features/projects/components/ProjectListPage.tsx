import Link from "next/link";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { createProjectFromPrompt } from "@/server/generation/actions";
import type { ProjectSummary } from "@/server/projects/projectRepository";

type ProjectListPageProps = {
  authUserEmail: string | null;
  errorMessage?: string;
  projectCount: number;
  projects: ProjectSummary[];
};

export function ProjectListPage({
  authUserEmail,
  errorMessage,
  projectCount,
  projects
}: ProjectListPageProps) {
  return (
    <main className="min-h-screen bg-canvas px-6 py-8 text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              Private projects
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Create and reopen front-end prototype projects through the
              server-side generation and persistence boundary.
            </p>
            <p className="mt-2 text-xs text-muted">
              Signed in as {authUserEmail ?? "authenticated user"} / {projectCount} saved projects
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white"
            href="/workspace"
          >
            Open workspace
          </Link>
        </header>

        {errorMessage ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {errorMessage}
          </section>
        ) : null}

        <CreateProjectForm action={createProjectFromPrompt} />

        {projects.length === 0 ? (
          <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold">No saved projects yet</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Generate your first prototype from the form above. A failed request
              will not create a saved project.
            </p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-medium"
              href="/workspace"
            >
              Open authenticated workspace
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article
                className="rounded-lg border border-line bg-white p-5 shadow-sm"
                key={project.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                      Saved prototype
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                    Updated {project.updatedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {project.description ?? "No description yet."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-canvas px-3 py-2">
                    <span className="block text-xs text-muted">Pages</span>
                    <strong>{project.pageCount}</strong>
                  </div>
                  <div className="rounded-md bg-canvas px-3 py-2">
                    <span className="block text-xs text-muted">Versions</span>
                    <strong>1+</strong>
                  </div>
                </div>
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-medium"
                  href={`/workspace?projectId=${project.id}`}
                >
                  Open workspace
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
