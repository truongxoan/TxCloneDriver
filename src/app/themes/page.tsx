"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  MousePointer2,
  Flame,
  Volume2,
  Crosshair,
  Heart,
  Sword,
  Star,
  RefreshCw,
  Flower2,
  Wind,
  Snowflake,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { playClickSound, playThunderSound } from "@/lib/soundEffects";
import { CursorStyle } from "@/modules/interactions/MouseEffectsProvider";
import { EffectType } from "@/modules/theme-engine/types";

export default function ThemesPage() {
  const {
    currentTheme,
    themeId,
    setThemeId,
    effectsEnabled,
    setEffectsEnabled,
    isAutoSeason,
    setIsAutoSeason,
    intensity,
    setIntensity,
    customEffectType,
    setCustomEffectType,
    flowerType,
    setFlowerType,
  } = useTheme();

  // Custom Cursor Style State (synced with MouseEffectsProvider via localStorage & events)
  const [currentCursor, setCurrentCursor] = useState<CursorStyle>("default");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("txclonedriver_cursor_style") as CursorStyle;
      if (saved) setCurrentCursor(saved);
    } catch {}

    const handleCursorSync = (e: any) => {
      if (e.detail?.style) setCurrentCursor(e.detail.style);
    };
    window.addEventListener("tx_cursor_style_change", handleCursorSync);
    return () => window.removeEventListener("tx_cursor_style_change", handleCursorSync);
  }, []);

  const changeCursor = (style: CursorStyle) => {
    setCurrentCursor(style);
    try {
      localStorage.setItem("txclonedriver_cursor_style", style);
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tx_cursor_style_change", { detail: { style } }));
    }
    showToast(`Đã áp dụng kiểu chuột: ${style.toUpperCase()}`);
    playClickSound();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Computed active effect across themes & custom override
  const activeCurrentEffect =
    customEffectType && customEffectType !== "theme-default"
      ? customEffectType
      : currentTheme.effectType;

  const isEffectActive = (target: EffectType) => {
    return effectsEnabled && activeCurrentEffect === target;
  };

  const toggleEffect = (target: EffectType, labelVi: string, triggerEvent?: string, detail?: any) => {
    playClickSound();
    const currentlyActive = isEffectActive(target);

    if (currentlyActive) {
      // Toggle OFF: disable this effect by setting custom effect to "none"
      setCustomEffectType("none");
      showToast(`Đã TẮT công tắc: ${labelVi}`);
    } else {
      // Toggle ON: activate effect globally
      if (!effectsEnabled) setEffectsEnabled(true);
      setCustomEffectType(target);
      if (triggerEvent && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(triggerEvent, { detail }));
        }, 120);
      }
      showToast(`⚡ Đã BẬT công tắc: ${labelVi} trên toàn trang!`);
    }
  };

  const handleSelectTheme = (id: typeof themeId) => {
    playClickSound();
    setThemeId(id);
    const th = THEMES.find((t) => t.id === id);
    showToast(`Đã áp dụng giao diện: ${th?.nameVi || id}`);
  };

  // Reusable Micro Toggle Switch Pill Component
  const renderToggleSwitch = (
    id: EffectType,
    label: string,
    icon: React.ReactNode,
    styles: {
      card: string;
      track: string;
      text: string;
    },
    triggerEvent?: string,
    detail?: any
  ) => {
    const active = isEffectActive(id);

    return (
      <button
        key={id}
        onClick={() => toggleEffect(id, label, triggerEvent, detail)}
        role="switch"
        aria-checked={active}
        title={`${active ? "Bấm để TẮT" : "Bấm để BẬT"} công tắc ${label}`}
        className={cn(
          "px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer select-none active:scale-95 border",
          active
            ? cn("scale-[1.02] shadow-lg ring-1 ring-white/10", styles.card)
            : "bg-slate-900/70 hover:bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white"
        )}
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </div>

        {/* Real Toggle Switch Control with Sliding Knob */}
        <div
          className={cn(
            "w-7 h-3.5 rounded-full transition-colors duration-300 relative flex items-center p-0.5",
            active ? styles.track : "bg-slate-700"
          )}
        >
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-300 transform",
              active ? "translate-x-3.5" : "translate-x-0"
            )}
          />
        </div>

        <span
          className={cn(
            "text-[9px] font-black uppercase px-1 rounded tracking-wider",
            active ? styles.text : "text-slate-400"
          )}
        >
          {active ? "BẬT" : "TẮT"}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-primary/40 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Theme Studio & Hiệu Ứng Sống Động 3D / 4D
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tùy biến toàn diện diện mạo nền sâu 8K, tương tác hạt vũ trụ, sấm sét 4D và công tắc hiệu ứng toàn trang
          </p>
        </div>

        {/* Quick Atmosphere Toggle Switches Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Blossom / Flower Switch */}
          {renderToggleSwitch(
            "blossom",
            "🌸 Hoa Rơi",
            <Flower2 className="h-3.5 w-3.5 text-pink-400 animate-pulse" />,
            {
              card: "bg-pink-950/60 border-pink-500/60 text-pink-200 shadow-pink-500/20",
              track: "bg-pink-500",
              text: "text-pink-300",
            },
            "tx_trigger_wind_gust",
            { type: flowerType || "sakura" }
          )}

          {/* 2. Thunderstorm Switch */}
          {renderToggleSwitch(
            "thunderstorm",
            "⚡ Sấm Sét 4D",
            <Zap className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />,
            {
              card: "bg-violet-950/60 border-violet-500/60 text-violet-200 shadow-violet-500/20",
              track: "bg-yellow-400",
              text: "text-yellow-300",
            },
            "tx_trigger_lightning"
          )}

          {/* 3. Fireworks Switch */}
          {renderToggleSwitch(
            "fireworks",
            "🎆 Pháo Hoa",
            <Flame className="h-3.5 w-3.5 text-rose-400 animate-bounce" />,
            {
              card: "bg-rose-950/60 border-rose-500/60 text-rose-200 shadow-rose-500/20",
              track: "bg-rose-500",
              text: "text-rose-300",
            },
            "tx_trigger_firework"
          )}

          {/* 4. Cosmic Shooting Star Switch */}
          {renderToggleSwitch(
            "cosmic",
            "🌌 Sao Băng",
            <Star className="h-3.5 w-3.5 text-cyan-300 fill-cyan-300" />,
            {
              card: "bg-sky-950/60 border-sky-500/60 text-sky-200 shadow-sky-500/20",
              track: "bg-cyan-400",
              text: "text-cyan-300",
            },
            "tx_trigger_shooting_star"
          )}

          {/* 5. Snow Switch */}
          {renderToggleSwitch(
            "snow",
            "❄️ Tuyết Rơi",
            <Snowflake className="h-3.5 w-3.5 text-sky-200 animate-spin" />,
            {
              card: "bg-slate-900/90 border-cyan-400/50 text-cyan-100 shadow-cyan-500/20",
              track: "bg-cyan-400",
              text: "text-cyan-200",
            }
          )}

          {/* Reset to Theme Default */}
          <button
            onClick={() => {
              playClickSound();
              setCustomEffectType("theme-default");
              showToast("Đã khôi phục hiệu ứng theo Theme mặc định!");
            }}
            className={cn(
              "px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95",
              customEffectType === "theme-default"
                ? "bg-primary/20 border-primary text-primary font-bold shadow-md"
                : "bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white"
            )}
            title="Khôi phục hiệu ứng ban đầu của giao diện đang chọn"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Mặc Định</span>
          </button>

          <Badge variant="primary" size="md">
            Đang dùng: {currentTheme.nameVi}
          </Badge>
        </div>
      </div>

      {/* 🌸 Dedicated Global Flower Shower Studio Card */}
      <Card className="p-6 glass-card border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-slate-900/60 to-purple-950/20 relative overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header & Master Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-pink-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  <Flower2 className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Cài Đặt Hiệu Ứng Hoa Rơi Toàn Web
                    <Badge variant="primary" size="sm" className="bg-pink-500/20 text-pink-300 border-pink-500/40">
                      Toàn Hệ Thống (All Pages)
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cánh hoa hoặc lá rơi liên tục, bay lượn 3D tự nhiên trên tất cả các trang web theo tùy chỉnh của Admin
                  </p>
                </div>
              </div>
            </div>

            {/* Master Switch for Falling Flowers */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  toggleEffect(
                    "blossom",
                    "🌸 Hoa Rơi Toàn Web",
                    "tx_trigger_wind_gust",
                    { type: flowerType || "sakura" }
                  );
                }}
                role="switch"
                aria-checked={isEffectActive("blossom")}
                className={cn(
                  "px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-3 transition-all duration-300 shadow-xl border cursor-pointer select-none active:scale-95",
                  isEffectActive("blossom")
                    ? "bg-pink-600 text-white border-pink-400 shadow-pink-600/30 scale-[1.02]"
                    : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                )}
              >
                <span>{isEffectActive("blossom") ? "🌸 Trạng thái: ĐANG RƠI" : "🌸 Trạng thái: ĐÃ TẮT"}</span>
                {/* Switch Slider */}
                <div
                  className={cn(
                    "w-9 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center",
                    isEffectActive("blossom") ? "bg-pink-900/90" : "bg-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 transform",
                      isEffectActive("blossom") ? "translate-x-4.5" : "translate-x-0"
                    )}
                  />
                </div>
                <span className={cn("text-[10px] font-black uppercase", isEffectActive("blossom") ? "text-yellow-200" : "text-slate-400")}>
                  {isEffectActive("blossom") ? "BẬT" : "TẮT"}
                </span>
              </button>

              {/* Instant Wind Gust Test Button */}
              <button
                onClick={() => {
                  playClickSound();
                  if (!isEffectActive("blossom")) {
                    if (!effectsEnabled) setEffectsEnabled(true);
                    setCustomEffectType("blossom");
                  }
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("tx_trigger_wind_gust", {
                        detail: { type: flowerType || "sakura" },
                      })
                    );
                  }
                  showToast("🌪️ Đã tạo cơn gió lốc cuốn hoa 3D cực mạnh!");
                }}
                className="px-3 py-2.5 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Tạo luồng gió xoáy cuốn hoa bay qua màn hình ngay lập tức"
              >
                <Wind className="h-4 w-4 text-pink-300 animate-pulse" />
                <span>Thổi Cơn Lốc Hoa 3D</span>
              </button>
            </div>
          </div>

          {/* Controls: Flower Type & Falling Intensity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Flower Type Selector */}
            <div className="space-y-3 p-4 rounded-2xl bg-surface-elevated/40 border border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-pink-400" />
                  1. Chọn Loại Hoa Rơi (&quot;Hoa đào hoặc hoa gì đó&quot;):
                </span>
                <span className="text-[11px] font-mono font-bold text-pink-400">
                  {flowerType === "sakura" ? "🌸 Hoa Đào Hồng" : flowerType === "apricot" ? "🌼 Hoa Mai Vàng" : flowerType === "rose" ? "🌹 Cánh Hoa Hồng" : "🍁 Lá Phong Đỏ"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: "sakura" as const,
                    name: "Hoa Đào Hồng",
                    sub: "Sakura Nhật Bản",
                    emoji: "🌸",
                    activeBg: "bg-pink-950/70 text-pink-200 border-pink-400 shadow-pink-500/30",
                  },
                  {
                    id: "apricot" as const,
                    name: "Hoa Mai Vàng",
                    sub: "Tết Cổ Truyền",
                    emoji: "🌼",
                    activeBg: "bg-yellow-950/70 text-yellow-200 border-yellow-400 shadow-yellow-500/30",
                  },
                  {
                    id: "rose" as const,
                    name: "Cánh Hoa Hồng",
                    sub: "Lãng Mạn Tình Yêu",
                    emoji: "🌹",
                    activeBg: "bg-rose-950/70 text-rose-200 border-rose-400 shadow-rose-500/30",
                  },
                  {
                    id: "maple" as const,
                    name: "Lá Phong Đỏ",
                    sub: "Mùa Thu Ấm Áp",
                    emoji: "🍁",
                    activeBg: "bg-orange-950/70 text-orange-200 border-orange-400 shadow-orange-500/30",
                  },
                ].map((item) => {
                  const isSelected = flowerType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playClickSound();
                        setFlowerType(item.id);
                        if (!isEffectActive("blossom")) {
                          if (!effectsEnabled) setEffectsEnabled(true);
                          setCustomEffectType("blossom");
                        }
                        showToast(`Đã áp dụng loại hoa: ${item.name} trên toàn hệ thống!`);
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left flex flex-col items-center sm:items-start gap-1 transition-all cursor-pointer relative active:scale-95",
                        isSelected
                          ? cn("scale-105 shadow-lg font-bold border-2", item.activeBg)
                          : "bg-slate-900/50 hover:bg-slate-800/70 border-slate-700/60 text-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{item.emoji}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />}
                      </div>
                      <span className="text-xs font-bold leading-tight mt-1">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Intensity Selector */}
            <div className="space-y-3 p-4 rounded-2xl bg-surface-elevated/40 border border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-pink-400" />
                  2. Mức Độ Rơi Liên Tục (Intensity do Admin tùy chỉnh):
                </span>
                <span className="text-[11px] font-mono font-bold text-primary">
                  {intensity === "low" ? "🍃 Nhẹ (~30 cánh)" : intensity === "medium" ? "🌸 Vừa (~60 cánh)" : "🌪️ Dày đặc (~100 cánh)"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    level: "low" as const,
                    label: "Nhẹ",
                    desc: "30 cánh - Êm đềm",
                    icon: "🍃",
                  },
                  {
                    level: "medium" as const,
                    label: "Vừa",
                    desc: "60 cánh - Tự nhiên",
                    icon: "🌸",
                  },
                  {
                    level: "high" as const,
                    label: "Dày đặc",
                    desc: "100 cánh - Bão hoa",
                    icon: "🌪️",
                  },
                ].map((item) => {
                  const isSelected = intensity === item.level;
                  return (
                    <button
                      key={item.level}
                      onClick={() => {
                        playClickSound();
                        setIntensity(item.level);
                        showToast(`Mức độ rơi hoa: ${item.label} (${item.desc})`);
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95",
                        isSelected
                          ? "bg-primary/20 border-primary text-primary font-bold shadow-md scale-105"
                          : "bg-slate-900/50 hover:bg-slate-800/70 border-slate-700/60 text-slate-300"
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                Cánh hoa rơi liên tục được vẽ bằng Canvas 2D/3D hiệu năng cao, tự động tái sinh hạt khi chạm mép màn hình và tạm dừng khi ẩn tab để tiết kiệm pin.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Seasonal Control Panel */}
      <Card className="p-5 glass-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-accent" />
              Bộ Điều Khiển Hiệu Ứng Hạt Đa Chiều (Seasonal & Physics Engine)
            </h3>
            <p className="text-xs text-muted-foreground">
              Canvas hiệu ứng độc lập, tự động tối ưu hóa FPS, tạm dừng khi ẩn tab và hỗ trợ reduced-motion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto Season Switch */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-surface-border text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoSeason}
                onChange={(e) => setIsAutoSeason(e.target.checked)}
                className="rounded border-surface-border text-primary"
              />
              <span className="text-foreground font-medium">Tự động theo mùa</span>
            </label>

            {/* Intensity Toggle */}
            <div className="flex items-center rounded-xl glass-panel p-1 border border-surface-border text-xs">
              {(["low", "medium", "high"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setIntensity(lvl)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg capitalize transition-colors font-medium",
                    intensity === lvl
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lvl === "low" ? "Nhẹ" : lvl === "medium" ? "Vừa" : "Dày đặc"}
                </button>
              ))}
            </div>

            {/* Toggle Switch */}
            <Button
              variant={effectsEnabled ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEffectsEnabled(!effectsEnabled)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{effectsEnabled ? "Hiệu ứng: Bật" : "Hiệu ứng: Tắt"}</span>
            </Button>
          </div>
        </div>

        {/* 3D / 4D Custom Effect Selector */}
        <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mr-2">
            ✨ Tùy Chọn Kiểu Hiệu Ứng 3D / 4D:
          </span>
          {[
            { id: "theme-default", label: "Theo Theme Mặc Định" },
            { id: "thunderstorm", label: "⛈️ Mưa Bão & Sấm Sét 4D" },
            { id: "fireworks", label: "🎆 Pháo Hoa Tết Giao Thừa" },
            { id: "lanterns", label: "🏮 Đèn Lồng Rằm Trung Thu" },
            { id: "sparkles", label: "🎄 Ánh Sao Giáng Sinh" },
            { id: "cosmic", label: "🌌 Tinh Vân Vũ Trụ Sâu" },
            { id: "blossom", label: "🌸 Hoa Anh Đào Bay" },
            { id: "leaves", label: "🌿 Lá Rơi Mùa Hạ" },
            { id: "autumn", label: "🍂 Lá Phong Mùa Thu" },
            { id: "snow", label: "❄️ Bông Tuyết Mùa Đông" },
            { id: "cyber", label: "💎 Hạt Năng Lượng Cyber" },
            { id: "stars", label: "⭐ Vũ Trụ Sao Lấp Lánh" },
            { id: "bubbles", label: "🫧 Bong Bóng Thủy Cung" },
            { id: "particles", label: "🥽 Hạt Phân Tử VisionOS" },
            { id: "hud-grid", label: "🌐 Lưới Radar Sci-Fi HUD" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCustomEffectType(item.id as any);
                playClickSound();
                showToast(`Hiệu ứng hạt: ${item.label}`);
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                customEffectType === item.id
                  ? "bg-accent/20 border-accent text-accent font-bold shadow-md shadow-accent/20 scale-105"
                  : "bg-surface-elevated/60 border-surface-border text-muted-foreground hover:text-foreground hover:border-surface-border/80"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Mouse Cursor & Follower Effect Customization */}
      <Card className="p-5 glass-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MousePointer2 className="h-4 w-4 text-cyan-400" />
              Tùy Biến Con Trỏ Chuột & Hiệu Ứng Bụi Sao Đi Theo Chuột
            </h3>
            <p className="text-xs text-muted-foreground">
              Thay đổi hình dáng chuột độc đáo và hiệu ứng hào quang vệt sáng khi di chuyển chuột trên toàn bộ trang web.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-800/40">
            Kiểu hiện tại: {currentCursor}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          {[
            {
              id: "default",
              label: "Mặc định",
              desc: "Chuột hệ điều hành tiêu chuẩn",
              icon: <MousePointer2 className="w-5 h-5 text-slate-300" />,
            },
            {
              id: "neon-cross",
              label: "⚡ Tâm Ngắm",
              desc: "Tâm ngắm Neon phản lực",
              icon: <Crosshair className="w-5 h-5 text-cyan-400 animate-pulse" />,
            },
            {
              id: "cyber-dot",
              label: "💎 Cyber Dot",
              desc: "Hạt năng lượng xoay Cyberpunk",
              icon: <Sparkles className="w-5 h-5 text-pink-400 animate-spin" />,
            },
            {
              id: "heart",
              label: "💖 Trái Tim",
              desc: "Trái tim hồng lơ lửng 3D",
              icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />,
            },
            {
              id: "sword",
              label: "🗡️ Kiếm Hiệp",
              desc: "Thanh kiếm hiệp RPG phát sáng",
              icon: <Sword className="w-5 h-5 text-blue-400 -rotate-45" />,
            },
            {
              id: "star",
              label: "⭐ Ngôi Sao",
              desc: "Ngôi sao thiên hà lấp lánh",
              icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400 animate-spin" />,
            },
          ].map((cur) => {
            const isCurSelected = currentCursor === cur.id;
            return (
              <button
                key={cur.id}
                onClick={() => changeCursor(cur.id as CursorStyle)}
                className={cn(
                  "p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden",
                  isCurSelected
                    ? "bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20"
                    : "bg-surface-elevated/50 border-surface-border hover:border-surface-border/80 hover:bg-surface-elevated"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {cur.icon}
                  </div>
                  {isCurSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{cur.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {cur.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 17 Modern Themes Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Bộ Sưu Tập 17 Giao Diện Cao Cấp &amp; Hình Nền 8K Đa Chiều</span>
            <span className="text-xs font-normal text-muted-foreground">
              (Bấm để kích hoạt tức thì)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {THEMES.map((theme) => {
            const isSelected = theme.id === themeId;

            return (
              <Card
                key={theme.id}
                className={cn(
                  "p-4 flex flex-col justify-between transition-all group relative overflow-hidden border backdrop-blur-xl",
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-surface/90 shadow-2xl shadow-primary/25 scale-[1.01]"
                    : "hover:border-surface-border/80 hover:scale-[1.01] bg-surface/60"
                )}
              >
                <div>
                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <Badge variant="outline" size="sm">
                      {theme.badge}
                    </Badge>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary animate-pulse">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đang Dùng
                      </span>
                    )}
                  </div>

                  {/* Scenic Full HD Wallpaper Preview Box */}
                  <div className="relative h-28 w-full rounded-2xl mb-3 overflow-hidden border border-white/15 shadow-inner group-hover:shadow-md transition-shadow">
                    {theme.bgImage ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${theme.bgImage}')` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br",
                          theme.previewGradient
                        )}
                      />
                    )}

                    {/* Bottom floating color dots & effect tag */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/60 shadow"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/60 shadow"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>

                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/90 font-mono font-bold uppercase tracking-wider">
                        {theme.effectType}
                      </span>
                    </div>
                  </div>

                  {/* Title and Descriptions */}
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    {theme.nameVi}
                  </h3>
                  <h4 className="text-[11px] text-muted-foreground font-mono">
                    {theme.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border/60">
                  <Button
                    variant={isSelected ? "secondary" : "primary"}
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => handleSelectTheme(theme.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? "✓ Đang kích hoạt" : "Kích hoạt giao diện"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
