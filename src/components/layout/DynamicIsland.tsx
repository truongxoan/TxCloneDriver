"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Music,
  Radio,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  Crown,
  Eye,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { useTheme } from "@/modules/theme-engine/themeContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DynamicIsland() {
  const { user, isAdmin, originalAdminUser } = useAuth();
  const { currentTheme, themeId, setThemeId } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [liveSecond, setLiveSecond] = useState(30);

  // Live timer simulation for mini widgets
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSecond((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-slate-950/95 backdrop-blur-2xl text-white border border-white/15 shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden",
          isExpanded
            ? "w-[360px] sm:w-[420px] rounded-3xl p-4 ring-1 ring-primary/40 shadow-primary/20"
            : "w-auto min-w-[210px] h-9 rounded-full px-3.5 flex items-center justify-between gap-3 hover:scale-102 hover:border-white/30"
        )}
      >
        {!isExpanded ? (
          /* Compact Island View */
          <div className="flex items-center justify-between w-full text-xs font-mono select-none">
            {/* Left status */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold tracking-tight text-slate-200">
                {currentTheme.nameVi || "TxHub"}
              </span>
            </div>

            {/* Middle wave / equalizer */}
            <div className="flex items-center gap-0.5 px-2">
              <span className="w-0.5 h-2 bg-primary animate-pulse" />
              <span className="w-0.5 h-3.5 bg-primary/80 animate-pulse delay-75" />
              <span className="w-0.5 h-2 bg-primary/60 animate-pulse delay-150" />
            </div>

            {/* Right indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
              <span>PvP {liveSecond}s</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        ) : (
          /* Expanded Island View */
          <div
            className="space-y-3.5 text-xs animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white tracking-wide">
                  Dynamic Island Capsule Pro
                </span>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Media Player Capsule */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-md">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] truncate">
                    Lofi Study & Focus Chill 2026
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    TxDrive Audio Sync &bull; 320kbps
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                  className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  {isPlayingMusic ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-0.5">
                <div className="text-slate-400 text-[10px]">Đấu Trường PvP</div>
                <div className="text-blue-300 font-bold flex items-center justify-between">
                  <span>Ván Caro #108</span>
                  <span className="font-mono">{liveSecond}s</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                <div className="text-slate-400 text-[10px]">Số dư khả dụng</div>
                <div className="text-amber-300 font-bold font-mono">
                  🪙 {(user?.coins || 50000).toLocaleString()} Xu
                </div>
              </div>
            </div>

            {/* Quick Theme Switch Pills */}
            <div className="pt-1">
              <div className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                Đổi Nhanh Giao Diện Hiện Đại:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "bento-grid", label: "🍱 Bento 2.0" },
                  { id: "vision-os", label: "🥽 VisionOS" },
                  { id: "cyber-hud", label: "🌐 Cyber HUD" },
                  { id: "neo-brutalism", label: "⚡ Neo-Brutalist" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeId(th.id as any)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                      themeId === th.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-slate-300"
                    )}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
