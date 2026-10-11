"use client";

import React, { useState } from "react";
import {
  Zap,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  CloudSun,
  Utensils,
  BookOpen,
  HardDrive,
  Trash2,
  Terminal,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface AutomationTask {
  id: string;
  name: string;
  time: string;
  icon: any;
  iconColor: string;
  description: string;
  enabled: boolean;
  lastRun?: string;
  status: "idle" | "running" | "success" | "error";
  targetChannel: string;
}

const DEFAULT_TASKS: AutomationTask[] = [
  {
    id: "task-morning",
    name: "07:00 Báo Cáo Tin Sáng Telegram",
    time: "07:00",
    icon: CloudSun,
    iconColor: "text-amber-400",
    description: "Tự động gửi thông tin dự báo thời tiết, lịch trình hôm nay & lời chào năng lượng về Telegram bot cá nhân.",
    enabled: true,
    lastRun: "Hôm nay 07:00:00",
    status: "idle",
    targetChannel: "Telegram Bot (@TxDriverBot)",
  },
  {
    id: "task-noon",
    name: "12:00 Điểm Danh & Nhắc Nhở Ăn Trưa",
    time: "12:00",
    icon: Utensils,
    iconColor: "text-emerald-400",
    description: "Tự động cộng thưởng +50,000 Xu đăng nhập mỗi ngày, đề xuất thực đơn ăn uống và gửi thông báo nghỉ trưa.",
    enabled: true,
    lastRun: "Hôm nay 12:00:00",
    status: "idle",
    targetChannel: "Hệ thống Web & Push Notification",
  },
  {
    id: "task-night",
    name: "22:00 Ôn Luyện HSK & Chốt Sổ Chi Tiêu",
    time: "22:00",
    icon: BookOpen,
    iconColor: "text-sky-400",
    description: "Gửi 3 từ vựng HSK trọng điểm trong ngày, nhắc nhở ghi chép chi tiêu sinh hoạt và duy trì chuỗi Streak học tập.",
    enabled: true,
    lastRun: "Hôm qua 22:00:00",
    status: "idle",
    targetChannel: "Telegram Bot & Web Notification",
  },
  {
    id: "task-backup",
    name: "00:00 Tự Động Sao Lưu Cloud & Dọn Cache",
    time: "00:00",
    icon: HardDrive,
    iconColor: "text-purple-400",
    description: "Đồng bộ snapshot dữ liệu lên Google Drive cá nhân, tối ưu hóa bộ nhớ tạm và ghi nhận nhật ký kiểm toán hệ thống.",
    enabled: true,
    lastRun: "Hôm qua 00:00:02",
    status: "idle",
    targetChannel: "Google Drive Endpoint (Backup)",
  },
];

interface ExecutionLog {
  id: string;
  timestamp: string;
  taskName: string;
  output: string;
  status: "success" | "warning";
}

export function SmartAutomationWidget() {
  const [tasks, setTasks] = useState<AutomationTask[]>(DEFAULT_TASKS);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      id: "log-1",
      timestamp: "11/10/2026 07:00:00",
      taskName: "07:00 Báo Cáo Tin Sáng Telegram",
      output: "Gửi thành công: Nhiệt độ Hà Nội 26°C, trời quang đãng. 2 sự kiện lịch cá nhân.",
      status: "success",
    },
    {
      id: "log-2",
      timestamp: "10/10/2026 00:00:02",
      taskName: "00:00 Tự Động Sao Lưu Cloud & Dọn Cache",
      output: "Đã tạo bản sao lưu snapshot txclonedriver_backup_10102026.json (48.2 KB). Cache đã dọn dẹp.",
      status: "success",
    },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleRunNow = async (task: AutomationTask) => {
    setRunningTaskId(task.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "running" } : t))
    );

    // Simulate real execution
    await new Promise((r) => setTimeout(r, 1400));

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    let outputResult = "";
    if (task.id === "task-morning") {
      outputResult = `[Telegram Dispatch] Gửi tin sáng thành công: "☀️ Chào buổi sáng! Nhiệt độ hôm nay 28°C. Nhắc lịch: Ôn tập HSK và kiểm tra Google Drive."`;
    } else if (task.id === "task-noon") {
      outputResult = `[Rewards Engine] Đã cấp thưởng +50,000 Xu đăng nhập hôm nay. Đề xuất: Cơm gà sốt nấm / Salad ức gà.`;
    } else if (task.id === "task-night") {
      outputResult = `[Study Bot] 3 Từ vựng đề xuất: 学习 (học tập), 坚持 (kiên trì), 成功 (thành công). Nhắc tổng kết chi tiêu ngày.`;
    } else if (task.id === "task-backup") {
      outputResult = `[Drive Sync] Snapshot đồng bộ hoàn tất (52 KB). Đã giải phóng bộ nhớ đệm tạm thời thành công.`;
    }

    const newLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      taskName: task.name,
      output: outputResult,
      status: "success",
    };

    setLogs((prev) => [newLog, ...prev]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: "success", lastRun: `Vừa chạy (${timeStr})` } : t
      )
    );
    setRunningTaskId(null);

    // Reset status back to idle after 3s
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "idle" } : t))
      );
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 glass-panel border border-white/10 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Zap className="h-4 w-4 animate-pulse text-amber-400" />
              <span>Smart Cloud Automation Hub 24/7</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Lập Trình Tự Động Hóa Đa Nhiệm
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Tự động vận hành nền tảng theo lịch trình: Báo cáo tin sáng Telegram, thưởng điểm danh trưa, nhắc học HSK tối và sao lưu Drive định kỳ nửa đêm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs py-1.5 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-2" />
              Cron Engine Active (4 Tasks)
            </Badge>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const Icon = task.icon;
          const isRunning = runningTaskId === task.id;

          return (
            <Card
              key={task.id}
              className={cn(
                "p-5 glass-card border transition-all flex flex-col justify-between gap-4",
                task.enabled
                  ? "border-white/10 bg-slate-900/40 hover:border-white/20"
                  : "border-white/5 bg-slate-950/40 opacity-70"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-2xl bg-white/5 border border-white/10", task.iconColor)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-slate-400 border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> {task.time} Hàng ngày
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {task.targetChannel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0",
                      task.enabled
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-slate-500 border border-white/10 hover:text-white"
                    )}
                  >
                    {task.enabled ? "Đang Bật" : "Đã Tắt"}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Lần chạy cuối: <strong className="text-slate-300">{task.lastRun || "Chưa có"}</strong>
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  disabled={isRunning}
                  onClick={() => handleRunNow(task)}
                  className="gap-1.5 text-xs h-8 px-3"
                >
                  <Play className={cn("w-3.5 h-3.5", isRunning && "animate-spin")} />
                  <span>{isRunning ? "Đang chạy..." : "🚀 Chạy Thử Ngay"}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Execution Logs Section */}
      <Card className="p-6 bg-slate-900/60 border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-sm">
              Nhật Ký Thực Thi Tự Động Hóa (Automation Run Logs)
            </h3>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa logs
          </button>
        </div>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Chưa có lịch sử thực thi nào trong phiên làm việc.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-sky-300 font-bold">{log.taskName}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-slate-200">{log.output}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
