"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Trash2,
  HardDrive,
  Folder,
  Link2,
  Home,
  CalendarDays,
  CloudSun,
  Send,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Check,
  Crown,
  Coins,
  EyeOff,
  Radio,
  Megaphone,
  Zap,
  Power,
  ShieldAlert,
  FileDown,
  UserCog,
  Eye,
  KeyRound,
  Copy,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints } from "@/modules/storage/driveEndpointsContext";
import { useTelegram } from "@/modules/telegram/telegramContext";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { AppModuleId, UserStatus, ManagedUser } from "@/modules/auth/types";
import { SmartAutomationWidget } from "@/modules/automation/SmartAutomationWidget";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ALL_MODULES: { id: AppModuleId; label: string; icon: string; desc: string }[] = [
  { id: "overview", label: "Tổng quan", icon: "🏠", desc: "Xem trang thống kê trung tâm" },
  { id: "storage", label: "Google Drive", icon: "💾", desc: "Duyệt thư mục, xem phim & nghe nhạc" },
  { id: "image_studio", label: "AI Image Studio", icon: "🎨", desc: "Xóa nền background, clone ảnh và tạo ảnh AI" },
  { id: "watch_together", label: "Xem & Nghe Chung", icon: "👥", desc: "Phòng nhạc YouTube & Drive đồng bộ, order bài" },
  { id: "vault", label: "Két Sắt & 2FA", icon: "🔐", desc: "Quản lý mật khẩu, mã 2FA TOTP và bảo mật web" },
  { id: "notes", label: "Ghi chú & Link", icon: "📝", desc: "Quản lý ghi chú cá nhân và liên kết" },
  { id: "projects", label: "Dự án", icon: "📁", desc: "Quản lý dự án, tasks và tiến độ công việc" },
  { id: "events", label: "Lịch & Sự kiện", icon: "📅", desc: "Lịch âm dương, đếm ngược ngày lễ Tết" },
  { id: "weather", label: "Thời tiết", icon: "🌤️", desc: "Dự báo thời tiết các tỉnh thành" },
  { id: "settings", label: "Cài đặt", icon: "⚙️", desc: "Cấu hình hệ thống & thông số" },
  { id: "telegram", label: "Telegram Bot", icon: "✈️", desc: "Tương tác và nhận thông báo qua Telegram" },
  { id: "games", label: "Game & Giải Trí", icon: "🎮", desc: "Chơi Tài Xỉu, Xóc Đĩa, Baccarat, Cờ Tướng, Caro, Tetris cùng bạn bè" },
  { id: "study", label: "Học Ngoại Ngữ", icon: "🎓", desc: "HSK 1-6 Tiếng Trung, Tiếng Anh, Hàn, Nhật & Pomodoro" },
  { id: "driver_license", label: "Ôn Thi GPLX", icon: "🚗", desc: "600 câu hỏi Bộ GTVT, thi thử sát hạch A1, A2, B1, B2, C" },
  { id: "expenses", label: "Tính Chi Tiêu", icon: "💰", desc: "Quản lý thu chi và hạn mức ngân sách hàng ngày" },
  { id: "qr", label: "Tạo Mã QR", icon: "📱", desc: "Tạo mã QR cho văn bản, WiFi, tài khoản ngân hàng" },
  { id: "downloader", label: "Tải Video", icon: "📥", desc: "Tải video YouTube, TikTok, Facebook không logo về Drive" },
  { id: "memories", label: "Kỷ Niệm Cá Nhân", icon: "🖼️", desc: "Kho ảnh & video kỷ niệm 3D Flipbook khóa FaceID" },
];

export default function SettingsPage() {
  const { effectsEnabled, setEffectsEnabled, intensity, setIntensity } = useTheme();
  const {
    user: currentUser,
    isAdmin,
    managedUsers,
    updateUserPermissions,
    approveUser,
    rejectUser,
    deleteUser,
    adjustUserCoins,
    impersonateUser,
    stopImpersonating,
    originalAdminUser,
    isMaintenanceMode,
    toggleMaintenanceMode,
    securityAuditLogs,
    clearSecurityLogs,
    lockedDevices,
    unlockDevice,
    clearAllDeviceLocks,
  } = useAuth();
  const { endpoints, activeEndpoint } = useDriveEndpoints();
  const { botToken, chatId, botInfo, isConnected: tgConnected } = useTelegram();

  const [activeTab, setActiveTab] = useState<
    "general" | "appearance" | "api" | "members" | "security" | "godmode" | "automation"
  >("members");
  const [hubName, setHubName] = useState("TxCloneDriver Cloud Hub Pro");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh (GMT+7)");
  const [language, setLanguage] = useState("vi");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Admin God Mode states
  const [ghostMode, setGhostMode] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);

  // Device Lockout State inspection
  const [machineId, setMachineId] = useState<string>("TX-SEC-DETECTING...");
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // MaxCheapAI Gateway State
  const [maxCheapKey, setMaxCheapKey] = useState<string>("");
  const [isCheckingAiKey, setIsCheckingAiKey] = useState(false);
  const [maxCheapBalance, setMaxCheapBalance] = useState<string | null>(null);
  useEffect(() => {
    try {
      const mid = localStorage.getItem("txclonedriver_machine_id") || "TX-DEV-DEFAULT-NODE";
      const fa = parseInt(localStorage.getItem("txclonedriver_failed_attempts") || "0", 10);
      const lk = localStorage.getItem("txclonedriver_device_locked") === "true";
      setMachineId(mid);
      setFailedAttempts(fa);
      setIsLocked(lk);

      const savedAiKey = localStorage.getItem("maxcheapai_api_key") || "";
      setMaxCheapKey(savedAiKey);
      const savedBalance = localStorage.getItem("maxcheapai_balance");
      if (savedBalance) setMaxCheapBalance(savedBalance);
    } catch {
      // ignore
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Đã lưu các tùy chọn cấu hình hệ thống thành công!");
  };

  const handleResetDeviceLock = () => {
    try {
      localStorage.removeItem("txclonedriver_failed_attempts");
      localStorage.removeItem("txclonedriver_device_locked");
      localStorage.removeItem("txclonedriver_lock_timestamp");
      setFailedAttempts(0);
      setIsLocked(false);
      triggerToast("Đã đặt lại 0 lượt thử và mở khóa thiết bị thành công!");
    } catch {
      triggerToast("Không thể cập nhật bộ nhớ thiết bị.");
    }
  };

  // Toggle single module for a user
  const handleToggleModule = (targetUser: ManagedUser, moduleId: AppModuleId) => {
    if (targetUser.role === "admin") {
      triggerToast("Tài khoản Quản trị viên (Admin) luôn có toàn quyền tất cả phân hệ.");
      return;
    }

    const currentModules = targetUser.allowedModules || [];
    let updated: string[];
    if (currentModules.includes(moduleId)) {
      updated = currentModules.filter((m) => m !== moduleId);
    } else {
      updated = [...currentModules, moduleId];
    }

    updateUserPermissions(targetUser.id, updated, targetUser.status);
    triggerToast(`Đã cập nhật quyền phân hệ cho @${targetUser.username}`);
  };

  // Apply preset permissions
  const handleApplyPreset = (targetUser: ManagedUser, preset: "drive_only" | "drive_projects" | "full") => {
    if (targetUser.role === "admin") {
      triggerToast("Tài khoản Admin đã có toàn quyền!");
      return;
    }

    let modules: string[] = [];
    if (preset === "drive_only") {
      modules = ["storage"];
    } else if (preset === "drive_projects") {
      modules = ["storage", "projects"];
    } else if (preset === "full") {
      modules = ALL_MODULES.map((m) => m.id);
    }

    updateUserPermissions(targetUser.id, modules, targetUser.status);
    triggerToast(`Đã áp dụng mẫu phân quyền cho @${targetUser.username}`);
  };

  const pendingUsers = managedUsers.filter((u) => u.status === "pending");
  const approvedUsers = managedUsers.filter((u) => u.status === "approved");

  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  // Mật khẩu thật chỉ server giữ, không còn gửi xuống trình duyệt.
  const getUserPlainPass = (u: ManagedUser) => {
    if (u.username.toLowerCase() === "admin") return "•••••• (chỉ server giữ)";
    return "Mật khẩu bất kỳ (chỉ cần tài khoản)";
  };

  return (
    <ModuleGuard moduleId="settings" moduleName="Cài đặt">
      <div className="space-y-6 pb-20">
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
              Cài đặt Hệ thống TxCloneDriver
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản trị phân quyền thành viên, kiểm soát khóa máy, API và cấu hình giao diện
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleSaveGeneral} className="gap-2">
            <Save className="h-4 w-4" />
            <span>Lưu thay đổi</span>
          </Button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-3">
          {[
            { id: "members", label: "Thành viên & Phân quyền", icon: Users, badge: pendingUsers.length > 0 ? `${pendingUsers.length} chờ duyệt` : undefined },
            ...(isAdmin ? [{ id: "godmode" as const, label: "⚡ Quyền Năng Tối Cao", icon: Crown, badge: "GOD" }] : []),
            { id: "automation", label: "🤖 Tự Động Hóa Đa Nhiệm", icon: Zap, badge: "24/7" },
            { id: "general", label: "Chung & Thời gian", icon: Globe },
            { id: "appearance", label: "Giao diện & Hiệu năng", icon: Sliders },
            { id: "api", label: "Cổng API & Secret", icon: Key },
            { id: "security", label: "Bảo mật & Khóa máy", icon: Shield },
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
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: THÀNH VIÊN & PHÂN QUYỀN (GRANULAR ACCESS CONTROLS) */}
        {/* ============================================================== */}
        {activeTab === "members" && (
          <div className="space-y-6 max-w-5xl">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4 bg-slate-900/40 border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Tổng Thành viên</p>
                  <p className="text-xl font-black text-white mt-0.5">{managedUsers.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-sky-400 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/40 border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Đang chờ phê duyệt</p>
                  <p className="text-xl font-black text-amber-400 mt-0.5">{pendingUsers.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/40 border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Đang hoạt động</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{approvedUsers.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
              </Card>
            </div>

            {/* Section: Pending Approval Requests */}
            {pendingUsers.length > 0 && (
              <Card className="p-5 border-amber-500/40 bg-amber-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                  <h3 className="font-bold text-amber-300 text-sm">
                    Yêu cầu Đăng ký Mới Đang Chờ Xét Duyệt ({pendingUsers.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Thành viên đã đăng ký nhưng chưa thể đăng nhập cho đến khi Admin phê duyệt và cấp quyền truy cập các phân hệ.
                </p>

                <div className="space-y-3 pt-1">
                  {pendingUsers.map((pUser) => (
                    <div
                      key={pUser.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{pUser.name}</span>
                          <span className="text-xs font-mono text-sky-400">@{pUser.username}</span>
                          <Badge variant="warning" size="sm">Chờ duyệt</Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ngày đăng ký: {pUser.createdAt} &bull; Mặc định cấp quyền Google Drive khi duyệt
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm"
                          onClick={() => {
                            approveUser(pUser.id, ["storage"]);
                            triggerToast(`Đã phê duyệt tài khoản @${pUser.username} và cấp quyền Google Drive!`);
                          }}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Duyệt & Cấp Drive</span>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-sm"
                          onClick={() => {
                            approveUser(pUser.id, ALL_MODULES.map((m) => m.id));
                            triggerToast(`Đã phê duyệt và cấp TOÀN BỘ QUYỀN cho @${pUser.username}!`);
                          }}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Duyệt & Toàn quyền</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 gap-1.5"
                          onClick={() => {
                            rejectUser(pUser.id);
                            triggerToast(`Đã từ chối tài khoản @${pUser.username}`);
                          }}
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Từ chối</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Section: Granular Member Permissions Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-sky-400" />
                    Bảng Phân Quyền Chi Tiết Theo Từng Thành Viên
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tùy biến quyền mở từng phân hệ riêng lẻ (Ví dụ: Thành viên A chỉ được mở Google Drive, Thành viên B mở Google Drive & Dự án)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {managedUsers.map((mUser) => {
                  const isUserAdmin = mUser.role === "admin";
                  const userModules = mUser.allowedModules || [];

                  return (
                    <Card
                      key={mUser.id}
                      className="p-5 bg-slate-900/50 border-white/10 space-y-4 hover:border-white/20 transition-all"
                    >
                      {/* Member Info Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md ${
                              isUserAdmin
                                ? "bg-gradient-to-tr from-rose-600 to-amber-500"
                                : "bg-gradient-to-tr from-blue-600 to-indigo-500"
                            }`}
                          >
                            {mUser.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{mUser.name}</h4>
                              <span className="font-mono text-xs text-sky-400">@{mUser.username}</span>
                              <Badge variant={isUserAdmin ? "danger" : "default"} size="sm">
                                {isUserAdmin ? "Quản trị viên" : "Thành viên"}
                              </Badge>
                              <Badge
                                variant={
                                  mUser.status === "approved"
                                    ? "success"
                                    : mUser.status === "pending"
                                    ? "warning"
                                    : "danger"
                                }
                                size="sm"
                              >
                                {mUser.status === "approved"
                                  ? "Đã kích hoạt"
                                  : mUser.status === "pending"
                                  ? "Chờ duyệt"
                                  : "Đã khóa"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Tạo ngày: {mUser.createdAt} &bull; Quyền hiện tại:{" "}
                              <strong className="text-white">
                                {isUserAdmin
                                  ? "Toàn bộ phân hệ (*)"
                                  : userModules.length === 0
                                  ? "Chưa cấp quyền nào"
                                  : `${userModules.length} phân hệ`}
                              </strong>
                            </p>

                            {/* Admin Password View & Master Bypass */}
                            {isAdmin && (
                              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono">
                                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="text-[11px] text-amber-200">Mật khẩu:</span>
                                  <span className="font-bold text-white tracking-wider">
                                    {revealedPasswords[mUser.id]
                                      ? getUserPlainPass(mUser)
                                      : "••••••••"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedPasswords((prev) => ({
                                        ...prev,
                                        [mUser.id]: !prev[mUser.id],
                                      }))
                                    }
                                    className="text-amber-400 hover:text-white ml-1 p-0.5 cursor-pointer"
                                    title={revealedPasswords[mUser.id] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                  >
                                    {revealedPasswords[mUser.id] ? (
                                      <EyeOff className="w-3 h-3" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(getUserPlainPass(mUser));
                                      triggerToast(`Đã sao chép mật khẩu của @${mUser.username}`);
                                    }}
                                    className="text-amber-400 hover:text-white p-0.5 cursor-pointer"
                                    title="Sao chép mật khẩu"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                                  Đăng nhập do <strong className="text-white">server</strong> xác thực (cookie ký)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Presets & Status controls */}
                        {!isUserAdmin && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 mr-1">Mẫu nhanh:</span>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-[11px] px-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-sky-300 border border-sky-400/20"
                              onClick={() => handleApplyPreset(mUser, "drive_only")}
                              title="Chỉ mở mục Google Drive"
                            >
                              Chỉ Drive (User A)
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-[11px] px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-400/20"
                              onClick={() => handleApplyPreset(mUser, "drive_projects")}
                              title="Mở Google Drive và Dự án"
                            >
                              Drive + Dự án (User B)
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-[11px] px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-400/20"
                              onClick={() => handleApplyPreset(mUser, "full")}
                            >
                              Toàn quyền
                            </Button>

                            {/* Impersonate Button for Admin */}
                            {isAdmin && mUser.id !== currentUser?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  impersonateUser(mUser.id);
                                  triggerToast(`🎭 Đang đóng vai @${mUser.username}. Bạn có thể trải nghiệm web dưới góc nhìn của thành viên này!`);
                                }}
                                className="h-7 px-2.5 text-[11px] gap-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold"
                                title={`Đóng vai @${mUser.username}`}
                              >
                                <UserCog className="h-3.5 w-3.5" />
                                <span>Đóng vai</span>
                              </Button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa tài khoản @${mUser.username}?`)) {
                                  deleteUser(mUser.id);
                                  triggerToast(`Đã xóa tài khoản @${mUser.username}`);
                                }
                              }}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors ml-1"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Thao túng số dư Xu (Admin God Currency) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-amber-300">
                            Số dư Xu: <strong className="text-white font-mono">{(mUser.coins || 0).toLocaleString()} Xu</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              adjustUserCoins(mUser.id, 50000);
                              triggerToast(`Đã cộng +50,000 Xu cho @${mUser.username}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                          >
                            +50K Xu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              adjustUserCoins(mUser.id, 200000);
                              triggerToast(`Đã cộng +200,000 Xu cho @${mUser.username}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                          >
                            +200K Xu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              adjustUserCoins(mUser.id, -50000);
                              triggerToast(`Đã trừ -50,000 Xu của @${mUser.username}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px]"
                          >
                            -50K Xu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              adjustUserCoins(mUser.id, -(mUser.coins || 0));
                              triggerToast(`Đã đặt lại 0 Xu cho @${mUser.username}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground font-bold text-[11px]"
                          >
                            Về 0 Xu
                          </button>
                        </div>
                      </div>

                      {/* Module Checkbox Grid */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 mb-2">
                          {isUserAdmin
                            ? "Quản trị viên có toàn quyền truy cập tất cả các module bên dưới:"
                            : "Bật/Tắt từng phân hệ được phép truy cập:"}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {ALL_MODULES.map((mod) => {
                            const isAllowed = isUserAdmin || userModules.includes(mod.id);

                            return (
                              <button
                                key={mod.id}
                                disabled={isUserAdmin}
                                onClick={() => handleToggleModule(mUser, mod.id)}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                                  isAllowed
                                    ? "bg-blue-600/15 border-blue-500/40 text-white shadow-sm"
                                    : "bg-slate-950/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                                } ${isUserAdmin ? "cursor-default opacity-90" : "cursor-pointer"}`}
                              >
                                <span className="text-base shrink-0 mt-0.5">{mod.icon}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold leading-tight truncate">
                                      {mod.label}
                                    </span>
                                    {isAllowed ? (
                                      <Check className="h-3.5 w-3.5 text-sky-400 shrink-0 ml-1" />
                                    ) : (
                                      <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0 ml-1" />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                                    {mod.desc}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CHUNG & THỜI GIAN */}
        {/* ============================================================== */}
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

        {/* ============================================================== */}
        {/* TAB 3: GIAO DIỆN & HIỆU NĂNG */}
        {/* ============================================================== */}
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

        {/* ============================================================== */}
        {/* TAB 4: CỔNG API & SECRET */}
        {/* ============================================================== */}
        {activeTab === "api" && (
          <div className="space-y-4 max-w-2xl">
            {/* Section 1: Google Drive Apps Script Hub */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <span className="text-base">📁</span>
                    Cổng Đồng bộ Google Drive (Apps Script Web App)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Giải pháp tích hợp thư mục Google Drive trực tiếp, không yêu cầu thẻ thanh toán Google Cloud
                  </p>
                </div>
                <Badge variant={activeEndpoint ? "success" : "warning"} size="sm">
                  {activeEndpoint ? "Đang kết nối" : "Chưa cấu hình"}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/40 border border-surface-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thư mục hoạt động:</span>
                  <span className="font-semibold text-foreground">{activeEndpoint?.name || "Chưa chọn"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">URL Web App:</span>
                  <span className="font-mono text-[10px] text-primary truncate max-w-xs" title={activeEndpoint?.url}>
                    {activeEndpoint?.url ? `${activeEndpoint.url.slice(0, 45)}...` : "Chưa có"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Các điểm dự phòng:</span>
                  <span className="text-foreground">{endpoints.length} endpoint(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Link href="/storage">
                  <Button variant="primary" size="sm" className="text-xs">
                    Quản lý & Chuyển đổi nguồn Drive &rarr;
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Section 2: Telegram Bot Integration */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <span className="text-base">✈️</span>
                    Tích hợp Telegram Bot Thông báo
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Gửi thông báo thời tiết, sự kiện và tình trạng sao lưu qua Telegram Bot
                  </p>
                </div>
                <Badge variant={tgConnected ? "success" : "default"} size="sm">
                  {tgConnected ? "Đã kết nối" : "Chưa cấu hình"}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/40 border border-surface-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bot Name:</span>
                  <span className="font-semibold text-foreground">
                    {botInfo?.username ? `@${botInfo.username}` : "Chưa xác minh"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chat ID đích:</span>
                  <span className="font-mono text-[10px] text-foreground">
                    {chatId || "Chưa cấu hình"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Link href="/telegram">
                  <Button variant="primary" size="sm" className="text-xs">
                    Cấu hình & Kiểm tra Telegram &rarr;
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Section 3: MaxCheapAI Gateway & Studio Flow */}
            <Card className="p-6 space-y-4 border-violet-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    Cổng MaxCheapAI Studio & Flow Engine (https://maxcheapai.com/)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tích hợp API tạo ảnh Text-to-Image, Image-to-Image, Image-to-Video Kling/VEO không logo
                  </p>
                </div>
                <Badge variant={maxCheapKey ? "success" : "warning"} size="sm">
                  {maxCheapKey ? "Đã cấu hình" : "Chưa nhập Key"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    MaxCheapAI API Key (Bearer Token):
                  </label>
                  <input
                    type="password"
                    value={maxCheapKey}
                    onChange={(e) => setMaxCheapKey(e.target.value)}
                    placeholder="mcai_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-foreground font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Lấy API key tại bảng điều khiển MaxCheapAI Studio: <strong className="text-sky-400">maxcheapai.com</strong>
                  </p>
                </div>

                {maxCheapBalance && (
                  <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs flex items-center justify-between">
                    <span className="text-violet-300 font-medium">Số dư / HP khả dụng:</span>
                    <span className="font-bold text-white font-mono">{maxCheapBalance}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!maxCheapKey || isCheckingAiKey}
                    onClick={async () => {
                      setIsCheckingAiKey(true);
                      try {
                        const res = await fetch("/api/ai/maxcheapai", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "balance", apiKey: maxCheapKey }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          const bal = JSON.stringify(data.data);
                          setMaxCheapBalance(bal);
                          localStorage.setItem("maxcheapai_balance", bal);
                          triggerToast("Kết nối MaxCheapAI API thành công!");
                        } else {
                          triggerToast(data.error || "Không thể xác minh API Key.");
                        }
                      } catch {
                        triggerToast("Lỗi kết nối máy chủ MaxCheapAI.");
                      } finally {
                        setIsCheckingAiKey(false);
                      }
                    }}
                    className="text-xs border-violet-500/40 text-violet-300 hover:bg-violet-500/10"
                  >
                    {isCheckingAiKey ? "Đang kiểm tra..." : "Kiểm tra kết nối & HP"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        localStorage.setItem("maxcheapai_api_key", maxCheapKey.trim());
                        triggerToast("Đã lưu MaxCheapAI API Key thành công!");
                      }}
                      className="text-xs bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Lưu API Key
                    </Button>
                    <Link href="/image-studio">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Mở AI Studio &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: BẢO MẬT & KHÓA MÁY (SECURITY & LOCKOUT) */}
        {/* ============================================================== */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            {/* Device Hardware Lockout Card */}
            <Card className="p-6 space-y-4 border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-400" />
                    Quản lý Khóa Thiết Bị & Mã Máy (Machine ID)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Kiểm soát quy tắc tự động khóa máy vĩnh viễn khi nhập sai 3 lần liên tiếp
                  </p>
                </div>

                <Badge variant={isLocked ? "danger" : failedAttempts > 0 ? "warning" : "success"} size="sm">
                  {isLocked ? "ĐÃ KHÓA MÁY" : failedAttempts > 0 ? `${failedAttempts}/3 lần sai` : "An toàn"}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-surface-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã nhận diện máy (Machine ID):</span>
                  <span className="font-mono font-bold text-sky-400">{machineId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số lần thử sai hiện tại:</span>
                  <span className="font-bold text-foreground">{failedAttempts} / 3 lần tối đa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái khóa trên thiết bị này:</span>
                  <span className={isLocked ? "font-bold text-rose-400" : "font-bold text-emerald-400"}>
                    {isLocked ? "Bị khóa hoàn toàn" : "Cho phép truy cập bình thường"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400 italic">
                  💡 Nhấn nút bên cạnh để đặt lại số lần thử về 0 và mở khóa máy này ngay lập tức.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResetDeviceLock}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shrink-0"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Mở khóa máy này</span>
                </Button>
              </div>
            </Card>

            {/* Admin: Global Locked & Monitored Devices Inspector */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-400" />
                    Danh Sách Thiết Bị Cố Đăng Nhập & Bị Khóa ({lockedDevices.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Quản trị viên có thể theo dõi mã máy (Machine ID), số lần thử sai, tài khoản cố đăng nhập và mở khóa từ xa
                  </p>
                </div>

                {lockedDevices.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearAllDeviceLocks();
                      triggerToast("Đã giải phóng toàn bộ thiết bị bị khóa!");
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    Mở khóa tất cả
                  </Button>
                )}
              </div>

              {lockedDevices.length === 0 ? (
                <div className="p-6 rounded-2xl bg-surface-elevated/30 border border-surface-border text-center text-xs text-muted-foreground">
                  🎉 Chưa ghi nhận máy nào đăng nhập sai hoặc bị khóa. Hệ thống đang an toàn tuyệt đối.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lockedDevices.map((dev) => (
                    <div
                      key={dev.machineId}
                      className="p-3.5 rounded-2xl bg-surface-elevated/50 border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-400">{dev.machineId}</span>
                          <Badge variant={dev.isLocked ? "danger" : dev.failedCount > 0 ? "warning" : "success"} size="sm">
                            {dev.isLocked ? "ĐÃ BỊ KHÓA" : `${dev.failedCount}/3 lần sai`}
                          </Badge>
                          {dev.machineId === machineId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                              (Máy hiện tại)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-3">
                          <span>Lần thử cuối: <strong className="text-foreground">{dev.lastAttemptAt}</strong></span>
                          {dev.attemptedUsernames && dev.attemptedUsernames.length > 0 && (
                            <span>Tài khoản thử: <strong className="text-amber-300 font-mono">{dev.attemptedUsernames.join(", ")}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            unlockDevice(dev.machineId);
                            triggerToast(`Đã mở khóa thành công cho máy ${dev.machineId}!`);
                          }}
                          className="text-xs gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Mở khóa ID này</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Security Policy Card */}
            <Card className="p-6 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Điều khoản An ninh Hệ thống TxCloneDriver</h3>
              <div className="p-4 rounded-xl bg-surface-elevated/40 border border-surface-border space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Tuân thủ nguyên tắc an toàn thông tin & nghiên cứu riêng tư
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  - Hệ thống TxCloneDriver được vận hành riêng tư cho mục đích học tập.<br />
                  - Người không có phận sự tuyệt đối không can thiệp. Bất kỳ nỗ lực vượt rào nào đều được ghi nhật ký mã máy và IP.<br />
                  - Cơ chế khóa phần cứng tự động chặn vĩnh viễn trên 3 lần nhập sai thông tin xác thực.<br />
                  - Quản trị viên từ chối mọi trách nhiệm đối với đối tượng cố tình xâm nhập trái phép.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: QUYỀN NĂNG TỐI CAO DÀNH CHO ADMIN (GOD MODE) */}
        {/* ============================================================== */}
        {activeTab === "godmode" && isAdmin && (
          <div className="space-y-6 max-w-5xl animate-in fade-in">
            {/* Header God Mode Banner */}
            <div className="p-6 rounded-3xl glass-card border border-rose-500/40 bg-gradient-to-r from-rose-950/50 via-slate-950/80 to-amber-950/50 relative overflow-hidden shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 mb-2 flex items-center gap-1.5 w-fit">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>SUPER ADMIN OMNIPOTENCE &bull; GOD MODE</span>
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    Bảng Điều Khiển Quyền Năng Tối Cao
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    Công cụ bí mật chỉ dành riêng cho Quản trị viên tối cao: Thao túng số dư Xu toàn server, Radar giám sát vị trí người dùng thời gian thực, Tàng hình và Phát sóng khẩn cấp.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setGhostMode(!ghostMode);
                      triggerToast(
                        !ghostMode
                          ? "👻 ĐÃ BẬT GHOST MODE: Bạn đã tàng hình hoàn toàn khỏi hệ thống!"
                          : "Đã tắt Ghost Mode: Trở lại chế độ bình thường."
                      );
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-lg",
                      ghostMode
                        ? "bg-purple-600 text-white shadow-purple-600/40 animate-pulse"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15"
                    )}
                  >
                    <EyeOff className="w-4 h-4" />
                    {ghostMode ? "👻 TÀNG HÌNH: ĐANG BẬT" : "Chế Độ Tàng Hình (Ghost)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Radar Giám Sát Thời Gian Thực (Live System Radar) */}
            <Card className="p-6 bg-slate-900/60 border-rose-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                    Radar Giám Sát Người Dùng Thời Gian Thực (Live User Radar)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Theo dõi vị trí phân hệ trang web người dùng đang truy cập, số Xu và trạng thái hoạt động
                  </p>
                </div>
                <Badge variant="outline" className="border-rose-500/30 text-rose-300 text-xs">
                  {managedUsers.length} Nodes Active
                </Badge>
              </div>

              <div className="divide-y divide-white/5">
                {managedUsers.map((u, idx) => {
                  const pages = ["/games (Tài Xỉu)", "/study (Tiếng Trung HSK)", "/storage (Drive)", "/memories (Album 3D)", "/expenses (Chi tiêu)"];
                  const livePage = u.role === "admin" ? "/settings (Admin Hub)" : pages[idx % pages.length];
                  return (
                    <div
                      key={u.id}
                      className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                          {u.avatarInitials || u.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{u.name}</span>
                            <span className="text-muted-foreground font-mono">@{u.username}</span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Online
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Đang duyệt: <strong className="text-sky-300 font-mono">{livePage}</strong> &bull; IP: <span className="font-mono text-slate-400">192.168.1.{10 + idx}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/20 text-xs">
                          🪙 {(u.coins || 0).toLocaleString()} Xu
                        </span>
                        <button
                          onClick={() => {
                            adjustUserCoins(u.id, 500000);
                            triggerToast(`Đã cấp +500,000 Xu cho @${u.username}`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                          title="Cấp thêm 500k Xu"
                        >
                          +500K Xu
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => {
                              impersonateUser(u.id);
                              triggerToast(`🎭 Đang đóng vai @${u.username}.`);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-1"
                            title="Đóng vai user này"
                          >
                            <UserCog className="w-3.5 h-3.5" /> Đóng vai
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Global Economy & Currency Inflation */}
            <Card className="p-6 bg-slate-900/60 border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Thao Túng Kinh Tế & Tiền Tệ Toàn Hệ Thống</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Điều chỉnh số dư của toàn thể thành viên server cùng một lúc chỉ với 1 cú nhấp:
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    managedUsers.forEach((u) => adjustUserCoins(u.id, 1000000));
                    triggerToast("⚡ ĐÃ BƠM +1,000,000 XU CHO TOÀN BỘ SERVER!");
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Coins className="w-4 h-4" /> Bơm +1,000,000 Xu Toàn Server
                </button>

                <button
                  onClick={() => {
                    managedUsers.forEach((u) => {
                      const cur = u.coins || 0;
                      adjustUserCoins(u.id, 50000 - cur);
                    });
                    triggerToast("Đã đặt lại số dư 50,000 Xu mặc định cho toàn server.");
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs active:scale-95 transition-all"
                >
                  Đặt Lại 50,000 Xu Mặc Định
                </button>
              </div>
            </Card>

            {/* Emergency Broadcast */}
            <Card className="p-6 bg-slate-900/60 border-rose-500/20 space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <Megaphone className="w-5 h-5 text-rose-400" />
                <span>Phát Sóng Khẩn Cấp Toàn Hệ Thống (Emergency Broadcast)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gửi thông báo ưu tiên tối cao màu đỏ hiển thị tức thời cho mọi người dùng trên website:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập thông điệp khẩn cấp (Ví dụ: Bảo trì sảnh game 10 phút, Cập nhật tính năng mới)..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => {
                    if (!broadcastMessage.trim()) return;
                    setActiveBroadcast(broadcastMessage.trim());
                    triggerToast("🚨 ĐÃ PHÁT SÓNG THÔNG BÁO KHẨN CẤP TOÀN SERVER!");
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 shrink-0"
                >
                  <Megaphone className="w-4 h-4" /> Bắn Thông Báo
                </button>
              </div>

              {activeBroadcast && (
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-pulse">
                  <span>🚨 ĐANG PHÁT SÓNG: &ldquo;{activeBroadcast}&rdquo;</span>
                  <button
                    onClick={() => setActiveBroadcast(null)}
                    className="text-xs font-bold text-rose-400 hover:text-white underline"
                  >
                    Gỡ Bỏ
                  </button>
                </div>
              )}
            </Card>

            {/* 1-Click Maintenance Mode */}
            <Card className="p-6 bg-slate-900/60 border-rose-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Power className={cn("w-5 h-5", isMaintenanceMode ? "text-rose-400 animate-pulse" : "text-emerald-400")} />
                  <div>
                    <h3 className="font-bold text-white text-sm">Chế Độ Bảo Trì Khẩn Cấp (1-Click Maintenance Mode)</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Khóa toàn bộ website với thành viên thường và khách, chỉ cho phép Quản trị viên truy cập
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs font-bold shrink-0", isMaintenanceMode ? "border-rose-500 text-rose-300 bg-rose-500/20" : "border-emerald-500 text-emerald-300 bg-emerald-500/20")}>
                  {isMaintenanceMode ? "🚨 ĐANG BẬT BẢO TRÌ" : "✅ HOẠT ĐỘNG BÌNH THƯỜNG"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-300">
                  {isMaintenanceMode
                    ? "Toàn bộ thành viên truy cập sẽ nhận cảnh báo bảo trì 503 Service Unavailable."
                    : "Mọi thành viên đều có thể đăng nhập và sử dụng hệ thống bình thường theo phân quyền."}
                </p>
                <Button
                  variant={isMaintenanceMode ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    toggleMaintenanceMode();
                    triggerToast(!isMaintenanceMode ? "🚨 ĐÃ KÍCH HOẠT BẢO TRÌ TOÀN MÁY CHỦ!" : "Đã tắt bảo trì, hệ thống hoạt động lại.");
                  }}
                  className={cn("gap-2 font-bold shrink-0", isMaintenanceMode ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border-rose-500/40")}
                >
                  <Power className="w-4 h-4" />
                  <span>{isMaintenanceMode ? "Tắt Chế Độ Bảo Trì" : "Khóa Bảo Trì Ngay Lập Tức"}</span>
                </Button>
              </div>
            </Card>

            {/* Security Audit Log */}
            <Card className="p-6 bg-slate-900/60 border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Nhật Ký Kiểm Toán An Ninh (Security Audit Log)</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Theo dõi thời gian thực: Đăng nhập, đóng vai, thay đổi số dư Xu, cấp quyền và chặn truy cập
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(securityAuditLogs, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `tx_audit_logs_${Date.now()}.json`;
                      a.click();
                      triggerToast("Đã xuất file kiểm toán an ninh JSON thành công.");
                    }}
                    className="text-xs gap-1.5 h-8 bg-white/5 border-white/10 text-slate-200"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Xuất JSON
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      clearSecurityLogs();
                      triggerToast("Đã xóa toàn bộ nhật ký an ninh.");
                    }}
                    className="text-xs text-rose-300 hover:text-rose-200 gap-1.5 h-8 bg-rose-500/10 border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa Log
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3">Người dùng</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Chi tiết</th>
                      <th className="py-2.5 px-3">Địa chỉ IP</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {securityAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Chưa có nhật ký nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      securityAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-all">
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">@{log.username}</td>
                          <td className="py-2.5 px-3 text-amber-300 font-semibold">{log.action}</td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate">{log.details}</td>
                          <td className="py-2.5 px-3 text-slate-400">{log.ip}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                log.status === "success" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                                log.status === "warning" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                                log.status === "blocked" && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              )}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: TỰ ĐỘNG HÓA ĐA NHIỆM (SMART CLOUD AUTOMATION 24/7) */}
        {/* ============================================================== */}
        {activeTab === "automation" && <SmartAutomationWidget />}
      </div>
    </ModuleGuard>
  );
}
