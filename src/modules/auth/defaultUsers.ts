import type { AppModuleId, ManagedUser } from "./types";

/**
 * Danh sách thành viên CỐ ĐỊNH của hệ thống — nguồn sự thật duy nhất.
 *
 * Quy định (theo yêu cầu chủ hệ thống):
 * - Chỉ có admin + đúng 10 thành viên: 11, 22, 33, 44, 55, 66, 77, 88, 99, 100.
 * - KHÔNG có đăng ký thành viên mới. Mọi username ngoài danh sách này đều bị loại
 *   ở cả client, server và khi merge dữ liệu cloud/localStorage cũ.
 * - 10 thành viên chỉ có 3 quyền: Google Drive (storage), Xem chung
 *   (watch_together) và Ghi chú (notes).
 * - 10 thành viên đăng nhập đơn giản: nhập đúng tài khoản, mật khẩu gõ gì
 *   cũng được (chỉ cần không để trống). Admin vẫn phải đúng mật khẩu thật.
 */
export const DRIVER_USERNAMES = [
  "11",
  "22",
  "33",
  "44",
  "55",
  "66",
  "77",
  "88",
  "99",
  "100",
] as const;

export const DRIVER_MODULES: AppModuleId[] = ["storage", "watch_together", "notes"];

export const ADMIN_MODULES: AppModuleId[] = [
  "overview",
  "storage",
  "notes",
  "projects",
  "events",
  "weather",
  "settings",
  "telegram",
  "watch_together",
  "vault",
  "games",
  "study",
  "driver_license",
  "expenses",
  "qr",
  "downloader",
  "memories",
  "image_studio",
  "google_flow",
];

export const ALLOWED_USERNAMES: string[] = ["admin", ...DRIVER_USERNAMES];

export function isDriverUsername(username: string): boolean {
  return (DRIVER_USERNAMES as readonly string[]).includes(
    (username || "").trim().toLowerCase()
  );
}

export function isAllowedUsername(username: string): boolean {
  return ALLOWED_USERNAMES.includes((username || "").trim().toLowerCase());
}

/** Chỉ giữ admin + 10 thành viên, đồng thời ép đúng quyền cho 10 thành viên. */
export function enforceUserWhitelist<T extends ManagedUser>(users: T[]): T[] {
  const byName = new Map<string, T>();
  for (const u of users || []) {
    const key = (u.username || "").trim().toLowerCase();
    if (!isAllowedUsername(key)) continue;
    if (!byName.has(key)) byName.set(key, u);
  }
  const defaults = buildDefaultUsers();
  return defaults.map((def) => {
    const existing = byName.get(def.username.toLowerCase());
    if (!existing) return def as T;
    if (def.role === "admin") return { ...def, ...existing, role: "admin" as const };
    // Thành viên driver: luôn approved + đúng 3 module, bất kể dữ liệu cũ ghi gì.
    return {
      ...existing,
      role: "user" as const,
      status: "approved" as const,
      allowedModules: [...DRIVER_MODULES],
    };
  });
}

/** Map module -> đường dẫn thật. watch_together là /watch-together (gạch ngang). */
export const MODULE_ROUTES: Record<string, string> = {
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

export function moduleToPath(moduleId: string): string {
  return MODULE_ROUTES[moduleId] || "/storage";
}

/** Trang đích sau đăng nhập: admin -> /overview, thành viên -> module đầu tiên họ có. */
export function landingPathFor(modules: string[] | undefined, role?: string): string {
  if (role === "admin") return "/overview";
  const first = (modules || []).find((m) => MODULE_ROUTES[m]);
  return first ? MODULE_ROUTES[first] : "/storage";
}

export function buildDefaultUsers(): ManagedUser[] {
  const admin: ManagedUser = {
    id: "u-admin",
    username: "admin",
    password: "kdkctrkn@123",
    plainPassword: "kdkctrkn@123",
    name: "Quản trị viên Tối cao",
    avatarInitials: "TX",
    coins: 50000,
    role: "admin",
    status: "approved",
    allowedModules: [...ADMIN_MODULES],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000,
  };
  const drivers: ManagedUser[] = DRIVER_USERNAMES.map((username, i) => ({
    id: `u-driver-${username}`,
    username,
    // Mật khẩu lưu chỉ để tương thích dữ liệu cũ; đăng nhập của 10 thành viên
    // chấp nhận bất kỳ mật khẩu không trống nào (xem authContext.login).
    password: "21",
    plainPassword: "21",
    name: `Thành viên ${username}`,
    avatarInitials: username.slice(0, 2),
    coins: 50000,
    role: "user",
    status: "approved",
    allowedModules: [...DRIVER_MODULES],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000 + i,
  }));
  return [admin, ...drivers];
}
