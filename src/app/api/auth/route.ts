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
  },
];

// Bộ nhớ đệm Memory Fallback an toàn tuyệt đối nếu hệ thống cấm thao tác file
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
    console.warn("Unable to create DATA_DIR, fallback to in-memory store:", err);
    return false;
  }
}

function readUsers(): ManagedUser[] {
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

function writeUsers(users: ManagedUser[]) {
  memoryUsers = users;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.warn("Unable to write users file, preserved in memory:", err);
  }
}

function readDevices(): LockedDevice[] {
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

function writeDevices(devices: LockedDevice[]) {
  memoryDevices = devices;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2), "utf8");
  } catch (err) {
    console.warn("Unable to write devices file, preserved in memory:", err);
  }
}

function readAuditLogs(): AuditLogItem[] {
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

function writeAuditLogs(logs: AuditLogItem[]) {
  memoryAuditLogs = logs;
  if (!ensureDataDir()) return;
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.warn("Unable to write audit file, preserved in memory:", err);
  }
}

// GET: Fetch users, devices, audit logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "devices") {
      const devices = readDevices();
      return NextResponse.json({ success: true, devices });
    }

    if (type === "audit") {
      const logs = readAuditLogs();
      return NextResponse.json({ success: true, logs });
    }

    const users = readUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    // Luôn trả về danh sách người dùng thay vì quăng lỗi 500
    return NextResponse.json({ success: true, users: memoryUsers });
  }
}

// POST: Actions (register, google_login, sync_users, sync_devices, sync_audit)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Google Account Login / Registration
    if (action === "google_login") {
      const { email, name, avatarUrl } = body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanName = (name || "").trim() || cleanEmail.split("@")[0];

      if (!cleanEmail) {
        return NextResponse.json(
          { success: false, error: "Email Google không hợp lệ." },
          { status: 400 }
        );
      }

      const users = readUsers();
      let foundUser = users.find(
        (u) =>
          (u.googleEmail && u.googleEmail.toLowerCase() === cleanEmail) ||
          u.username.toLowerCase() === cleanEmail
      );

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      if (!foundUser) {
        // Tự động tạo tài khoản Google, cấp quyền Drive và vào dùng ngay lập tức
        foundUser = {
          id: `u-gg-${Date.now()}`,
          username: cleanEmail,
          name: cleanName,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
          role: "user",
          status: "approved",
          allowedModules: ["storage", "overview", "image_studio", "google_flow", "vault", "notes", "projects"],
          createdAt: dateStr,
          coins: 50000,
          provider: "google",
          googleEmail: cleanEmail,
        };

        const updated = [...users, foundUser];
        writeUsers(updated);

        // Nhật ký an ninh
        const logs = readAuditLogs();
        const ts = `${dateStr} ${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        const newLog: AuditLogItem = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: ts,
          username: cleanEmail,
          action: "Google Auto-Register & Login",
          details: `Tài khoản Google @${cleanEmail} (${cleanName}) tự động tạo tài khoản và đăng nhập thành công.`,
          ip: "Google Auth",
          status: "success",
        };
        writeAuditLogs([newLog, ...logs].slice(0, 100));

        return NextResponse.json({ success: true, user: foundUser, users: updated });
      } else {
        // Cập nhật avatar nếu có
        if (avatarUrl && !foundUser.avatarUrl) {
          foundUser.avatarUrl = avatarUrl;
          writeUsers(users);
        }

        if (foundUser.status === "rejected") {
          return NextResponse.json(
            { success: false, error: "Tài khoản Google này đã bị khóa quyền truy cập." },
            { status: 403 }
          );
        }

        return NextResponse.json({ success: true, user: foundUser, users });
      }
    }

    // 2. Regular Register
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

      const users = readUsers();
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

      const newUser: ManagedUser = {
        id: `u-${Date.now()}`,
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
      writeUsers(updated);

      // Audit log
      const logs = readAuditLogs();
      const ts = `${dateStr} ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: ts,
        username: u,
        action: "User Registration Pending",
        details: `Tài khoản đăng ký mới @${u} (${n}) gửi yêu cầu từ máy người dùng, đang chờ Admin phê duyệt cấp quyền.`,
        ip: "Client Machine",
        status: "warning",
      };
      writeAuditLogs([newLog, ...logs].slice(0, 100));

      return NextResponse.json({ success: true, user: newUser, users: updated });
    }

    if (action === "sync_users") {
      const { users } = body;
      if (Array.isArray(users)) {
        writeUsers(users);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Dữ liệu users không hợp lệ" }, { status: 400 });
    }

    if (action === "sync_devices") {
      const { devices } = body;
      if (Array.isArray(devices)) {
        writeDevices(devices);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Dữ liệu devices không hợp lệ" }, { status: 400 });
    }

    if (action === "sync_audit") {
      const { logs } = body;
      if (Array.isArray(logs)) {
        writeAuditLogs(logs);
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
