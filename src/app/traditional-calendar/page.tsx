"use client";

import React, { useState } from "react";
import {
  Compass,
  Clock,
  Sparkles,
  Star,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";

export default function TraditionalCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const d = selectedDate;
  const lunar = convertSolar2Lunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
  const hours = getAuspiciousHours(d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours());

  return (
    <div className="space-y-6">
      {/* Disclaimer Card as required by Section 10 */}
      <div className="rounded-2xl glass-panel p-4 border border-surface-border bg-surface-elevated/40 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-accent">
            Lưu ý về Dữ liệu Lịch Cổ Truyền & Giờ Hoàng Đạo
          </div>
          <p className="text-muted-foreground">
            Thông tin giờ hoàng đạo, can chi và tiết khí dựa trên thuật toán thiên văn và tài liệu cổ học Việt Nam (Ngọc Hạp Thông Thư, Lục Nhâm).
            Đây là hệ giá trị văn hóa truyền thống dân gian, không mang tính khẳng định tuyệt đối hay bảo đảm kết quả trong công việc thực tế.
          </p>
        </div>
      </div>

      {/* Header and Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-accent" />
            Lịch Cổ Truyền & Giờ Hoàng Đạo
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tra cứu thập nhị thời thần (12 khung giờ) và trực nhật theo ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Hôm nay
          </Button>
          <div className="flex items-center rounded-xl glass-panel p-1 border border-surface-border">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-foreground min-w-[130px] text-center">
              {d.getDate()}/{d.getMonth() + 1}/{d.getFullYear()}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Âm lịch Việt Nam</span>
          <div className="text-2xl font-bold text-accent mt-1">
            Ngày {lunar.day} tháng {lunar.month}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Năm: <strong className="text-foreground">{lunar.canChiYear}</strong>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Can Chi trong ngày</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {lunar.canChiDay}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Tháng: <strong className="text-foreground">{lunar.canChiMonth}</strong>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground">Tiết Khí Mặt Trời</span>
          <div className="text-2xl font-bold text-primary mt-1">
            {lunar.solarTerm}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Tọa độ mặt trời: Khung 15° kinh độ hoàng đạo
          </div>
        </Card>
      </div>

      {/* Auspicious Hours (12 Khung Giờ) Table & Grid */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              12 Khung Giờ trong ngày ({hours.filter((h) => h.isAuspicious).length} Hoàng Đạo / 6 Hắc Đạo)
            </CardTitle>
            <CardDescription>
              Khung giờ hiện tại được đánh dấu viền sáng phản hồi theo thời gian thực
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {hours.map((h, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all relative",
                  h.isCurrent
                    ? "ring-2 ring-accent border-accent bg-accent/15 shadow-glow-accent"
                    : h.isAuspicious
                    ? "bg-surface-elevated/60 border-surface-border hover:border-accent/40"
                    : "bg-surface-elevated/20 border-surface-border/40 text-muted-foreground opacity-75"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    {h.chi}
                    {h.isCurrent && (
                      <span className="text-[10px] bg-accent/30 text-accent font-semibold px-1.5 py-0.2 rounded">
                        Hiện tại
                      </span>
                    )}
                  </span>
                  <Badge
                    variant={h.isAuspicious ? "accent" : "outline"}
                    size="sm"
                    className="text-[10px]"
                  >
                    {h.starName}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {h.timeRange}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
