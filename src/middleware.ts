import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/sessionToken";

// Map module -> path thật (watch_together = /watch-together, không phải /watch_together).
const MODULE_ROUTES: Record<string, string> = {
  overview: "/overview",
  storage: "/storage",
  notes: "/notes",
  watch_together: "/watch-together",
  projects: "/projects",
  events: "/events",
  weather: "/weather",
  settings: "/settings",
  telegram: "/telegram",
  vault: "/vault",
  games: "/games",
  study: "/study",
  driver_license: "/driver-license",
  expenses: "/expenses",
  qr: "/qr",
  downloader: "/downloader",
  memories: "/memories",
  image_studio: "/image-studio",
  google_flow: "/google-flow",
};

const ROUTE_MODULES: Record<string, string> = {
  "/overview": "overview",
  "/hubs": "overview",
  "/activity": "overview",
  "/storage": "storage",
  "/share": "storage",
  "/backups": "storage",
  "/notes": "notes",
  "/watch-together": "watch_together",
  "/image-studio": "image_studio",
  "/google-flow": "google_flow",
  "/projects": "projects",
  "/events": "events",
  "/calendar": "events",
  "/traditional-calendar": "events",
  "/weather": "weather",
  "/settings": "settings",
  "/themes": "settings",
  "/telegram": "telegram",
  "/vault": "vault",
  "/games": "games",
  "/study": "study",
  "/driver-license": "driver_license",
  "/expenses": "expenses",
  "/qr": "qr",
  "/downloader": "downloader",
  "/memories": "memories",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Phiên hợp lệ = cookie token có CHỮ KÝ HMAC đúng + chưa hết hạn.
  // Cookie JSON tự chế kiểu cũ (không chữ ký) bị coi như chưa đăng nhập.
  const token =
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get("datavault_session")?.value;
  const session = await verifySessionToken(token);

  if (!session && pathname !== "/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (session && (pathname === "/login" || pathname === "/")) {
    let targetPath = "/overview";
    if (session.role !== "admin") {
      const modules = session.allowedModules || [];
      if (!modules.includes("overview")) {
        const first = modules.find((m) => MODULE_ROUTES[m]);
        targetPath = first ? MODULE_ROUTES[first] : "/storage";
      }
    }
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = targetPath;
    return NextResponse.redirect(targetUrl);
  }

  // Chặn theo quyền ở tầng route cho thành viên thường.
  if (session && session.role !== "admin" && pathname !== "/login") {
    const seg = "/" + (pathname.split("/")[1] || "");
    const required = ROUTE_MODULES[seg];
    const modules = session.allowedModules || [];
    if (required && !modules.includes(required)) {
      const first = modules.find((m) => MODULE_ROUTES[m]);
      const url = request.nextUrl.clone();
      url.pathname = first ? MODULE_ROUTES[first] : "/storage";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
