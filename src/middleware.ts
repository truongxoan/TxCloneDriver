import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map module -> path thật (watch_together = /watch-together, không phải /watch_together).
// Middleware chạy ở Edge nên không import từ app code; giữ bảng nhỏ này khớp với
// MODULE_ROUTES trong src/modules/auth/defaultUsers.ts.
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

export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("txclonedriver_session")?.value ||
    request.cookies.get("datavault_session")?.value;
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  if (!sessionCookie && pathname !== "/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Chặn theo quyền ở tầng route: thành viên thường chỉ vào được đúng module
  // được cấp (storage / watch_together / notes), kể cả khi gõ URL trực tiếp
  // tới các trang chưa có ModuleGuard riêng (activity, calendar, themes...).
  if (sessionCookie && pathname !== "/login") {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      if (user && user.role !== "admin") {
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
        const seg = "/" + (pathname.split("/")[1] || "");
        const required = ROUTE_MODULES[seg];
        const modules: string[] = Array.isArray(user.allowedModules) ? user.allowedModules : [];
        if (required && !modules.includes(required)) {
          const first = modules.find((m) => MODULE_ROUTES[m]);
          const url = request.nextUrl.clone();
          url.pathname = first ? MODULE_ROUTES[first] : "/storage";
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // Cookie hỏng: bỏ qua, các lớp dưới tự xử lý.
    }
  }

  if (sessionCookie && (pathname === "/login" || pathname === "/")) {
    let targetPath = "/overview";
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      if (user && user.role !== "admin") {
        const modules: string[] = Array.isArray(user.allowedModules) ? user.allowedModules : [];
        if (!modules.includes("overview")) {
          const first = modules.find((m) => MODULE_ROUTES[m]);
          targetPath = first ? MODULE_ROUTES[first] : "/storage";
        }
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
