"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthContextType, ManagedUser, UserStatus, AppModuleId, AuditLogItem, LockedDevice } from "./types";
import { buildDefaultUsers, enforceUserWhitelist } from "./defaultUsers";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "txclonedriver_session";
const STORAGE_USERS_KEY = "txclonedriver_managed_users";
const STORAGE_AUDIT_KEY = "txclonedriver_security_audit_logs";
const STORAGE_MAINTENANCE_KEY = "txclonedriver_maintenance_mode";
const STORAGE_LOCKED_DEVICES_KEY = "txclonedriver_locked_devices_list";

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
    action: "Driver Login",
    details: "Thành viên 11 đăng nhập",
    ip: "192.168.1.45",
    status: "warning",
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

// Default initial users: admin + đúng 10 thành viên cố định (xem defaultUsers.ts)
const INITIAL_USERS: ManagedUser[] = buildDefaultUsers();

// Phiên đăng nhập do SERVER giữ trong cookie httpOnly có chữ ký — trình
// duyệt không đọc/sửa được. Các hàm dưới đây chỉ dọn cookie JS cũ (bản trước)
// và hỏi server xem phiên hiện tại là ai.
function clearLegacyCookies() {
  try {
    document.cookie = "txclonedriver_session=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "datavault_session=; path=/; max-age=0; SameSite=Lax";
  } catch {}
}

function toAuthUser(raw: {
  id?: string;
  username: string;
  role: "admin" | "user";
  name: string;
  status?: string;
  allowedModules?: string[];
}): AuthUser {
  const initials =
    (raw.name || raw.username)
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";
  return {
    id: raw.id,
    username: raw.username,
    role: raw.role,
    name: raw.name,
    avatarInitials: initials,
    status: "approved",
    allowedModules: raw.allowedModules || [],
  };
}

async function fetchServerSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`/api/auth?type=me&_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.user) return toAuthUser(data.user);
  } catch {}
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
            const merged = enforceUserWhitelist(Array.from(map.values()));
            try {
              localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
          return enforceUserWhitelist(data.users as ManagedUser[]);
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
        // Loại ngay mọi user cũ ngoài whitelist (userb, hocvien_moi, user tự đăng ký...)
        const cleaned = enforceUserWhitelist(JSON.parse(savedUsers));
        setManagedUsers(cleaned);
        try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cleaned)); } catch {}
      }
      // Dọn trạng thái khóa máy cũ: cơ chế khóa vĩnh viễn sau 3 lần sai đã bị gỡ,
      // tránh trình duyệt từng bị khóa tiếp tục kẹt ở dữ liệu cũ.
      try {
        localStorage.removeItem("txclonedriver_failed_attempts");
        localStorage.removeItem("txclonedriver_device_locked");
        localStorage.removeItem("txclonedriver_lock_timestamp");
      } catch {}
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

    // Khôi phục phiên từ server (cookie httpOnly). Cookie JS cũ nếu còn
    // sẽ bị middleware/server từ chối vì không có chữ ký.
    fetchServerSession().then((serverUser) => {
      if (serverUser) setUser(serverUser);
    });
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
            setManagedUsers(event.data.users);
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
      ws = new WebSocket("wss://ntfy.sh/txclone-hub-7f3k9x2q-events/ws");
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

  const saveUsersList = (rawUpdated: ManagedUser[]) => {
    const updated = enforceUserWhitelist(rawUpdated);
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
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      return { success: false, error: "Vui lòng điền đầy đủ tài khoản và mật khẩu." };
    }
    // Xác thực hoàn toàn ở SERVER: server kiểm tra (thành viên driver: đúng
    // tài khoản + mật khẩu bất kỳ; admin: đúng mật khẩu đã băm) rồi phát
    // cookie httpOnly có chữ ký. Trình duyệt không còn giữ mật khẩu nào.
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username: u, password: p }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.user) {
        return { success: false, error: data?.error || "Tài khoản hoặc mật khẩu không chính xác." };
      }
      const authUser = toAuthUser(data.user);
      setUser(authUser);
      refreshUsersFromServer().catch(() => {});
      return { success: true, user: authUser };
    } catch {
      return { success: false, error: "Không thể kết nối máy chủ xác thực. Vui lòng thử lại." };
    }
  };

  const register = async (
    _username: string,
    _password: string,
    _name: string,
    _confirmPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Đăng ký thành viên đã bị TẮT vĩnh viễn: hệ thống chỉ có admin + 10
    // thành viên cố định. Giữ hàm này để các caller cũ không vỡ, nhưng luôn từ chối.
    void _username; void _password; void _name; void _confirmPassword;
    return {
      success: false,
      error: "Chức năng đăng ký đã bị tắt. Hệ thống chỉ có các tài khoản được cấp sẵn, vui lòng liên hệ Admin.",
    };
  };

  // Google login is deprecated per user requirement - keep minimal signature to avoid breaking callers
  const loginWithGoogle = async (googleProfile: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: "Đăng nhập Google đã được tắt. Vui lòng dùng tài khoản được cấp sẵn." };
  };

  const logout = () => {
    setUser(null);
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => {});
    clearLegacyCookies();
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
    // Cookie đóng vai do SERVER phát lại (có chữ ký, ghi rõ imp=<admin>).
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "impersonate", userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.user) setUser(toAuthUser(data.user));
      })
      .catch(() => {});
    logSecurityAudit(
      "Impersonate User",
      `Admin đóng vai @${targetUser.username} (${targetUser.role})`,
      "warning"
    );
  };

  const stopImpersonating = () => {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop_impersonate" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.user) setUser(toAuthUser(data.user));
        else if (originalAdminUser) setUser(originalAdminUser);
      })
      .catch(() => {
        if (originalAdminUser) setUser(originalAdminUser);
      });
    if (originalAdminUser) {
      logSecurityAudit(
        "Stop Impersonating",
        `Quay trở lại tài khoản Quản trị viên @${originalAdminUser.username}`,
        "success"
      );
    }
    setOriginalAdminUser(null);
    try {
      sessionStorage.removeItem("tx_original_admin");
    } catch {}
  };

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
