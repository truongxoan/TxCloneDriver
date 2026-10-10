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
} from "lucide-react";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";
import { getUpcomingHolidayCountdowns } from "@/modules/holiday-countdown/holidaysData";
import { getWeather } from "@/modules/weather/weatherMockService";
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

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
    <header className="sticky top-0 z-30 flex h-auto min-h-[64px] w-full items-center justify-between px-3 sm:px-5 py-2.5 gap-2 overflow-x-auto no-scrollbar">
      {/* Mobile Hamburger Menu */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl glass-pill text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Main Multi-Pill Bar */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Pill 1: Clock & Solar Date */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-pill shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-foreground tracking-tight font-mono leading-none">
              {hoursStr}:{minStr}:{secStr}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
              {weekday}, {solarDateStr}
            </span>
          </div>
        </div>

        {/* Pill 2: Âm lịch & Can Chi */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl glass-pill shrink-0">
          <span className="text-lg">🐎</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-foreground leading-none">
              Âm lịch: {lunar.day}/{lunar.month}/{lunar.year}
            </span>
            <span className="text-[10px] text-amber-300 font-medium mt-0.5 whitespace-nowrap">
              (Ngày {lunar.canChiDay} &bull; Tháng {lunar.canChiMonth})
            </span>
          </div>
        </div>

        {/* Pill 3: Tết Nguyên Đán Countdown */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-pill shrink-0">
          <div className="h-6 w-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Gift className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-foreground leading-none">
              Tết Nguyên Đán
            </span>
            <span className="text-[10px] text-rose-400 font-semibold mt-0.5">
              Còn {tetHoliday.daysRemaining} ngày
            </span>
          </div>
        </div>

        {/* Pill 4: Giờ hoàng đạo */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-pill shrink-0">
          <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium text-muted-foreground leading-none">
              Giờ hoàng đạo
            </span>
            <span className="text-[11px] font-bold text-foreground mt-0.5 whitespace-nowrap">
              {currentAuspicious.timeRange} ({currentAuspicious.chi.replace("Giờ ", "")})
            </span>
          </div>
        </div>

        {/* Pill 5: Thời tiết */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-pill shrink-0 text-xs">
          <CloudSun className="h-4 w-4 text-amber-300 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{weather.city}</span>
            <span className="font-extrabold text-foreground">{weather.temperature}°C</span>
            <span className="text-muted-foreground text-[11px]">{weather.condition}</span>
            <span className="text-muted-foreground/50 mx-0.5">|</span>
            <span className="text-muted-foreground text-[10px]">Độ ẩm {weather.humidity}%</span>
            <span className="text-muted-foreground/50 mx-0.5">|</span>
            <span className="text-muted-foreground text-[10px]">Gió {weather.windSpeedKmH} km/h</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Selector, Notification Bell, User Avatar */}
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

        {/* User Profile Avatar Pill */}
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl glass-pill hover:bg-white/10 text-foreground cursor-pointer">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
