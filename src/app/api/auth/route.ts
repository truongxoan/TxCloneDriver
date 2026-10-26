import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { ManagedUser, LockedDevice, AuditLogItem } from "@/modules/auth/types";
import { SyncRoom } from "@/modules/watch-party/types";
import { hashPassword } from "@/lib/password";
import { PRESET_MEMBERS, PRESET_MEMBER_MODULES, isPresetMemberUsername, isAllowedUsername, presetMemberFor } from "@/modules/auth/presetMembers";

// Hỗ trợ cả môi trường serverless Vercel (/tmp) và máy chủ cục bộ / VPS (thư mục ./data)
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "txclonedriver_data")
  : path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const DELETED_FILE = path.join(DATA_DIR, "deleted_users.json");
const DEVICES_FILE = path.join(DATA_DIR, "locked_devices.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");
const SESSIONS_FILE = path.join(DATA_DIR, "member_sessions.json");

// Dedicated Cloud Storage ID on restful-api.dev for cross-device sync
const CLOUD_STORE_ID = "ff808181a09d98f701a135d01243556c";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORE_ID}`;

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "u-admin",
    username: "admin",
    password: "kdkctrkn@123",
    plainPassword: "kdkctrkn@123",
    name: "Quản trị viên Tối cao",
    avatarInitials: "TX",
    coins: 50000,
    role: "admin",
    status: "approved",
    allowedModules: [
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
    ],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000,
  },
  ...PRESET_MEMBERS,
];

// In-Memory Master Cache (Ultra-fast 0ms response)
let memoryUsers: ManagedUser[] = [...INITIAL_USERS];
let memoryDevices: LockedDevice[] = [];
let memoryAuditLogs: AuditLogItem[] = [];
let memoryRooms: SyncRoom[] = [];

// One-device-per-member sessions (preset members only, never admin).
interface MemberSession {
  username: string;
  machineId: string | null;
  lastSeen: number;
  lockedUntil: number | null;
  lockedMachineId?: string | null;
}
let memorySessions: MemberSession[] = [];
let lastCloudFetchTime = 0;
let isCloudSyncInProgress = false;
// Tombstones for deleted usernames (lowercased). A stale client syncing an
// old user list must not resurrect a deleted user: mergeUserLists and
// readUsersLocal both drop tombstoned usernames. A fresh registration with
// Note: account creation is now disabled, so a tombstoned username
// cannot be re-registered through the web UI; restoring a deleted
// preset member requires clearing its tombstone server-side.
let memoryDeletedUsernames: string[] = [];

function readDeletedUsernamesLocal(): string[] {
  if (!ensureDataDir()) return memoryDeletedUsernames;
  try {
    if (!fs.existsSync(DELETED_FILE)) return memoryDeletedUsernames;
    const parsed = JSON.parse(fs.readFileSync(DELETED_FILE, "utf8"));
    if (Array.isArray(parsed)) {
      memoryDeletedUsernames = parsed
        .map((v) => String(v).toLowerCase())
        .filter(Boolean);
      return memoryDeletedUsernames;
    }
    return memoryDeletedUsernames;
  } catch {
    return memoryDeletedUsernames;
  }
}

function writeDeletedUsernamesLocal(list: string[]) {
  memoryDeletedUsernames = Array.from(
    new Set(list.map((v) => String(v).toLowerCase()).filter(Boolean))
  );
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(DELETED_FILE, JSON.stringify(memoryDeletedUsernames, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function isDeletedUsername(username: string): boolean {
  return readDeletedUsernamesLocal().includes(username.toLowerCase());
}

function filterDeletedUsers(users: ManagedUser[]): ManagedUser[] {
  const deleted = readDeletedUsernamesLocal();
  if (deleted.length === 0) return users;
  return users.filter((u) => !deleted.includes(u.username.toLowerCase()));
}


// --- Name-only preset members: whitelist + session registry ---
// Only "admin" and the 9 preset members may exist in the user list.
// Old cloud/local users (e.g. sample members, pending samples) are
// dropped, so they cannot bypass the whitelist.
function normalizePresetUser(u: ManagedUser): ManagedUser {
  const preset = presetMemberFor(u.username);
  if (!preset) return u;
  // Upgrade only the old sample record (modules ["storage"] with the old
  // timestamp) to the new preset definition. A newer record is an
  // admin change via the Settings matrix and must be kept as-is.
  const oldSample =
    (u.updatedAt || 0) <= 1728500000000 &&
    Array.isArray(u.allowedModules) &&
    !u.allowedModules.includes("watch_together");
  if (oldSample) {
    return { ...u, name: preset.name, allowedModules: [...PRESET_MEMBER_MODULES], status: "approved" };
  }
  return u;
}

function filterToAllowedUsers(users: ManagedUser[]): ManagedUser[] {
  const deleted = readDeletedUsernamesLocal();
  const map = new Map<string, ManagedUser>();
  for (const u of users) {
    const key = u.username.toLowerCase();
    if (deleted.includes(key)) continue;
    if (!isAllowedUsername(key)) continue;
    map.set(key, normalizePresetUser({ ...u }));
  }
  // Every preset member must be present unless tombstoned (deleted by
  // admin). This also repairs a list that lost a preset member.
  for (const preset of PRESET_MEMBERS) {
    const key = preset.username.toLowerCase();
    if (!deleted.includes(key) && !map.has(key)) {
      map.set(key, { ...preset });
    }
  }
  return Array.from(map.values());
}

function readSessionsLocal(): MemberSession[] {
  if (!ensureDataDir()) return memorySessions;
  try {
    if (!fs.existsSync(SESSIONS_FILE)) return memorySessions;
    const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
    if (Array.isArray(parsed)) {
      memorySessions = parsed.filter(
        (s: MemberSession) => s && isPresetMemberUsername(String(s.username || ""))
      );
      return memorySessions;
    }
    return memorySessions;
  } catch {
    return memorySessions;
  }
}

function writeSessionsLocal(sessions: MemberSession[]) {
  memorySessions = sessions.filter((s) => s && isPresetMemberUsername(String(s.username || "")));
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(memorySessions, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function mergeSessions(a: MemberSession[], b: MemberSession[]): MemberSession[] {
  const map = new Map<string, MemberSession>();
  const now = Date.now();
  for (const s of [...a, ...b]) {
    if (!s || !isPresetMemberUsername(String(s.username || ""))) continue;
    const key = String(s.username).toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...s });
      continue;
    }
    const aLocked = (existing.lockedUntil || 0) > now;
    const bLocked = (s.lockedUntil || 0) > now;
    if (aLocked || bLocked) {
      const winner = (s.lockedUntil || 0) > (existing.lockedUntil || 0) ? s : existing;
      map.set(key, {
        ...winner,
        lockedUntil: Math.max(existing.lockedUntil || 0, s.lockedUntil || 0),
        lastSeen: Math.max(existing.lastSeen || 0, s.lastSeen || 0),
      });
    } else if ((s.lastSeen || 0) > (existing.lastSeen || 0)) {
      map.set(key, { ...s, lockedUntil: null });
    }
  }
  return Array.from(map.values());
}

async function fetchCloudSessionsOnly(): Promise<MemberSession[] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${CLOUD_API_URL}?_t=${Date.now()}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const sessions = data?.data?.sessions;
    if (Array.isArray(sessions)) return sessions as MemberSession[];
    return null;
  } catch {
    return null;
  }
}

async function readSessionsMerged(): Promise<MemberSession[]> {
  const local = readSessionsLocal();
  const cloud = await fetchCloudSessionsOnly();
  if (!cloud) return local;
  const merged = mergeSessions(local, cloud);
  writeSessionsLocal(merged);
  return merged;
}

function formatLockRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes} phút ${seconds} giây`;
  return `${seconds} giây`;
}

function lockError(lockedUntil: number): { locked: boolean; remainingSeconds: number; error: string } {
  const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  return {
    locked: true,
    remainingSeconds,
    error: `Tài khoản này đang bị khóa ${formatLockRemaining(lockedUntil - Date.now())} vì phát hiện đăng nhập từ máy khác. Vui lòng thử lại sau.`,
  };
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function readUsersLocal(): ManagedUser[] {
  if (!ensureDataDir()) {
    return memoryUsers;
  }
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), "utf8");
      memoryUsers = [...INITIAL_USERS];
      return INITIAL_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const filtered = filterDeletedUsers(parsed);
      memoryUsers = filtered;
      return filtered;
    }
    return filterDeletedUsers(memoryUsers);
  } catch {
    return memoryUsers;
  }
}

function writeUsersLocal(users: ManagedUser[]) {
  // Never persist a tombstoned user, even if a stale sync carried it in.
  users = filterDeletedUsers(users);
  memoryUsers = users;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function readDevicesLocal(): LockedDevice[] {
  if (!ensureDataDir()) return memoryDevices;
  try {
    if (!fs.existsSync(DEVICES_FILE)) return memoryDevices;
    const raw = fs.readFileSync(DEVICES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryDevices = parsed;
      return parsed;
    }
    return memoryDevices;
  } catch {
    return memoryDevices;
  }
}

function writeDevicesLocal(devices: LockedDevice[]) {
  memoryDevices = devices;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function readAuditLogsLocal(): AuditLogItem[] {
  if (!ensureDataDir()) return memoryAuditLogs;
  try {
    if (!fs.existsSync(AUDIT_FILE)) return memoryAuditLogs;
    const raw = fs.readFileSync(AUDIT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryAuditLogs = parsed;
      return parsed;
    }
    return memoryAuditLogs;
  } catch {
    return memoryAuditLogs;
  }
}

function writeAuditLogsLocal(logs: AuditLogItem[]) {
  memoryAuditLogs = logs;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function readRoomsLocal(): SyncRoom[] {
  if (!ensureDataDir()) return memoryRooms;
  try {
    if (!fs.existsSync(ROOMS_FILE)) return memoryRooms;
    const raw = fs.readFileSync(ROOMS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryRooms = parsed;
      return parsed;
    }
    return memoryRooms;
  } catch {
    return memoryRooms;
  }
}

function writeRoomsLocal(rooms: SyncRoom[]) {
  memoryRooms = rooms;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), "utf8");
  } catch {
    // ignore
  }
}

// Khởi tạo đọc local ngay khi load module
readDeletedUsernamesLocal();
readUsersLocal();
readDevicesLocal();
readAuditLogsLocal();
readRoomsLocal();

// ---------------------------------------------------------------------------
// Smart Merge Helper: Không bao giờ hạ cấp quyền hoặc làm mất user
// ---------------------------------------------------------------------------
function mergeUserLists(primary: ManagedUser[], secondary: ManagedUser[]): ManagedUser[] {
  const map = new Map<string, ManagedUser>();

  // Newest-wins merge: the record with the newer updatedAt decides status
  // and allowedModules, so a rejection can never be overwritten by an older
  // approved record, and an older pending record can never downgrade a
  // newer approval. Only on an exact updatedAt tie does the status
  // priority approved > rejected > pending apply. Tombstoned (deleted)
  // usernames are dropped from both sides.
  const statusRank = (status: ManagedUser["status"]) =>
    status === "approved" ? 2 : status === "rejected" ? 1 : 0;

  // Thêm danh sách ban đầu (bỏ qua user đã bị xóa và user không
  // thuộc whitelist admin + thành viên tạo sẵn)
  for (const u of primary) {
    if (isDeletedUsername(u.username)) continue;
    if (!isAllowedUsername(u.username)) continue;
    map.set(u.username.toLowerCase(), { ...u });
  }

  // Hợp nhất với danh sách thứ 2
  for (const s of secondary) {
    const key = s.username.toLowerCase();
    if (isDeletedUsername(s.username)) continue;
    if (!isAllowedUsername(s.username)) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...s });
    } else {
      const merged: ManagedUser = { ...existing };
      const existingTime = existing.updatedAt || 0;
      const secondaryTime = s.updatedAt || 0;

      if (secondaryTime > existingTime) {
        // Secondary is newer: it wins status, modules and profile fields.
        merged.status = s.status;
        if (Array.isArray(s.allowedModules)) merged.allowedModules = [...s.allowedModules];
        merged.name = s.name || existing.name;
        merged.coins = s.coins !== undefined ? s.coins : existing.coins;
        merged.avatarUrl = s.avatarUrl || existing.avatarUrl;
        merged.role = s.role || existing.role;
        merged.updatedAt = s.updatedAt;
      } else if (secondaryTime === existingTime) {
        // Tie: status priority, modules from the winning side if set.
        if (statusRank(s.status) > statusRank(existing.status)) {
          merged.status = s.status;
          if (Array.isArray(s.allowedModules) && s.allowedModules.length > 0) {
            merged.allowedModules = [...s.allowedModules];
          }
        } else if (
          statusRank(s.status) === statusRank(existing.status) &&
          Array.isArray(s.allowedModules) &&
          s.allowedModules.length > 0 &&
          (!Array.isArray(existing.allowedModules) || existing.allowedModules.length === 0)
        ) {
          merged.allowedModules = [...s.allowedModules];
        }
        // Profile fields stay with the existing record on a tie.
      }
      // If existing is newer, it wins outright: no downgrade, no module
      // rollback, and no resurrection of an older status.

      map.set(key, merged);
    }
  }

  return filterToAllowedUsers(Array.from(map.values()));
}

// ---------------------------------------------------------------------------
// Asynchronous Cloud Sync Helpers (Chạy ngầm, không block request của Client)
// ---------------------------------------------------------------------------
async function fetchFromCloudStore(): Promise<{
  users?: ManagedUser[];
  devices?: LockedDevice[];
  logs?: AuditLogItem[];
  rooms?: SyncRoom[];
  deletedUsernames?: string[];
  sessions?: MemberSession[];
} | null> {
  // Collect BOTH sources and merge them below. Previously this returned
  // early as soon as the txlab instance answered, so users that only
  // existed in the cloud object store were never seen.
  let txlabUsers: ManagedUser[] | undefined;
  let txlabRooms: SyncRoom[] | undefined;
  let txlabDevices: LockedDevice[] | undefined;
  let txlabSessions: MemberSession[] | undefined;

  // 1. Thử kéo dữ liệu trực tiếp từ máy chủ online txlab.io.vn (Nguồn chính xác nhất)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const [uRes, rRes, dRes, sRes] = await Promise.all([
      fetch("https://txlab.io.vn/api/auth?_t=" + Date.now(), {
        signal: controller.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      }).catch(() => null),
      fetch("https://txlab.io.vn/api/auth?type=rooms&_t=" + Date.now(), {
        signal: controller.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      }).catch(() => null),
      fetch("https://txlab.io.vn/api/auth?type=devices&_t=" + Date.now(), {
        signal: controller.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      }).catch(() => null),
      fetch("https://txlab.io.vn/api/auth?type=sessions&_t=" + Date.now(), {
        signal: controller.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      }).catch(() => null),
    ]);
    clearTimeout(timeout);

    if (uRes && uRes.ok) {
      const uData = await uRes.json().catch(() => null);
      if (uData?.users && Array.isArray(uData.users)) txlabUsers = uData.users;
    }
    if (rRes && rRes.ok) {
      const rData = await rRes.json().catch(() => null);
      if (rData?.rooms && Array.isArray(rData.rooms)) txlabRooms = rData.rooms;
    }
    if (dRes && dRes.ok) {
      const dData = await dRes.json().catch(() => null);
      if (dData?.devices && Array.isArray(dData.devices)) txlabDevices = dData.devices;
    }
    if (sRes && sRes.ok) {
      const sData = await sRes.json().catch(() => null);
      if (sData?.sessions && Array.isArray(sData.sessions)) txlabSessions = sData.sessions;
    }
  } catch {
    // fall through to the cloud object store below
  }

  // 2. Cloud Object Store (restful-api.dev) — merged with, not replaced by,
  // the txlab instance data above.
  let cloudData: {
    users?: ManagedUser[];
    devices?: LockedDevice[];
    logs?: AuditLogItem[];
    rooms?: SyncRoom[];
    deletedUsernames?: string[];
    sessions?: MemberSession[];
  } | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${CLOUD_API_URL}?_t=${Date.now()}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.data) cloudData = data.data;
    }
  } catch {
    // ignore
  }

  const mergedUsers =
    txlabUsers && cloudData?.users
      ? mergeUserLists(txlabUsers, cloudData.users)
      : txlabUsers || cloudData?.users;
  const mergedSessions = mergeSessions(
    txlabSessions || [],
    cloudData?.sessions || []
  );
  const deletedUsernames = Array.from(
    new Set([
      ...(cloudData?.deletedUsernames || []).map((v) => String(v).toLowerCase()),
    ])
  );

  if (mergedUsers || txlabRooms || cloudData?.rooms || txlabDevices || cloudData?.devices || cloudData?.logs || deletedUsernames.length > 0 || mergedSessions.length > 0) {
    return {
      users: mergedUsers,
      rooms: txlabRooms || cloudData?.rooms,
      devices: txlabDevices || cloudData?.devices,
      logs: cloudData?.logs,
      deletedUsernames: deletedUsernames.length > 0 ? deletedUsernames : undefined,
      sessions: mergedSessions.length > 0 ? mergedSessions : undefined,
    };
  }
  return null;
}

async function triggerBackgroundCloudFetch() {
  const now = Date.now();
  // Giới hạn tần suất kéo cloud ở chế độ nền (tối thiểu 15 giây/lần để tránh rate limit)
  if (isCloudSyncInProgress || now - lastCloudFetchTime < 15000) {
    return;
  }
  isCloudSyncInProgress = true;
  lastCloudFetchTime = now;

  try {
    const cloudData = await fetchFromCloudStore();
    if (cloudData) {
      if (cloudData.deletedUsernames && cloudData.deletedUsernames.length > 0) {
        writeDeletedUsernamesLocal([
          ...readDeletedUsernamesLocal(),
          ...cloudData.deletedUsernames,
        ]);
      }
      if (cloudData.users && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
        const local = readUsersLocal();
        const merged = mergeUserLists(local, cloudData.users);
        writeUsersLocal(merged);
      }
      if (cloudData.devices && Array.isArray(cloudData.devices)) {
        writeDevicesLocal(cloudData.devices);
      }
      if (cloudData.logs && Array.isArray(cloudData.logs)) {
        writeAuditLogsLocal(cloudData.logs);
      }
      if (cloudData.rooms && Array.isArray(cloudData.rooms)) {
        writeRoomsLocal(cloudData.rooms);
      }
      if (cloudData.sessions && Array.isArray(cloudData.sessions)) {
        writeSessionsLocal(mergeSessions(readSessionsLocal(), cloudData.sessions));
      }
    }
  } catch {
    // ignore
  } finally {
    isCloudSyncInProgress = false;
  }
}

async function saveToCloudStoreBackground(payload: {
  users?: ManagedUser[];
  devices?: LockedDevice[];
  logs?: AuditLogItem[];
  rooms?: SyncRoom[];
  deletedUsernames?: string[];
  sessions?: MemberSession[];
}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const currentUsers = payload.users || memoryUsers;
    const currentDevices = payload.devices || memoryDevices;
    const currentLogs = payload.logs || memoryAuditLogs;
    const currentRooms = payload.rooms || memoryRooms;
    const currentSessions = payload.sessions || memorySessions;
    const currentDeleted = payload.deletedUsernames || readDeletedUsernamesLocal();

    await fetch(CLOUD_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        name: "txclonedriver_global_store_v1",
        data: {
          users: currentUsers,
          devices: currentDevices,
          logs: currentLogs.slice(0, 50),
          rooms: currentRooms,
          deletedUsernames: currentDeleted,
          sessions: currentSessions,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Đẩy trực tiếp lên txlab.io.vn nếu đang chạy ở môi trường máy cục bộ (không phải trên Vercel)
    if (!IS_VERCEL) {
      if (payload.rooms) {
        fetch("https://txlab.io.vn/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_rooms", rooms: payload.rooms }),
        }).catch(() => {});
      }
      if (payload.users) {
        fetch("https://txlab.io.vn/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_users", users: payload.users }),
        }).catch(() => {});
      }
    }

    // Kích hoạt WebSocket Broadcast tức thì
    fetch("https://ntfy.sh/txclonedriver_hub_events", {
      method: "POST",
      body: JSON.stringify({ event: "sync_update", timestamp: Date.now() }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

// GET: for rooms/devices/audit, trả về local và kích hoạt sync nền như cũ.
// For users, best-effort merge the cloud object store BEFORE returning, so
// a registration saved on another serverless instance is visible to the
// admin immediately. The merge is capped at 2 seconds and every failure is
// ignored, so a slow/unreachable cloud store can never block the response.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "rooms") {
      triggerBackgroundCloudFetch().catch(() => {});
      const rooms = readRoomsLocal();
      return NextResponse.json({ success: true, rooms }, { headers: NO_CACHE_HEADERS });
    }

    if (type === "devices") {
      triggerBackgroundCloudFetch().catch(() => {});
      const devices = readDevicesLocal();
      return NextResponse.json({ success: true, devices }, { headers: NO_CACHE_HEADERS });
    }

    if (type === "audit") {
      triggerBackgroundCloudFetch().catch(() => {});
      const logs = readAuditLogsLocal();
      return NextResponse.json({ success: true, logs }, { headers: NO_CACHE_HEADERS });
    }

    if (type === "sessions") {
      triggerBackgroundCloudFetch().catch(() => {});
      const sessions = readSessionsLocal();
      return NextResponse.json({ success: true, sessions }, { headers: NO_CACHE_HEADERS });
    }

    let users = readUsersLocal();
    try {
      const cloudData = await Promise.race([
        fetchFromCloudStore(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      if (cloudData) {
        if (cloudData.deletedUsernames && cloudData.deletedUsernames.length > 0) {
          writeDeletedUsernamesLocal([
            ...readDeletedUsernamesLocal(),
            ...cloudData.deletedUsernames,
          ]);
        }
        if (cloudData.users && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
          users = mergeUserLists(users, cloudData.users);
          writeUsersLocal(users);
        }
        if (cloudData.sessions && Array.isArray(cloudData.sessions)) {
          writeSessionsLocal(mergeSessions(readSessionsLocal(), cloudData.sessions));
        }
        // Mark the cloud as freshly fetched so the background trigger does
        // not immediately repeat the same fetch.
        lastCloudFetchTime = Date.now();
      }
    } catch {
      // Cloud merge is best-effort: local users are still returned.
    }

    users = filterToAllowedUsers(users);
    writeUsersLocal(users);
    return NextResponse.json(
      { success: true, users, deletedUsernames: readDeletedUsernamesLocal() },
      { headers: NO_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: true, users: filterToAllowedUsers(filterDeletedUsers(memoryUsers)), deletedUsernames: readDeletedUsernamesLocal() },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Xử lý thao tác với tốc độ phản hồi cực nhanh (< 5ms)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. ĐĂNG KÝ TÀI KHOẢN MỚI — ĐÃ TẮT (name-only login).
    // Chỉ các thành viên do admin tạo sẵn mới đăng nhập được; không
    // tạo tài khoản mới từ API này nữa, kể cả khi client cũ vẫn gọi.
    if (action === "register") {
      return NextResponse.json(
        {
          success: false,
          error: "Chức năng tạo tài khoản đã tắt. Chỉ tài khoản do admin tạo sẵn mới đăng nhập được.",
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 1b. PHIÊN ĐĂNG NHẬP MỘT MÁY CHO THÀNH VIÊN TẠO SẴN.
    // Không áp dụng cho admin. Một thành viên chỉ được đăng nhập ở
    // một máy: máy thứ hai đăng nhập trong khi phiên cũ còn hoạt động
    // (lastSeen trong 30 phút) sẽ khiến thành viên bị khóa 5 phút.
    if (action === "session_login" || action === "session_heartbeat" || action === "session_logout") {
      const username = String(body.username || "").trim().toLowerCase();
      const machineId = String(body.machineId || "").trim();
      if (!isPresetMemberUsername(username)) {
        return NextResponse.json(
          { success: false, error: "Chỉ thành viên do admin tạo sẵn mới dùng phiên đăng nhập này." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
      if (!machineId) {
        return NextResponse.json(
          { success: false, error: "Thiếu mã máy. Vui lòng tải lại trang đăng nhập và thử lại." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
      const sessions = await readSessionsMerged();
      const existing = sessions.find((s) => s.username.toLowerCase() === username);
      const now = Date.now();

      if (action === "session_logout") {
        if (existing && existing.machineId === machineId) {
          if (existing.lockedUntil && existing.lockedUntil > now) {
            // Keep the lock even though this machine logged out, so the
            // lock cannot be bypassed by logging out and back in.
            writeSessionsLocal(
              sessions.map((s) =>
                s.username.toLowerCase() === username
                  ? { ...s, machineId: null, lockedUntil: s.lockedUntil }
                  : s
              )
            );
          } else {
            writeSessionsLocal(sessions.filter((s) => s.username.toLowerCase() !== username));
          }
          saveToCloudStoreBackground({ sessions: readSessionsLocal() }).catch(() => {});
        }
        return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
      }

      if (action === "session_heartbeat") {
        if (!existing) {
          return NextResponse.json(
            { success: false, active: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
            { headers: NO_CACHE_HEADERS }
          );
        }
        if (existing.lockedUntil && existing.lockedUntil > now) {
          return NextResponse.json(
            { success: false, ...lockError(existing.lockedUntil) },
            { headers: NO_CACHE_HEADERS }
          );
        }
        if (existing.machineId !== machineId) {
          return NextResponse.json(
            {
              success: false,
              active: false,
              error: "Tài khoản này đã đăng nhập ở máy khác. Phiên này đã bị đăng xuất.",
            },
            { headers: NO_CACHE_HEADERS }
          );
        }
        writeSessionsLocal(
          sessions.map((s) =>
            s.username.toLowerCase() === username ? { ...s, lastSeen: now, lockedUntil: null } : s
          )
        );
        return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
      }

      // session_login
      if (existing && existing.lockedUntil && existing.lockedUntil > now) {
        return NextResponse.json(
          { success: false, ...lockError(existing.lockedUntil) },
          { headers: NO_CACHE_HEADERS }
        );
      }
      if (
        existing &&
        existing.machineId &&
        existing.machineId !== machineId &&
        now - (existing.lastSeen || 0) < 30 * 60 * 1000
      ) {
        const lockedUntil = now + 5 * 60 * 1000;
        writeSessionsLocal(
          sessions.map((s) =>
            s.username.toLowerCase() === username
              ? { ...s, lockedUntil, lockedMachineId: machineId }
              : s
          )
        );
        saveToCloudStoreBackground({ sessions: readSessionsLocal() }).catch(() => {});
        return NextResponse.json(
          { success: false, ...lockError(lockedUntil) },
          { headers: NO_CACHE_HEADERS }
        );
      }
      // Same machine, stale session (>30 phút), absent session, or an
      // expired lock: allow and replace the session, clearing the lock.
      const next: MemberSession = {
        username,
        machineId,
        lastSeen: now,
        lockedUntil: null,
      };
      writeSessionsLocal([
        ...sessions.filter((s) => s.username.toLowerCase() !== username),
        next,
      ]);
      saveToCloudStoreBackground({ sessions: readSessionsLocal() }).catch(() => {});
      return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
    }

    // 2. CẬP NHẬT PHÂN QUYỀN / DUYỆT TỪNG THÀNH VIÊN TRỰC TIẾP
    if (action === "update_user_permission" || action === "approve_user") {
      const { userId, allowedModules, status } = body;
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Thiếu mã định danh người dùng (userId)" },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      let users = readUsersLocal();
      const now = Date.now();
      const updated = users.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            allowedModules: Array.isArray(allowedModules) ? allowedModules : u.allowedModules,
            status: status || u.status,
            updatedAt: now,
          };
        }
        return u;
      });

      writeUsersLocal(updated);
      saveToCloudStoreBackground({ users: updated }).catch(() => {});

      return NextResponse.json({ success: true, users: updated }, { headers: NO_CACHE_HEADERS });
    }

    // 2b. XÓA TÀI KHOẢN (server-side, có tombstone để stale sync không
    // khôi phục lại user đã xóa). Idempotent: xóa lại user đã xóa vẫn
    // trả success với danh sách hiện tại.
    if (action === "delete_user") {
      const { userId, username } = body;
      if (!userId && !username) {
        return NextResponse.json(
          { success: false, error: "Thiếu mã định danh người dùng (userId)" },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      let users = readUsersLocal();
      const target = users.find(
        (u) =>
          (userId && u.id === userId) ||
          (username && u.username.toLowerCase() === String(username).toLowerCase())
      );
      if (!target) {
        return NextResponse.json({ success: true, users }, { headers: NO_CACHE_HEADERS });
      }
      if (target.role === "admin") {
        return NextResponse.json(
          { success: false, error: "Không thể xóa tài khoản quản trị viên." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const updated = users.filter((u) => u.id !== target.id);
      // Record the tombstone BEFORE writing, so writeUsersLocal's filter
      // and any concurrent merge drop the deleted user.
      writeDeletedUsernamesLocal([
        ...readDeletedUsernamesLocal(),
        target.username.toLowerCase(),
      ]);
      writeUsersLocal(updated);
      saveToCloudStoreBackground({
        users: updated,
        deletedUsernames: readDeletedUsernamesLocal(),
      }).catch(() => {});

      return NextResponse.json(
        { success: true, users: updated, deletedUsernames: readDeletedUsernamesLocal() },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 3. ĐỒNG BỘ DANH SÁCH USERS
    if (action === "sync_users") {
      const { users } = body;
      if (Array.isArray(users)) {
        const local = readUsersLocal();
        const merged = mergeUserLists(local, users);
        writeUsersLocal(merged);
        saveToCloudStoreBackground({ users: merged }).catch(() => {});
        return NextResponse.json({ success: true, users: merged }, { headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        { success: false, error: "Dữ liệu users không hợp lệ" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 4. SYNC PHÒNG XEM & NGHE CHUNG
    if (action === "sync_rooms") {
      const { rooms } = body;
      if (Array.isArray(rooms)) {
        writeRoomsLocal(rooms);
        saveToCloudStoreBackground({ rooms }).catch(() => {});
        return NextResponse.json({ success: true, rooms }, { headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        { success: false, error: "Dữ liệu rooms không hợp lệ" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 5. SYNC KHÓA MÁY
    if (action === "sync_devices") {
      const { devices } = body;
      if (Array.isArray(devices)) {
        writeDevicesLocal(devices);
        saveToCloudStoreBackground({ devices }).catch(() => {});
        return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        { success: false, error: "Dữ liệu devices không hợp lệ" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 6. SYNC NHẬT KÝ AN NINH
    if (action === "sync_audit") {
      const { logs } = body;
      if (Array.isArray(logs)) {
        writeAuditLogsLocal(logs);
        saveToCloudStoreBackground({ logs }).catch(() => {});
        return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        { success: false, error: "Dữ liệu logs không hợp lệ" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: "Hành động không hợp lệ" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing auth action";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
