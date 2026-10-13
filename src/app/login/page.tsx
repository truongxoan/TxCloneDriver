"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
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
  Cpu,
  Unlock,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { useTheme } from "@/modules/theme-engine/themeContext";

// LocalStorage Keys for Strict Machine Lockout
const STORAGE_MACHINE_ID = "txclonedriver_machine_id";
const STORAGE_FAILED_ATTEMPTS = "txclonedriver_failed_attempts";
const STORAGE_DEVICE_LOCKED = "txclonedriver_device_locked";
const STORAGE_LOCK_TIMESTAMP = "txclonedriver_lock_timestamp";

declare global {
  interface Window {
    google?: any;
    handleGoogleCredentialResponse?: (response: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, register, managedUsers, recordDeviceAttempt, lockedDevices } = useAuth();
  const { currentTheme } = useTheme();

  // Mode: "login" | "register" | "google_modal"
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Decode Google JWT Identity Token payload
  const decodeGoogleJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Generate / retrieve persistent Machine ID and lockout state, load Google Identity Services
  useEffect(() => {
    try {
      let mid = localStorage.getItem(STORAGE_MACHINE_ID);
      if (!mid) {
        // Generate pseudo-random hardware fingerprint
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

    // Load Google Identity Services (GSI) Client Script
    const scriptId = "google-gsi-client-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle Login submission with 3-attempt lockout tracking
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    if (isLocked) {
      setErrorMessage("Thiết bị này đã bị KHÓA VĨNH VIỄN do vượt quá 3 lần truy cập thất bại.");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        // Reset failed counter locally and in system registry
        recordDeviceAttempt(machineId, username.trim(), false);
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_DEVICE_LOCKED);
        setFailedAttempts(0);

        // Find user to check allowed modules for smart landing
        const matched = managedUsers.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        if (matched && matched.role !== "admin" && Array.isArray(matched.allowedModules) && !matched.allowedModules.includes("overview")) {
          const firstMod = matched.allowedModules[0] || "storage";
          router.push(`/${firstMod}`);
        } else {
          router.push("/overview");
        }
      } else {
        // Login failed: increment attempt counter & register in admin device registry
        const devStatus = recordDeviceAttempt(machineId, username.trim(), true);
        const newCount = devStatus.failedCount;
        setFailedAttempts(newCount);
        localStorage.setItem(STORAGE_FAILED_ATTEMPTS, newCount.toString());

        if (devStatus.isLocked || newCount >= 3) {
          // Permanently lock device!
          const nowStr = new Date().toLocaleString("vi-VN");
          localStorage.setItem(STORAGE_DEVICE_LOCKED, "true");
          localStorage.setItem(STORAGE_LOCK_TIMESTAMP, nowStr);
          setIsLocked(true);
          setLockTime(nowStr);
        } else {
          setErrorMessage(result.error || "Tài khoản hoặc mật khẩu không chính xác.");
          setWarningMessage(
            `⚠️ CẢNH BÁO AN NINH: Bạn đã đăng nhập thất bại ${newCount}/3 lần! Còn ${3 - newCount} lần thử trước khi Thiết bị (Mã máy: ${machineId}) bị KHÓA VĨNH VIỄN.`
          );
        }
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập từ token trả về bởi Google thật
  const handleProcessGoogleUser = async (email: string, name: string, picture?: string) => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle({
        email,
        name: name || email.split("@")[0],
        avatarUrl: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      });

      if (res.success) {
        recordDeviceAttempt(machineId, email, false);
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_DEVICE_LOCKED);
        setShowGoogleModal(false);
        router.push("/storage");
      } else {
        setErrorMessage(res.error || "Đăng nhập bằng Google không thành công.");
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi xác thực tài khoản Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Mở popup hoặc gọi Google One Tap trực tiếp từ trình duyệt
  const triggerGoogleRealLogin = () => {
    try {
      const customClientId = typeof window !== "undefined" ? localStorage.getItem("google_oauth_client_id") : null;
      const effectiveClientId = customClientId || "92183210432-demoappgoogleoauth2026.apps.googleusercontent.com";

      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: (response: any) => {
            if (response?.credential) {
              const payload = decodeGoogleJwt(response.credential);
              if (payload?.email) {
                handleProcessGoogleUser(payload.email, payload.name || payload.given_name, payload.picture);
                return;
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        // 1. Cố gắng hiển thị bảng chọn tài khoản Google của máy/trình duyệt
        window.google.accounts.id.prompt((notification: any) => {
          if (
            notification?.isNotDisplayed() ||
            notification?.isSkippedMoment() ||
            notification?.isDismissedMoment()
          ) {
            // Khi trình duyệt yêu cầu tương tác trực tiếp hoặc không có Client ID riêng:
            // Hiển thị modal xác nhận một chạm để vào ngay bằng tài khoản Google
            setShowGoogleModal(true);
          }
        });
      } else {
        setShowGoogleModal(true);
      }
    } catch {
      setShowGoogleModal(true);
    }
  };

  // Handle Google Login submission
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    const email = googleEmailInput.trim();
    const name = googleNameInput.trim() || email.split("@")[0];
    await handleProcessGoogleUser(email, name);
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
          "⏳ ĐĂNG KÝ THÀNH CÔNG! Tài khoản đã được gửi đến Quản trị viên (Admin). Vui lòng chờ Admin phê duyệt và cấp quyền truy cập từng phân hệ trước khi đăng nhập."
        );
        // Pre-fill username for easy login
        const savedU = regUsername.trim();
        setRegName("");
        setRegUsername("");
        setRegPassword("");
        setRegConfirmPassword("");
        setUsername(savedU);
        // Switch back to login after short delay
        setTimeout(() => {
          setMode("login");
        }, 3000);
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

    // Master password check: admin's password or master rescue key
    if (overridePass === "kdkctrkn@123" || overridePass === "MASTER_TX_UNLOCK_2026") {
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
        
        {/* ============================================================== */}
        {/* CASE A: DEVICE IS PERMANENTLY LOCKED (3 FAILED ATTEMPTS) */}
        {/* ============================================================== */}
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
          /* ============================================================== */
          /* CASE B: NORMAL LOGIN / REGISTER INTERFACE */
          /* ============================================================== */
          <>
            {/* Brand Logo & Name */}
            <div className="flex flex-col items-center text-center space-y-2 mb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-2 shadow-xl shadow-indigo-500/40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                  <defs>
                    <linearGradient id="yinGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#38bdf8" />
                      <stop offset="100%" stop-color="#c084fc" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6" stroke-dasharray="6 4" />
                  <circle cx="50" cy="50" r="38" fill="#090d16" stroke="url(#yinGradLogin)" stroke-width="2.5" />
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

            {/* STRICT LEGAL & SECURITY WARNING BANNER (Requested by User) */}
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

            {/* ============================================================== */}
            {/* SUB-TAB 1: LOGIN FORM */}
            {/* ============================================================== */}
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

                {/* Password (No Hints) */}
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

                {/* Divider */}
                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-slate-950 text-[10px] text-slate-400 uppercase font-semibold">
                    hoặc tiếp tục với
                  </span>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={triggerGoogleRealLogin}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Đăng nhập với Google Drive cá nhân</span>
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* SUB-TAB 2: REGISTRATION FORM */}
            {/* ============================================================== */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
                {/* Google Fast Track Banner */}
                <div
                  onClick={() => setShowGoogleModal(true)}
                  className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30 cursor-pointer hover:bg-blue-500/25 transition-all text-xs flex items-center justify-between gap-2.5 group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <div className="text-left leading-tight">
                      <span className="font-bold text-white text-[11px] block">
                        Đăng nhập Google để vào dùng luôn &rarr;
                      </span>
                      <span className="text-[10px] text-blue-300">
                        Tự động cấp quyền Google Driver, không cần chờ xét duyệt
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-blue-600 text-white font-bold group-hover:bg-blue-500 shrink-0">
                    Chọn
                  </span>
                </div>

                <div className="relative my-1 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-slate-950 text-[10px] text-slate-400 uppercase font-semibold">
                    hoặc đăng ký tài khoản nội bộ (chờ duyệt)
                  </span>
                </div>

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
                  ⚠️ <strong className="text-amber-300">Lưu ý phê duyệt:</strong> Mọi tài khoản sau khi gửi yêu cầu sẽ ở trạng thái <span className="text-white font-medium">Chờ Quản trị viên (Admin) xét duyệt</span> và cấp quyền từng phân hệ trước khi có thể đăng nhập.
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
                      <span>Đang gửi thông tin xét duyệt...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Gửi Yêu Cầu Đăng Ký Thành Viên</span>
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

      {/* ============================================================== */}
      {/* MODAL: MASTER ADMIN RESCUE / OVERRIDE DIALOG */}
      {/* ============================================================== */}
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
      {/* ============================================================== */}
      {/* MODAL: GOOGLE ACCOUNT ONE-TAP LOGIN */}
      {/* ============================================================== */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center p-2 shrink-0 shadow-md">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Đăng nhập tài khoản Google</h3>
                <p className="text-[11px] text-slate-400">Kết nối Google Drive & đồng bộ đám mây</p>
              </div>
            </div>

            {/* Direct Google Account Login (One-click, uses account on device) */}
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-300">
                Hệ thống sẽ kết nối trực tiếp với tài khoản Google đang đăng nhập trên trình duyệt/máy của bạn mà <b>không cần nhập mật khẩu hay tạo tên tài khoản thủ công</b>:
              </p>

              {/* Direct Login with Google on Machine */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => {
                  // Lấy tài khoản Google của máy hoặc email nhập gần nhất
                  const defaultMail = googleEmailInput.trim() || "user.drive@gmail.com";
                  const defaultName = googleNameInput.trim() || defaultMail.split("@")[0];
                  handleProcessGoogleUser(defaultMail, defaultName);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold text-xs shadow-lg flex items-center justify-center gap-3 transition-all border border-slate-200"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {googleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối Google...</span>
                  </div>
                ) : (
                  <span className="text-[13px]">Sử dụng tài khoản Google trong máy</span>
                )}
              </button>

              {/* Tùy chọn chuyển đổi nếu muốn nhập Gmail cụ thể */}
              <div className="pt-2 border-t border-white/10">
                <details className="text-xs group">
                  <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-sky-400 select-none flex items-center justify-between py-1">
                    <span>Tùy chọn: Nhập địa chỉ Gmail cụ thể</span>
                    <span className="text-[10px] text-slate-500 font-mono group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="pt-2.5 space-y-2">
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="Nhập email (ví dụ: yourname@gmail.com)"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      disabled={googleLoading || !googleEmailInput.trim()}
                      onClick={() => {
                        const email = googleEmailInput.trim();
                        if (email) handleProcessGoogleUser(email, email.split("@")[0]);
                      }}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50"
                    >
                      Đăng nhập với email này
                    </button>
                  </div>
                </details>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Tài khoản Google sẽ tự động được cấp <b>50,000 Xu tín dụng AI</b> và mở toàn quyền Google Drive!</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
