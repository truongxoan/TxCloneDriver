"use client";

import React from "react";
import {
  Palette,
  Sparkles,
  Check,
  Zap,
  Sliders,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";

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
  } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Theme Studio & Hiệu ứng Mùa
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tùy biến diện mạo cao cấp 3D và tương tác hạt trang trí không giật lag
          </p>
        </div>

        <Badge variant="primary" size="md">
          Đang áp dụng: {currentTheme.nameVi}
        </Badge>
      </div>

      {/* Seasonal Control Panel */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-accent" />
              Bộ điều khiển Hiệu ứng Hạt (Seasonal Engine)
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
                      ? "bg-primary text-primary-foreground"
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
      </Card>

      {/* 8 Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {THEMES.map((theme) => {
          const isSelected = theme.id === themeId;

          return (
            <Card
              key={theme.id}
              className={cn(
                "p-5 flex flex-col justify-between transition-all group relative overflow-hidden",
                isSelected
                  ? "ring-2 ring-primary border-primary bg-surface shadow-glow-lg"
                  : "hover:border-surface-border/80"
              )}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" size="sm">
                    {theme.badge}
                  </Badge>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đang dùng
                    </span>
                  )}
                </div>

                {/* Color Swatch Preview */}
                <div
                  className={cn(
                    "h-20 w-full rounded-xl mb-3 p-3 flex items-end justify-between border border-white/10 bg-gradient-to-br",
                    theme.previewGradient
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  <span className="text-[10px] text-white/80 font-mono">
                    {theme.effectType.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-foreground text-sm">
                  {theme.nameVi}
                </h3>
                <h4 className="text-[11px] text-muted-foreground font-mono">
                  {theme.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {theme.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border/60">
                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setThemeId(theme.id)}
                  disabled={isSelected}
                >
                  {isSelected ? "Đang kích hoạt" : "Kích hoạt giao diện"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
