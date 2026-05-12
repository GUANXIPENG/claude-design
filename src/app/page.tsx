const scaffoldItems = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind CSS",
  "Server-only AI and data boundaries",
  "Vitest and Playwright ready testing path"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Phase 1 scaffold
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          AI Design Workspace
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          A minimal runnable foundation for the multi-page AI design prototype
          workspace described in the product and architecture docs.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {scaffoldItems.map((item) => (
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
