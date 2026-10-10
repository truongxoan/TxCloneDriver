"use client";

import React, { useState } from "react";
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Shield,
  Palette,
  HardDrive,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  category: "system" | "storage" | "theme" | "security" | "telegram";
  title: string;
  description: string;
  actor: string;
  ip: string;
  timestamp: string;
  status: "success" | "warning" | "info";
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    category: "system",
    title: "Khởi tạo thành công Giai đoạn 1",
    description: "DataVault Cloud Hub thiết lập xong cấu trúc giao diện, Smart Header và Theme engine.",
    actor: "Admin (Tx)",
    ip: "127.0.0.1",
    timestamp: "10/10/2026 16:50:12",
    status: "success",
  },
  {
    id: "act-2",
    category: "theme",
    title: "Chuyển đổi giao diện sang Thu Phong Lá Vàng",
    description: "Hệ thống tự động đồng bộ biến CSS và hiệu ứng hạt lá phong rơi 3D.",
    actor: "Hệ thống Tự động",
    ip: "Internal",
    timestamp: "10/10/2026 16:45:00",
    status: "info",
  },
  {
    id: "act-3",
    category: "security",
    title: "Kiểm tra tính toàn vẹn thuật toán Lịch thiên văn",
    description: "Unit test thuật toán âm lịch và chu kỳ 6 giờ Hoàng Đạo/ngày vượt qua 100% kiểm thử.",
    actor: "Test Runner",
    ip: "Internal",
    timestamp: "10/10/2026 16:30:20",
    status: "success",
  },
  {
    id: "act-4",
    category: "storage",
    title: "Khởi tạo danh mục tệp tin mẫu Google Drive",
    description: "Nạp cấu trúc thư mục và tài liệu cho phiên làm việc Demo Giai đoạn 1.",
    actor: "Drive Mock Engine",
    ip: "Internal",
    timestamp: "10/10/2026 16:00:00",
    status: "info",
  },
  {
    id: "act-5",
    category: "telegram",
    title: "Kiểm tra trạng thái Telegram Webhook",
    description: "Phát hiện Webhook chưa đăng ký Token. Giữ trạng thái an toàn chờ Giai đoạn 6.",
    actor: "Security Guardian",
    ip: "Internal",
    timestamp: "10/10/2026 15:45:00",
    status: "warning",
  },
];

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filtered = ACTIVITIES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "all" || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "theme":
        return <Palette className="h-4 w-4 text-pink-400" />;
      case "storage":
        return <HardDrive className="h-4 w-4 text-primary" />;
      case "telegram":
        return <Send className="h-4 w-4 text-cyan-400" />;
      case "security":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      default:
        return <Activity className="h-4 w-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Nhật ký Hoạt động Hệ thống
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit log ghi nhận toàn diện các thao tác, cảnh báo bảo mật và thay đổi cấu hình
          </p>
        </div>

        <Badge variant="outline" size="md">
          {filtered.length} sự kiện được ghi nhận
        </Badge>
      </div>

      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nhật ký theo tiêu đề, nội dung..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Tất cả" },
              { id: "system", label: "Hệ thống" },
              { id: "storage", label: "Lưu trữ" },
              { id: "theme", label: "Giao diện" },
              { id: "security", label: "Bảo mật" },
              { id: "telegram", label: "Telegram" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                  selectedCat === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Timeline List */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-surface-border/50">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="p-4 hover:bg-surface-elevated/40 transition-colors flex items-start gap-4 text-xs"
            >
              <div className="p-2 rounded-xl bg-surface-elevated border border-surface-border shrink-0 mt-0.5">
                {getCategoryIcon(act.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold text-foreground text-sm">
                    {act.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {act.timestamp}
                  </span>
                </div>

                <p className="text-muted-foreground mt-1 text-xs">
                  {act.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Tác nhân: <strong className="text-foreground">{act.actor}</strong></span>
                  <span>IP: <strong className="font-mono text-foreground">{act.ip}</strong></span>
                </div>
              </div>

              <Badge
                variant={
                  act.status === "success"
                    ? "success"
                    : act.status === "warning"
                    ? "warning"
                    : "primary"
                }
                size="sm"
                className="shrink-0"
              >
                {act.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
