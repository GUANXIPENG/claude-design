import { NextResponse, type NextRequest } from "next/server";
import { sanitizeReturnTo } from "@/server/auth/returnTo";
import { createSupabaseServerClient } from "@/server/auth/session";
import { ensureUserProfile } from "@/server/auth/userProfile";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const safeReturnTo = sanitizeReturnTo(requestUrl.searchParams.get("returnTo"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { data: { user: null } };

    if (user) {
      await ensureUserProfile({
        user: {
          email: user.email ?? null,
          id: user.id
        }
      });
    }
  }

  return NextResponse.redirect(new URL(safeReturnTo, request.url));
}
