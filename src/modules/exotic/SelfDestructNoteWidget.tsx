"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Lock,
  Unlock,
  Key,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function SelfDestructNoteWidget() {
  const [mode, setMode] = useState<"create" | "read" | "destroyed">("create");
  const [noteTitle, setNoteTitle] = useState("Kế hoạch Mật Lệnh TxLab 2026");
  const [noteContent, setNoteContent] = useState(
    "Chào bạn! Đây là bức thư bảo mật cấp cao. Mật khẩu két sắt Master PIN là: 080497. Bức thư này sẽ kích hoạt cơ chế tự hủy trong 60 giây ngay sau khi mở khóa. Đừng chia sẻ cho bất kỳ ai!"
  );
  const [pinCode, setPinCode] = useState("080497");
  const [inputPin, setInputPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [pinError, setPinError] = useState(false);

  // Countdown timer when unlocked
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUnlocked && mode === "read" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleSelfDestruct();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isUnlocked, mode, countdown]);

  const handleUnlock = () => {
    if (inputPin.trim() === pinCode.trim()) {
      setIsUnlocked(true);
      setPinError(false);
      setCountdown(60);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2500);
    }
  };

  const handleSelfDestruct = () => {
    setMode("destroyed");
    setIsUnlocked(false);
    setNoteContent("");
    setInputPin("");
  };

  const handleReset = () => {
    setMode("create");
    setIsUnlocked(false);
    setCountdown(60);
    setNoteContent(
      "Chào bạn! Đây là bức thư bảo mật cấp cao. Mật mã két sắt Master PIN là: 080497. Bức thư này sẽ kích hoạt cơ chế tự hủy trong 60 giây ngay sau khi mở khóa!"
    );
  };

  return (
    <Card className="p-6 sm:p-8 bg-slate-900/60 border-rose-500/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Bức Thư Mật Tự Hủy Sau 60 Giây (Burn Note)
            </h3>
            <p className="text-xs text-muted-foreground">
              Công nghệ truyền tin bí mật tự thiêu hủy sau khi đọc, không lưu vết trên máy chủ
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-xs px-3 py-1 font-mono font-bold shrink-0",
            mode === "destroyed"
              ? "border-slate-700 text-slate-500 bg-black/60"
              : isUnlocked
              ? "border-rose-500 text-rose-400 bg-rose-500/10 animate-pulse"
              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
          )}
        >
          {mode === "destroyed"
            ? "💀 ĐÃ TỰ HỦY"
            : isUnlocked
            ? `🔥 TỰ HỦY TRONG ${countdown}S`
            : "🔐 ĐANG KHÓA MẬT MÃ"}
        </Badge>
      </div>

      {/* STATE 1: CREATE MODE */}
      {mode === "create" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tiêu Đề Thư Mật:
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nội Dung Mật (Sẽ Tự Hủy Sau 60 Giây Khi Mở Khóa):
            </label>
            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 resize-none font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300">Mã PIN mở khóa:</span>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-24 px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 text-amber-300 font-mono text-xs text-center font-bold"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setMode("read")}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold gap-2 text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Khóa & Tạo Thư Mật Điệp Viên</span>
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: READ MODE */}
      {mode === "read" && (
        <div className="space-y-4">
          {!isUnlocked ? (
            /* PIN LOCKED SCREEN */
            <div className="p-6 rounded-2xl bg-black/50 border border-white/10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{noteTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Nhập mật mã để đọc. Ngay khi mở, đồng hồ 60 giây sẽ đếm ngược để tự hủy bức thư!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="password"
                  placeholder="Nhập mã PIN..."
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-center font-mono font-bold text-sm w-36 focus:outline-none focus:border-amber-400"
                />
                <Button variant="primary" size="sm" onClick={handleUnlock}>
                  Mở Khóa
                </Button>
              </div>

              {pinError && (
                <div className="text-xs text-rose-400 font-bold animate-shake">
                  ❌ Mật mã không đúng! Vui lòng thử lại.
                </div>
              )}
            </div>
          ) : (
            /* UNLOCKED & COUNTDOWN RUNNING */
            <div className="space-y-4">
              {/* Progress Countdown Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 animate-bounce" />
                    Cơ chế tự hủy đang đếm ngược:
                  </span>
                  <span className="text-xl font-black text-rose-400 font-mono">
                    00:{String(countdown).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Note Content Display */}
              <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/30 text-rose-100 text-xs font-mono leading-relaxed space-y-2 relative overflow-hidden">
                <div className="font-bold text-amber-300 text-sm">{noteTitle}</div>
                <div className="whitespace-pre-wrap">{noteContent}</div>
              </div>

              {/* Self Destruct Manual Action */}
              <div className="flex items-center justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleSelfDestruct}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold gap-1.5 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Kích Hoạt Tự Hủy Ngay Lập Tức</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: DESTROYED MODE */}
      {mode === "destroyed" && (
        <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto">
            <Flame className="w-8 h-8 opacity-40" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-400 uppercase tracking-widest">
              Bức Thư Đã Tự Hủy Hoàn Toàn!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nội dung bức thư mật đã bị xóa sạch khỏi bộ nhớ và không thể khôi phục lại.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tạo Bức Thư Mật Mới</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
