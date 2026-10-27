"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  HardDrive,
  Users2,
  StickyNote,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { DRIVER_USERNAMES, landingPathFor } from "@/modules/auth/defaultUsers";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login, managedUsers } = useAuth();
  const { currentTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dọn trạng thái khóa máy cũ (cơ chế khóa vĩnh viễn đã bị gỡ bỏ).
  useEffect(() => {
    try {
      localStorage.removeItem("txclonedriver_failed_attempts");
      localStorage.removeItem("txclonedriver_device_locked");
      localStorage.removeItem("txclonedriver_lock_timestamp");
    } catch {}
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Vui lòng nhập tài khoản (hoặc chạm vào một mã thành viên bên dưới).");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu. Thành viên: gõ gì cũng được. Admin: nhập đúng mật khẩu admin.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        const matched = managedUsers.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        router.push(landingPathFor(matched?.allowedModules, matched?.role));
      } else {
        setErrorMessage(result.error || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-x-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${currentTheme.bgImage || "/images/spring-blossom.jpg"}')` }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80" />
      </div>

      <SeasonalCanvas />

      <div className="relative z-10 w-full max-w-[460px] rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl shadow-black/90 bg-slate-950/85 backdrop-blur-2xl my-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-2 shadow-xl shadow-indigo-500/40 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow" aria-hidden="true">
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
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              TxCloneDriver <span className="text-sky-400 text-[11px] uppercase px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30 align-middle">Hub</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">Drive chung · Xem chung · Ghi chú</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block">Tên tài khoản</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoComplete="username"
                inputMode="numeric"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: 11"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block">Mật khẩu</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Thành viên: gõ gì cũng được"
                className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Chọn nhanh tài khoản thành viên
          </p>
          <div className="grid grid-cols-5 gap-2">
            {DRIVER_USERNAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setUsername(name);
                  setErrorMessage(null);
                }}
                className={cn(
                  "py-2 rounded-xl text-sm font-bold border transition-all active:scale-95",
                  username === name
                    ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30"
                    : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
            Thành viên chỉ cần nhập tài khoản + mật khẩu bất kỳ là vào được.
            <br />
            Hệ thống không có đăng ký mới — chỉ có 10 tài khoản trên + admin.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><HardDrive className="h-3.5 w-3.5 text-sky-400" /> Drive</span>
          <span className="flex items-center gap-1"><Users2 className="h-3.5 w-3.5 text-sky-400" /> Xem chung</span>
          <span className="flex items-center gap-1"><StickyNote className="h-3.5 w-3.5 text-sky-400" /> Ghi chú</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> TxCloneDriver</span>
        </div>
      </div>
    </div>
  );
}
