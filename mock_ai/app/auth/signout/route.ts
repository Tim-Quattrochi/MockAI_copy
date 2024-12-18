import { createClient } from "@//supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/");
  return NextResponse.redirect(new URL("/auth/signin", req.url), {
    status: 302,
  });
}

export const runtime = "edge";