import { signInWithEmail, signOut } from "@/server/auth/actions";
import { sanitizeReturnTo } from "@/server/auth/returnTo";
import { getCurrentUser, hasSupabaseAuthConfig } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = getParam(params, "error");
  const sent = getParam(params, "sent");
  const returnTo = sanitizeReturnTo(getParam(params, "returnTo"));
  const user = await getCurrentUser();
  const isConfigured = hasSupabaseAuthConfig();

  return (
    <main className="min-h-screen bg-canvas px-6 py-12 text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              Supabase Auth
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Sign in to access private prototype projects.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              The lightweight account boundary protects project ownership,
              private project access, database persistence, quota records, and
              server-side generation. Version UI, zip export, and API/E2E
              hardening remain later MVP stages.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            {user ? (
              <form action={signOut}>
                <p className="text-sm font-medium">Signed in</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {user.email ?? "Authenticated user"}
                </p>
                <button
                  className="mt-4 w-full rounded-md border border-line px-4 py-3 text-sm font-medium"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <form action={signInWithEmail}>
                <input name="returnTo" type="hidden" value={returnTo} />
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                />
                <button
                  className="mt-4 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white"
                  type="submit"
                >
                  Send login link
                </button>
              </form>
            )}

            {!isConfigured ? (
              <p className="mt-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
                Supabase environment variables are missing. Configure
                NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before
                real login can succeed.
              </p>
            ) : null}
            {sent ? (
              <p className="mt-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
                Check your email for the login link.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
