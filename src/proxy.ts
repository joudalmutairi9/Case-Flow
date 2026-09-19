import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { ROLE_TO_PORTAL, SESSION_TTL_MINUTES, isPortalKey } from "@/lib/portals";

const COOKIE_NAME = "cf_session";
const PUBLIC_SUFFIXES = ["/login", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const portal = segments[0];

  if (!isPortalKey(portal)) {
    return NextResponse.next();
  }

  const rest = "/" + segments.slice(1).join("/");
  const isPublic = PUBLIC_SUFFIXES.some((suffix) => rest.startsWith(suffix));

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isPublic) {
    // Already logged in? send to their dashboard instead of showing login again.
    if (session && ROLE_TO_PORTAL[session.role] === portal && rest === "/login") {
      return NextResponse.redirect(new URL(`/${portal}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  if (!session || ROLE_TO_PORTAL[session.role] !== portal) {
    return NextResponse.redirect(new URL(`/${portal}/login`, request.url));
  }

  if (session.mustChangePassword && rest !== "/change-password") {
    return NextResponse.redirect(
      new URL(`/${portal}/change-password`, request.url)
    );
  }

  // Sliding session expiration (AUTH-06).
  const response = NextResponse.next();
  const ttlMinutes = SESSION_TTL_MINUTES[session.role];
  response.cookies.set(COOKIE_NAME, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlMinutes * 60,
  });
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/records/:path*",
    "/intern/:path*",
    "/student/:path*",
    "/supervisor/:path*",
  ],
};
