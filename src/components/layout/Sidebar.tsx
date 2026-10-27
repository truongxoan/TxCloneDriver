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
  Wallet,
  QrCode,
  Download,
  Images,
  Wand2,
  Workflow,
  Radio,
  LayoutGrid,
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

interface SidebarGroup {
  category: string;
  items: SidebarLinkItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    category: "Tổng Quan",
    items: [
      { href: "/overview", label: "Tổng quan", icon: Home, module: "overview" },
      { href: "/hubs", label: "Hub chức năng", icon: LayoutGrid, module: "overview" },
      { href: "/storage", label: "Google Drive", icon: HardDrive, module: "storage" },
      { href: "/share", label: "Bắn Tệp P2P", icon: Radio, module: "storage" as AppModuleId },
    ],
  },
  {
    category: "Sáng Tạo & AI",
    items: [
      { href: "/image-studio", label: "AI Image Studio", icon: Wand2, module: "image_studio" as AppModuleId },
      { href: "/google-flow", label: "Google Flow Tools", icon: Workflow, module: "google_flow" as AppModuleId },
    ],
  },
  {
    category: "Giải Trí",
    items: [
      { href: "/watch-together", label: "Xem & Nghe Chung", icon: Users2, module: "watch_together" },
      { href: "/downloader", label: "Tải Video", icon: Download, module: "downloader" },
      { href: "/memories", label: "Kỷ Niệm Cá Nhân", icon: Images, module: "memories" },
      { href: "/games", label: "Game & Giải Trí", icon: Gamepad2, module: "games" },
    ],
  },
  {
    category: "Học Tập",
    items: [
      { href: "/study", label: "Học Ngoại Ngữ", icon: GraduationCap, module: "study" },
      { href: "/driver-license", label: "Ôn Thi GPLX", icon: Car, module: "driver_license" },
    ],
  },
  {
    category: "Công Cụ",
    items: [
      { href: "/vault", label: "Két Sắt & 2FA", icon: KeyRound, module: "vault" },
      { href: "/expenses", label: "Tính Chi Tiêu", icon: Wallet, module: "expenses" },
      { href: "/qr", label: "Tạo Mã QR", icon: QrCode, module: "qr" },
      { href: "/notes", label: "Ghi chú & Link", icon: Link2, module: "notes" },
    ],
  },
  {
    category: "Hệ Thống",
    items: [
      { href: "/projects", label: "Dự án", icon: Folder, module: "projects" },
      { href: "/events", label: "Lịch & Sự kiện", icon: CalendarDays, module: "events" },
      { href: "/weather", label: "Thời tiết", icon: CloudSun, module: "weather" },
      { href: "/settings", label: "Cài đặt", icon: Settings, module: "settings" },
    ],
  },
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform p-1.5 relative overflow-hidden">
                {/* Embedded High-Resolution Mystic Cyber Daoist Icon */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                  <defs>
                    <linearGradient id="yinGradSide" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  {/* Outer Mystic Bagua Circle */}
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="6 4" />
                  {/* Yin Yang Symbol */}
                  <circle cx="50" cy="50" r="38" fill="#090d16" stroke="url(#yinGradSide)" strokeWidth="2.5" />
                  <path d="M 50 12 A 38 38 0 0 1 50 88 A 19 19 0 0 1 50 50 A 19 19 0 0 0 50 12 Z" fill="url(#yinGradSide)" />
                  {/* Dots */}
                  <circle cx="50" cy="31" r="5" fill="#090d16" />
                  <circle cx="50" cy="31" r="2.5" fill="#fde047" />
                  <circle cx="50" cy="69" r="5" fill="#ffffff" />
                  <circle cx="50" cy="69" r="2.5" fill="#6366f1" />
                </svg>
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-base font-black tracking-tight text-white leading-none">
                    MêÂmĐạoSỹ
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
          <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 no-scrollbar">
            {SIDEBAR_GROUPS.map((group) => ({
              ...group,
              // Thành viên thường chỉ thấy đúng module được cấp (Drive / Xem chung / Ghi chú).
              // Admin thấy tất cả. Module chưa có quyền được ẩn hẳn thay vì hiện khóa gây rối mắt.
              items: group.items.filter((it) => isAdmin || hasModuleAccess(it.module)),
            }))
              .filter((group) => group.items.length > 0)
              .map((group, gIdx) => (
              <div key={group.category} className="space-y-1">
                {/* Category Header or Divider */}
                {!collapsed ? (
                  <div className={cn("px-3.5 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none", gIdx > 0 && "pt-2 border-t border-white/5")}>
                    {group.category}
                  </div>
                ) : (
                  gIdx > 0 && <div className="my-1.5 border-t border-white/10" />
                )}

                {group.items.map((item, idx) => {
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
                        "flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group",
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
              </div>
            ))}
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
