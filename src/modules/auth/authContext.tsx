"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthContextType, ManagedUser, UserStatus, AppModuleId } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "txclonedriver_session";
const STORAGE_USERS_KEY = "txclonedriver_managed_users";

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
    allowedModules: ["storage"], // Đúng như yêu cầu: Thành viên A chỉ được mở mục Google Driver
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
    allowedModules: ["storage", "projects"], // Đúng như yêu cầu: Thành viên B chỉ được mở Google Driver và Dự án
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

  // Load managed users and session
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (savedUsers) {
        setManagedUsers(JSON.parse(savedUsers));
      } else {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      }
    } catch {
      // ignore
    }

    const existingSession = getSessionCookie();
    if (existingSession) {
      setUser(existingSession);
    }
    setInitialized(true);
  }, []);

  const saveUsersList = (updated: ManagedUser[]) => {
    setManagedUsers(updated);
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const u = username.trim();
    const p = password.trim();

    // Check in managedUsers list
    const foundUser = managedUsers.find((item) => item.username.toLowerCase() === u.toLowerCase());

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
      status: "pending", // Mặc định chờ admin phê duyệt
      allowedModules: [], // Chưa được cấp quyền module nào
      createdAt: dateStr,
    };

    const updated = [...managedUsers, newUser];
    saveUsersList(updated);

    return { success: true };
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        managedUsers,
        login,
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
