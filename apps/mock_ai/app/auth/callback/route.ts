import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  // Extract search parameters and origin from the request URL
  const { searchParams, origin } = new URL(request.url);

  // Get the authorization code and the 'next' redirect path
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
