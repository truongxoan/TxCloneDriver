"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Palette,
  Settings,
  Wand2,
  Workflow,
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
    id: "image-studio",
    label: "AI Studio",
    href: "/image-studio",
    icon: Wand2,
    iconBg: "from-violet-600 via-purple-600 to-pink-600",
  },
  {
    id: "google-flow",
    label: "Google Flow",
    href: "/google-flow",
    icon: Workflow,
    iconBg: "from-blue-500 via-teal-500 to-emerald-500",
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
    label: "Sảnh Game",
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
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [isHoveringDockArea, setIsHoveringDockArea] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor Cinema mode
  useEffect(() => {
    const handleCinemaState = (e: any) => {
      if (e.detail) {
        setIsCinemaOpen(Boolean(e.detail.isOpen));
      }
    };
    window.addEventListener("tx_cinema_state", handleCinemaState);

    const update = () => {
      setIsCinemaOpen(document.body.classList.contains("cinema-video-open"));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("tx_cinema_state", handleCinemaState);
      observer.disconnect();
    };
  }, []);

  // Smart Auto-Hide timer when idle for 4.5s
  useEffect(() => {
    const resetTimer = () => {
      setIsAutoHidden(false);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = setTimeout(() => {
        // Auto hide if not hovering
        setIsAutoHidden(true);
      }, 5000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("scroll", resetTimer);
    resetTimer();

    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  // If on login page or cinema mode is open, hide dock completely
  if (pathname === "/login" || isCinemaOpen) return null;

  // Dock is visible if user hovers near bottom area or when active
  const isDockVisible = isHoveringDockArea || !isAutoHidden;

  return (
    <div
      onMouseEnter={() => {
        setIsHoveringDockArea(true);
        setIsAutoHidden(false);
      }}
      onMouseLeave={() => {
        setIsHoveringDockArea(false);
        setHoveredIdx(null);
      }}
      className={cn(
        "fixed bottom-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none pointer-events-auto transition-all duration-500 ease-out",
        isDockVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-7 opacity-30 hover:opacity-100 scale-95"
      )}
    >
      {/* Smart Compact Indicator Strip / Trigger Bar */}
      <div
        onClick={() => setIsAutoHidden(!isAutoHidden)}
        className="mb-1 p-0.5 px-3 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-[9px] flex items-center gap-1 shadow-lg transition-all cursor-pointer backdrop-blur-md"
        title={isDockVisible ? "Ẩn thanh Dock" : "Hiện thanh Dock"}
      >
        <span className="font-semibold text-sky-400">Dock</span>
        {isDockVisible ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronUp className="w-2.5 h-2.5" />}
      </div>

      {/* Main Streamlined Compact Dock Bar */}
      <div
        className={cn(
          "rounded-2xl p-1.5 px-2.5 bg-slate-950/85 backdrop-blur-3xl border border-white/15 shadow-2xl flex items-end gap-1.5 sm:gap-2 transition-all duration-300 ring-1 ring-white/10",
          !isDockVisible && "pointer-events-none"
        )}
      >
        {DOCK_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          // Subtle magnification calculation
          let scaleClass = "scale-100";
          if (hoveredIdx !== null) {
            const diff = Math.abs(hoveredIdx - idx);
            if (diff === 0) scaleClass = "scale-120 -translate-y-1.5";
            else if (diff === 1) scaleClass = "scale-110 -translate-y-0.5";
          }

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="relative group flex flex-col items-center"
            >
              {/* Floating Tooltip Label */}
              <div className="absolute -top-8 px-2 py-0.5 rounded-lg bg-slate-900/95 text-white font-bold text-[9px] border border-white/15 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </div>

              {/* Compact Dock Icon Button (36px -> 40px sm) */}
              <Link
                href={item.href}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm",
                  "bg-gradient-to-tr",
                  item.iconBg,
                  scaleClass,
                  "hover:shadow-md active:scale-95"
                )}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white drop-shadow-sm" />
              </Link>

              {/* Active Dot Indicator */}
              <span
                className={cn(
                  "w-1 h-1 rounded-full mt-0.5 transition-all",
                  isActive
                    ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] scale-100"
                    : "bg-transparent scale-0"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
