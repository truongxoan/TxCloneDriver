"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  HardDrive,
  Send,
  CalendarDays,
  CloudSun,
  Moon,
  Compass,
  Bell,
  Settings,
  Cloud,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const SIDEBAR_LINKS = [
  { href: "/overview", label: "Trang chủ", icon: Home },
  { href: "/storage", label: "Tệp của tôi", icon: FolderOpen },
  { href: "/storage", label: "Google Drive", icon: HardDrive },
  { href: "/telegram", label: "Telegram", icon: Send },
  { href: "/events", label: "Lịch & Sự kiện", icon: CalendarDays },
  { href: "/weather", label: "Thời tiết", icon: CloudSun },
  { href: "/calendar", label: "Lịch âm dương", icon: Moon },
  { href: "/traditional-calendar", label: "Giờ hoàng đạo", icon: Compass },
  { href: "/activity", label: "Thông báo", icon: Bell },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Cloud className="h-5 w-5 fill-white/20" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-base font-black tracking-tight text-white leading-none">
                    DataVault
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Mascot Card matching user's reference mockup */}
        {!collapsed && (
          <div className="relative mt-auto pt-3">
            <div className="rounded-3xl glass-card p-3 border border-white/15 text-center flex flex-col items-center relative overflow-hidden bg-gradient-to-b from-white/5 to-white/10">
              {/* Cute Cat Mascot Avatar */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-2 border border-white/20 shadow-md">
                <Image
                  src="/images/cat-mascot.jpg"
                  alt="DataVault Mascot"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-0.5 text-[11px] text-slate-300 font-medium">
                <p>Lưu trữ an toàn</p>
                <p>Kết nối mọi lúc</p>
                <p className="text-[10px] text-muted-foreground">
                  Khám phá không giới hạn
                </p>
              </div>

              <button className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold transition-all shadow-sm">
                DataVault 💙
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
