import Link from "next/link";

const phaseItems = [
  "Fixture project list",
  "Three-panel workspace",
  "Preview and code view",
  "Mock generation states"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Phase 2 front-end loop
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          AI Design Workspace
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          A fixture-driven prototype shell for browsing projects, opening a
          workspace, switching pages, reviewing preview output, and testing mock
          generation states.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-white"
            href="/projects"
          >
            View projects
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-medium"
            href="/workspace"
          >
            Open workspace
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {phaseItems.map((item) => (
            <div
              className="rounded-lg border border-line bg-white/70 px-4 py-3 text-sm shadow-sm"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
