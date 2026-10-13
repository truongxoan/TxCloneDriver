import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { ManagedUser, LockedDevice, AuditLogItem } from "@/modules/auth/types";

// Hỗ trợ cả môi trường serverless (Vercel /var/task là read-only, thư mục ghi được là os.tmpdir()) và môi trường cục bộ
const IS_VERCEL = !!process.env.VERCEL || process.env.NODE_ENV === "production";
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "txclonedriver_data")
  : path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const DEVICES_FILE = path.join(DATA_DIR, "locked_devices.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");

// Dedicated Cloud Storage ID on restful-api.dev to ensure seamless cross-device synchronization on Vercel
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
  },
];

// Bộ nhớ đệm Memory Fallback an toàn tuyệt đối
let memoryUsers: ManagedUser[] = [...INITIAL_USERS];
let memoryDevices: LockedDevice[] = [];
let memoryAuditLogs: AuditLogItem[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (err) {
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
    memoryUsers = parsed;
    return parsed;
  } catch {
    return memoryUsers;
  }
}

function writeUsersLocal(users: ManagedUser[]) {
  memoryUsers = users;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    // ignore
  }
}

function readDevicesLocal(): LockedDevice[] {
  if (!ensureDataDir()) {
    return memoryDevices;
  }
  try {
    if (!fs.existsSync(DEVICES_FILE)) {
      return memoryDevices;
    }
    const raw = fs.readFileSync(DEVICES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    memoryDevices = parsed;
    return parsed;
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
  if (!ensureDataDir()) {
    return memoryAuditLogs;
  }
  try {
    if (!fs.existsSync(AUDIT_FILE)) {
      return memoryAuditLogs;
    }
    const raw = fs.readFileSync(AUDIT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    memoryAuditLogs = parsed;
    return parsed;
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

// ---------------------------------------------------------------------------
// Cloud Sync Store Helpers (Chia sẻ dữ liệu thời gian thực giữa mọi máy và serverless instance)
// ---------------------------------------------------------------------------

async function fetchFromCloudStore(): Promise<{
  users?: ManagedUser[];
  devices?: LockedDevice[];
  logs?: AuditLogItem[];
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(CLOUD_API_URL, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        return data.data;
      }
    }
  } catch {
    // fallback to local
  }
  return null;
}

async function saveToCloudStore(payload: {
  users?: ManagedUser[];
  devices?: LockedDevice[];
  logs?: AuditLogItem[];
}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    // Merge với dữ liệu hiện tại
    const currentUsers = payload.users || memoryUsers;
    const currentDevices = payload.devices || memoryDevices;
    const currentLogs = payload.logs || memoryAuditLogs;

    await fetch(CLOUD_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "txclonedriver_global_store_v1",
        data: {
          users: currentUsers,
          devices: currentDevices,
          logs: currentLogs.slice(0, 50),
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // ignore cloud failure, local/memory was already saved
  }
}

// GET: Fetch users, devices, audit logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Đồng bộ từ Cloud Store để mọi máy thấy tài khoản người khác vừa tạo
    const cloudData = await fetchFromCloudStore();

    if (type === "devices") {
      let devices = readDevicesLocal();
      if (cloudData?.devices && Array.isArray(cloudData.devices)) {
        devices = cloudData.devices;
        writeDevicesLocal(devices);
      }
      return NextResponse.json({ success: true, devices });
    }

    if (type === "audit") {
      let logs = readAuditLogsLocal();
      if (cloudData?.logs && Array.isArray(cloudData.logs)) {
        logs = cloudData.logs;
        writeAuditLogsLocal(logs);
      }
      return NextResponse.json({ success: true, logs });
    }

    let users = readUsersLocal();
    if (cloudData?.users && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
      // Merge users: đảm bảo giữ lại admin và các user mới
      const userMap = new Map<string, ManagedUser>();
      users.forEach((u) => userMap.set(u.username.toLowerCase(), u));
      cloudData.users.forEach((u) => userMap.set(u.username.toLowerCase(), u));
      users = Array.from(userMap.values());
      writeUsersLocal(users);
    }
    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    return NextResponse.json({ success: true, users: memoryUsers });
  }
}

// POST: Actions (register, sync_users, sync_devices, sync_audit)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Đăng ký tài khoản người dùng thông thường
    if (action === "register") {
      const { username, password, name } = body;
      const u = (username || "").trim();
      const p = (password || "").trim();
      const n = (name || "").trim();

      if (!u || !p || !n) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập đầy đủ thông tin đăng ký." },
          { status: 400 }
        );
      }

      // 1. Lấy dữ liệu người dùng mới nhất từ Cloud & Local
      const cloudData = await fetchFromCloudStore();
      let users = readUsersLocal();
      if (cloudData?.users && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
        const userMap = new Map<string, ManagedUser>();
        users.forEach((item) => userMap.set(item.username.toLowerCase(), item));
        cloudData.users.forEach((item) => userMap.set(item.username.toLowerCase(), item));
        users = Array.from(userMap.values());
      }

      // 2. Kiểm tra xem username đã tồn tại chưa
      if (users.some((item) => item.username.toLowerCase() === u.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: "Tên tài khoản này đã tồn tại trên hệ thống. Vui lòng chọn tên khác." },
          { status: 400 }
        );
      }

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      // 3. Tạo tài khoản mới ở trạng thái chờ duyệt ("pending")
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
      };

      const updated = [...users, newUser];
      writeUsersLocal(updated);

      // 4. Ghi nhật ký an ninh
      const logs = readAuditLogsLocal();
      const ts = `${dateStr} ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: ts,
        username: u,
        action: "User Registration Pending",
        details: `Tài khoản đăng ký mới @${u} (${n}) gửi yêu cầu, đang chờ Admin duyệt.`,
        ip: "Client Machine",
        status: "warning",
      };
      const updatedLogs = [newLog, ...logs].slice(0, 100);
      writeAuditLogsLocal(updatedLogs);

      // 5. Lưu đồng bộ lên Cloud Store để máy chủ Admin thấy ngay tức thì
      await saveToCloudStore({ users: updated, logs: updatedLogs });

      return NextResponse.json({ success: true, user: newUser, users: updated });
    }

    // Admin hoặc Client sync danh sách người dùng (duyệt, cấp quyền, xóa, cập nhật xu)
    if (action === "sync_users") {
      const { users } = body;
      if (Array.isArray(users)) {
        writeUsersLocal(users);
        await saveToCloudStore({ users });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Dữ liệu users không hợp lệ" }, { status: 400 });
    }

    // Sync danh sách máy bị khóa / theo dõi
    if (action === "sync_devices") {
      const { devices } = body;
      if (Array.isArray(devices)) {
        writeDevicesLocal(devices);
        await saveToCloudStore({ devices });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Dữ liệu devices không hợp lệ" }, { status: 400 });
    }

    // Sync nhật ký an ninh
    if (action === "sync_audit") {
      const { logs } = body;
      if (Array.isArray(logs)) {
        writeAuditLogsLocal(logs);
        await saveToCloudStore({ logs });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Dữ liệu logs không hợp lệ" }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing auth action";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
