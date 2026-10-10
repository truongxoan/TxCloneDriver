"use client";

import React, { useState } from "react";
import {
  Hourglass,
  Calendar,
  Plus,
  Sparkles,
  PartyPopper,
  Clock,
  CheckCircle2,
  Bell,
  Heart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getUpcomingHolidayCountdowns } from "@/modules/holiday-countdown/holidaysData";
import { CountdownItem } from "@/modules/holiday-countdown/types";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

export default function EventsPage() {
  const [events, setEvents] = useState<CountdownItem[]>(getUpcomingHolidayCountdowns());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventDate) return;

    const target = new Date(newEventDate);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const custom: CountdownItem = {
      id: `custom-${Date.now()}`,
      name: newEventName,
      type: "custom",
      isLunar: false,
      solarMonth: target.getMonth() + 1,
      solarDay: target.getDate(),
      description: "Sự kiện cá nhân của bạn",
      badge: "⭐ Sự kiện cá nhân",
      targetDateStr: `${String(target.getDate()).padStart(2, "0")}/${String(
        target.getMonth() + 1
      ).padStart(2, "0")}/${target.getFullYear()}`,
      daysRemaining,
      hoursRemaining: daysRemaining * 24,
      isToday: daysRemaining === 0,
    };

    setEvents([custom, ...events].sort((a, b) => a.daysRemaining - b.daysRemaining));
    setShowAddModal(false);
    setNewEventName("");
    setNewEventDate("");
    setToastMsg(`Đã thêm sự kiện "${newEventName}" thành công!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <ModuleGuard moduleId="events" moduleName="Lịch & Sự kiện">
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
            <Hourglass className="h-6 w-6 text-accent" />
            Đếm ngược Ngày Lễ & Sự kiện
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi thời gian chính xác tới các ngày lễ quốc gia, lễ truyền thống và kỷ niệm cá nhân
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Thêm sự kiện mới</span>
        </Button>
      </div>

      {/* Holiday Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col justify-between hover:border-primary/50 transition-all p-5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant={
                    item.type === "official"
                      ? "primary"
                      : item.type === "traditional"
                      ? "accent"
                      : "success"
                  }
                  size="sm"
                >
                  {item.badge}
                </Badge>
                {item.isLunar && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Lịch Âm
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-foreground">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-surface-border/60 flex items-end justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground">Ngày diễn ra</span>
                <div className="text-xs font-semibold text-foreground">
                  {item.targetDateStr}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-primary font-mono leading-none">
                  {item.daysRemaining}
                </div>
                <span className="text-[10px] text-muted-foreground">ngày nữa</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 shadow-glass border border-surface-border">
            <h3 className="text-base font-bold text-foreground mb-1">
              Thêm sự kiện cá nhân mới
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Nhập tên sự kiện và ngày đích để theo dõi đếm ngược
            </p>

            <form onSubmit={handleAddCustomEvent} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Tên sự kiện
                </label>
                <input
                  type="text"
                  required
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="VD: Sinh nhật, Kỷ niệm ngày cưới..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Ngày diễn ra
                </label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Lưu sự kiện
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ModuleGuard>
  );
}
