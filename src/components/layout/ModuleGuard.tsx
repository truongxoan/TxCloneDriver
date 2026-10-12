"use client";

import React from "react";
import Link from "next/link";
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  HardDrive,
  Folder,
  Link2,
  Home,
  CalendarDays,
  CloudSun,
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
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { AppModuleId } from "@/modules/auth/types";
import { Button } from "@/components/ui/Button";

interface ModuleGuardProps {
  moduleId: AppModuleId;
  moduleName: string;
  children: React.ReactNode;
}

const MODULE_NAMES: Record<AppModuleId, { name: string; href: string; icon: React.ElementType }> = {
  overview: { name: "Tổng quan", href: "/overview", icon: Home },
  storage: { name: "Google Drive", href: "/storage", icon: HardDrive },
  image_studio: { name: "AI Image Studio", href: "/image-studio", icon: Wand2 },
  google_flow: { name: "Google Flow Studio", href: "/google-flow", icon: Workflow },
  watch_together: { name: "Xem & Nghe Chung", href: "/watch-together", icon: Users2 },
  vault: { name: "Két Sắt & 2FA", href: "/vault", icon: KeyRound },
  notes: { name: "Ghi chú & Link", href: "/notes", icon: Link2 },
  projects: { name: "Dự án", href: "/projects", icon: Folder },
  events: { name: "Lịch & Sự kiện", href: "/events", icon: CalendarDays },
  weather: { name: "Thời tiết", href: "/weather", icon: CloudSun },
  settings: { name: "Cài đặt", href: "/settings", icon: Lock },
  telegram: { name: "Telegram Bot", href: "/telegram", icon: ShieldAlert },
  games: { name: "Game Giải Trí", href: "/games", icon: Gamepad2 },
  study: { name: "Học Ngoại Ngữ", href: "/study", icon: GraduationCap },
  driver_license: { name: "Ôn Thi GPLX", href: "/driver-license", icon: Car },
  expenses: { name: "Tính Chi Tiêu", href: "/expenses", icon: Wallet },
  qr: { name: "Tạo Mã QR", href: "/qr", icon: QrCode },
  downloader: { name: "Tải Video", href: "/downloader", icon: Download },
  memories: { name: "Kỷ Niệm Cá Nhân", href: "/memories", icon: Images },
};

export function ModuleGuard({ moduleId, moduleName, children }: ModuleGuardProps) {
  const { user, hasModuleAccess, isAdmin } = useAuth();

  if (isAdmin || hasModuleAccess(moduleId)) {
    return <>{children}</>;
  }

  // Get user's permitted modules for quick jump links
  const permitted = (user?.allowedModules || []) as AppModuleId[];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-rose-500/30 shadow-2xl shadow-rose-950/40 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-rose-400 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          Phân Hệ Bị Giới Hạn Quyền
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
          Quyền Truy Cập {moduleName} Đã Bị Khóa
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Tài khoản <strong className="text-white font-mono">@{user?.username || "user"}</strong> ({user?.name || "Thành viên"}) chưa được Quản trị viên cấp phép sử dụng phân hệ này.
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">
            Các phân hệ bạn ĐÃ ĐƯỢC CẤP QUYỀN sử dụng:
          </div>
          {permitted.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {permitted.map((modKey) => {
                const info = MODULE_NAMES[modKey];
                if (!info) return null;
                const Icon = info.icon;
                return (
                  <Link key={modKey} href={info.href}>
                    <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-sky-200 border border-sky-400/30">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{info.name}</span>
                      <ArrowRight className="h-3 w-3 ml-0.5 opacity-60" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-amber-300 italic">
              Hiện tại bạn chưa được kích hoạt phân hệ nào. Vui lòng liên hệ Admin để được cấp quyền.
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          💡 Lưu ý: Quản trị viên (Admin) có thể bật/tắt quyền truy cập từng phân hệ cho tài khoản của bạn bất cứ lúc nào trong mục Quản trị Thành viên.
        </p>
      </div>
    </div>
  );
}
