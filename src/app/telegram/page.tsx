"use client";

import React, { useState } from "react";
import {
  Send,
  ShieldAlert,
  Terminal,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Key,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const BOT_COMMANDS = [
  { command: "/start", desc: "Khởi động bot và xác thực danh tính người dùng" },
  { command: "/help", desc: "Xem danh sách các lệnh và cú pháp sử dụng" },
  { command: "/status", desc: "Kiểm tra tình trạng tài nguyên, CPU, RAM và sao lưu" },
  { command: "/search <từ khóa>", desc: "Tìm kiếm tài liệu và tệp tin trên Google Drive" },
  { command: "/recent", desc: "Xem 5 tệp tin cập nhật gần đây nhất" },
  { command: "/backup", desc: "Kích hoạt phiên sao lưu snapshot thủ công khẩn cấp" },
  { command: "/cancel", desc: "Hủy bỏ tác vụ đang chờ xác nhận" },
];

export default function TelegramPage() {
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestConnection = () => {
    setTestStatus("Đang kiểm tra kết nối Webhook...");
    setTimeout(() => {
      setTestStatus("Chưa thiết lập TELEGRAM_BOT_TOKEN trong biến môi trường. Vui lòng cấu hình ở Giai đoạn 6.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="rounded-2xl glass-panel p-4 border border-cyan-500/30 bg-cyan-500/10 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-cyan-300">
            Trạng thái Mô phỏng Giai đoạn 1 &mdash; Chưa kết nối Telegram Bot thật
          </div>
          <p className="text-muted-foreground">
            Bot Telegram chưa được nạp Token hoặc Webhook Secret. Theo quy chuẩn bảo mật tại Section 12 & 15,
            mọi thao tác tương tác Bot sẽ được xây dựng và mã hóa bảo mật toàn diện ở{" "}
            <span className="text-primary font-medium">Giai đoạn 6</span>.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-cyan-400" />
            Telegram Control Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trung tâm điều khiển và tiếp nhận cảnh báo tự động thông qua Telegram Bot API
          </p>
        </div>

        <Badge variant="warning" size="md">
          Chờ tích hợp (Giai đoạn 6)
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Trạng thái Webhook</span>
          <div className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Chưa đăng ký Webhook
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Yêu cầu HTTPS công khai và Secret Token xác thực
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Người dùng được cấp phép (Whitelist)</span>
          <div className="text-lg font-bold text-foreground mt-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            0 Tài khoản liên kết
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Chống truy cập trái phép & kiểm tra phân quyền backend
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Kênh nhận thông báo</span>
          <div className="text-lg font-bold text-foreground mt-1 flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            Sẵn sàng cấu hình
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Cảnh báo thời tiết xấu, backup lỗi và nhắc việc
          </p>
        </Card>
      </div>

      {/* Webhook Configuration Preview & Command Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Command Reference (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Đặc tả Bộ lệnh Tương tác Bot
              </CardTitle>
              <CardDescription>
                Các câu lệnh người dùng được hỗ trợ khi chat trực tiếp với bot
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {BOT_COMMANDS.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-elevated/40 border border-surface-border flex items-start justify-between gap-4"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {cmd.command}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cmd.desc}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                      Kiểm tra quyền
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Guide & Test Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" />
                Cấu hình Giai đoạn 6
              </CardTitle>
              <CardDescription>
                Các bước chuẩn bị để kích hoạt Bot an toàn
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-1.5">
                <span className="font-semibold text-foreground">Bước 1: Tạo bot qua @BotFather</span>
                <p className="text-muted-foreground text-[11px]">
                  Lấy chuỗi token dạng: <code className="text-primary font-mono">123456:ABC-DEF...</code>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-1.5">
                <span className="font-semibold text-foreground">Bước 2: Cài đặt biến môi trường</span>
                <p className="text-muted-foreground text-[11px]">
                  Cấu hình <code className="text-primary font-mono">TELEGRAM_BOT_TOKEN</code> và{" "}
                  <code className="text-primary font-mono">TELEGRAM_WEBHOOK_SECRET</code> trong file .env.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-1.5">
                <span className="font-semibold text-foreground">Bước 3: Whitelist User ID</span>
                <p className="text-muted-foreground text-[11px]">
                  Chỉ cho phép Telegram ID của quản trị viên thực thi lệnh backup và tìm kiếm tệp.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={handleTestConnection}
              >
                Kiểm tra kết nối Bot (Thử nghiệm)
              </Button>

              {testStatus && (
                <div className="p-2.5 rounded-xl bg-surface-elevated border border-primary/30 text-[11px] text-foreground">
                  {testStatus}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
