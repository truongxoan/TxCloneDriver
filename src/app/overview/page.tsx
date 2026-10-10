"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  Send,
  ShieldCheck,
  Database,
  Calendar,
  CloudSun,
  Compass,
  Hourglass,
  ArrowUpRight,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  Archive,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatBytes, cn } from "@/lib/utils";
import { MOCK_STORAGE_ITEMS, MOCK_STORAGE_QUOTA } from "@/modules/storage/mockDriveData";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";
import { getUpcomingHolidayCountdowns } from "@/modules/holiday-countdown/holidaysData";
import { getWeather } from "@/modules/weather/weatherMockService";
import { useTheme } from "@/modules/theme-engine/themeContext";

export default function OverviewPage() {
  const { currentTheme } = useTheme();
  const [mountedDate, setMountedDate] = useState<Date>(new Date());

  useEffect(() => {
    setMountedDate(new Date());
  }, []);

  const d = mountedDate;
  const lunar = convertSolar2Lunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
  const auspiciousHours = getAuspiciousHours(d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours());
  const holidays = getUpcomingHolidayCountdowns(d).slice(0, 3);
  const weather = getWeather("hanoi");

  // Determine greeting
  const hour = d.getHours();
  let greeting = "Chào buổi sáng";
  if (hour >= 12 && hour < 18) greeting = "Chào buổi chiều";
  else if (hour >= 18) greeting = "Chào buổi tối";

  const getFileIcon = (category: string) => {
    switch (category) {
      case "document":
        return <FileText className="h-4 w-4 text-sky-400" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-emerald-400" />;
      case "backup":
        return <Archive className="h-4 w-4 text-amber-400" />;
      case "folder":
        return <Folder className="h-4 w-4 text-yellow-400" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 lg:p-8 border border-surface-border">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                Bảng điều khiển trung tâm
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <Badge variant="primary" size="sm">
                Giai đoạn 1: Nền tảng
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting}, Quản trị viên!
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Hệ thống DataVault Cloud Hub đang vận hành giao diện 3D theo mùa{" "}
              <span className="text-primary font-medium">{currentTheme.nameVi}</span>.
              Dữ liệu lịch âm và giờ hoàng đạo đã được tính toán thiên văn chính xác.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/themes">
              <Button variant="secondary" size="sm" className="gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Đổi giao diện mùa
              </Button>
            </Link>
            <Link href="/storage">
              <Button variant="primary" size="sm" className="gap-2">
                <HardDrive className="h-3.5 w-3.5" />
                Quản lý kho tệp
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Connectivity & Service Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Google Drive Status */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <HardDrive className="h-5 w-5" />
              </div>
              <Badge variant="warning" size="sm">
                Chưa kết nối
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm">Google Drive v3</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Chưa thiết lập OAuth 2.0 Credentials. Sẽ kết nối thực tế ở Giai đoạn 3.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">[Giai đoạn 3]</span>
            <Link
              href="/storage"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Cấu hình <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Telegram Bot Status */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Send className="h-5 w-5" />
              </div>
              <Badge variant="warning" size="sm">
                Chờ thiết lập
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm">Telegram Bot Hub</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Chưa gắn Webhook Secret và Bot Token. Sẽ kích hoạt an toàn ở Giai đoạn 6.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">[Giai đoạn 6]</span>
            <Link
              href="/telegram"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Cấu hình <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Backup Engine Status */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <Badge variant="success" size="sm">
                Sẵn sàng (Demo)
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm">Sao lưu & Automation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Lập lịch: Mỗi ngày lúc 02:00 sáng. Snapshot bản ghi hệ thống định kỳ.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">Dry-run: OK</span>
            <Link
              href="/backups"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Xem nhật ký <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Quota Gauge */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="outline" size="sm">
                Dữ liệu Demo
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm">Dung lượng Tổng thể</h3>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Đã sử dụng</span>
                <span className="font-bold text-foreground">
                  {formatBytes(MOCK_STORAGE_QUOTA.usedBytes, 1)} / {formatBytes(MOCK_STORAGE_QUOTA.totalBytes, 0)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-surface-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{
                    width: `${Math.round(
                      (MOCK_STORAGE_QUOTA.usedBytes / MOCK_STORAGE_QUOTA.totalBytes) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[11px]">Còn trống: 10.2 GB</span>
            <Link
              href="/storage"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Chi tiết <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left (Files & Activity) + Right (Calendar, Auspicious, Weather, Countdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Files Table Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Tệp tin gần đây</CardTitle>
                  <Badge variant="outline" size="sm">
                    Mô phỏng Giai đoạn 1
                  </Badge>
                </div>
                <CardDescription>
                  Dữ liệu mẫu chuẩn bị cấu hình Google Drive API v3
                </CardDescription>
              </div>
              <Link href="/storage">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-muted-foreground">
                      <th className="pb-3 font-medium">Tên tệp</th>
                      <th className="pb-3 font-medium">Dung lượng</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Cập nhật</th>
                      <th className="pb-3 font-medium text-right">Đồng bộ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/40">
                    {MOCK_STORAGE_ITEMS.slice(0, 5).map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-surface-elevated/50 transition-colors group"
                      >
                        <td className="py-3 flex items-center gap-2.5 font-medium text-foreground">
                          <span className="p-1 rounded-lg bg-surface-elevated border border-surface-border group-hover:scale-105 transition-transform">
                            {getFileIcon(item.category)}
                          </span>
                          <span className="truncate max-w-[200px] sm:max-w-[280px]">
                            {item.name}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground font-mono">
                          {formatBytes(item.sizeBytes, 1)}
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell">
                          {item.updatedAt}
                        </td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" size="sm" className="text-[10px]">
                            Demo
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* System Activity Log Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nhật ký hệ thống gần đây</CardTitle>
                <CardDescription>
                  Ghi nhận hoạt động sao lưu và thay đổi cấu hình
                </CardDescription>
              </div>
              <Link href="/activity">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Xem toàn bộ <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        Khởi tạo Nền tảng DataVault Giai đoạn 1 thành công
                      </p>
                      <span className="text-[10px] text-muted-foreground">Vừa xong</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Đã thiết lập Design System, 8 Theme engine, hiệu ứng mùa và tính toán lịch âm dương.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        Kiểm thử thuật toán Lịch thiên văn Hồ Ngọc Đức
                      </p>
                      <span className="text-[10px] text-muted-foreground">Hôm nay</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Xác minh 100% chính xác mốc Tết Giáp Thìn và chu kỳ 6 giờ Hoàng Đạo/ngày.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        Google Drive & Telegram ở trạng thái chờ
                      </p>
                      <span className="text-[10px] text-muted-foreground">Kế hoạch</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sẵn sàng tích hợp xác thực an toàn ở các giai đoạn tiếp theo theo lộ trình.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vietnamese Lunar Calendar Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle>Lịch Âm Dương Việt Nam</CardTitle>
              </div>
              <Link href="/calendar">
                <Badge variant="primary" size="sm" className="cursor-pointer">
                  Xem tháng
                </Badge>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Dương lịch hôm nay</span>
                  <div className="text-2xl font-black text-foreground">
                    {d.getDate()}/{d.getMonth() + 1}/{d.getFullYear()}
                  </div>
                  <div className="text-xs text-primary font-medium mt-0.5">
                    Tiết khí: {lunar.solarTerm}
                  </div>
                </div>
                <div className="text-right border-l border-surface-border/80 pl-4">
                  <span className="text-xs text-muted-foreground">Âm lịch chính xác</span>
                  <div className="text-xl font-bold text-accent">
                    Ngày {lunar.day} Thg {lunar.month}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Năm {lunar.canChiYear}
                  </div>
                </div>
              </div>

              {/* Can Chi breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-surface-elevated/50 border border-surface-border">
                  <span className="text-[10px] text-muted-foreground">Ngày</span>
                  <div className="font-semibold text-foreground mt-0.5">{lunar.canChiDay}</div>
                </div>
                <div className="p-2 rounded-xl bg-surface-elevated/50 border border-surface-border">
                  <span className="text-[10px] text-muted-foreground">Tháng</span>
                  <div className="font-semibold text-foreground mt-0.5">{lunar.canChiMonth}</div>
                </div>
                <div className="p-2 rounded-xl bg-surface-elevated/50 border border-surface-border">
                  <span className="text-[10px] text-muted-foreground">Năm</span>
                  <div className="font-semibold text-foreground mt-0.5">{lunar.canChiYear}</div>
                </div>
              </div>

              {/* Auspicious Hours Mini Preview */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-accent" />
                    Giờ Hoàng Đạo trong ngày
                  </span>
                  <Link
                    href="/traditional-calendar"
                    className="text-[11px] text-primary hover:underline"
                  >
                    Chi tiết &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {auspiciousHours
                    .filter((h) => h.isAuspicious)
                    .map((h, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-[11px]",
                          h.isCurrent
                            ? "bg-accent/20 border-accent/40 text-accent font-bold"
                            : "bg-surface-elevated/40 border-surface-border text-foreground"
                        )}
                      >
                        <span>{h.chi}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {h.timeRange}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holiday Countdown Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-accent" />
                <CardTitle>Đếm ngược Ngày Lễ</CardTitle>
              </div>
              <Link href="/events">
                <Badge variant="outline" size="sm">
                  Tất cả ngày lễ
                </Badge>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-surface-border"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {h.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Ngày diễn ra: {h.targetDateStr}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-primary font-mono">
                      {h.daysRemaining}
                    </span>
                    <span className="text-[10px] text-muted-foreground block -mt-1">
                      ngày nữa
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weather Widget Snapshot */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-cyan-400" />
                <CardTitle>Thời tiết: {weather.city}</CardTitle>
              </div>
              <Badge variant="outline" size="sm">
                Mô phỏng Giai đoạn 5
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-extrabold text-foreground">
                    {weather.temperature}°C
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cảm giác như {weather.feelsLike}°C &bull; {weather.condition}
                  </div>
                </div>
                <div className="text-right text-xs space-y-1">
                  <div className="text-muted-foreground">
                    Độ ẩm: <span className="font-semibold text-foreground">{weather.humidity}%</span>
                  </div>
                  <div className="text-muted-foreground">
                    Gió: <span className="font-semibold text-foreground">{weather.windSpeedKmH} km/h</span>
                  </div>
                </div>
              </div>

              {/* Hourly slider */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-surface-border/60 text-center text-xs">
                {weather.hourly.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-surface-elevated/40 border border-surface-border"
                  >
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    <div className="my-0.5 text-base">{item.icon}</div>
                    <span className="font-semibold text-foreground text-[11px]">
                      {item.temp}°
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
