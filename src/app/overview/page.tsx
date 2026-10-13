"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  HardDrive,
  Folder,
  Cloud,
  ChevronRight,
  MoreVertical,
  Laptop,
  Smartphone,
  Server,
  Bookmark,
  Upload,
  Link2,
  CheckCircle2,
  ChevronLeft,
  X,
  FileText,
  Plus,
  Coins,
  Wallet,
  Users,
  Settings,
  User,
  Sparkles,
  Crown,
  Clock,
  ShieldCheck,
  AlertCircle,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints } from "@/modules/storage/driveEndpointsContext";
import { useFeedback } from "@/modules/feedback/feedbackContext";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { LiveChatWidget } from "@/modules/overview/LiveChatWidget";
import { BugReportWidget } from "@/modules/overview/BugReportWidget";
import { LeaderboardWidget } from "@/modules/overview/LeaderboardWidget";
import { ProfileEditModal } from "@/modules/overview/ProfileEditModal";
import { QuickTodoWidget } from "@/modules/overview/QuickTodoWidget";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function OverviewPage() {
  const { user, isAdmin, managedUsers } = useAuth();
  const { activeEndpoint, files } = useDriveEndpoints();
  const { reports } = useFeedback();

  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notesCount, setNotesCount] = useState<number>(3);
  const [projectsCount, setProjectsCount] = useState<number>(4);
  const [totalMonthExpense, setTotalMonthExpense] = useState<number>(2450000);

  // Load actual local notes, projects & expenses counts
  useEffect(() => {
    try {
      const rawNotes =
        localStorage.getItem("datavault_notes_v2") ||
        localStorage.getItem("datavault_notes");
      if (rawNotes) {
        const parsed = JSON.parse(rawNotes);
        if (Array.isArray(parsed)) setNotesCount(parsed.length);
      }
      const rawProjects = localStorage.getItem("datavault_projects");
      if (rawProjects) {
        const parsed = JSON.parse(rawProjects);
        if (Array.isArray(parsed)) setProjectsCount(parsed.length);
      }
      const rawExp = localStorage.getItem("txclonedriver_expenses");
      if (rawExp) {
        const parsed = JSON.parse(rawExp);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sum = parsed
            .filter((item: any) => item.type === "expense")
            .reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
          if (sum > 0) setTotalMonthExpense(sum);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute real drive usage
  const totalDriveBytes = files.reduce((acc, f) => {
    return acc + (f.sizeBytes && f.sizeBytes > 0 ? f.sizeBytes : 25 * 1024 * 1024);
  }, 0);
  const driveCapacity = 100 * 1024 * 1024 * 1024; // 100 GB
  const drivePercent = Math.min(
    100,
    Math.max(1, Math.round((totalDriveBytes / driveCapacity) * 100))
  );

  const pendingNameRequests = managedUsers.filter((u) => u.pendingNameChange).length;
  const openBugsCount = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;

  // Calendar dynamic computations
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const monthLabel = `Tháng ${calMonth + 1} ${calYear}`;

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calYear, calMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calYear, calMonth + 1, 1));
  };

  const handleResetToday = () => {
    setCalendarDate(new Date());
  };

  const firstDayRaw = new Date(calYear, calMonth, 1).getDay();
  const startDayOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // 0 for Mon, 6 for Sun

  const totalDaysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const prevOverflowDays: number[] = [];
  for (let i = startDayOffset - 1; i >= 0; i--) {
    prevOverflowDays.push(totalDaysInPrevMonth - i);
  }

  const currentMonthDays: number[] = [];
  for (let d = 1; d <= totalDaysInCurrentMonth; d++) {
    currentMonthDays.push(d);
  }

  const totalCells = startDayOffset + totalDaysInCurrentMonth > 35 ? 42 : 35;
  const remainingCells = totalCells - (startDayOffset + totalDaysInCurrentMonth);
  const nextOverflowDays: number[] = [];
  for (let d = 1; d <= remainingCells; d++) {
    nextOverflowDays.push(d);
  }

  const today = new Date();
  const isViewingCurrentMonth =
    today.getFullYear() === calYear && today.getMonth() === calMonth;
  const todayDate = today.getDate();

  return (
    <ModuleGuard moduleId="overview" moduleName="Tổng quan">
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
        {/* ============================================================== */}
        {/* 1. TOP ROW: GREETING & PROFILE + COMPACT CALENDAR              */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: Greeting & Search Bar */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full pt-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* User Avatar */}
                <div className="relative">
                  {user?.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {user?.name?.slice(0, 2).toUpperCase() || "TX"}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border border-black flex items-center justify-center text-[10px] text-black font-black" title="Quản trị viên Tối cao">
                      👑
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                    <span>Xin chào, {user?.name || "Trường"}!</span>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        Admin Tối Cao
                      </span>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                    {user?.bio || "Chào mừng bạn trở lại với TxCloneDriver Cloud Hub."}
                  </p>
                </div>
              </div>

              {/* Profile button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="relative px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-sm hover:scale-[1.02]"
              >
                <User className="w-4 h-4 text-primary" />
                <span>Chỉnh sửa Hồ sơ</span>
                {isAdmin && pendingNameRequests > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {pendingNameRequests}
                  </span>
                )}
              </button>
            </div>

            {/* Pending Name Notice for normal user */}
            {!isAdmin && user?.pendingNameChange && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Yêu cầu đổi tên thành <strong>&ldquo;{user.pendingNameChange}&rdquo;</strong> đã được gửi tới Admin và đang chờ phê duyệt.
                </span>
              </div>
            )}

            {/* Global Search Bar */}
            <div
              onClick={() => {
                window.dispatchEvent(new CustomEvent("tx-open-search"));
              }}
              className="relative mt-4 max-w-2xl cursor-pointer group"
              title="Nhấn để mở tìm kiếm Spotlight nhanh (Ctrl+K)"
            >
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              <input
                type="text"
                readOnly
                placeholder="Tìm kiếm tệp Google Drive, ghi chú, dự án, báo cáo lỗi..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-slate-400 shadow-sm border border-white/10 group-hover:border-primary/40 cursor-pointer pointer-events-none"
              />
              <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 pointer-events-none">
                <kbd className="hidden sm:inline-block rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                  Ctrl + K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Sleek Month Calendar Widget */}
          <div className="lg:col-span-4 rounded-3xl glass-card p-4 border border-white/10 shadow-glass">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  {monthLabel}
                </h3>
                {!isViewingCurrentMonth && (
                  <button
                    onClick={handleResetToday}
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30 transition-all font-semibold"
                    title="Trở về tháng hiện tại"
                  >
                    Hôm nay
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Tháng trước"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Tháng sau"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1 select-none">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span className="text-rose-400">CN</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
              {/* Prev Month Days */}
              {prevOverflowDays.map((d) => (
                <span key={`prev-${d}`} className="py-1 text-slate-600 select-none">
                  {d}
                </span>
              ))}

              {/* Current Month Days */}
              {currentMonthDays.map((d, idx) => {
                const dayOfWeek = (startDayOffset + idx) % 7;
                const isSunday = dayOfWeek === 6;
                const isToday = isViewingCurrentMonth && d === todayDate;

                return (
                  <span
                    key={`curr-${d}`}
                    className={cn(
                      "py-1 flex items-center justify-center rounded-xl transition-all cursor-default",
                      isToday
                        ? ""
                        : isSunday
                        ? "text-rose-400 hover:bg-white/10"
                        : "text-slate-300 hover:bg-white/10"
                    )}
                  >
                    {isToday ? (
                      <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-500/50">
                        {d}
                      </span>
                    ) : (
                      d
                    )}
                  </span>
                );
              })}

              {/* Next Month Days */}
              {nextOverflowDays.map((d, idx) => {
                const dayOfWeek = (startDayOffset + currentMonthDays.length + idx) % 7;
                const isSunday = dayOfWeek === 6;
                return (
                  <span
                    key={`next-${d}`}
                    className={cn(
                      "py-1 select-none",
                      isSunday ? "text-rose-500/40" : "text-slate-600"
                    )}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. REAL METRICS CARDS (DUNG LƯỢNG, GHI CHÚ, DỰ ÁN, CHI TIÊU, XU) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
          {/* Card 1: Dung lượng Google Drive Thực */}
          <Link
            href="/storage"
            className="rounded-3xl glass-card p-4 border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
                  <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44C.4 50 0 51.55 0 53.1h27.5z" fill="#00AC47"/>
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.3c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
                  <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D"/>
                  <path d="M59.8 53.1H87.3c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z" fill="#2684FC"/>
                  <path d="M73.55 76.8H27.5L13.75 53h46.05z" fill="#FFBA00"/>
                </svg>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block font-medium">Google Drive Thực tế</span>
              <span className="text-sm font-extrabold text-white mt-0.5 block">
                {formatBytes(totalDriveBytes)} ({files.length} tệp tin)
              </span>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${drivePercent}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px] mt-2 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {activeEndpoint?.name || "Đã đồng bộ Drive"}
                </span>
                <span className="text-slate-400 font-mono">{drivePercent}%</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Ghi chú & Liên kết Thực */}
          <Link
            href="/notes"
            className="rounded-3xl glass-card p-4 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <Bookmark className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block font-medium">Ghi chú & Bookmark</span>
              <span className="text-2xl font-black text-white mt-0.5 block">{notesCount}</span>
              <p className="text-[11px] text-purple-300 font-medium mt-1">
                Tất cả đã lưu vào LocalVault
              </p>
            </div>
          </Link>

          {/* Card 3: Dự án Đang triển khai Thực */}
          <Link
            href="/projects"
            className="rounded-3xl glass-card p-4 border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Folder className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block font-medium">Dự án Đang làm</span>
              <span className="text-2xl font-black text-white mt-0.5 block">{projectsCount}</span>
              <p className="text-[11px] text-emerald-300 font-medium mt-1">
                Theo dõi tiến độ Kanban & Task
              </p>
            </div>
          </Link>

          {/* Card 4: Sổ Chi Tiêu Tháng Này */}
          <Link
            href="/expenses"
            className="rounded-3xl glass-card p-4 border border-white/10 hover:border-rose-400/40 transition-all flex flex-col justify-between group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block font-medium">Chi Tiêu Tháng Này</span>
              <span className="text-xl font-black text-white mt-0.5 block truncate">
                {totalMonthExpense.toLocaleString("vi-VN")} ₫
              </span>
              <p className="text-[11px] text-rose-300 font-medium mt-1">
                Theo dõi ngân sách & thu chi
              </p>
            </div>
          </Link>

          {/* Card 5: Ví Điểm Cược & Hệ Thống Game */}
          <Link
            href="/games"
            className="rounded-3xl glass-card p-4 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Coins className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Game Hub
                </span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block font-medium">Ví Điểm Cược Cá Nhân</span>
              <span className="text-xl font-black text-amber-400 mt-0.5 block">
                {(user?.coins ?? 50000).toLocaleString("vi-VN")} Xu
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium mt-1">
                <span>Reset 50K/24h</span>
                <span className="text-emerald-400 font-bold">+100K cuối tháng</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ============================================================== */}
        {/* 3. THREE INTERACTIVE PANELS: CHAT, BÁO LỖI, BẢNG XẾP HẠNG TOP  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Panel 1: Live Chat Widget */}
          <LiveChatWidget />

          {/* Panel 2: Bug Report Widget */}
          <BugReportWidget />

          {/* Panel 3: Leaderboard Widget */}
          <LeaderboardWidget />
        </div>

        {/* ============================================================== */}
        {/* 4. MIDDLE ROW: DỰ ÁN, GHI CHÚ NHANH & VIỆC CẦN LÀM TODO        */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Column 1: Dự án đang làm */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-400" />
                Dự án đang làm
              </h3>
              <Link
                href="/projects"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Xem tất cả &rarr;
              </Link>
            </div>

            {/* Project 1: Website TxCloneDriver */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">Website TxCloneDriver Hub</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-semibold">
                    Đang làm
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Phát triển giao diện, phân quyền bảo mật và kho game
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
            </div>

            {/* Project 2: Hệ thống Game & AI Assistant */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">Kho Game & Trợ Thủ AI</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold">
                    Hoàn tất
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Tài xỉu, Xóc đĩa, Baccarat, Bầu cua, Cờ tướng, Cờ caro AI
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Project 3: Backup hệ thống */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Server className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">Đồng bộ Google Drive & Telegram</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-semibold">
                    Sắp hoàn thành
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Tự động sao lưu và stream đa kênh
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Ghi chú & Link nhanh */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-purple-400" />
                Ghi chú & Link nhanh
              </h3>
              <Link
                href="/notes?action=new"
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Thêm mới
              </Link>
            </div>

            {/* Link 1: Notion */}
            <a
              href="https://www.notion.so"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white font-serif font-black text-lg shrink-0">
                  N
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                    Notion &bull; Kế hoạch công việc
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    www.notion.so
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </a>

            {/* Link 2: Google Drive */}
            <Link
              href="/storage"
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 87.3 78" fill="none">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
                    <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44C.4 50 0 51.55 0 53.1h27.5z" fill="#00AC47"/>
                    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.3c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
                    <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D"/>
                    <path d="M59.8 53.1H87.3c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z" fill="#2684FC"/>
                    <path d="M73.55 76.8H27.5L13.75 53h46.05z" fill="#FFBA00"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                    Google Drive &bull; Kho tệp cá nhân
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    txlab.io.vn/storage
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>

            {/* Link 3: GitHub */}
            <a
              href="https://github.com/truongxoan/TxCloneDriver"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                    GitHub &bull; truongxoan/TxCloneDriver
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    github.com/truongxoan
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Column 3: Việc Cần Làm Nhanh (Quick Tasks) */}
          <QuickTodoWidget />
        </div>

        {/* ============================================================== */}
        {/* 5. BOTTOM ROW: HOẠT ĐỘNG GẦN ĐÂY                              */}
        {/* ============================================================== */}
        <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              Hoạt động gần đây
            </h3>
            <Link
              href="/activity"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          {/* Item 1 */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Upload className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  Đã đồng bộ Google Drive thành công
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  {files.length} tệp tin sẵn sàng phát trực tuyến
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Vừa xong
            </span>
          </div>

          {/* Item 2 */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  Kích hoạt hệ thống Game Hub & Admin Secret Tool
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  Tài xỉu, Xóc đĩa, Baccarat, Bầu cua, Cờ Caro AI Golden Hint
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hôm nay
            </span>
          </div>

          {/* Item 3 */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  Cập nhật phân quyền hồ sơ & Kênh Chat Trực Tiếp
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  Admin phê duyệt đổi tên, tùy chỉnh Avatar và Bio
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hôm nay
            </span>
          </div>
        </div>

        {/* Profile Edit Modal */}
        <ProfileEditModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      </div>
    </ModuleGuard>
  );
}
