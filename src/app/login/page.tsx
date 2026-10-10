"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/modules/auth/authContext";
import { SeasonalCanvas } from "@/modules/seasonal-effects/SeasonalCanvas";
import { useTheme } from "@/modules/theme-engine/themeContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { currentTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/overview");
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Layer 0: Epic Thematic Scenic Wallpaper */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out transform scale-100"
        style={{
          backgroundImage: `url('${currentTheme.bgImage || "/images/spring-blossom.jpg"}')`,
        }}
      >
        {/* Cinematic dark vignette backdrop */}
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
      </div>

      {/* Layer 1: Floating Seasonal Particles */}
      <SeasonalCanvas />

      {/* Layer 2: High-End Frosted Glass Login Window */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-500 bg-slate-950/80 backdrop-blur-2xl">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center">
            <div className="h-full w-full rounded-2xl bg-slate-950/40 flex items-center justify-center">
              <Cloud className="h-7 w-7 text-white fill-white/20 animate-pulse" />
            </div>
          </div>

          <div className="pt-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              DataVault
              <span className="text-sky-400 font-extrabold text-xs uppercase px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30">
                Hub
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Cổng Đăng Nhập Hệ Thống Quản Lý Dữ Liệu
            </p>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
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
                placeholder="Nhập tên tài khoản..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-slate-500 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
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
                placeholder="Nhập mật khẩu của bạn..."
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
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span className="text-[11px]">Ghi nhớ phiên làm việc</span>
            </label>

            <span className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer">
              Bảo mật hệ thống
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập vào Hệ thống</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Certificate Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Mã hóa SSL/TLS &bull; DataVault Hub Security</span>
        </div>
      </div>
    </div>
  );
}
