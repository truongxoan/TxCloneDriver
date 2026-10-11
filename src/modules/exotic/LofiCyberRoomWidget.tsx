"use client";

import React, { useState, useEffect } from "react";
import {
  Lamp,
  Disc3,
  CloudRain,
  Sparkles,
  Coffee,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Moon,
  Sun,
  Flame,
  Radio,
  Sliders,
  Maximize2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function LofiCyberRoomWidget() {
  // Room states
  const [lampMode, setLampMode] = useState<"warm" | "cyber" | "off">("warm");
  const [windowScene, setWindowScene] = useState<"rain" | "aurora" | "sunset">("rain");
  const [isVinylSpinning, setIsVinylSpinning] = useState<boolean>(true);
  const [ambientRain, setAmbientRain] = useState<boolean>(true);
  const [ambientFire, setAmbientFire] = useState<boolean>(false);
  const [ambientCafe, setAmbientCafe] = useState<boolean>(false);
  const [digitalClock, setDigitalClock] = useState<string>("22:30:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDigitalClock(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
          2,
          "0"
        )}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 glass-panel border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
              <span>Không Gian Tương Tác 3D Siêu Thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Góc Phòng Chill Lo-fi & Cyberpunk Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tương tác trực tiếp với các đồ vật trong phòng: Bật/tắt đèn bàn, đổi cảnh cửa sổ trời mưa, xoay máy đĩa than và hòa trộn âm thanh thiên nhiên nền.
            </p>
          </div>

          <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 font-mono">
            Mode: {lampMode.toUpperCase()} &bull; {digitalClock}
          </Badge>
        </div>
      </div>

      {/* Virtual 3D Interactive Room Canvas */}
      <div
        className={cn(
          "relative rounded-3xl border border-white/15 overflow-hidden transition-all duration-700 p-6 sm:p-10 min-h-[460px] flex flex-col justify-between shadow-2xl",
          lampMode === "warm" && "bg-gradient-to-b from-amber-950/60 via-slate-950/90 to-black shadow-amber-900/20",
          lampMode === "cyber" && "bg-gradient-to-b from-purple-950/70 via-cyan-950/60 to-black shadow-cyan-900/30",
          lampMode === "off" && "bg-gradient-to-b from-slate-950 via-zinc-950 to-black"
        )}
      >
        {/* Ambient Room Glow Lighting */}
        <div
          className={cn(
            "absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60",
            lampMode === "warm" && "bg-amber-500/30",
            lampMode === "cyber" && "bg-fuchsia-500/30",
            lampMode === "off" && "opacity-0"
          )}
        />

        {/* Top Room Scene: Window & Clock */}
        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          {/* Virtual Window Frame */}
          <div
            onClick={() => {
              if (windowScene === "rain") setWindowScene("aurora");
              else if (windowScene === "aurora") setWindowScene("sunset");
              else setWindowScene("rain");
            }}
            className="w-48 sm:w-64 h-36 rounded-2xl border-2 border-slate-700 bg-slate-900/80 shadow-2xl overflow-hidden cursor-pointer group relative transition-transform hover:scale-102"
            title="Nhấp để đổi cảnh quan cửa sổ (Mưa / Cực Quang / Chiều Tà)"
          >
            {/* Window Glass Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none border-b-2 border-r-2 border-slate-800/80 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-slate-700/60" />
              <div className="border-b border-slate-700/60" />
              <div className="border-r border-slate-700/60" />
              <div />
            </div>

            {/* Scene Background */}
            {windowScene === "rain" && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 p-2 flex flex-col justify-end">
                <div className="text-[10px] text-blue-300 font-bold flex items-center gap-1 z-30">
                  <CloudRain className="w-3.5 h-3.5 animate-bounce" /> Mưa Đêm Rả Rích
                </div>
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent animate-pulse" />
              </div>
            )}
            {windowScene === "aurora" && (
              <div className="absolute inset-0 bg-gradient-to-b from-teal-900 via-purple-950 to-black p-2 flex flex-col justify-end">
                <div className="text-[10px] text-teal-300 font-bold flex items-center gap-1 z-30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Cực Quang Phương Bắc
                </div>
                <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-teal-400/30 via-emerald-400/20 to-purple-400/30 animate-pulse" />
              </div>
            )}
            {windowScene === "sunset" && (
              <div className="absolute inset-0 bg-gradient-to-b from-orange-900 via-amber-950 to-neutral-950 p-2 flex flex-col justify-end">
                <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1 z-30">
                  <Sun className="w-3.5 h-3.5" /> Hoàng Hôn Rực Rỡ
                </div>
              </div>
            )}

            <span className="absolute top-1.5 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-slate-400 z-30">
              Nhấp đổi cảnh
            </span>
          </div>

          {/* Retro Neon LED Digital Clock */}
          <div className="p-3 px-5 rounded-2xl bg-black/80 border border-white/15 shadow-xl font-mono text-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Desk LED Clock</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-500 tracking-widest drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]">
              {digitalClock}
            </div>
          </div>
        </div>

        {/* Desk Surface Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
          {/* ITEM 1: Desk Lamp */}
          <div
            onClick={() => {
              if (lampMode === "warm") setLampMode("cyber");
              else if (lampMode === "cyber") setLampMode("off");
              else setLampMode("warm");
            }}
            className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                lampMode === "warm" && "bg-amber-500 text-slate-950 shadow-amber-500/50 scale-105",
                lampMode === "cyber" && "bg-fuchsia-500 text-white shadow-fuchsia-500/50 scale-105",
                lampMode === "off" && "bg-slate-800 text-slate-500"
              )}
            >
              <Lamp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Đèn Bàn Cổ Điển</div>
              <div className="text-[10px] text-slate-400">
                {lampMode === "warm" ? "💡 Ánh Vàng Ấm" : lampMode === "cyber" ? "⚡ Ánh Tím Cyber" : "🌑 Đang Tắt"}
              </div>
            </div>
          </div>

          {/* ITEM 2: Vinyl Turntable Player */}
          <div
            onClick={() => setIsVinylSpinning(!isVinylSpinning)}
            className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center transition-all shadow-lg",
                isVinylSpinning ? "text-purple-400 ring-2 ring-purple-500/40" : "text-slate-600"
              )}
            >
              <Disc3 className={cn("w-7 h-7", isVinylSpinning && "animate-spin")} style={{ animationDuration: "3s" }} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Máy Đĩa Than Lo-fi</div>
              <div className="text-[10px] text-slate-400">
                {isVinylSpinning ? "🎵 Đang Quay & Phát Nhạc" : "Tạm dừng"}
              </div>
            </div>
          </div>

          {/* ITEM 3: Steaming Coffee Cup */}
          <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center relative">
              <Coffee className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 w-2 h-2 rounded-full bg-amber-400/50 animate-ping" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tách Cafe Bốc Khói</div>
              <div className="text-[10px] text-amber-300 font-medium">Arabica 65°C</div>
            </div>
          </div>

          {/* ITEM 4: Ambient Soundscape Mixer */}
          <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Âm Thanh Tự Nhiên</div>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => setAmbientRain(!ambientRain)}
                  className={cn(
                    "p-1 rounded-md text-[10px] font-bold transition-all",
                    ambientRain ? "bg-blue-500/30 text-blue-300" : "bg-white/5 text-slate-500"
                  )}
                  title="Tiếng Mưa Rơi"
                >
                  🌧️
                </button>
                <button
                  onClick={() => setAmbientFire(!ambientFire)}
                  className={cn(
                    "p-1 rounded-md text-[10px] font-bold transition-all",
                    ambientFire ? "bg-amber-500/30 text-amber-300" : "bg-white/5 text-slate-500"
                  )}
                  title="Tiếng Lửa Sưởi"
                >
                  🔥
                </button>
                <button
                  onClick={() => setAmbientCafe(!ambientCafe)}
                  className={cn(
                    "p-1 rounded-md text-[10px] font-bold transition-all",
                    ambientCafe ? "bg-emerald-500/30 text-emerald-300" : "bg-white/5 text-slate-500"
                  )}
                  title="Tiếng Quán Cafe"
                >
                  ☕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
