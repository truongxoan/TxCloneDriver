"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";
import { getUpcomingHolidayCountdowns } from "@/modules/holiday-countdown/holidaysData";
import { getWeather } from "@/modules/weather/weatherMockService";
import { useAuth } from "@/modules/auth/authContext";
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

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
        {/* Clock & Solar Date */}
        <div className="text-right shrink-0">
          <div className="text-sm font-extrabold text-white tracking-tight font-mono leading-tight">
            {hoursStr}:{minStr}:{secStr}
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
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
            <span className="text-sm">🌸</span>
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
                          <span
                            className="h-3 w-3 rounded-full border border-white/20 shadow-sm shrink-0"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
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

        {/* Notifications Button */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl glass-pill hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
        </button>

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
                  <div className="px-2 py-1.5 text-[11px] text-slate-400">
                    {isAdmin
                      ? "Bạn có toàn quyền thêm, sửa, xóa và cấu hình hệ thống."
                      : "Bạn có quyền xem và tải xuống tài liệu (Không được thêm/xóa)."}
                  </div>

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
    </header>
  );
}
