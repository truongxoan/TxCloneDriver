"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthContextType, ManagedUser, UserStatus, AppModuleId, AuditLogItem, LockedDevice } from "./types";

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
    username: "hocvien_moi",
    action: "User Registration",
    details: "Tài khoản đăng ký mới đang chờ duyệt",
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

// Default initial users
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

  // Function to pull users from server API and update state & localStorage
  const refreshUsersFromServer = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setManagedUsers(data.users);
          try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(data.users));
          } catch {}
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
        setManagedUsers(JSON.parse(savedUsers));
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
    if (existingSession) {
      setUser(existingSession);
    }
    setInitialized(true);

    // 2. Fetch fresh users & devices & audit from server
    refreshUsersFromServer();

    // 3. Periodic polling every 3.5s so Admin sees new registrations from target machines in real time!
    const pollInterval = setInterval(() => {
      refreshUsersFromServer();
    }, 3500);

    return () => clearInterval(pollInterval);
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

    // Refresh users from server to get latest approvals / updates
    const freshUsers = (await refreshUsersFromServer()) || managedUsers;

    // Check in users list
    const foundUser = freshUsers.find((item) => item.username.toLowerCase() === u.toLowerCase());

    if (!foundUser || foundUser.password !== p) {
      return {
        success: false,
        error: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
      };
    }

    // Check approval status
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

  const register = async (
    username: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    const u = username.trim();
    const p = password.trim();
    const n = name.trim();

    if (!u || !p || !n) {
      return { success: false, error: "Vui lòng nhập đầy đủ thông tin đăng ký." };
    }

    try {
      // Send register request to server API so all clients/admin see it
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: u,
          password: p,
          name: n,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Không thể đăng ký tài khoản." };
      }

      if (Array.isArray(data.users)) {
        setManagedUsers(data.users);
        try {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(data.users));
        } catch {}
      }

      logSecurityAudit(
        "User Registration Pending",
        `Tài khoản đăng ký lẻ @${u} (${n}) gửi yêu cầu, đang chờ Admin phê duyệt cấp quyền.`,
        "warning"
      );

      return { success: true };
    } catch {
      // Fallback local if network fails
      if (managedUsers.some((item) => item.username.toLowerCase() === u.toLowerCase())) {
        return { success: false, error: "Tên tài khoản này đã tồn tại trên hệ thống. Vui lòng chọn tên khác." };
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

      const updated = [...managedUsers, newUser];
      saveUsersList(updated);

      return { success: true };
    }
  };

  const loginWithGoogle = async (googleProfile: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const email = googleProfile.email.trim().toLowerCase();
    const name = googleProfile.name.trim() || email.split("@")[0];

    try {
      // 1. Call server API to create/find account in central store
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email,
          name,
          avatarUrl: googleProfile.avatarUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.user) {
        throw new Error(data.error || "Server registration error");
      }

      const foundUser: ManagedUser = data.user;
      if (Array.isArray(data.users)) {
        setManagedUsers(data.users);
        try {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(data.users));
        } catch {}
      }

      if (foundUser.status === "rejected") {
        return { success: false, error: "Tài khoản Google này đã bị khóa quyền truy cập." };
      }

      const initials =
        foundUser.name
          .split(" ")
          .map((s) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "GG";

      const authUser: AuthUser = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        avatarInitials: initials,
        avatarUrl: foundUser.avatarUrl,
        status: foundUser.status,
        allowedModules: foundUser.allowedModules || ["storage", "overview", "image_studio", "google_flow"],
        provider: "google",
        googleEmail: email,
        coins: foundUser.coins,
      };

      setUser(authUser);
      setSessionCookie(authUser);
      logSecurityAudit("Google Login", `Tài khoản Google @${email} đăng nhập thành công`, "success");
      return { success: true };
    } catch {
      // Fallback local logic
      const currentUsers = (await refreshUsersFromServer()) || managedUsers;
      let foundUser = currentUsers.find(
        (u) =>
          (u.googleEmail && u.googleEmail.toLowerCase() === email) ||
          u.username.toLowerCase() === email
      );

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      if (!foundUser) {
        foundUser = {
          id: `u-gg-${Date.now()}`,
          username: email,
          name: name,
          avatarUrl: googleProfile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role: "user",
          status: "approved",
          allowedModules: ["storage", "overview", "image_studio", "google_flow", "vault", "notes", "projects"],
          createdAt: dateStr,
          coins: 50000,
          provider: "google",
          googleEmail: email,
        };

        const updated = [...currentUsers, foundUser];
        saveUsersList(updated);
      }

      const initials =
        foundUser.name
          .split(" ")
          .map((s) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "GG";

      const authUser: AuthUser = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        avatarInitials: initials,
        avatarUrl: foundUser.avatarUrl,
        status: foundUser.status,
        allowedModules: foundUser.allowedModules,
        provider: "google",
        googleEmail: email,
        coins: foundUser.coins,
      };

      setUser(authUser);
      setSessionCookie(authUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    clearSessionCookie();
    router.push("/login");
  };

  // Admin action: update permissions and status
  const updateUserPermissions = (userId: string, allowedModules: string[], status: UserStatus) => {
    const updated = managedUsers.map((item) =>
      item.id === userId ? { ...item, allowedModules, status } : item
    );
    saveUsersList(updated);

    // If current logged in user was modified, update their active session
    if (user && user.id === userId) {
      const updatedUser: AuthUser = {
        ...user,
        allowedModules,
        status,
      };
      setUser(updatedUser);
      setSessionCookie(updatedUser);
    }
  };

  const approveUser = (userId: string, allowedModules: string[]) => {
    updateUserPermissions(userId, allowedModules.length > 0 ? allowedModules : ["storage"], "approved");
  };

  const rejectUser = (userId: string) => {
    const updated = managedUsers.map((item) =>
      item.id === userId ? { ...item, status: "rejected" as UserStatus } : item
    );
    saveUsersList(updated);
  };

  const deleteUser = (userId: string) => {
    const updated = managedUsers.filter((item) => item.id !== userId);
    saveUsersList(updated);
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
