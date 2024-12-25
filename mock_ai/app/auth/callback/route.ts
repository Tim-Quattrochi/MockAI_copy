import { NextResponse } from "next/server";

import { createClient } from "@/supabase/server";
export async function GET(request: Request) {
  // Extract search parameters and origin from the request URL
  const requestUrl = new URL(request.url);

  // Get the authorization code and the 'next' redirect path
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/error`);
    }
  }

  return NextResponse.redirect(`${origin}/interview`);
}
