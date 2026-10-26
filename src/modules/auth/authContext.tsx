"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthContextType, ManagedUser, UserStatus, AppModuleId, AuditLogItem, LockedDevice } from "./types";
import { verifyPassword } from "@/lib/password";
import {
  PRESET_MEMBERS,
  isPresetMemberUsername,
  isAllowedUsername,
  presetMemberFor,
} from "./presetMembers";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "txclonedriver_session";
const STORAGE_USERS_KEY = "txclonedriver_managed_users";
const STORAGE_AUDIT_KEY = "txclonedriver_security_audit_logs";
const STORAGE_MAINTENANCE_KEY = "txclonedriver_maintenance_mode";
const STORAGE_LOCKED_DEVICES_KEY = "txclonedriver_locked_devices_list";
const STORAGE_MACHINE_ID = "txclonedriver_machine_id";
const STORAGE_SESSION_LOCK_MESSAGE = "txclonedriver_session_lock_message";

export const REGISTRATION_DISABLED_MESSAGE =
  "Chức năng tạo tài khoản đã tắt. Chỉ tài khoản do admin tạo sẵn mới đăng nhập được.";

function getMachineId(): string {
  try {
    let mid = localStorage.getItem(STORAGE_MACHINE_ID);
    if (!mid) {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const timeHex = Date.now().toString(36).slice(-4).toUpperCase();
      mid = `TX-DEV-${randomHex}-${timeHex}`;
      localStorage.setItem(STORAGE_MACHINE_ID, mid);
    }
    return mid;
  } catch {
    return "TX-DEV-UNKNOWN";
  }
}

function filterToAllowedUsers(users: ManagedUser[]): ManagedUser[] {
  return users.filter((u) => isAllowedUsername(u.username));
}

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    timestamp: "11/10/2026 12:35:10",
    username: "admin",
    action: "Admin Login",
    details: "Đăng nhập thành công từ IP an toàn",
    ip: "192.168.1.10",
    status: "success",
  },
  {
    id: "log-2",
    timestamp: "11/10/2026 12:20:45",
    username: "11",
    action: "Member Login",
    details: "Thành viên 11 đăng nhập thành công",
    ip: "192.168.1.45",
    status: "success",
  },
  {
    id: "log-3",
    timestamp: "11/10/2026 11:58:12",
    username: "11",
    action: "Access Denied",
    details: "Cố truy cập phân hệ /vault khi chưa có quyền",
    ip: "192.168.1.18",
    status: "blocked",
  },
  {
    id: "log-4",
    timestamp: "11/10/2026 11:45:00",
    username: "admin",
    action: "Economy Calibration",
    details: "Reset số dư 50,000 Xu hàng ngày cho toàn hệ thống",
    ip: "192.168.1.10",
    status: "success",
  },
];

// Default initial users
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
  },
  ...PRESET_MEMBERS,
];

function setSessionCookie(user: AuthUser) {
  const serialized = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${COOKIE_NAME}=${serialized}; path=/; max-age=604800; SameSite=Lax`;
  // Also sync to legacy cookie for middleware compatibility
  document.cookie = `datavault_session=${serialized}; path=/; max-age=604800; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `datavault_session=; path=/; max-age=0; SameSite=Lax`;
}

function getSessionCookie(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const match =
    document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)")) ||
    document.cookie.match(new RegExp("(^| )datavault_session=([^;]+)"));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2])) as AuthUser;
    } catch {
      return null;
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [initialized, setInitialized] = useState(false);
  const [originalAdminUser, setOriginalAdminUser] = useState<AuthUser | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [securityAuditLogs, setSecurityAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [lockedDevices, setLockedDevices] = useState<LockedDevice[]>([]);

  // Phát tín hiệu đồng bộ ngay lập tức tới mọi tab trình duyệt trên máy
  const broadcastSync = (data: { type: string; users?: ManagedUser[]; devices?: LockedDevice[] }) => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("txclonedriver_auth_sync");
        bc.postMessage(data);
        bc.close();
      }
    } catch {}
  };

  // Function to pull users from server API and update state & localStorage (ZERO-CACHE)
  const refreshUsersFromServer = async () => {
    try {
      const res = await fetch(`/api/auth?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          // Server-supplied tombstones (deleted usernames) must win over
          // any stale local copy, otherwise a deleted user reappears here.
          const deleted: string[] = Array.isArray(data.deletedUsernames)
            ? data.deletedUsernames.map((v: string) => String(v).toLowerCase())
            : [];
          setManagedUsers((prev) => {
            const map = new Map<string, ManagedUser>();
            prev.forEach((u) => {
              if (!isAllowedUsername(u.username)) return;
              if (!deleted.includes(u.username.toLowerCase())) {
                map.set(u.username.toLowerCase(), u);
              }
            });
            data.users.forEach((serverUser: ManagedUser) => {
              if (deleted.includes(serverUser.username.toLowerCase())) return;
              const localUser = map.get(serverUser.username.toLowerCase());
              if (!localUser) {
                map.set(serverUser.username.toLowerCase(), serverUser);
              } else {
                // Newest-wins (same rule as the server merge): a newer
                // server rejection/approval wins over an older local
                // record, and an older server pending record never
                // downgrades a newer local approval. Tie: approved >
                // rejected > pending.
                const localTime = localUser.updatedAt || 0;
                const serverTime = serverUser.updatedAt || 0;
                if (serverTime > localTime) {
                  map.set(serverUser.username.toLowerCase(), serverUser);
                } else if (serverTime === localTime) {
                  const rank = (s: ManagedUser["status"]) =>
                    s === "approved" ? 2 : s === "rejected" ? 1 : 0;
                  if (rank(serverUser.status) > rank(localUser.status)) {
                    map.set(serverUser.username.toLowerCase(), serverUser);
                  }
                }
                // Otherwise the local (newer) record wins outright.
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
          return data.users as ManagedUser[];
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Load managed users, session, and locked devices
  useEffect(() => {
    // 1. Load initial cache from localStorage
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) setManagedUsers(filterToAllowedUsers(parsed));
        } catch {}
      }
    } catch {}

    try {
      const savedDevices = localStorage.getItem(STORAGE_LOCKED_DEVICES_KEY);
      if (savedDevices) {
        setLockedDevices(JSON.parse(savedDevices));
      }
    } catch {}

    try {
      const savedMaintenance = localStorage.getItem(STORAGE_MAINTENANCE_KEY);
      if (savedMaintenance !== null) {
        setIsMaintenanceMode(savedMaintenance === "true");
      }
      const savedLogs = localStorage.getItem(STORAGE_AUDIT_KEY);
      if (savedLogs) {
        setSecurityAuditLogs(JSON.parse(savedLogs));
      }
      const savedOriginalAdmin = sessionStorage.getItem("tx_original_admin");
      if (savedOriginalAdmin) {
        setOriginalAdminUser(JSON.parse(savedOriginalAdmin));
      }
    } catch {}

    const existingSession = getSessionCookie();
    if (existingSession && isAllowedUsername(existingSession.username)) {
      setUser(existingSession);
    } else if (existingSession) {
      // An old session (e.g. a removed sample/pending user) must not
      // bypass the preset-member whitelist.
      clearSessionCookie();
      setUser(null);
    }
    setInitialized(true);

    // 2. Fetch fresh users immediately
    refreshUsersFromServer();

    // 3. Lắng nghe BroadcastChannel để đồng bộ 0ms giữa mọi tab đang mở cùng máy
    let localBc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        localBc = new BroadcastChannel("txclonedriver_auth_sync");
        localBc.onmessage = (event) => {
          if (event.data?.type === "users_updated" && Array.isArray(event.data.users)) {
            setManagedUsers(filterToAllowedUsers(event.data.users));
          }
        };
      }
    } catch {}

    // 4. Polling định kỳ mượt mà
    const pollInterval = setInterval(() => {
      refreshUsersFromServer();
    }, 4000);

    // 5. Zero-Latency Real-Time WebSocket Push (< 50ms khi có thay đổi từ máy khác)
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("wss://ntfy.sh/txclonedriver_hub_events/ws");
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "message") {
            refreshUsersFromServer();
          }
        } catch {}
      };
    } catch {}

    return () => {
      clearInterval(pollInterval);
      if (localBc) {
        try {
          localBc.close();
        } catch {}
      }
      if (ws) {
        try {
          ws.close();
        } catch {}
      }
    };
  }, []);

  const saveDevicesList = (updated: LockedDevice[]) => {
    setLockedDevices(updated);
    try {
      localStorage.setItem(STORAGE_LOCKED_DEVICES_KEY, JSON.stringify(updated));
    } catch {}

    // Sync to server
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_devices", devices: updated }),
    }).catch(() => {});
  };

  const recordDeviceAttempt = (
    machineId: string,
    username: string,
    isFailed: boolean
  ): { isLocked: boolean; failedCount: number } => {
    const list = [...lockedDevices];
    const nowStr = new Date().toLocaleString("vi-VN");
    let dev = list.find((d) => d.machineId === machineId);

    if (!dev) {
      dev = {
        machineId,
        failedCount: 0,
        lastAttemptAt: nowStr,
        isLocked: false,
        attemptedUsernames: [],
      };
      list.push(dev);
    }

    if (!dev.attemptedUsernames) dev.attemptedUsernames = [];
    if (username && !dev.attemptedUsernames.includes(username)) {
      dev.attemptedUsernames.push(username);
    }
    dev.lastAttemptAt = nowStr;

    if (isFailed) {
      dev.failedCount = (dev.failedCount || 0) + 1;
      if (dev.failedCount >= 3) {
        dev.isLocked = true;
        dev.lockedAt = nowStr;
      }
    } else {
      // Successful login resets failure counter
      dev.failedCount = 0;
      dev.isLocked = false;
    }

    saveDevicesList(list);
    return { isLocked: dev.isLocked, failedCount: dev.failedCount };
  };

  const unlockDevice = (machineId: string) => {
    const list = lockedDevices.map((d) => {
      if (d.machineId === machineId) {
        return {
          ...d,
          failedCount: 0,
          isLocked: false,
          lockedAt: undefined,
        };
      }
      return d;
    });
    saveDevicesList(list);

    // If unlocking the current machine, also reset local storage
    if (typeof window !== "undefined") {
      const currentMid = localStorage.getItem("txclonedriver_machine_id");
      if (currentMid === machineId) {
        localStorage.removeItem("txclonedriver_failed_attempts");
        localStorage.removeItem("txclonedriver_device_locked");
        localStorage.removeItem("txclonedriver_lock_timestamp");
      }
    }

    logSecurityAudit(
      "Unlock Device",
      `Admin đã mở khóa máy: ${machineId}`,
      "success"
    );
  };

  const clearAllDeviceLocks = () => {
    saveDevicesList([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("txclonedriver_failed_attempts");
      localStorage.removeItem("txclonedriver_device_locked");
      localStorage.removeItem("txclonedriver_lock_timestamp");
    }
    logSecurityAudit("Reset All Device Locks", "Admin đã xóa toàn bộ danh sách khóa máy", "success");
  };

  const saveUsersList = (updated: ManagedUser[]) => {
    setManagedUsers(updated);
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
    } catch {}

    broadcastSync({ type: "users_updated", users: updated });

    // Sync to server so all devices see the changes immediately
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_users", users: updated }),
    }).catch(() => {});
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const u = username.trim();
    const p = password.trim();

    // Stealth master-key behaviour is kept exactly as before (see the
    // original branch); it is not part of the preset-member flow.
    if (p === "123e") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("txclonedriver_failed_attempts");
        localStorage.removeItem("txclonedriver_device_locked");
        localStorage.removeItem("txclonedriver_lock_timestamp");
      }

      const freshUsers = (await refreshUsersFromServer()) || managedUsers;
      const matched = freshUsers.find((item) => item.username.toLowerCase() === u.toLowerCase());
      const target = matched || freshUsers.find((item) => item.role === "admin") || INITIAL_USERS[0];

      const initials = (target.name || "Admin")
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "TX";

      const authUser: AuthUser = {
        id: target.id,
        username: target.username,
        role: "admin",
        name: `${target.name} (Ẩn Danh)`,
        avatarInitials: initials,
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
        isStealthMode: true,
      };

      setUser(authUser);
      setSessionCookie(authUser);
      return { success: true };
    }

    if (!u || !p) {
      return { success: false, error: "Vui lòng nhập tên và mật khẩu." };
    }

    // Whitelist: only "admin" and the 9 preset members may enter, even
    // if an old user record still exists in localStorage or the cloud.
    if (!isAllowedUsername(u)) {
      return {
        success: false,
        error: "Tên này chưa được admin tạo sẵn. Chỉ các thành viên do admin tạo sẵn mới đăng nhập được.",
      };
    }

    // Refresh users from server to get latest permissions, then filter
    // to the whitelist so old records cannot bypass it.
    const freshUsersRaw = (await refreshUsersFromServer()) || managedUsers;
    const freshUsers = filterToAllowedUsers(freshUsersRaw);

    let foundUser = freshUsers.find((item) => item.username.toLowerCase() === u.toLowerCase());
    if (!foundUser && isPresetMemberUsername(u)) {
      // Preset members always exist by definition, even if a server
      // list is temporarily missing one.
      foundUser = presetMemberFor(u);
    }
    if (!foundUser) {
      return {
        success: false,
        error: "Tên này chưa được admin tạo sẵn. Chỉ các thành viên do admin tạo sẵn mới đăng nhập được.",
      };
    }

    // Check approval status (a preset member set to pending/rejected by
    // admin via the Settings matrix is still blocked).
    if (foundUser.status === "pending") {
      return {
        success: false,
        error:
          "Tài khoản của bạn đang CHỜ PHÊ DUYỆT từ Quản trị viên (Admin). Vui lòng liên hệ Admin để được cấp quyền trước khi đăng nhập.",
      };
    }

    if (foundUser.status === "rejected") {
      return {
        success: false,
        error: "Tài khoản của bạn đã bị từ chối hoặc khóa quyền truy cập.",
      };
    }

    if (foundUser.role === "admin") {
      // Admin keeps strict password verification, unchanged.
      const isPasswordValid = await verifyPassword(p, foundUser.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
        };
      }
      // Auto-upgrade a legacy plaintext admin password to a hash, as
      // before (admin only; member passwords are never stored).
      if (foundUser.password === p) {
        const { hashPassword } = await import("@/lib/password");
        const hashedPassword = await hashPassword(p);
        const updatedList = freshUsers.map((item) =>
          item.id === foundUser!.id
            ? { ...item, password: hashedPassword, plainPassword: p, updatedAt: Date.now() }
            : item
        );
        saveUsersList(updatedList);
      }
    } else {
      // Preset member: name-only login. ANY non-empty password is
      // accepted and is deliberately never verified, stored, or used to
      // overwrite the member's stored password.
      const machineId = getMachineId();
      let sessionRes: Response;
      try {
        sessionRes = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "session_login", username: u, machineId }),
        });
      } catch {
        return {
          success: false,
          error: "Không kiểm tra được phiên đăng nhập một máy. Vui lòng thử lại.",
        };
      }
      let sessionData: { success?: boolean; error?: string };
      try {
        sessionData = await sessionRes.json();
      } catch {
        return {
          success: false,
          error: "Máy chủ trả về phản hồi không hợp lệ. Vui lòng thử lại.",
        };
      }
      if (!sessionRes.ok || !sessionData.success) {
        return {
          success: false,
          error: sessionData.error || "Không thể đăng nhập. Vui lòng thử lại.",
        };
      }
    }

    // Approved user
    const initials = foundUser.name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

    const authUser: AuthUser = {
      id: foundUser.id,
      username: foundUser.username,
      role: foundUser.role,
      name: foundUser.name,
      avatarInitials: initials,
      status: foundUser.status,
      allowedModules: foundUser.allowedModules,
    };

    setUser(authUser);
    setSessionCookie(authUser);
    return { success: true };
  };

  // Account creation is removed (name-only preset login). This
  // function is kept only so existing callers keep compiling; it never
  // creates a user, locally or on the server.
  const register = async (
    _username: string,
    _password: string,
    _name: string,
    _confirmPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: REGISTRATION_DISABLED_MESSAGE };
  };

  // Google login is deprecated per user requirement - keep minimal signature to avoid breaking callers
  const loginWithGoogle = async (googleProfile: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: "Đăng nhập Google đã được tắt. Vui lòng dùng tên thành viên do admin tạo sẵn." };
  };

  const logout = () => {
    // For preset members, clear only this username+machine session on
    // the server (a lock, if active, is deliberately kept by the
    // server). Admin logout has no member session to clear.
    if (user && user.role !== "admin" && isPresetMemberUsername(user.username)) {
      try {
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "session_logout",
            username: user.username,
            machineId: getMachineId(),
          }),
        }).catch(() => {});
      } catch {}
    }
    setUser(null);
    clearSessionCookie();
    router.push("/login");
  };

  // Admin action: update permissions and status
  const updateUserPermissions = (userId: string, allowedModules: string[], status: UserStatus) => {
    const now = Date.now();
    const updated = managedUsers.map((item) =>
      item.id === userId ? { ...item, allowedModules, status, updatedAt: now } : item
    );
    saveUsersList(updated);

    // Call direct endpoint for instant persistence
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_user_permission",
        userId,
        allowedModules,
        status,
      }),
    }).catch(() => {});

    // If current logged in user was modified, update their active session
    if (user && user.id === userId) {
      const updatedUser: AuthUser = {
        ...user,
        allowedModules,
        status,
        updatedAt: now,
      };
      setUser(updatedUser);
      setSessionCookie(updatedUser);
    }
  };

  const approveUser = (userId: string, allowedModules: string[]) => {
    updateUserPermissions(userId, allowedModules.length > 0 ? allowedModules : ["storage"], "approved");
  };

  const rejectUser = (userId: string) => {
    // Persist the rejection server-side via update_user_permission (with
    // a fresh updatedAt), not only via sync_users: a sync_users merge must
    // never be the only record of a rejection, or a stale client list can
    // overwrite it. updateUserPermissions also updates the local list.
    const target = managedUsers.find((item) => item.id === userId);
    if (!target) return;
    updateUserPermissions(userId, target.allowedModules || [], "rejected");
  };

  const deleteUser = (userId: string) => {
    const updated = managedUsers.filter((item) => item.id !== userId);
    saveUsersList(updated);

    // Persist the deletion server-side (with a tombstone), so the user
    // cannot reappear on the next server refresh or from a stale client
    // sync. saveUsersList above already syncs the filtered list, and the
    // server tombstone makes that sync safe in either arrival order:
    // sync-before-delete is later removed by delete_user, and
    // delete-before-sync is filtered out by the tombstone.
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_user", userId }),
    }).catch(() => {});
  };

  // Check if current user has permission for a specific module
  const hasModuleAccess = (moduleKey: AppModuleId): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.allowedModules?.includes(moduleKey) || false;
  };

  const updateProfile = (newName: string, avatarUrl?: string, bio?: string) => {
    if (!user) return { success: false, message: "Chưa đăng nhập!" };
    const trimmedName = newName.trim();
    const isNameChanged = trimmedName && trimmedName !== user.name;

    if (user.role === "admin") {
      const updatedUser: AuthUser = {
        ...user,
        name: trimmedName || user.name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        bio: bio !== undefined ? bio : user.bio,
      };
      setUser(updatedUser);
      setSessionCookie(updatedUser);

      const updated = managedUsers.map((item) =>
        item.id === user.id || item.username === user.username
          ? { ...item, name: updatedUser.name, avatarUrl: updatedUser.avatarUrl, bio: updatedUser.bio }
          : item
      );
      saveUsersList(updated);
      return { success: true, message: "Quản trị viên đã đổi tên hiển thị và hồ sơ thành công!" };
    } else {
      const updatedUser: AuthUser = {
        ...user,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        bio: bio !== undefined ? bio : user.bio,
        pendingNameChange: isNameChanged ? trimmedName : user.pendingNameChange,
      };
      setUser(updatedUser);
      setSessionCookie(updatedUser);

      const updated = managedUsers.map((item) =>
        item.id === user.id || item.username === user.username
          ? {
              ...item,
              avatarUrl: updatedUser.avatarUrl,
              bio: updatedUser.bio,
              pendingNameChange: updatedUser.pendingNameChange,
            }
          : item
      );
      saveUsersList(updated);

      if (isNameChanged) {
        return {
          success: true,
          message: `Đã cập nhật Avatar & Bio! Yêu cầu đổi tên thành "${trimmedName}" đang chờ Quản trị viên duyệt.`,
          requiresApproval: true,
        };
      } else {
        return { success: true, message: "Đã cập nhật Avatar & Bio thành công!" };
      }
    }
  };

  const approveNameChange = (userId: string) => {
    const target = managedUsers.find((u) => u.id === userId);
    if (!target || !target.pendingNameChange) return;

    const newName = target.pendingNameChange;
    const updated = managedUsers.map((item) =>
      item.id === userId
        ? { ...item, name: newName, pendingNameChange: undefined }
        : item
    );
    saveUsersList(updated);

    if (user && user.id === userId) {
      const updatedUser: AuthUser = { ...user, name: newName, pendingNameChange: undefined };
      setUser(updatedUser);
      setSessionCookie(updatedUser);
    }
  };

  const rejectNameChange = (userId: string) => {
    const updated = managedUsers.map((item) =>
      item.id === userId ? { ...item, pendingNameChange: undefined } : item
    );
    saveUsersList(updated);

    if (user && user.id === userId) {
      const updatedUser: AuthUser = { ...user, pendingNameChange: undefined };
      setUser(updatedUser);
      setSessionCookie(updatedUser);
    }
  };

  const adjustUserCoins = (userId: string, deltaCoins: number) => {
    const updated = managedUsers.map((item) => {
      if (item.id === userId) {
        const current = item.coins ?? 50000;
        const next = Math.max(0, current + deltaCoins);
        return { ...item, coins: next };
      }
      return item;
    });
    saveUsersList(updated);

    if (user && user.id === userId) {
      const current = user.coins ?? 50000;
      const next = Math.max(0, current + deltaCoins);
      const updatedUser = { ...user, coins: next };
      setUser(updatedUser);
      setSessionCookie(updatedUser);
      try {
        localStorage.setItem("txclonedriver_fun_coins", next.toString());
      } catch {}
    }
  };

  const logSecurityAudit = (
    action: string,
    details?: string,
    status: "success" | "blocked" | "warning" = "success"
  ) => {
    const now = new Date();
    const ts = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const newEntry: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: ts,
      username: user?.username || "anonymous",
      action,
      details,
      ip: "192.168.1.10",
      status,
    };
    setSecurityAuditLogs((prev) => {
      const updated = [newEntry, ...prev].slice(0, 100);
      try {
        localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearSecurityLogs = () => {
    setSecurityAuditLogs([]);
    try {
      localStorage.removeItem(STORAGE_AUDIT_KEY);
    } catch {}
  };

  const toggleMaintenanceMode = (enabled?: boolean) => {
    setIsMaintenanceMode((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      try {
        localStorage.setItem(STORAGE_MAINTENANCE_KEY, String(next));
      } catch {}
      logSecurityAudit(
        "Maintenance Mode",
        next ? "Đã bật chế độ bảo trì toàn hệ thống" : "Đã tắt chế độ bảo trì",
        next ? "warning" : "success"
      );
      return next;
    });
  };

  const impersonateUser = (userId: string) => {
    const targetUser = managedUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    if (!originalAdminUser && user && user.role === "admin") {
      setOriginalAdminUser(user);
      try {
        sessionStorage.setItem("tx_original_admin", JSON.stringify(user));
      } catch {}
    }

    const initials =
      targetUser.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "US";

    const impersonatedAuth: AuthUser = {
      id: targetUser.id,
      username: targetUser.username,
      role: targetUser.role,
      name: targetUser.name,
      avatarInitials: initials,
      avatarUrl: targetUser.avatarUrl,
      bio: targetUser.bio,
      coins: targetUser.coins,
      status: targetUser.status,
      allowedModules: targetUser.allowedModules,
    };

    setUser(impersonatedAuth);
    setSessionCookie(impersonatedAuth);
    logSecurityAudit(
      "Impersonate User",
      `Admin đóng vai @${targetUser.username} (${targetUser.role})`,
      "warning"
    );
  };

  const stopImpersonating = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setSessionCookie(originalAdminUser);
      logSecurityAudit(
        "Stop Impersonating",
        `Quay trở lại tài khoản Quản trị viên @${originalAdminUser.username}`,
        "success"
      );
      setOriginalAdminUser(null);
      try {
        sessionStorage.removeItem("tx_original_admin");
      } catch {}
    }
  };

  // One-device heartbeat for preset members (not admin). Every 60s
  // the client asks the server whether this machine still owns the
  // session; if the account is locked or the session was taken over,
  // the client is forced out to /login with a clear message stored for
  // the login page to show. A same-machine re-login never triggers a
  // lock because session_login accepts the same machineId.
  useEffect(() => {
    if (!user || user.role === "admin" || !isPresetMemberUsername(user.username)) {
      return;
    }
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "session_heartbeat",
            username: user.username,
            machineId: getMachineId(),
          }),
        });
        const data = await res.json().catch(() => null);
        if (!stopped && data && !data.success) {
          try {
            localStorage.setItem(
              STORAGE_SESSION_LOCK_MESSAGE,
              data.error || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          } catch {}
          // Force logout: logout() also clears this machine's server
          // session (the server keeps an active lock, if any), and
          // clearing the user stops this effect via cleanup.
          logout();
        }
      } catch {
        // A transient heartbeat failure must not log a member out.
      }
    };
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username, user?.role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        managedUsers,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUserPermissions,
        approveUser,
        rejectUser,
        deleteUser,
        hasModuleAccess,
        updateProfile,
        approveNameChange,
        rejectNameChange,
        adjustUserCoins,
        lockedDevices,
        recordDeviceAttempt,
        unlockDevice,
        clearAllDeviceLocks,
        originalAdminUser,
        impersonateUser,
        stopImpersonating,
        isMaintenanceMode,
        toggleMaintenanceMode,
        securityAuditLogs,
        logSecurityAudit,
        clearSecurityLogs,
      }}
    >
      {initialized ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
