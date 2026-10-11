"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  HardDrive,
  Users,
  Gamepad2,
  GraduationCap,
  Download,
  Image as ImageIcon,
  Zap,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  iconBg: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: "overview",
    label: "Tổng Quan",
    href: "/overview",
    icon: Home,
    iconBg: "from-blue-600 to-indigo-600",
  },
  {
    id: "storage",
    label: "Google Drive",
    href: "/storage",
    icon: HardDrive,
    iconBg: "from-amber-500 to-orange-600",
  },
  {
    id: "watch-together",
    label: "Xem & Nghe Chung",
    href: "/watch-together",
    icon: Users,
    iconBg: "from-pink-600 to-rose-600",
  },
  {
    id: "games",
    label: "Sảnh Game PvP",
    href: "/games",
    icon: Gamepad2,
    iconBg: "from-purple-600 to-violet-600",
  },
  {
    id: "study",
    label: "Học Ngoại Ngữ",
    href: "/study",
    icon: GraduationCap,
    iconBg: "from-emerald-500 to-teal-600",
  },
  {
    id: "downloader",
    label: "Tải Video",
    href: "/downloader",
    icon: Download,
    iconBg: "from-cyan-500 to-blue-600",
  },
  {
    id: "memories",
    label: "Kỷ Niệm 3D",
    href: "/memories",
    icon: ImageIcon,
    iconBg: "from-fuchsia-600 to-pink-600",
  },
  {
    id: "themes",
    label: "Đổi Giao Diện",
    href: "/themes",
    icon: Palette,
    iconBg: "from-yellow-500 to-amber-600",
  },
  {
    id: "settings",
    label: "Cài Đặt & Admin",
    href: "/settings",
    icon: Settings,
    iconBg: "from-slate-600 to-zinc-700",
  },
];

export function MacOsDock() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // If on login page, hide dock
  if (pathname === "/login") return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none pointer-events-auto">
      {/* Minimize / Expand Toggle Tab */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="mb-1 p-1 px-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-[10px] flex items-center gap-1 shadow-lg transition-all"
        title={isMinimized ? "Hiện Dock" : "Thu gọn Dock"}
      >
        <span>Dock</span>
        {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {!isMinimized && (
        <div
          onMouseLeave={() => setHoveredIdx(null)}
          className="rounded-3xl p-2 px-3 bg-slate-950/85 backdrop-blur-3xl border border-white/15 shadow-2xl flex items-end gap-2.5 transition-all duration-300 ring-1 ring-white/10"
        >
          {DOCK_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            // Magnification calculation
            let scaleClass = "scale-100";
            if (hoveredIdx !== null) {
              const diff = Math.abs(hoveredIdx - idx);
              if (diff === 0) scaleClass = "scale-130 -translate-y-2";
              else if (diff === 1) scaleClass = "scale-115 -translate-y-1";
            }

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="relative group flex flex-col items-center"
              >
                {/* Floating Tooltip Label */}
                <div className="absolute -top-9 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white font-bold text-[10px] border border-white/15 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.label}
                </div>

                {/* Dock Icon Button */}
                <Link
                  href={item.href}
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md",
                    "bg-gradient-to-tr",
                    item.iconBg,
                    scaleClass,
                    "hover:shadow-lg active:scale-95"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />
                </Link>

                {/* Active Indicator Dot */}
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1 transition-all",
                    isActive
                      ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-100"
                      : "bg-transparent scale-0"
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
