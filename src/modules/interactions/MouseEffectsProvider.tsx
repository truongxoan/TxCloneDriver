"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Music,
  Palette,
  Lock,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Sparkles,
  Maximize2,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { useAuth } from "@/modules/auth/authContext";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  alpha: number;
}

export type CursorStyle = "default" | "neon-cross" | "cyber-dot" | "heart" | "sword" | "star";

export function MouseEffectsProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, setThemeId, themeId } = useTheme();
  const { isMaintenanceMode, toggleMaintenanceMode, isAdmin } = useAuth();

  // Custom Cursor Style State (stored in localStorage)
  const [cursorStyle, setCursorStyle] = useState<CursorStyle>("default");
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    try {
      const savedCursor = localStorage.getItem("txclonedriver_cursor_style") as CursorStyle;
      if (savedCursor && ["default", "neon-cross", "cyber-dot", "heart", "sword", "star"].includes(savedCursor)) {
        setCursorStyle(savedCursor);
      }
    } catch {}

    const handleCursorChange = (e: any) => {
      if (e.detail?.style) {
        setCursorStyle(e.detail.style);
      }
    };
    window.addEventListener("tx_cursor_style_change", handleCursorChange);
    return () => window.removeEventListener("tx_cursor_style_change", handleCursorChange);
  }, []);

  const changeCursorStyle = (style: CursorStyle) => {
    setCursorStyle(style);
    try {
      localStorage.setItem("txclonedriver_cursor_style", style);
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tx_cursor_style_change", { detail: { style } }));
    }
  };

  // Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Note Mini Modal State
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState("");
  const [quickNoteSaved, setQuickNoteSaved] = useState(false);

  // Stardust Particle Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef({ x: -100, y: -100 });

  // Handle Right Click (Custom Context Menu)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't override if inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      e.preventDefault();

      // Ensure menu stays within window bounds
      const x = Math.min(e.clientX, window.innerWidth - 240);
      const y = Math.min(e.clientY, window.innerHeight - 340);
      setContextMenuPos({ x, y });
    };

    const handleClickOutside = () => {
      setContextMenuPos(null);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Stardust Particle Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#a855f7", "#ec4899", "#3b82f6", "#06b6d4", "#eab308", "#10b981"];

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });

      // Spawn 1-2 stardust particles on move
      if (Math.random() < 0.45) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 2.5 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5,
          alpha: 1,
        });
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleClick = (e: MouseEvent) => {
      // Spawn ripple particle shockwave on click
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1.5;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          alpha: 1,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.025;
        p.size *= 0.97;

        if (p.alpha <= 0 || p.size <= 0.3) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setContextMenuPos(null);
  };

  const handleSaveQuickNote = () => {
    if (!quickNoteText.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("txclonedriver_quick_notes") || "[]");
      existing.unshift({
        id: `note-${Date.now()}`,
        text: quickNoteText.trim(),
        createdAt: new Date().toLocaleString("vi-VN"),
      });
      localStorage.setItem("txclonedriver_quick_notes", JSON.stringify(existing));
      setQuickNoteSaved(true);
      setTimeout(() => {
        setQuickNoteSaved(false);
        setShowQuickNote(false);
        setQuickNoteText("");
      }, 1000);
    } catch {}
  };

  return (
    <>
      {/* Interactive Stardust Particle Canvas (Pointer events none) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      />

      {/* ========================================================= */}
      {/* CUSTOM CURSOR FOLLOWER & ANIMATED SHAPES                  */}
      {/* ========================================================= */}
      {cursorStyle !== "default" && (
        <div
          className="fixed pointer-events-none z-[99999] transition-transform duration-75 ease-out select-none"
          style={{
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%) scale(${
              isClicking ? 0.8 : 1
            })`,
          }}
        >
          {cursorStyle === "neon-cross" && (
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <div className="absolute h-full w-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <div className="w-2 h-2 rounded-full border border-white bg-cyan-300 shadow-[0_0_10px_#67e8f9] animate-ping" />
            </div>
          )}

          {cursorStyle === "cyber-dot" && (
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_12px_#ec4899] animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-pink-400/60 animate-spin" />
            </div>
          )}

          {cursorStyle === "heart" && (
            <div className="text-xl filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce select-none">
              💖
            </div>
          )}

          {cursorStyle === "sword" && (
            <div className="text-2xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.9)] -rotate-45 select-none">
              🗡️
            </div>
          )}

          {cursorStyle === "star" && (
            <div className="text-xl filter drop-shadow-[0_0_12px_rgba(250,204,21,0.95)] animate-spin select-none">
              ⭐
            </div>
          )}
        </div>
      )}

      {children}

      {/* ========================================================= */}
      {/* CUSTOM DESKTOP RIGHT-CLICK CONTEXT MENU                   */}
      {/* ========================================================= */}
      {contextMenuPos && (
        <div
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-[100] w-56 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 p-1.5 shadow-2xl text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TxCloneDriver Hub Menu
            </span>
            <span className="text-[10px] font-mono text-primary font-bold">
              {currentTheme.nameVi}
            </span>
          </div>

          <div className="space-y-0.5">
            {/* Quick Note */}
            <button
              onClick={() => {
                setShowQuickNote(true);
                setContextMenuPos(null);
              }}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-white/10 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Ghi chú nhanh (Quick Note)</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-white/10 hover:text-white transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copiedLink ? "Đã sao chép link!" : "Sao chép liên kết trang"}</span>
            </button>

            {/* Quick Themes */}
            <div className="pt-1 mt-1 border-t border-white/10">
              <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase">
                Đổi Giao Diện Nhanh:
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                {[
                  { id: "tet-fireworks", label: "🎆 Tết Pháo Hoa" },
                  { id: "deep-space", label: "🌌 Vũ Trụ Sâu" },
                  { id: "mid-autumn", label: "🏮 Trung Thu" },
                  { id: "christmas-magic", label: "🎄 Giáng Sinh" },
                  { id: "bento-grid", label: "🍱 Bento 2.0" },
                  { id: "vision-os", label: "🥽 VisionOS" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setThemeId(th.id as any);
                      setContextMenuPos(null);
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all truncate",
                      themeId === th.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-white/5 hover:bg-white/15 text-slate-300"
                    )}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mouse Cursor Selector */}
            <div className="pt-1 mt-1 border-t border-white/10">
              <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
                <span>Con Trỏ Chuột Tùy Biến:</span>
                <span className="text-[9px] text-primary font-mono">{cursorStyle}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 px-1">
                {[
                  { id: "default", label: "Mặc định" },
                  { id: "neon-cross", label: "⚡ Tâm Ngắm" },
                  { id: "cyber-dot", label: "💎 Cyber" },
                  { id: "heart", label: "💖 Trái Tim" },
                  { id: "sword", label: "🗡️ Kiếm" },
                  { id: "star", label: "⭐ Ngôi Sao" },
                ].map((cur) => (
                  <button
                    key={cur.id}
                    onClick={() => {
                      changeCursorStyle(cur.id as CursorStyle);
                      setContextMenuPos(null);
                    }}
                    className={cn(
                      "px-1.5 py-1 rounded-lg text-[9px] font-bold text-center transition-all truncate",
                      cursorStyle === cur.id
                        ? "bg-accent/30 text-accent border border-accent/40 shadow-sm"
                        : "bg-white/5 hover:bg-white/15 text-slate-300"
                    )}
                  >
                    {cur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reload Page */}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-white/10 hover:text-white transition-colors pt-1.5 mt-1 border-t border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Tải lại trang web</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK NOTE MINI MODAL                                     */}
      {/* ========================================================= */}
      {showQuickNote && (
        <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-5 rounded-3xl border border-white/15 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Ghi Chú Nhanh (Lưu Cục Bộ)</span>
              </div>
              <button
                onClick={() => setShowQuickNote(false)}
                className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Nhập ý tưởng, việc cần làm, ghi chú nhanh bất chợt..."
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {quickNoteSaved ? "✅ Đã lưu thành công!" : "Tự động lưu vào trình duyệt của bạn"}
              </span>
              <button
                onClick={handleSaveQuickNote}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Lưu Ghi Chú
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
