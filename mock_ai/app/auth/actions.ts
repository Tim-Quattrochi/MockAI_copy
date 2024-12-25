"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = headers().get("origin");

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    console.log("GOOGLE AUTH ERROR", error);
  }
  if (data?.url) {
    redirect(data.url);
  }
}
