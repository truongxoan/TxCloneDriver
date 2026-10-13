import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { ManagedUser, LockedDevice, AuditLogItem } from "@/modules/auth/types";
import { SyncRoom } from "@/modules/watch-party/types";

// Hỗ trợ cả môi trường serverless Vercel (/tmp) và máy chủ cục bộ / VPS (thư mục ./data)
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "txclonedriver_data")
  : path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const DEVICES_FILE = path.join(DATA_DIR, "locked_devices.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");

// Dedicated Cloud Storage ID on restful-api.dev for cross-device sync
const CLOUD_STORE_ID = "ff808181a09d98f701a135d01243556c";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_STORE_ID}`;

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "u-admin",
    username: "admin",
    password: "kdkctrkn@123",
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
  {
    id: "u-member-a",
    username: "11",
    password: "21",
    name: "Thành viên A (Chỉ Google Drive)",
    avatarInitials: "11",
    coins: 50000,
    role: "user",
    status: "approved",
    allowedModules: ["storage"],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000,
  },
  {
    id: "u-member-b",
    username: "userb",
    password: "21",
    name: "Thành viên B (Google Drive & Dự án)",
    avatarInitials: "UB",
    coins: 50000,
    role: "user",
    status: "approved",
    allowedModules: ["storage", "projects"],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000,
  },
  {
    id: "u-member-pending",
    username: "hocvien_moi",
    password: "21",
    name: "Học viên Đăng ký mới (Chờ duyệt)",
    avatarInitials: "HV",
    coins: 50000,
    role: "user",
    status: "pending",
    allowedModules: [],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 1728500000000,
  },
];

// In-Memory Master Cache (Ultra-fast 0ms response)
let memoryUsers: ManagedUser[] = [...INITIAL_USERS];
let memoryDevices: LockedDevice[] = [];
let memoryAuditLogs: AuditLogItem[] = [];
let memoryRooms: SyncRoom[] = [];
let lastCloudFetchTime = 0;
let isCloudSyncInProgress = false;

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
      memoryUsers = parsed;
      return parsed;
    }
    return memoryUsers;
  } catch {
    return memoryUsers;
  }
}

function writeUsersLocal(users: ManagedUser[]) {
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
readUsersLocal();
readDevicesLocal();
readAuditLogsLocal();
readRoomsLocal();

// ---------------------------------------------------------------------------
// Smart Merge Helper: Không bao giờ hạ cấp quyền hoặc làm mất user
// ---------------------------------------------------------------------------
function mergeUserLists(primary: ManagedUser[], secondary: ManagedUser[]): ManagedUser[] {
  const map = new Map<string, ManagedUser>();

  // Thêm danh sách ban đầu
  for (const u of primary) {
    map.set(u.username.toLowerCase(), { ...u });
  }

  // Hợp nhất thông minh với danh sách thứ 2
  for (const s of secondary) {
    const key = s.username.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...s });
    } else {
      // Nếu user đã tồn tại ở cả 2 nơi:
      const merged: ManagedUser = { ...existing };

      // 1. Nếu một bên đã approved, giữ nguyên approved (không bao giờ đảo ngược về pending)
      if (existing.status === "approved" || s.status === "approved") {
        merged.status = "approved";
      } else if (existing.status === "rejected" || s.status === "rejected") {
        merged.status = "rejected";
      }

      // 2. Bảo toàn allowedModules nếu một bên đã được cấu hình quyền
      if (Array.isArray(s.allowedModules) && s.allowedModules.length > 0) {
        if (!Array.isArray(existing.allowedModules) || existing.allowedModules.length === 0) {
          merged.allowedModules = [...s.allowedModules];
        } else if ((s.updatedAt || 0) > (existing.updatedAt || 0)) {
          merged.allowedModules = [...s.allowedModules];
        }
      }

      // 3. Sử dụng timestamp updatedAt nếu có
      if ((s.updatedAt || 0) > (existing.updatedAt || 0)) {
        merged.name = s.name || existing.name;
        merged.coins = s.coins !== undefined ? s.coins : existing.coins;
        merged.avatarUrl = s.avatarUrl || existing.avatarUrl;
        merged.role = s.role || existing.role;
        merged.updatedAt = s.updatedAt;
      }

      map.set(key, merged);
    }
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Asynchronous Cloud Sync Helpers (Chạy ngầm, không block request của Client)
// ---------------------------------------------------------------------------
async function fetchFromCloudStore(): Promise<{
  users?: ManagedUser[];
  devices?: LockedDevice[];
  logs?: AuditLogItem[];
  rooms?: SyncRoom[];
} | null> {
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
      if (data?.data) {
        return data.data;
      }
    }
  } catch {
    // ignore
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
}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const currentUsers = payload.users || memoryUsers;
    const currentDevices = payload.devices || memoryDevices;
    const currentLogs = payload.logs || memoryAuditLogs;
    const currentRooms = payload.rooms || memoryRooms;

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
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

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

// GET: Trả về kết quả tức thì từ In-Memory & Local Disk (0ms latency), kích hoạt sync nền
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Kích hoạt đồng bộ ngầm không chặn kết quả
    triggerBackgroundCloudFetch().catch(() => {});

    if (type === "rooms") {
      const rooms = readRoomsLocal();
      return NextResponse.json({ success: true, rooms }, { headers: NO_CACHE_HEADERS });
    }

    if (type === "devices") {
      const devices = readDevicesLocal();
      return NextResponse.json({ success: true, devices }, { headers: NO_CACHE_HEADERS });
    }

    if (type === "audit") {
      const logs = readAuditLogsLocal();
      return NextResponse.json({ success: true, logs }, { headers: NO_CACHE_HEADERS });
    }

    const users = readUsersLocal();
    return NextResponse.json({ success: true, users }, { headers: NO_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ success: true, users: memoryUsers }, { headers: NO_CACHE_HEADERS });
  }
}

// POST: Xử lý thao tác với tốc độ phản hồi cực nhanh (< 5ms)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. ĐĂNG KÝ TÀI KHOẢN MỚI
    if (action === "register") {
      const { username, password, name } = body;
      const u = (username || "").trim();
      const p = (password || "").trim();
      const n = (name || "").trim();

      if (!u || !p || !n) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập đầy đủ thông tin đăng ký." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      let users = readUsersLocal();

      // Kiểm tra trùng username
      if (users.some((item) => item.username.toLowerCase() === u.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: "Tên tài khoản này đã tồn tại trên hệ thống. Vui lòng chọn tên khác." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      const newUser: ManagedUser = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        username: u,
        password: p,
        name: n,
        role: "user",
        status: "pending",
        allowedModules: [],
        createdAt: dateStr,
        coins: 50000,
        provider: "local",
        updatedAt: Date.now(),
      };

      const updated = [...users, newUser];
      writeUsersLocal(updated);

      const logs = readAuditLogsLocal();
      const ts = `${dateStr} ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: ts,
        username: u,
        action: "User Registration Pending",
        details: `Tài khoản mới @${u} (${n}) gửi yêu cầu, đang chờ Admin duyệt.`,
        ip: "Client Machine",
        status: "warning",
      };
      const updatedLogs = [newLog, ...logs].slice(0, 100);
      writeAuditLogsLocal(updatedLogs);

      // Lưu lên cloud trong background (không block UI phản hồi)
      saveToCloudStoreBackground({ users: updated, logs: updatedLogs }).catch(() => {});

      return NextResponse.json(
        { success: true, user: newUser, users: updated },
        { headers: NO_CACHE_HEADERS }
      );
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
