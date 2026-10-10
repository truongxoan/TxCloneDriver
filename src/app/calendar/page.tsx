"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Compass,
  Star,
  Plus,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Build grid days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week index (Monday = 0, Sunday = 6)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const totalDays = lastDayOfMonth.getDate();

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const calendarCells = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    const lunar = convertSolar2Lunar(dayNum, month === 0 ? 12 : month, month === 0 ? year - 1 : year);
    calendarCells.push({
      date,
      solarDay: dayNum,
      lunar,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const lunar = convertSolar2Lunar(i, month + 1, year);
    calendarCells.push({
      date,
      solarDay: i,
      lunar,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (42 cells: 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    const lunar = convertSolar2Lunar(i, month + 2 > 12 ? 1 : month + 2, month + 1 >= 12 ? year + 1 : year);
    calendarCells.push({
      date,
      solarDay: i,
      lunar,
      isCurrentMonth: false,
    });
  }

  const selectedLunar = convertSolar2Lunar(
    selectedDate.getDate(),
    selectedDate.getMonth() + 1,
    selectedDate.getFullYear()
  );

  const selectedAuspicious = getAuspiciousHours(
    selectedDate.getDate(),
    selectedDate.getMonth() + 1,
    selectedDate.getFullYear()
  );

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isSelected = (d: Date) => {
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Lịch Âm Dương Việt Nam
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tính toán thiên văn chu kỳ mặt trăng và 24 tiết khí chuẩn xác GMT+7
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Hôm nay
          </Button>
          <div className="flex items-center rounded-xl glass-panel p-1 border border-surface-border">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-foreground min-w-[120px] text-center">
              Tháng {month + 1} / {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid + Day Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-4">
            {/* Weekdays Bar */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs mb-2">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    "py-2 rounded-lg bg-surface-elevated/40 text-muted-foreground",
                    idx === 6 ? "text-rose-400" : ""
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                const today = isToday(cell.date);
                const selected = isSelected(cell.date);
                const isSpecialLunar = cell.lunar.day === 1 || cell.lunar.day === 15;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      "min-h-[74px] p-2 rounded-xl flex flex-col justify-between text-left transition-all relative border",
                      cell.isCurrentMonth
                        ? "bg-surface-elevated/50 border-surface-border/60 hover:border-primary/50"
                        : "bg-surface-elevated/15 border-transparent text-muted-foreground/40 opacity-40",
                      selected && "ring-2 ring-primary border-primary bg-primary/10 shadow-glow-sm",
                      today && "border-accent shadow-glow-accent"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          today
                            ? "text-accent"
                            : cell.isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {cell.solarDay}
                      </span>
                      {today && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full text-[10px]">
                      <span
                        className={cn(
                          "font-mono font-medium",
                          isSpecialLunar
                            ? "text-primary font-bold"
                            : "text-muted-foreground"
                        )}
                      >
                        {cell.lunar.day === 1
                          ? `${cell.lunar.day}/${cell.lunar.month}`
                          : cell.lunar.day}
                      </span>
                      {isSpecialLunar && (
                        <span className="text-[9px] text-accent font-semibold">
                          {cell.lunar.day === 1 ? "Mùng 1" : "Rằm"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Details Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">
                  Thông tin ngày
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Tiết khí: <strong className="text-foreground">{selectedLunar.solarTerm}</strong>
                </span>
              </div>
              <CardTitle className="text-lg mt-2">
                {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-surface-elevated/70 border border-surface-border">
                <span className="text-[11px] text-muted-foreground block mb-1">
                  Âm lịch Việt Nam
                </span>
                <div className="text-xl font-bold text-accent">
                  Ngày {selectedLunar.day} tháng {selectedLunar.month}
                  {selectedLunar.isLeap ? " (Nhuận)" : ""}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Năm {selectedLunar.canChiYear}
                </div>
              </div>

              {/* Can Chi Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-muted-foreground">Can Chi Ngày:</span>
                  <span className="font-semibold text-foreground">{selectedLunar.canChiDay}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-muted-foreground">Can Chi Tháng:</span>
                  <span className="font-semibold text-foreground">{selectedLunar.canChiMonth}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border/60">
                  <span className="text-muted-foreground">Can Chi Năm:</span>
                  <span className="font-semibold text-foreground">{selectedLunar.canChiYear}</span>
                </div>
              </div>

              {/* Auspicious Hours for Day */}
              <div>
                <span className="text-xs font-semibold text-foreground block mb-2">
                  Giờ Hoàng Đạo ngày này:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedAuspicious
                    .filter((h) => h.isAuspicious)
                    .map((h, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-lg bg-surface-elevated/50 border border-surface-border text-[11px] flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{h.chi}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {h.timeRange}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                <span>Thêm sự kiện cá nhân (Demo)</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
