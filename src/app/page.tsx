import Link from "next/link";

const phaseItems = [
  "Authenticated project list",
  "P0 generation entry",
  "Persisted workspace snapshot",
  "Pre-Sandpack safety"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-accent">
          P0 generation entry
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          AI Design Workspace
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Create authenticated prototype projects from natural-language prompts,
          persist the validated current version, and continue toward controlled
          Sandpack preview, version rollback, and export.
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
