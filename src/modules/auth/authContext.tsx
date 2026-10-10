"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "datavault_session";

function setSessionCookie(user: AuthUser) {
  const serialized = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${COOKIE_NAME}=${serialized}; path=/; max-age=604800; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function getSessionCookie(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check existing session
    const existing = getSessionCookie();
    if (existing) {
      setUser(existing);
    }
    setInitialized(true);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Trim inputs
    const u = username.trim();
    const p = password.trim();

    // Verify credentials strictly according to specifications
    if (u === "admin" && p === "kdkctrkn@123") {
      const adminUser: AuthUser = {
        username: "admin",
        role: "admin",
        name: "Quản trị viên Tối cao",
        avatarInitials: "AD",
      };
      setUser(adminUser);
      setSessionCookie(adminUser);
      return { success: true };
    }

    if (u === "11" && p === "21") {
      const standardUser: AuthUser = {
        username: "11",
        role: "user",
        name: "Người dùng",
        avatarInitials: "US",
      };
      setUser(standardUser);
      setSessionCookie(standardUser);
      return { success: true };
    }

    return {
      success: false,
      error: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
    };
  };

  const logout = () => {
    setUser(null);
    clearSessionCookie();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
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
