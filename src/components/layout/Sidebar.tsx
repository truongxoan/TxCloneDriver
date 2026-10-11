"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  HardDrive,
  Link2,
  Folder,
  CalendarDays,
  CloudSun,
  Settings,
  Cloud,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Users2,
  KeyRound,
  Gamepad2,
  GraduationCap,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/authContext";
import { AppModuleId } from "@/modules/auth/types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SidebarLinkItem {
  href: string;
  label: string;
  icon: React.ElementType;
  module: AppModuleId;
}

const SIDEBAR_LINKS: SidebarLinkItem[] = [
  { href: "/overview", label: "Tổng quan", icon: Home, module: "overview" },
  { href: "/storage", label: "Google Drive", icon: HardDrive, module: "storage" },
  { href: "/watch-together", label: "Xem & Nghe Chung", icon: Users2, module: "watch_together" },
  { href: "/games", label: "Game & Giải Trí", icon: Gamepad2, module: "games" },
  { href: "/study", label: "Học Ngoại Ngữ", icon: GraduationCap, module: "study" },
  { href: "/driver-license", label: "Ôn Thi GPLX", icon: Car, module: "driver_license" },
  { href: "/vault", label: "Két Sắt & 2FA", icon: KeyRound, module: "vault" },
  { href: "/notes", label: "Ghi chú & Link", icon: Link2, module: "notes" },
  { href: "/projects", label: "Dự án", icon: Folder, module: "projects" },
  { href: "/events", label: "Lịch & Sự kiện", icon: CalendarDays, module: "events" },
  { href: "/weather", label: "Thời tiết", icon: CloudSun, module: "weather" },
  { href: "/settings", label: "Cài đặt", icon: Settings, module: "settings" },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { hasModuleAccess, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out p-3",
          "glass-panel border-r border-white/10",
          collapsed ? "w-[76px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Logo Header */}
        <div>
          <div className="flex h-14 items-center justify-between px-2 mb-3">
            <Link
              href="/overview"
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Cloud className="h-5 w-5 fill-white/20" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-base font-black tracking-tight text-white leading-none">
                    TxCloneDriver
                  </span>
                  <span className="text-[11px] font-semibold text-sky-400/90 tracking-wide mt-0.5">
                    Cloud Hub
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-290px)] pr-1">
            {SIDEBAR_LINKS.map((item, idx) => {
              const Icon = item.icon;
              const isAllowed = isAdmin || hasModuleAccess(item.module);

              // Check active status
              const isActive =
                item.href === "/overview"
                  ? pathname === "/overview" || pathname === "/"
                  : pathname === item.href;

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                      : isAllowed
                      ? "text-slate-300 hover:text-white hover:bg-white/10"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5 opacity-75"
                  )}
                  title={
                    collapsed
                      ? isAllowed
                        ? item.label
                        : `${item.label} (Chưa được cấp quyền)`
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-white"
                          : isAllowed
                          ? "text-slate-400 group-hover:text-white"
                          : "text-slate-500"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && !isAllowed && (
                    <span
                      title="Quyền truy cập bị khóa"
                      className="ml-auto flex items-center justify-center h-4 w-4 rounded-full bg-slate-800 text-amber-400/80 border border-amber-400/20"
                    >
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Brand Quote matching user's reference image */}
        {!collapsed && (
          <div className="relative mt-auto pt-4 px-2 pb-2 border-t border-white/10">
            <p className="text-xs italic text-slate-300 font-serif leading-relaxed opacity-90">
              &ldquo;Dữ liệu của bạn là tài sản quý giá nhất&rdquo;
            </p>
            <p className="text-[10px] text-sky-400 font-medium mt-1">
              — TxCloneDriver Cloud Hub
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
