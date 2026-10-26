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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ThemeStudio } from "@/components/ui/ThemeStudio";
import MouseFxStudio from "@/components/ui/MouseFxStudio";
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

        {/* Quick Atmosphere Toggle Switches Bar: Exclusively Thunderstorm, Fireworks, and Cosmic Stars */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Thunderstorm Switch */}
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

          {/* 2. Fireworks Switch */}
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

          {/* 3. Cosmic Shooting Star Switch */}
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

      {/* Theme Studio — tự tạo theme */}
      <ThemeStudio />
      <MouseFxStudio />

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
            { id: "leaves", label: "🌿 Lá Rơi Mùa Hạ" },
            { id: "autumn", label: "🍂 Lá Phong Mùa Thu" },
            { id: "snow", label: "❄️ Bông Tuyết Mùa Đông" },
            { id: "cyber", label: "💎 Hạt Năng Lượng Cyber" },
            { id: "stars", label: "⭐ Vũ Trụ Sao Lấp Lánh" },
            { id: "bubbles", label: "🫧 Bong Bóng Thủy Cung" },
            { id: "particles", label: "🥽 Hạt Phân Tử VisionOS" },
            { id: "hud-grid", label: "🌐 Lưới Radar Sci-Fi HUD" },
            { id: "synthwave", label: "🕹️ Neon Hạt Retro 80s" },
            { id: "matrix", label: "💻 Mưa Ký Tự Số Ma Trận" },
            { id: "aurora", label: "🌌 Cực Quang Bắc Cực" },
            { id: "sunset", label: "🌅 Đốm Lửa Hoàng Hôn" },
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

      {/* Themes Grid (count is dynamic from THEMES) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Bộ Sưu Tập {THEMES.length} Giao Diện Cao Cấp &amp; Hình Nền 8K Đa Chiều</span>
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
