"use client";

import React, { useState, useEffect } from "react";
import {
  Music,
  Radio,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CloudSun,
  HardDrive,
  Send,
  GraduationCap,
  Wallet,
  Bell,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { cn } from "@/lib/utils";

interface SystemNotification {
  id: string;
  type: "weather" | "drive" | "telegram" | "study" | "expenses";
  icon: any;
  iconColor: string;
  title: string;
  detail: string;
  time: string;
}

const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    type: "weather",
    icon: CloudSun,
    iconColor: "text-amber-400",
    title: "Thời Tiết Hôm Nay",
    detail: "Hà Nội 28°C, trời nắng nhẹ, độ ẩm 62%.",
    time: "Vừa xong",
  },
  {
    id: "notif-2",
    type: "drive",
    icon: HardDrive,
    iconColor: "text-blue-400",
    title: "Google Drive Cloud Hub",
    detail: "Đã đồng bộ 38 tệp tin mới nhất lên Cloud an toàn.",
    time: "5p trước",
  },
  {
    id: "notif-3",
    type: "telegram",
    icon: Send,
    iconColor: "text-sky-400",
    title: "Telegram Bot Kết Nối",
    detail: "@TxDriverBot đang hoạt động 24/7.",
    time: "12p trước",
  },
  {
    id: "notif-4",
    type: "study",
    icon: GraduationCap,
    iconColor: "text-emerald-400",
    title: "Nhắc Nhở Học Tập",
    detail: "Đạt chuỗi Streak 5 ngày HSK 3 liên tiếp!",
    time: "30p trước",
  },
  {
    id: "notif-5",
    type: "expenses",
    icon: Wallet,
    iconColor: "text-purple-400",
    title: "Sổ Chi Tiêu Hàng Ngày",
    detail: "Đã ghi nhận 1 khoản chi tiêu hôm nay.",
    time: "1h trước",
  },
];

export function DynamicIsland() {
  const { currentTheme, themeId, setThemeId } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"music" | "notifications">("music");
  const [notifIndex, setNotifIndex] = useState(0);

  const playlist = [
    { title: "Nightfall Lofi Coffee", artist: "ChilledCow & TxStudio", duration: "03:42" },
    { title: "Beijing Autumn Rain (雨中北京)", artist: "Traditional Chill Beats", duration: "04:15" },
    { title: "Cyber Horizon 2026", artist: "Synthwave Digital Nomad", duration: "03:20" },
  ];

  const currentTrack = playlist[currentTrackIndex];
  const activeNotif = SYSTEM_NOTIFICATIONS[notifIndex];

  // Auto rotate notifications every 6 seconds in compact mode
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % SYSTEM_NOTIFICATIONS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const ActiveNotifIcon = activeNotif.icon;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-slate-950/95 backdrop-blur-2xl text-white border border-white/15 shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden",
          isExpanded
            ? "w-[360px] sm:w-[440px] rounded-3xl p-4 ring-1 ring-primary/40 shadow-primary/20"
            : "w-auto min-w-[280px] sm:min-w-[340px] h-9 rounded-full px-3.5 flex items-center justify-between gap-3 hover:scale-102 hover:border-white/30"
        )}
      >
        {!isExpanded ? (
          /* ========================================================= */
          /* COMPACT ISLAND VIEW: MUSIC & SYSTEM NOTIFICATION ONLY     */
          /* ========================================================= */
          <div className="flex items-center justify-between w-full text-xs select-none">
            {/* Left: Music Track & Equalizer */}
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shrink-0">
                <Music className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                {currentTrack.title}
              </span>
              {/* Sound waves animation */}
              <div className="flex items-center gap-0.5 shrink-0">
                <span className={cn("w-0.5 h-2 bg-primary", isPlaying && "animate-pulse")} />
                <span className={cn("w-0.5 h-3 bg-primary/80", isPlaying && "animate-pulse delay-75")} />
                <span className={cn("w-0.5 h-1.5 bg-primary/60", isPlaying && "animate-pulse delay-150")} />
              </div>
            </div>

            {/* Right: Rotating Non-Game Notification Pill */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 shrink-0 text-[10px]">
              <ActiveNotifIcon className={cn("w-3.5 h-3.5 shrink-0", activeNotif.iconColor)} />
              <span className="text-slate-300 font-medium truncate max-w-[85px] sm:max-w-[110px]">
                {activeNotif.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* EXPANDED ISLAND VIEW                                      */
          /* ========================================================= */
          <div
            className="space-y-3.5 text-xs animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Mode Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("music")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "music"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Trình Phát Nhạc</span>
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    activeTab === "notifications"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Thông Báo ({SYSTEM_NOTIFICATIONS.length})</span>
                </button>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                title="Thu nhỏ"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB 1: MUSIC PLAYER CONTROLS */}
            {activeTab === "music" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {currentTrack.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {currentTrack.artist} &bull; {currentTrack.duration}
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrevTrack}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                      title="Bài trước"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md active:scale-95 transition-all"
                      title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button
                      onClick={handleNextTrack}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                      title="Bài kế tiếp"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Volume Slider & Sound Quality */}
                <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-[10px] w-8 text-right">
                      {isMuted ? "0%" : `${volume}%`}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-emerald-400 border border-white/10 shrink-0">
                    320kbps Lossless
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: SYSTEM NOTIFICATIONS (NO GAMES) */}
            {activeTab === "notifications" && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {SYSTEM_NOTIFICATIONS.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start gap-2.5"
                    >
                      <div className={cn("p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5", notif.iconColor)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-[11px] truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {notif.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Theme Switch Footer */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Chuyển Nhanh Giao Diện:
                </span>
                <span className="text-[10px] text-primary font-bold">
                  {currentTheme.nameVi}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
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
                      "py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate px-1",
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
