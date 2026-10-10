import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("txclonedriver_session")?.value ||
    request.cookies.get("datavault_session")?.value;
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

  // Already logged in -> redirect away from /login to allowed landing page
  if (sessionCookie && (pathname === "/login" || pathname === "/")) {
    let targetPath = "/overview";
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      if (
        user &&
        user.role !== "admin" &&
        Array.isArray(user.allowedModules) &&
        !user.allowedModules.includes("overview")
      ) {
        const firstModule = user.allowedModules[0] || "storage";
        targetPath = `/${firstModule}`;
      }
    } catch {
      targetPath = "/overview";
    }

    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = targetPath;
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
