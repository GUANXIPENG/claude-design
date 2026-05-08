import Link from "next/link";

export default function LoginPlaceholderPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-12 text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              Login placeholder
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Lightweight account boundary is reserved for Phase 3.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Phase 2 keeps this page as a visible route only. No Supabase Auth,
              session handling, private project access, or quota persistence is
              implemented here.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm"
              disabled
              id="email"
              placeholder="Phase 3"
              type="email"
            />
            <button
              className="mt-4 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white opacity-70"
              disabled
              type="button"
            >
              Continue in Phase 3
            </button>
            <Link
              className="mt-4 inline-flex text-sm font-medium text-accent"
              href="/projects"
            >
              Continue to fixture projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
