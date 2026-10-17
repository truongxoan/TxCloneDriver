"use client";

import React, { useState, useEffect } from "react";
import {
  Music,
  Film,
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
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints } from "@/modules/storage/driveEndpointsContext";
import { useFeedback } from "@/modules/feedback/feedbackContext";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { useMusicPlayer } from "@/modules/audio/musicPlayerContext";
import { cn } from "@/lib/utils";

interface CinemaSyncData {
  isOpen: boolean;
  video: {
    id: string;
    title: string;
    resolution?: string;
    duration?: string;
  } | null;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
}

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
    title: "Google Drive Hub",
    detail: "Đã đồng bộ dữ liệu đám mây an toàn & mượt mà.",
    time: "5p trước",
  },
  {
    id: "notif-3",
    type: "telegram",
    icon: Send,
    iconColor: "text-sky-400",
    title: "Telegram Bot",
    detail: "Hệ thống bot thông báo hoạt động liên tục 24/7.",
    time: "12p trước",
  },
  {
    id: "notif-4",
    type: "study",
    icon: GraduationCap,
    iconColor: "text-emerald-400",
    title: "Học Tập Cá Nhân",
    detail: "Đạt chuỗi Streak học từ vựng HSK 3 liên tiếp!",
    time: "30p trước",
  },
  {
    id: "notif-5",
    type: "expenses",
    icon: Wallet,
    iconColor: "text-purple-400",
    title: "Sổ Thu Chi",
    detail: "Ghi nhận ngân sách chi tiêu hàng ngày chính xác.",
    time: "1h trước",
  },
];

const formatSeconds = (sec: number) => {
  if (isNaN(sec) || sec === 0) return "00:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function DynamicIsland() {
  const { currentTheme, themeId, setThemeId } = useTheme();
  const { user, isAdmin, managedUsers } = useAuth();
  const { files, activeEndpoint } = useDriveEndpoints();
  const { reports } = useFeedback();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"music" | "cinema" | "notifications">("music");
  const [notifIndex, setNotifIndex] = useState(0);

  // Cinema video integration state
  const [cinemaData, setCinemaData] = useState<CinemaSyncData>({
    isOpen: false,
    video: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  const pendingRequests = managedUsers.filter((u) => u.pendingNameChange).length;
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;

  const systemNotifications: SystemNotification[] = React.useMemo(() => {
    const list: SystemNotification[] = [
      {
        id: "notif-drive",
        type: "drive",
        icon: HardDrive,
        iconColor: "text-blue-400",
        title: "Google Drive Cloud",
        detail: `Đã đồng bộ ${files.length} tệp tin • ${activeEndpoint?.name || "Bộ nhớ an toàn"}`,
        time: "Trực tuyến",
      },
      {
        id: "notif-coins",
        type: "expenses",
        icon: Wallet,
        iconColor: "text-amber-400",
        title: "Ví Điểm Cược Hệ Thống",
        detail: `Số dư ${(user?.coins ?? 50000).toLocaleString("vi-VN")} Xu • Reset 50.000 Xu hàng ngày`,
        time: "Hôm nay",
      },
    ];

    if (isAdmin && pendingRequests > 0) {
      list.unshift({
        id: "notif-requests",
        type: "telegram",
        icon: Bell,
        iconColor: "text-rose-400",
        title: "Yêu Cầu Chờ Duyệt",
        detail: `Có ${pendingRequests} thành viên gửi yêu cầu đổi tên chờ bạn phê duyệt.`,
        time: "Cần xử lý",
      });
    }

    if (openReports > 0) {
      list.push({
        id: "notif-reports",
        type: "telegram",
        icon: CheckCircle2,
        iconColor: "text-amber-400",
        title: "Báo Cáo Phản Hồi",
        detail: `Có ${openReports} báo cáo lỗi/góp ý đang được theo dõi.`,
        time: "Hôm nay",
      });
    }

    list.push(
      {
        id: "notif-weather",
        type: "weather",
        icon: CloudSun,
        iconColor: "text-sky-400",
        title: "Thời Tiết Trực Tiếp",
        detail: "Hà Nội 28°C • Trời nắng nhẹ mát mẻ, độ ẩm 62%.",
        time: "Vừa xong",
      },
      {
        id: "notif-study",
        type: "study",
        icon: GraduationCap,
        iconColor: "text-emerald-400",
        title: "Góc Ngoại Ngữ & Thi GPLX",
        detail: "Luyện tập từ vựng HSK, tiếng Anh & bộ đề sát hạch lái xe.",
        time: "Mỗi ngày",
      }
    );

    return list;
  }, [files.length, activeEndpoint?.name, user?.coins, isAdmin, pendingRequests, openReports]);

  // Consume Global Music Player state connected to Google Drive
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
  } = useMusicPlayer();

  const activeTrackTitle = currentTrack ? currentTrack.title : "Google Drive Music Player";
  const activeTrackArtist = currentTrack?.artist || "TxCloneDriver Audio Hub";
  const safeNotifIndex = notifIndex % (systemNotifications.length || 1);
  const activeNotif = systemNotifications[safeNotifIndex] || systemNotifications[0];

  // Auto rotate notifications every 6 seconds in compact mode
  useEffect(() => {
    if (systemNotifications.length === 0) return;
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % systemNotifications.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [systemNotifications.length]);

  // Listen to Cinema Video Modal status & progress events
  useEffect(() => {
    const handleCinemaState = (e: any) => {
      if (e.detail) {
        setCinemaData((prev) => ({
          ...prev,
          isOpen: e.detail.isOpen,
          video: e.detail.video,
          isPlaying: e.detail.isOpen,
        }));
        if (e.detail.isOpen) {
          setActiveTab("cinema");
        }
      }
    };

    const handleCinemaSync = (e: any) => {
      if (e.detail) {
        setCinemaData((prev) => ({
          ...prev,
          currentTime: e.detail.currentTime ?? prev.currentTime,
          duration: e.detail.duration ?? prev.duration,
          isPlaying: e.detail.isPlaying ?? prev.isPlaying,
        }));
      }
    };

    window.addEventListener("tx_cinema_state", handleCinemaState);
    window.addEventListener("tx_cinema_sync", handleCinemaSync);

    return () => {
      window.removeEventListener("tx_cinema_state", handleCinemaState);
      window.removeEventListener("tx_cinema_sync", handleCinemaSync);
    };
  }, []);

  const [isMinimized, setIsMinimized] = useState(false);

  const ActiveNotifIcon = activeNotif.icon;

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-auto select-none">
      {/* If fully hidden by user, show an ultra-mini pill indicator to reopen */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="h-6 px-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 backdrop-blur-md shadow-lg text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          title="Mở Dynamic Island"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span className="font-semibold text-sky-400">Island</span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>
      ) : (
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "bg-slate-950/90 backdrop-blur-2xl text-white border border-white/15 shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden",
            isExpanded
              ? "w-[330px] sm:w-[420px] rounded-2xl p-3.5 ring-1 ring-primary/40 shadow-primary/20"
              : "w-auto min-w-[210px] sm:min-w-[280px] max-w-[90vw] sm:max-w-[340px] h-7 sm:h-7.5 rounded-full px-2.5 flex items-center justify-between gap-2 hover:border-white/30 hover:scale-[1.01]"
          )}
        >
          {!isExpanded ? (
            /* ========================================================= */
            /* ULTRA-COMPACT SLIM ISLAND VIEW                            */
            /* ========================================================= */
            <div className="flex items-center justify-between w-full text-[11px] select-none gap-1.5">
              {/* Left: Music / Cinema Media Indicator */}
              {cinemaData.isOpen && cinemaData.video ? (
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/40">
                    <Film className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white truncate max-w-[90px] sm:max-w-[120px]" title={cinemaData.video.title}>
                    {cinemaData.video.title}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className={cn("w-0.5 h-1.5 bg-rose-400 rounded-full", cinemaData.isPlaying && "animate-pulse")} />
                    <span className={cn("w-0.5 h-2.5 bg-rose-500 rounded-full", cinemaData.isPlaying && "animate-pulse delay-75")} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isPlaying
                        ? "bg-gradient-to-tr from-pink-500 to-rose-500 shadow-sm shadow-pink-500/50"
                        : "bg-gradient-to-tr from-purple-600 to-pink-500"
                    )}
                  >
                    <Music className="w-2 h-2 text-white" />
                  </div>

                  <span className="text-[10px] font-bold text-slate-200 truncate max-w-[85px] sm:max-w-[115px]" title={activeTrackTitle}>
                    {currentTrack ? currentTrack.title : "Drive Audio"}
                  </span>

                  {/* Equalizer Wave */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className={cn("w-0.5 h-1.5 bg-pink-400 rounded-full", isPlaying && "animate-pulse")} />
                    <span className={cn("w-0.5 h-2 bg-pink-500 rounded-full", isPlaying && "animate-pulse delay-75")} />
                  </div>

                  {/* Mini Quick Play/Pause */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="p-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0 ml-0.5"
                    title={isPlaying ? "Tạm dừng" : "Phát tiếp"}
                  >
                    {isPlaying ? <Pause className="w-2 h-2" /> : <Play className="w-2 h-2 fill-current" />}
                  </button>
                </div>
              )}

              {/* Right: Rotating Notification & Hide Button */}
              <div className="flex items-center gap-1 pl-1.5 border-l border-white/10 shrink-0 text-[10px]">
                <ActiveNotifIcon className={cn("w-3 h-3 shrink-0", activeNotif.iconColor)} />
                <span className="text-slate-300 font-medium truncate max-w-[65px] sm:max-w-[90px] hidden xs:inline">
                  {activeNotif.title}
                </span>

                {/* Hide Pill Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 ml-0.5"
                  title="Thu nhỏ thành nút nhỏ"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
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
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("music")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                    activeTab === "music"
                      ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-500/30"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Nhạc Drive</span>
                </button>

                {cinemaData.video && (
                  <button
                    onClick={() => setActiveTab("cinema")}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                      activeTab === "cinema"
                        ? "bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-sm shadow-rose-500/30"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    )}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Phim Cinema</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                    activeTab === "notifications"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Thông Báo ({systemNotifications.length})</span>
                </button>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0 ml-2"
                title="Thu nhỏ"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB 1: MUSIC PLAYER CONTROLS (LIVE DRIVE STREAMING) */}
            {activeTab === "music" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                        isPlaying
                          ? "bg-gradient-to-tr from-pink-500 to-rose-600 text-white animate-spin-slow shadow-pink-500/40"
                          : "bg-gradient-to-tr from-purple-600 to-pink-600 text-white"
                      )}
                    >
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                          Drive MP3
                        </span>
                        <div
                          className="font-bold text-white text-xs truncate max-w-[160px] sm:max-w-[210px]"
                          title={activeTrackTitle}
                        >
                          {activeTrackTitle}
                        </div>
                      </div>
                      <div className="text-[11px] text-pink-300/80 truncate mt-0.5">
                        {activeTrackArtist}
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={prevTrack}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-transform active:scale-95"
                      title="Bài trước"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
                      title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={nextTrack}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-transform active:scale-95"
                      title="Bài kế tiếp"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Scrub Bar */}
                <div className="space-y-1 px-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.5"
                    value={currentTime}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatSeconds(currentTime)}</span>
                    <span className="text-pink-300 font-semibold">{formatSeconds(duration)}</span>
                  </div>
                </div>

                {/* Volume Slider & Audio Status */}
                <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={toggleMute}
                      className="text-slate-400 hover:text-white"
                      title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : Math.round(volume * 100)}
                      onChange={(e) => setVolume(Number(e.target.value) / 100)}
                      className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-[10px] w-8 text-right">
                      {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/storage"
                      onClick={() => setIsExpanded(false)}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-[10px] font-semibold text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-colors"
                    >
                      Kho Drive &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CINEMA MOVIE DETAILS */}
            {activeTab === "cinema" && cinemaData.video && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                          {cinemaData.video.resolution || "1080p FHD"}
                        </span>
                        <div
                          className="font-bold text-white text-xs truncate max-w-[170px] sm:max-w-[240px]"
                          title={cinemaData.video.title}
                        >
                          {cinemaData.video.title}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate mt-0.5">
                        Rạp Chiếu Đám Mây MêÂmĐạoSỹ
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/storage"
                    onClick={() => setIsExpanded(false)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-[10px] font-semibold text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors shrink-0"
                  >
                    Xem Phim &rarr;
                  </Link>
                </div>

                {/* Video Duration / Progress Indicator */}
                <div className="space-y-1 px-1">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          cinemaData.duration && cinemaData.duration > 0
                            ? Math.min(100, ((cinemaData.currentTime || 0) / cinemaData.duration) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatSeconds(cinemaData.currentTime || 0)}</span>
                    <span className="text-rose-300 font-semibold">
                      {formatSeconds(cinemaData.duration || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {systemNotifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start gap-2.5"
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5",
                          notif.iconColor
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-[11px] truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
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
                <span className="text-[10px] text-primary font-bold">{currentTheme.nameVi}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: "tet-fireworks", label: "🎆 Tết Pháo Hoa" },
                  { id: "deep-space", label: "🌌 Vũ Trụ Sâu" },
                  { id: "bento-grid", label: "🍱 Bento 2.0" },
                  { id: "vision-os", label: "🥽 VisionOS" },
                  { id: "cyber-hud", label: "🌐 Cyber HUD" },
                  { id: "thunderstorm", label: "⛈️ Sấm Sét" },
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
      )}
    </div>
  );
}
