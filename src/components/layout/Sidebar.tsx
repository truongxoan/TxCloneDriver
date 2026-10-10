"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HardDrive,
  Calendar,
  CloudSun,
  Compass,
  Hourglass,
  Palette,
  Send,
  ShieldCheck,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Menu,
  X,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { MOCK_STORAGE_QUOTA } from "@/modules/storage/mockDriveData";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { href: "/overview", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/storage", label: "Kho lưu trữ", icon: HardDrive, badge: "Phase 3" },
  { href: "/calendar", label: "Lịch Âm Dương", icon: Calendar },
  { href: "/weather", label: "Trung tâm Thời tiết", icon: CloudSun, badge: "Demo" },
  { href: "/traditional-calendar", label: "Lịch Cổ Truyền", icon: Compass },
  { href: "/events", label: "Đếm ngược Ngày Lễ", icon: Hourglass },
  { href: "/themes", label: "Theme & Hiệu ứng", icon: Palette },
  { href: "/telegram", label: "Telegram Center", icon: Send, badge: "Phase 6" },
  { href: "/backups", label: "Sao lưu & Tự động", icon: ShieldCheck },
  { href: "/activity", label: "Nhật ký Hoạt động", icon: Activity },
  { href: "/settings", label: "Cài đặt Hệ thống", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const usedPercent = Math.round(
    (MOCK_STORAGE_QUOTA.usedBytes / MOCK_STORAGE_QUOTA.totalBytes) * 100
  );

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
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out",
          "glass-panel border-r border-surface-border",
          collapsed ? "w-[72px]" : "w-[240px]",
          // Mobile responsive slide-over
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-surface-border/60">
          <Link
            href="/overview"
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary shadow-glow-sm group-hover:scale-105 transition-transform">
              <Database className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  DATAVAULT
                  <span className="text-[10px] uppercase font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded border border-primary/30">
                    HUB
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Cloud Management v1.0
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/overview" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/70 border border-transparent"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-elevated text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Quota Widget */}
        <div className="p-3 border-t border-surface-border/60">
          {!collapsed ? (
            <div className="rounded-xl p-3 bg-surface-elevated/60 border border-surface-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Dung lượng Hub</span>
                <span className="font-semibold text-primary">{usedPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-surface-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>{formatBytes(MOCK_STORAGE_QUOTA.usedBytes, 1)}</span>
                <span>{formatBytes(MOCK_STORAGE_QUOTA.totalBytes, 0)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-surface-border/50 text-[10px] text-center text-muted-foreground">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 animate-pulse" />
                Dữ liệu Demo - Giai đoạn 1
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-elevated/40 text-center"
              title={`Dung lượng: ${usedPercent}%`}
            >
              <div className="h-8 w-1 rounded-full bg-surface-elevated overflow-hidden relative">
                <div
                  className="absolute bottom-0 w-full bg-primary"
                  style={{ height: `${usedPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
