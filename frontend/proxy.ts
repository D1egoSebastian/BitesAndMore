import { NextResponse, type NextRequest } from "next/server";
import { isTokenExpired, SESSION_COOKIE } from "@/lib/session/token";

const LOGIN_PATH = "/admin/login";

/**
 * Optimistic guard for the admin panel (FR-007-2): it only reads the cookie and the JWT expiry.
 * Server Actions verify the session again before every write, and the API remains the authority.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidSession = !!token && !isTokenExpired(token);

  if (pathname === LOGIN_PATH) {
    return hasValidSession ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  if (hasValidSession) return NextResponse.next();

  const loginUrl = new URL(LOGIN_PATH, request.url);
  if (token) loginUrl.searchParams.set("expired", "1");
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
