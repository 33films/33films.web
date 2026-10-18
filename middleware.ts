import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// /reset-password is intentionally absent: after the recovery link is exchanged
// the visitor already has a session, and this is the screen where they set the new password.
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { response, user, role, hasProfile } = await updateSession(request);
  if (response.status >= 300 && response.status < 400) return response;

  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && hasProfile && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user && hasProfile) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
