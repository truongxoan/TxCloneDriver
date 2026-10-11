"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { QuickSearchModal } from "./QuickSearchModal";
import { FloatingMessenger } from "@/modules/chat/FloatingMessenger";
import { DynamicIsland } from "./DynamicIsland";
import { MacOsDock } from "./MacOsDock";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { useAuth } from "@/modules/auth/authContext";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const { user, originalAdminUser, stopImpersonating, isMaintenanceMode } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // If on login page, render standalone view without sidebar and header
  if (pathname === "/login") {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="relative min-h-screen text-foreground flex overflow-hidden">
      {/* Layer 0: Scenic Fullscreen Wallpaper */}
      {currentTheme.bgImage ? (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out transform scale-100"
          style={{ backgroundImage: `url('${currentTheme.bgImage}')` }}
        >
          {/* Subtle dark vignette overlay for readability */}
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-zinc-950 to-black" />
      )}

      {/* Layer 1: Seasonal Particle Canvas */}
      <SeasonalCanvas />

      {/* Layer 2: Main Layout UI */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Content Wrapper */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300",
            collapsed ? "md:pl-[72px]" : "md:pl-[240px]"
          )}
        >
          {/* Impersonation Banner */}
          {originalAdminUser && (
            <div className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black px-4 py-2 flex items-center justify-between text-xs shadow-xl sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <span className="text-base">🎭</span>
                <span>
                  BẠN ĐANG ĐÓNG VAI @{user?.username} ({user?.name}) &mdash; Chế độ xem trước giao diện thành viên
                </span>
              </div>
              <button
                onClick={stopImpersonating}
                className="px-3.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Thoát Đóng Vai & Về Admin
              </button>
            </div>
          )}

          {/* Maintenance Mode Notice for Admin */}
          {isMaintenanceMode && user?.role === "admin" && (
            <div className="w-full bg-rose-600/90 text-white font-bold px-4 py-1.5 text-[11px] text-center tracking-wide">
              🚨 HỆ THỐNG ĐANG BẬT BẢO TRÌ TOÀN MÁY CHỦ (CHỈ ADMIN MỚI CÓ THỂ THAO TÁC)
            </div>
          )}

          {/* Top Multi-Pill Smart Header */}
          <Header
            onOpenMobileMenu={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Maintenance Mode Blocker for Non-Admin Users */}
      {isMaintenanceMode && user?.role !== "admin" && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Wrench className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-white">Hệ Thống Đang Bảo Trì</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quản trị viên đang tiến hành nâng cấp hệ thống máy chủ và bảo trì định kỳ. Quý thành viên vui lòng quay lại sau ít phút!
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Status: 503 Maintenance Mode Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Ctrl+K Modal */}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Floating Messenger Widget */}
      <FloatingMessenger />

      {/* Modern Dynamic Island Capsule & macOS Tahoe Dock */}
      <DynamicIsland />
      <MacOsDock />
    </div>
  );
}
