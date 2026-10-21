"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Unlock,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { useTelegram } from "@/modules/telegram/telegramContext";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { useTheme } from "@/modules/theme-engine/themeContext";

// LocalStorage Keys for Strict Machine Lockout
const STORAGE_MACHINE_ID = "txclonedriver_machine_id";
const STORAGE_FAILED_ATTEMPTS = "txclonedriver_failed_attempts";
const STORAGE_DEVICE_LOCKED = "txclonedriver_device_locked";
const STORAGE_LOCK_TIMESTAMP = "txclonedriver_lock_timestamp";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, managedUsers, recordDeviceAttempt } = useAuth();
  const { currentTheme } = useTheme();
  const { sendSecurityRadarAlert } = useTelegram();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Machine ID & Hardware Lockout State
  const [machineId, setMachineId] = useState<string>("TX-DEV-INITIALIZING...");
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockTime, setLockTime] = useState<string>("");

  // Master Admin Emergency Override modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePass, setOverridePass] = useState("");
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Generate / retrieve persistent Machine ID and lockout state
  useEffect(() => {
    try {
      let mid = localStorage.getItem(STORAGE_MACHINE_ID);
      if (!mid) {
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timeHex = Date.now().toString(36).slice(-4).toUpperCase();
        mid = `TX-DEV-${randomHex}-${timeHex}`;
        localStorage.setItem(STORAGE_MACHINE_ID, mid);
      }
      setMachineId(mid);

      const fa = parseInt(localStorage.getItem(STORAGE_FAILED_ATTEMPTS) || "0", 10);
      setFailedAttempts(fa);

      const locked = localStorage.getItem(STORAGE_DEVICE_LOCKED) === "true";
      if (locked || fa >= 3) {
        setIsLocked(true);
        setLockTime(localStorage.getItem(STORAGE_LOCK_TIMESTAMP) || new Date().toLocaleString("vi-VN"));
      }
    } catch {
      // fallback
    }
  }, []);

  // Handle Login submission with 3-attempt lockout tracking
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const isMasterBypass = password.trim() === "123e";

    if (isLocked && !isMasterBypass) {
      setErrorMessage("Thiết bị này đã bị KHÓA VĨNH VIỄN do vượt quá 3 lần truy cập thất bại.");
      return;
    }

    if (!isMasterBypass && (!username.trim() || !password.trim())) {
      setErrorMessage("Vui lòng điền đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        recordDeviceAttempt(machineId, username.trim() || "admin", false);
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_DEVICE_LOCKED);
        setIsLocked(false);
        setFailedAttempts(0);

        const matched = managedUsers.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        if (
          matched &&
          matched.role !== "admin" &&
          Array.isArray(matched.allowedModules) &&
          !matched.allowedModules.includes("overview")
        ) {
          const firstMod = matched.allowedModules[0] || "storage";
          router.push(`/${firstMod}`);
        } else {
          router.push("/overview");
        }
      } else {
        const devStatus = recordDeviceAttempt(machineId, username.trim(), true);
        const newCount = devStatus.failedCount;
        setFailedAttempts(newCount);
        localStorage.setItem(STORAGE_FAILED_ATTEMPTS, newCount.toString());

        if (devStatus.isLocked || newCount >= 3) {
          const nowStr = new Date().toLocaleString("vi-VN");
          localStorage.setItem(STORAGE_DEVICE_LOCKED, "true");
          localStorage.setItem(STORAGE_LOCK_TIMESTAMP, nowStr);
          setIsLocked(true);
          setLockTime(nowStr);

          // 🚨 Trigger Telegram Intrusion Radar Alert
          sendSecurityRadarAlert(
            "Cảnh Báo Khóa Thiết Bị",
            `Phát hiện đăng nhập thất bại 3 lần liên tiếp với tài khoản '${username.trim()}'. Thiết bị đã bị khóa cứng vĩnh viễn.`,
            machineId
          ).catch(() => {});
        } else {
          setErrorMessage(result.error || "Tài khoản hoặc mật khẩu không chính xác.");
          setWarningMessage(
            `⚠️ CẢNH BÁO AN NINH: Bạn đã đăng nhập thất bại ${newCount}/3 lần! Còn ${
              3 - newCount
            } lần thử trước khi Thiết bị (Mã máy: ${machineId}) bị KHÓA VĨNH VIỄN.`
          );
        }
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegSuccessMessage(null);

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin đăng ký.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setRegLoading(true);

    try {
      const res = await register(regUsername, regPassword, regName);
      if (res.success) {
        setRegSuccessMessage(
          "⏳ ĐĂNG KÝ THÀNH CÔNG! Tài khoản đã được chuyển lên Quản trị viên (Admin). Vui lòng chờ Admin phê duyệt và cấp quyền truy cập từng phân hệ trước khi đăng nhập."
        );
        const savedU = regUsername.trim();
        setRegName("");
        setRegUsername("");
        setRegPassword("");
        setRegConfirmPassword("");
        setUsername(savedU);
        setTimeout(() => {
          setMode("login");
        }, 3500);
      } else {
        setErrorMessage(res.error || "Không thể đăng ký tài khoản.");
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi đăng ký tài khoản.");
    } finally {
      setRegLoading(false);
    }
  };

  // Admin Master Override Unlock
  const handleMasterOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideError(null);

    if (
      overridePass === "123e" ||
      overridePass === "kdkctrkn@123" ||
      overridePass === "MASTER_TX_UNLOCK_2026"
    ) {
      localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_DEVICE_LOCKED);
      localStorage.removeItem(STORAGE_LOCK_TIMESTAMP);
      setIsLocked(false);
      setFailedAttempts(0);
      setShowOverrideModal(false);
      setOverridePass("");
      setErrorMessage(null);
      setWarningMessage(null);
    } else {
      setOverrideError("Mật khẩu Master Admin không chính xác. Truy cập bị từ chối!");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-x-hidden select-none">
      {/* Layer 0: Thematic Wallpaper */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out transform scale-100"
        style={{
          backgroundImage: `url('${currentTheme.bgImage || "/images/spring-blossom.jpg"}')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80" />
      </div>

      {/* Layer 1: Floating Seasonal Particles */}
      <SeasonalCanvas />

      {/* Layer 2: Main Card Container */}
      <div className="relative z-10 w-full max-w-[460px] rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-500 bg-slate-950/85 backdrop-blur-2xl my-6">
        
        {/* CASE A: DEVICE IS PERMANENTLY LOCKED (3 FAILED ATTEMPTS) */}
        {isLocked ? (
          <div className="space-y-5 text-center animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-600/20 border-2 border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <ShieldX className="h-9 w-9 text-rose-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <AlertTriangle className="h-3 w-3" />
                PERMANENT HARDWARE LOCKOUT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight pt-1">
                THIẾT BỊ ĐÃ BỊ KHÓA VĨNH VIỄN
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Phát hiện hành vi đăng nhập thất bại vượt quá <strong>3 lần liên tiếp</strong>. Hệ thống an ninh TxCloneDriver đã tự động ghi nhận và cô lập thiết bị này khỏi máy chủ.
              </p>
            </div>

            {/* Violation Details Box */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mã thiết bị (Machine ID):</span>
                <span className="font-mono font-bold text-rose-300">{machineId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời điểm vi phạm:</span>
                <span className="text-slate-200">{lockTime || "Vừa xong"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trạng thái an ninh:</span>
                <span className="font-bold text-rose-400">Đưa vào Blacklist Hệ thống</span>
              </div>
            </div>

            {/* Strict Legal Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-[11px] text-slate-300 text-left space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                Tuyên bố Từ chối Trách nhiệm An ninh:
              </p>
              <p>
                Trang web TxCloneDriver là cổng thông tin nội bộ riêng tư phục vụ mục đích học tập và nghiên cứu công nghệ. Mọi hành vi cố tình xâm nhập không có thẩm quyền là vi phạm quy định.
              </p>
              <p className="text-rose-300 font-medium">
                Ban quản trị và nhà phát triển hoàn toàn không chịu bất kỳ trách nhiệm pháp lý hay kỹ thuật nào đối với các cá nhân xâm nhập trái phép bị khóa thiết bị hoặc phát sinh thiệt hại.
              </p>
            </div>

            {/* Emergency Admin Override Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <Unlock className="h-3.5 w-3.5 text-amber-400" />
                <span>Mở khóa Khẩn cấp Dành cho Admin (Master Override)</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE B: NORMAL LOGIN / REGISTER INTERFACE */
          <>
            {/* Brand Logo & Name */}
            <div className="flex flex-col items-center text-center space-y-2 mb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-2 shadow-xl shadow-indigo-500/40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                  <defs>
                    <linearGradient id="yinGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="6 4" />
                  <circle cx="50" cy="50" r="38" fill="#090d16" stroke="url(#yinGradLogin)" strokeWidth="2.5" />
                  <path d="M 50 12 A 38 38 0 0 1 50 88 A 19 19 0 0 1 50 50 A 19 19 0 0 0 50 12 Z" fill="url(#yinGradLogin)" />
                  <circle cx="50" cy="31" r="5" fill="#090d16" />
                  <circle cx="50" cy="31" r="2.5" fill="#fde047" />
                  <circle cx="50" cy="69" r="5" fill="#ffffff" />
                  <circle cx="50" cy="69" r="2.5" fill="#6366f1" />
                </svg>
              </div>

              <div className="pt-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  MêÂmĐạoSỹ
                  <span className="text-sky-400 font-extrabold text-[11px] uppercase px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30">
                    Hub
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Cổng Xác Thực & Quản Trị Đám Mây Cá Nhân
                </p>
              </div>
            </div>

            {/* STRICT LEGAL & SECURITY WARNING BANNER */}
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-200 text-left space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Cảnh báo An ninh & Điều khoản Truy cập</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Trang web nội bộ phục vụ <strong className="text-white">mục đích học tập và nghiên cứu cá nhân</strong>. Người không có phận sự tuyệt đối <strong className="text-rose-300">không được phép truy cập</strong>.
              </p>
              <div className="text-[10px] text-slate-300 leading-relaxed border-t border-amber-500/20 pt-1.5 space-y-1">
                <div className="flex items-center justify-between text-sky-300 font-mono">
                  <span>Mã máy giám sát (Machine ID):</span>
                  <span className="font-bold">{machineId}</span>
                </div>
                <p className="text-amber-200">
                  ⚡ <strong>Quy tắc khóa máy:</strong> Nếu đăng nhập sai quá <strong>3 lần</strong>, ID thiết bị sẽ bị <strong>KHÓA TRUY CẬP VĨNH VIỄN</strong>.
                </p>
                <p className="text-rose-300/90 italic">
                  * Ban quản trị hoàn toàn không chịu trách nhiệm về người cố tình xâm nhập trái phép.
                </p>
              </div>
            </div>

            {/* Navigation Tabs: Đăng nhập vs Đăng ký */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Đăng nhập</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "register"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Đăng ký mới</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Warning Message (Count of failed attempts) */}
            {warningMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{warningMessage}</span>
              </div>
            )}

            {/* Success Registration Notification */}
            {regSuccessMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{regSuccessMessage}</span>
              </div>
            )}

            {/* SUB-TAB 1: LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Tên tài khoản
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên tài khoản của bạn..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Mật khẩu truy cập
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm font-sans"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px]">Ghi nhớ phiên làm việc</span>
                  </label>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Thử sai: {failedAttempts}/3
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xác thực thông tin...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập vào Hệ thống</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SUB-TAB 2: REGISTRATION FORM */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Họ và tên của bạn
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Tên tài khoản mong muốn
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Ví dụ: thanhvien_moi"
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm font-mono"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Mật khẩu khởi tạo
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Xác nhận lại mật khẩu
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm"
                    required
                  />
                </div>

                {/* Note about admin approval */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] text-slate-400">
                  ⚠️ <strong className="text-amber-300">Lưu ý phê duyệt:</strong> Mọi tài khoản sau khi tạo sẽ được chuyển đến Admin ở trạng thái <span className="text-white font-medium">Chờ xét duyệt</span>. Admin sẽ cấp quyền các phân hệ tương ứng trước khi bạn đăng nhập được.
                </div>

                {/* Register Submit */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
                >
                  {regLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi thông tin đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Gửi Yêu Cầu Tạo Tài Khoản</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Certificate Footer */}
            <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Mã hóa AES-256 &bull; TxCloneDriver Hub</span>
              </div>
              <span className="font-mono text-slate-500">ID: {machineId}</span>
            </div>
          </>
        )}
      </div>

      {/* MODAL: MASTER ADMIN RESCUE / OVERRIDE DIALOG */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-amber-500/30 bg-slate-950/95 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Khóa Cứu Hộ Master Admin</h3>
                <p className="text-[11px] text-slate-400">Mở khóa thiết bị khẩn cấp cho Quản trị viên</p>
              </div>
            </div>

            {overrideError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleMasterOverride} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mật khẩu Quản trị viên Tối cao
                </label>
                <input
                  type="password"
                  value={overridePass}
                  onChange={(e) => setOverridePass(e.target.value)}
                  placeholder="Nhập mật khẩu Admin..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  Xác nhận Mở khóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
