"use server";

import { redirect } from "next/navigation";
import { sanitizeReturnTo } from "@/server/auth/returnTo";
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/server/auth/session";

function getReturnTo(formData: FormData) {
  return sanitizeReturnTo(formData.get("returnTo"));
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const returnTo = getReturnTo(formData);

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Email is required")}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (!hasSupabaseAuthConfig()) {
    redirect(
      `/login?error=${encodeURIComponent("Supabase Auth is not configured")}&returnTo=${encodeURIComponent(returnTo)}`
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/login?error=${encodeURIComponent("Supabase Auth is not configured")}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Unable to send login link")}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  redirect(`/login?sent=1&returnTo=${encodeURIComponent(returnTo)}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
