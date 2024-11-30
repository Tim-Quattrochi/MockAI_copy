import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // allow guest users to access the home page
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|about|tips|_next/image|auth/signin|favicon.ico|mockai_vid.mp4|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/protected",
    "/admin/:path*",
  ],
};
