import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("datavault_session")?.value;
  const { pathname } = request.nextUrl;

  // Static assets & internal requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Not logged in -> redirect to /login
  if (!sessionCookie && pathname !== "/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in -> redirect away from /login to /overview
  if (sessionCookie && (pathname === "/login" || pathname === "/")) {
    const overviewUrl = request.nextUrl.clone();
    overviewUrl.pathname = "/overview";
    return NextResponse.redirect(overviewUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
