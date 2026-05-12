import Link from "next/link";
import { fixtureProjects } from "@/lib/fixtures/workspace";

export function ProjectListPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-8 text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              Mock data
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Phase 2 uses fixture projects to validate the front-end loop. These
              cards are not loaded from Supabase and do not represent real saved
              projects.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white"
            href="/workspace"
          >
            New fixture project
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {fixtureProjects.map((project) => (
            <article
              className="rounded-lg border border-line bg-white p-5 shadow-sm"
              key={project.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                    {project.status}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                  Updated {project.updatedAt}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{project.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-canvas px-3 py-2">
                  <span className="block text-xs text-muted">Pages</span>
                  <strong>{project.pageCount}</strong>
                </div>
                <div className="rounded-md bg-canvas px-3 py-2">
                  <span className="block text-xs text-muted">Versions</span>
                  <strong>{project.versionCount}</strong>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted">{project.note}</p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-medium"
                href="/workspace"
              >
                Open workspace
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
