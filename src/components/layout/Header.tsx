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
  CheckCircle2,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { convertSolar2Lunar } from "@/modules/lunar-calendar/lunarConverter";
import { getWeather } from "@/modules/weather/weatherMockService";
import { Button } from "@/components/ui/Button";
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

  // Format Time & Dates
  const now = currentTime || new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const weekday = WEEKDAYS_VI[now.getDay()];
  const solarDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  // Lunar conversion for today
  const lunar = convertSolar2Lunar(
    now.getDate(),
    now.getMonth() + 1,
    now.getFullYear()
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-border glass-panel px-4 lg:px-6">
      {/* Left: Mobile Menu + Smart Time Capsule */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live Clock & Vietnamese Lunar Capsule */}
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-elevated/70 border border-surface-border px-3 py-1.5 shadow-sm">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-sm font-bold text-foreground">
              {hours}:{minutes}
            </span>
            <span className="text-xs text-muted-foreground">:{seconds}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-surface-border/70 pl-2.5">
            <span className="text-xs font-medium text-foreground">
              {weekday}, {solarDateStr}
            </span>
            <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              Âm: {lunar.day}/{lunar.month} {lunar.canChiYear}
            </span>
          </div>
        </div>

        {/* Quick Weather Capsule */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-surface-elevated/60 border border-surface-border px-3 py-1.5 text-xs">
          <CloudSun className="h-4 w-4 text-accent" />
          <span className="text-foreground font-medium">Hà Nội, {weather.temperature}°C</span>
          <span className="text-muted-foreground text-[11px]">({weather.condition})</span>
          <Badge variant="outline" size="sm" className="text-[9px] py-0 px-1">
            Demo
          </Badge>
        </div>
      </div>

      {/* Right Controls: Search, Theme Picker, Seasonal Effect Toggle, Notifications, Avatar */}
      <div className="flex items-center gap-2">
        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-xl bg-surface-elevated/60 hover:bg-surface-elevated border border-surface-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          <Search className="h-3.5 w-3.5 text-primary" />
          <span>Tìm kiếm...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-surface-border bg-surface px-1.5 py-0.2 text-[10px] text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        {/* Seasonal Effects Toggle Button */}
        <button
          onClick={() => setEffectsEnabled(!effectsEnabled)}
          className={cn(
            "flex items-center gap-1.5 h-9 px-2.5 rounded-xl border text-xs font-medium transition-all",
            effectsEnabled
              ? "bg-accent/15 text-accent border-accent/40 shadow-glow-accent"
              : "bg-surface-elevated text-muted-foreground border-surface-border hover:text-foreground"
          )}
          title={effectsEnabled ? "Tắt hiệu ứng mùa" : "Bật hiệu ứng mùa"}
        >
          <Sparkles
            className={cn(
              "h-4 w-4 transition-transform",
              effectsEnabled ? "rotate-12 scale-110" : "opacity-60"
            )}
          />
          <span className="hidden xl:inline">
            {effectsEnabled ? "Hiệu ứng: Bật" : "Hiệu ứng: Tắt"}
          </span>
        </button>

        {/* Theme Engine Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border text-xs font-medium text-foreground transition-all"
          >
            <Palette className="h-4 w-4 text-primary" />
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
              <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl glass-panel p-2 shadow-glass border border-surface-border">
                <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border/60">
                  <span className="text-xs font-semibold text-foreground">
                    Bộ Sưu Tập Giao Diện
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAutoSeason}
                      onChange={(e) => setIsAutoSeason(e.target.checked)}
                      className="rounded border-surface-border"
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
                            ? "bg-primary/20 text-foreground font-semibold border border-primary/30"
                            : "hover:bg-surface-elevated/70 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full border border-white/20 shadow-sm"
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
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border text-muted-foreground hover:text-foreground transition-all relative"
            title="Thông báo hệ thống"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl glass-panel p-3 shadow-glass border border-surface-border">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
                  <span className="text-xs font-semibold text-foreground">
                    Thông báo DataVault
                  </span>
                  <Badge variant="primary" size="sm">
                    Giai đoạn 1
                  </Badge>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="rounded-xl p-2.5 bg-surface-elevated/70 border border-surface-border">
                    <p className="font-medium text-foreground">
                      🎉 Hoàn thành Nền tảng Giai đoạn 1
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Design System, Theme Engine 8 mùa & Lịch âm dương đã sẵn sàng.
                    </p>
                  </div>
                  <div className="rounded-xl p-2.5 bg-surface-elevated/70 border border-surface-border">
                    <p className="font-medium text-foreground">
                      ☁️ Google Drive & Telegram
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Đang ở trạng thái chờ cấu hình (chuẩn bị cho Giai đoạn 3 và 6).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-1.5 border-l border-surface-border/60">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
