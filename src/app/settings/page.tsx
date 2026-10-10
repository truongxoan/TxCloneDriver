"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Shield,
  Key,
  CheckCircle2,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/modules/theme-engine/themeContext";

export default function SettingsPage() {
  const { effectsEnabled, setEffectsEnabled, intensity, setIntensity } = useTheme();

  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "api" | "security">("general");
  const [hubName, setHubName] = useState("DataVault Cloud Hub Pro");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh (GMT+7)");
  const [language, setLanguage] = useState("vi");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Đã lưu các tùy chọn cấu hình hệ thống thành công!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Cài đặt Hệ thống DataVault
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình tham số môi trường, thời gian, giao diện và cổng bảo mật
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          <span>Lưu thay đổi</span>
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-3">
        {[
          { id: "general", label: "Chung & Thời gian", icon: Globe },
          { id: "appearance", label: "Giao diện & Hiệu năng", icon: Sliders },
          { id: "api", label: "Cổng API & Secret", icon: Key },
          { id: "security", label: "Bảo mật & Phân quyền", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "general" && (
        <Card className="p-6 max-w-2xl space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Thông tin Nền tảng</h3>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Tên Hub Quản trị
            </label>
            <input
              type="text"
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Múi giờ Hệ thống (Bắt buộc cho Lịch âm và Ticking Clock)
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-surface"
            >
              <option value="Asia/Ho_Chi_Minh (GMT+7)">Asia/Ho_Chi_Minh (GMT+7) &mdash; Mặc định Việt Nam</option>
              <option value="UTC (GMT+0)">UTC (GMT+0) &mdash; Quốc tế</option>
              <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9) &mdash; Nhật Bản</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Ngôn ngữ Giao diện
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-surface"
            >
              <option value="vi">Tiếng Việt (Việt Nam)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </Card>
      )}

      {activeTab === "appearance" && (
        <Card className="p-6 max-w-2xl space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Tối ưu hóa Trải nghiệm</h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-surface-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Hiệu ứng mùa (Seasonal Engine)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Hiệu ứng cánh hoa, lá rơi, tuyết hoặc ma trận hạt trên nền Canvas
              </span>
            </div>
            <Button
              variant={effectsEnabled ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEffectsEnabled(!effectsEnabled)}
            >
              {effectsEnabled ? "Đang bật" : "Đã tắt"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-surface-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Cường độ hạt hoạt họa
              </span>
              <span className="text-[11px] text-muted-foreground">
                Điều chỉnh số lượng hạt phù hợp cấu hình máy
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(["low", "medium", "high"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setIntensity(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    intensity === lvl
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground bg-surface"
                  }`}
                >
                  {lvl === "low" ? "Nhẹ" : lvl === "medium" ? "Vừa" : "Dày"}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "api" && (
        <Card className="p-6 max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">
              Cấu hình Secret Môi trường (.env)
            </h3>
            <Badge variant="warning" size="sm">
              Bảo mật Server-side
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Theo Section 15, không lưu API key hoặc token trực tiếp trên Frontend. Các giá trị dưới đây được ánh xạ từ file môi trường máy chủ.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">
                GOOGLE_DRIVE_CLIENT_ID (Giai đoạn 3)
              </label>
              <input
                type="text"
                disabled
                placeholder="apps.googleusercontent.com (Chưa cấu hình)"
                className="w-full px-3 py-2 rounded-xl glass-input opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">
                TELEGRAM_BOT_TOKEN (Giai đoạn 6)
              </label>
              <input
                type="password"
                disabled
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2 rounded-xl glass-input opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">
                DATABASE_URL (PostgreSQL - Giai đoạn 2)
              </label>
              <input
                type="password"
                disabled
                placeholder="postgresql://user:pass@localhost:5432/datavault"
                className="w-full px-3 py-2 rounded-xl glass-input opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="p-6 max-w-2xl space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Chính sách Bảo vệ</h3>
          <div className="p-4 rounded-xl bg-surface-elevated/40 border border-surface-border space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Shield className="h-4 w-4" />
              Tuân thủ nguyên tắc an toàn thông tin
            </div>
            <p className="text-muted-foreground">
              - Bảo vệ CSRF và Header an toàn theo chuẩn Next.js.<br />
              - Phân tách quyền nghiêm ngặt giữa người dùng thông thường và Quản trị viên.<br />
              - Hỗ trợ mã hóa AES-256 các token liên kết Google Drive và Telegram ở các giai đoạn sau.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
