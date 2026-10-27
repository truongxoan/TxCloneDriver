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
import { cn } from "@/lib/utils";

/** Arc Reactor — vòng năng lượng xoay + lõi phát sáng, thuần CSS/SVG. */
function ArcReactor({ size = 92 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-spin-slower">
        <circle cx="50" cy="50" r="47" fill="none" stroke="#00d9ff" strokeWidth="1.6" strokeOpacity="0.65" strokeDasharray="5 4" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-spin-slow">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#00d9ff" strokeWidth="3.2" strokeOpacity="0.95" strokeDasharray="13 5" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-spin-rev">
        <circle cx="50" cy="50" r="27" fill="none" stroke="#ffb300" strokeWidth="1.6" strokeOpacity="0.8" strokeDasharray="3 5" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="arc-core rounded-full bg-cyan-100"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            boxShadow:
              "0 0 18px 6px rgba(0,217,255,0.85), 0 0 46px 18px rgba(0,217,255,0.35), inset 0 0 8px rgba(255,255,255,0.9)",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

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
        // Server trả về user đã xác thực — dùng luôn, không tra danh sách local.
        router.push(landingPathFor(result.user?.allowedModules, result.user?.role));
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#02070f]">
      {/* ── HUD backdrop ─────────────────────────────── */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(0,217,255,0.17),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_38%_at_92%_108%,rgba(255,179,0,0.09),transparent_60%)]" />
        {/* Arc reactor khổng lồ mờ sau thẻ */}
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] scale-[2.6] sm:scale-[3.4]">
          <ArcReactor size={220} />
        </div>
        {/* Vòng HUD ở hai góc */}
        <svg className="absolute -left-44 -top-44 w-[480px] h-[480px] opacity-[0.12] animate-spin-slower" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="#00d9ff" strokeWidth="0.5" strokeDasharray="4 3" />
          <circle cx="50" cy="50" r="36" stroke="#00d9ff" strokeWidth="0.8" strokeDasharray="10 5" />
        </svg>
        <svg className="absolute -right-40 -bottom-48 w-[520px] h-[520px] opacity-[0.1] animate-spin-rev" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="#00d9ff" strokeWidth="0.5" strokeDasharray="3 5" />
          <circle cx="50" cy="50" r="33" stroke="#ffb300" strokeWidth="0.6" strokeDasharray="2 4" />
        </svg>
        <div className="hud-sweep-line" />
        {/* Sàn lưới 3D */}
        <div className="hud-floor absolute left-[-25%] right-[-25%] bottom-[-6%] h-[300px] opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(1,4,10,0.8)_100%)]" />
      </div>

      <SeasonalCanvas />

      {/* ── Thẻ đăng nhập ────────────────────────────── */}
      <div className="hud-corners relative z-10 w-full max-w-[460px] p-[1px] my-6">
        <div className="rounded-[22px] border border-cyan-300/25 bg-[#030f1c]/90 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_50px_-18px_rgba(0,217,255,0.65)] px-6 py-7 sm:px-8">
          {/* Status strip */}
          <div className="flex items-center justify-between hud-label text-[9px] text-cyan-200/60 mb-5">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              System Online
            </span>
            <span>Arc Reactor · 100%</span>
            <span className="text-amber-400/80">Mark VII</span>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <ArcReactor size={92} />
            <h1 className="hud-title mt-4 text-[22px] sm:text-2xl font-bold text-white">
              TxClone<span className="text-cyan-300">Driver</span>
            </h1>
            <p className="hud-label text-[10px] text-cyan-200/70 mt-2">
              Stark OS // Trung tâm điều khiển
            </p>
            <p className="text-xs text-slate-300 font-medium mt-1.5">
              Drive chung · Xem chung · Ghi chú
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="hud-label text-[10px] text-cyan-100/80 block">Tên tài khoản</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-cyan-300/70 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="username"
                  inputMode="numeric"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: 11"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="hud-label text-[10px] text-cyan-100/80 block">Mật khẩu</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-cyan-300/70 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Thành viên: gõ gì cũng được"
                  className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-cyan-200/60 hover:text-white transition-colors"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-400 bg-[length:180%_100%] hover:bg-right text-[#00131a] font-display font-bold text-[13px] tracking-[0.18em] uppercase shadow-[0_0_28px_-6px_rgba(0,217,255,0.9)] border border-cyan-200/60 flex items-center justify-center gap-2 transition-all duration-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-[#00131a]/30 border-t-[#00131a] rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Kích hoạt hệ thống</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="hud-label text-[10px] text-cyan-200/60 mb-2.5 text-center">
              {"// Nhân sự được ủy quyền //"}
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
                    "py-2 rounded-lg font-mono text-sm font-bold border transition-all active:scale-95",
                    username === name
                      ? "bg-cyan-400 text-[#00131a] border-cyan-200 shadow-[0_0_18px_-2px_rgba(0,217,255,0.9)]"
                      : "bg-cyan-400/5 text-cyan-100/80 border-cyan-300/20 hover:bg-cyan-400/15 hover:text-white hover:border-cyan-300/50"
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

          <div className="mt-5 pt-4 border-t border-cyan-300/15 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><HardDrive className="h-3.5 w-3.5 text-cyan-300" /> Drive</span>
            <span className="flex items-center gap-1"><Users2 className="h-3.5 w-3.5 text-cyan-300" /> Xem chung</span>
            <span className="flex items-center gap-1"><StickyNote className="h-3.5 w-3.5 text-cyan-300" /> Ghi chú</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Bảo mật server</span>
          </div>
        </div>
      </div>
    </div>
  );
}
