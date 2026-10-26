"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  CloudSun,
  Palette,
  Sparkles,
  Search,
  Bell,
  Menu,
  Check,
  ChevronDown,
  Gift,
  Compass,
  User,
  LogOut,
  Shield,
  ShieldAlert,
  Mic,
  Headphones,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Wallet,
  Smartphone,
  MessageCircle,
} from "lucide-react";
import { useChat } from "@/modules/chat/chatContext";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";
import { AmbientSoundPlayer } from "@/components/audio/AmbientSoundPlayer";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";
import { getUpcomingHolidayCountdowns } from "@/modules/holiday-countdown/holidaysData";
import { getWeather } from "@/modules/weather/weatherMockService";
import { useAuth } from "@/modules/auth/authContext";
import { useFeedback } from "@/modules/feedback/feedbackContext";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

const WEEKDAYS_VI = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function Header({ onOpenMobileMenu, onOpenSearch }: HeaderProps) {
  const {
    currentTheme,
    setThemeId,
    effectsEnabled,
    setEffectsEnabled,
    isAutoSeason,
    setIsAutoSeason,
  } = useTheme();

  const { user, isAdmin, logout } = useAuth();
  const { reports } = useFeedback();
  const { isChatWidgetVisible, toggleChatWidget } = useChat();
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [ambientPlayerOpen, setAmbientPlayerOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  // Pomodoro Timer State
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState<"work" | "break">("work");
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Pomodoro countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoroActive && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroActive && pomodoroSeconds === 0) {
      if (pomodoroMode === "work") {
        setPomodoroMode("break");
        setPomodoroSeconds(5 * 60);
      } else {
        setPomodoroMode("work");
        setPomodoroSeconds(25 * 60);
      }
      setPomodoroActive(false);
    }
    return () => clearInterval(timer);
  }, [pomodoroActive, pomodoroSeconds, pomodoroMode]);

  const pomodoroMin = Math.floor(pomodoroSeconds / 60);
  const pomodoroSec = pomodoroSeconds % 60;
  const pomodoroDisplay = `${String(pomodoroMin).padStart(2, "0")}:${String(pomodoroSec).padStart(2, "0")}`;

  const weather = getWeather("hanoi");

  // Client-side ticking clock (1s interval)
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime || new Date();
  const hoursStr = String(now.getHours()).padStart(2, "0");
  const minStr = String(now.getMinutes()).padStart(2, "0");
  const secStr = String(now.getSeconds()).padStart(2, "0");
  const weekday = WEEKDAYS_VI[now.getDay()];
  const solarDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  // Accurate lunar calculations
  const lunar = convertSolar2Lunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const auspiciousHours = getAuspiciousHours(now.getDate(), now.getMonth() + 1, now.getFullYear(), now.getHours());
  const currentAuspicious = auspiciousHours.find((h) => h.isCurrent) || auspiciousHours[0];

  // Tết Nguyên Đán countdown
  const holidayList = getUpcomingHolidayCountdowns(now);
  const tetHoliday = holidayList.find((h) => h.id === "tet-nguyen-dan") || holidayList[0];

  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;

  const notificationsList = [
    {
      id: "notif-drive",
      title: "Google Drive Cloud Hub",
      desc: "Hệ thống lưu trữ đám mây đang sẵn sàng và hoạt động ổn định.",
      time: "Trực tuyến",
      href: "/storage",
      icon: HardDrive,
      color: "text-blue-400 bg-blue-500/20",
    },
    {
      id: "notif-coins",
      title: "Ví Điểm Cược & Xu Thưởng",
      desc: `Số dư ${(user?.coins ?? 50000).toLocaleString("vi-VN")} Xu • Tặng 50.000 Xu mỗi 24 giờ.`,
      time: "Hôm nay",
      href: "/games",
      icon: Wallet,
      color: "text-amber-400 bg-amber-500/20",
    },
    ...(openReports > 0
      ? [
          {
            id: "notif-bugs",
            title: "Báo Cáo Lỗi & Phản Hồi",
            desc: `Đang có ${openReports} báo cáo lỗi đang mở cần chú ý.`,
            time: "Cần xử lý",
            href: "/overview",
            icon: CheckCircle2,
            color: "text-rose-400 bg-rose-500/20",
          },
        ]
      : []),
    {
      id: "notif-security",
      title: "Phân Quyền & Bảo Mật",
      desc: isAdmin ? "Tài khoản Quản trị viên Tối cao — Toàn quyền truy cập." : "Tài khoản Thành viên tiêu chuẩn an toàn.",
      time: "Bảo vệ",
      href: "/settings",
      icon: Shield,
      color: "text-emerald-400 bg-emerald-500/20",
    },
  ];

  const unreadCount = notificationsList.filter((n) => !readNotifIds.includes(n.id)).length;

  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-[64px] w-full items-center justify-between md:justify-end px-3 sm:px-6 py-2.5 gap-4">
      {/* Mobile Hamburger Menu */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl glass-pill text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Header Info & Controls (aligned right, matching reference) */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
        {/* Clock & Solar Date — min-w-0 + truncate so the centered
            Dynamic Island pill can never cover or cut off the date (fix #9). */}
        <div className="text-right shrink-0 min-w-0">
          <div className="text-sm font-extrabold text-white tracking-tight font-mono leading-tight truncate">
            {hoursStr}:{minStr}:{secStr}
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate max-w-[180px] sm:max-w-none">
            {weekday}, {solarDateStr}
          </div>
        </div>

        {/* Weather Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-pill shrink-0 text-xs">
          <span className="text-base">🌤️</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {weather.temperature}°C
            </span>
            <span className="text-[10px] text-slate-300 truncate max-w-[110px]">
              {weather.condition} - {weather.city}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Selector, Notification Bell, User Avatar & Logout */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-2xl glass-pill hover:bg-white/10 text-xs font-semibold text-foreground transition-all"
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: currentTheme.primaryColor }}
            />
            <span className="hidden sm:inline">{currentTheme.nameVi}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Theme Dropdown Menu */}
          {themeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setThemeDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl glass-panel p-2 shadow-glass border border-white/15">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <span className="text-xs font-bold text-foreground">
                    Bộ Sưu Tập Giao Diện
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAutoSeason}
                      onChange={(e) => setIsAutoSeason(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span>Tự động theo mùa</span>
                  </label>
                </div>

                <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                  {THEMES.map((theme) => {
                    const isSelected = theme.id === currentTheme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setThemeId(theme.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors group",
                          isSelected
                            ? "bg-primary/25 text-foreground font-semibold border border-primary/40"
                            : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.primaryColor }}
                              title="Màu chính"
                            />
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.accentColor }}
                              title="Màu điểm nhấn"
                            />
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.cssVars["--background"] || "#0a0d18" }}
                              title="Màu nền"
                            />
                          </div>
                          <div>
                            <div className="text-foreground font-medium">
                              {theme.nameVi}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {theme.name}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Voice Assistant Mic Button */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl glass-pill hover:bg-white/10 text-sky-400 hover:text-sky-300 transition-all relative group"
          title="Trợ lý giọng nói AI Tiếng Việt (Web Speech)"
        >
          <Mic className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
        </button>

        {/* Ambient Relaxing Sound Button */}
        <button
          onClick={() => setAmbientPlayerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl glass-pill hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-all relative group"
          title="Không gian âm thanh thư giãn (Lofi & White Noise)"
        >
          <Headphones className="h-4 w-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Pomodoro Focus Timer Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPomodoroOpen(!pomodoroOpen)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-2.5 rounded-2xl glass-pill hover:bg-white/10 transition-all text-xs font-semibold",
              pomodoroActive
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/20"
                : "text-emerald-400 hover:text-emerald-300"
            )}
            title="Đồng hồ tập trung Pomodoro (25/5 phút)"
          >
            <Timer className={cn("h-4 w-4", pomodoroActive && "animate-pulse")} />
            {pomodoroActive && (
              <span className="font-mono text-xs font-bold text-white">
                {pomodoroDisplay}
              </span>
            )}
          </button>

          {pomodoroOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPomodoroOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl glass-panel p-3.5 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150 text-center space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Timer className="h-4 w-4 text-rose-400" />
                    <span>Pomodoro Tập Trung</span>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      pomodoroMode === "work"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    )}
                  >
                    {pomodoroMode === "work" ? "Làm việc" : "Nghỉ ngơi"}
                  </span>
                </div>

                <div className="py-2">
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {pomodoroDisplay}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {pomodoroMode === "work"
                      ? "Tập trung sâu 25 phút"
                      : "Nghỉ giải lao 5 phút"}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPomodoroActive(!pomodoroActive)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-md",
                      pomodoroActive
                        ? "bg-amber-600 hover:bg-amber-500"
                        : "bg-rose-600 hover:bg-rose-500"
                    )}
                  >
                    {pomodoroActive ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span>{pomodoroActive ? "Tạm dừng" : "Bắt đầu"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setPomodoroActive(false);
                      setPomodoroSeconds(pomodoroMode === "work" ? 25 * 60 : 5 * 60);
                    }}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Đặt lại thời gian"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => {
                      setPomodoroMode("work");
                      setPomodoroSeconds(25 * 60);
                      setPomodoroActive(false);
                    }}
                    className={cn(
                      "hover:text-white transition-colors",
                      pomodoroMode === "work" && "text-white font-bold"
                    )}
                  >
                    25m Làm việc
                  </button>
                  <button
                    onClick={() => {
                      setPomodoroMode("break");
                      setPomodoroSeconds(5 * 60);
                      setPomodoroActive(false);
                    }}
                    className={cn(
                      "hover:text-white transition-colors",
                      pomodoroMode === "break" && "text-white font-bold"
                    )}
                  >
                    5m Nghỉ ngơi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PWA App Install Button */}
        <button
          onClick={async () => {
            if (installPrompt) {
              installPrompt.prompt();
              const choice = await installPrompt.userChoice;
              if (choice?.outcome === "accepted") setInstallPrompt(null);
            } else {
              alert(
                "📲 HƯỚNG DẪN CÀI ĐẶT APP:\n\n• Trên iPhone/iPad (Safari): Bấm nút Chia sẻ (biểu tượng mũi tên lên) -> Chọn 'Thêm vào MH chính' (Add to Home Screen).\n• Trên Android (Chrome): Bấm dấu 3 chấm góc phải -> Chọn 'Cài đặt ứng dụng' hoặc 'Thêm vào màn hình chính'.\n• Trên Máy tính (Chrome/Edge): Bấm biểu tượng Cài đặt (Install) ở góc phải thanh địa chỉ URL!"
              );
            }
          }}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-2xl glass-pill hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all text-xs font-bold border border-emerald-500/30 shadow-sm"
          title="Cài đặt TxCloneDriver thành App Native trên điện thoại hoặc máy tính"
        >
          <Smartphone className="h-4 w-4 text-emerald-400" />
          <span>Cài App</span>
        </button>

        {/* Chat Widget Toggle Button (Bật / Tắt / Mở Khung Chat) */}
        <div className="relative flex items-center">
          <button
            onClick={() => {
              if (isChatWidgetVisible) {
                // If visible -> hide completely and close window
                toggleChatWidget(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("close-floating-messenger"));
                }
              } else {
                // If hidden -> show and open window
                toggleChatWidget(true);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-floating-messenger"));
                }
              }
            }}
            className={cn(
              "flex h-9 px-2.5 items-center justify-center gap-1.5 rounded-2xl glass-pill transition-all relative cursor-pointer",
              isChatWidgetVisible
                ? "text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            )}
            title={
              isChatWidgetVisible
                ? "Bấm để TẮT/ẨN hoàn toàn khung chat (không che các nút bên dưới)"
                : "Bấm để BẬT và MỞ khung chat TxMessenger"
            }
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline text-xs font-semibold">
              {isChatWidgetVisible ? "Ẩn Chat" : "Hiện Chat"}
            </span>
            <span
              className={cn(
                "w-2 h-2 rounded-full ring-2 ring-slate-900",
                isChatWidgetVisible ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              )}
            />
          </button>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl glass-pill hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all relative"
            title="Trung tâm thông báo"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl glass-panel p-3.5 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Thông Báo
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setReadNotifIds(notificationsList.map((n) => n.id))}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notificationsList.map((notif) => {
                    const Icon = notif.icon;
                    const isRead = readNotifIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setReadNotifIds((prev) => [...prev, notif.id]);
                          if (notif.href) {
                            router.push(notif.href);
                            setNotificationsOpen(false);
                          }
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer group",
                          isRead
                            ? "bg-white/5 border-white/5 opacity-60"
                            : "bg-white/10 border-white/10 hover:border-white/20 hover:bg-white/15"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", notif.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {notif.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar Pill with Role & Logout */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 h-9 px-2.5 rounded-2xl glass-pill hover:bg-white/10 text-foreground transition-all cursor-pointer"
          >
            <div
              className={cn(
                "h-6 w-6 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm",
                isAdmin
                  ? "bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-500/30"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30"
              )}
            >
              {user?.avatarInitials || "AD"}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-200">
              {user?.username || "admin"}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl glass-panel p-3 shadow-glass border border-white/15 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md",
                      isAdmin
                        ? "bg-gradient-to-tr from-rose-600 to-amber-500"
                        : "bg-gradient-to-tr from-blue-600 to-indigo-500"
                    )}
                  >
                    {user?.avatarInitials || "AD"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user?.name || "Quản trị viên"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider",
                          isAdmin
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        )}
                      >
                        {isAdmin ? "Toàn quyền Admin" : "User tiêu chuẩn"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <div className="px-2 py-1 text-[11px] text-slate-400">
                    {isAdmin
                      ? "Bạn có toàn quyền thêm, sửa, xóa và cấu hình hệ thống."
                      : "Bạn có quyền xem và tải xuống tài liệu (Không được thêm/xóa)."}
                  </div>

                  {/* Toggle Chat Widget item in Menu */}
                  <button
                    onClick={() => {
                      toggleChatWidget(!isChatWidgetVisible);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-sky-400" />
                      <span>Khung Chat (TxMessenger)</span>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                        isChatWidgetVisible
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-700 text-slate-400 border-slate-600"
                      )}
                    >
                      {isChatWidgetVisible ? "Đang Bật" : "Đã Tắt"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 font-semibold transition-colors mt-2 text-xs"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onOpenAmbientMusic={() => setAmbientPlayerOpen(true)}
      />

      {/* Ambient Sound Relax Player */}
      <AmbientSoundPlayer
        isOpen={ambientPlayerOpen}
        onClose={() => setAmbientPlayerOpen(false)}
      />
    </header>
  );
}
