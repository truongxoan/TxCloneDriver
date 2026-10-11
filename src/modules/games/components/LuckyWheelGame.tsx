"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";
import {
  Sparkles,
  Crown,
  Trophy,
  Coins,
  Ticket,
  Clock,
  RotateCw,
  Gift,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WheelSlice {
  id: number;
  label: string;
  coinsReward: number;
  color: string;
  isJackpot?: boolean;
}

const SLICES: WheelSlice[] = [
  { id: 0, label: "5,000 Xu", coinsReward: 5000, color: "#3b82f6" },
  { id: 1, label: "25,000 Xu", coinsReward: 25000, color: "#8b5cf6" },
  { id: 2, label: "10,000 Xu", coinsReward: 10000, color: "#ec4899" },
  { id: 3, label: "50,000 Xu", coinsReward: 50000, color: "#f59e0b" },
  { id: 4, label: "100,000 Xu", coinsReward: 100000, color: "#10b981" },
  { id: 5, label: "👑 VIP JACKPOT", coinsReward: 500000, color: "#ef4444", isJackpot: true },
  { id: 6, label: "5,000 Xu", coinsReward: 5000, color: "#06b6d4" },
  { id: 7, label: "20,000 Xu", coinsReward: 20000, color: "#6366f1" },
];

export function LuckyWheelGame() {
  const { coins, addCoins, deductCoins } = useGames();
  const { isAdmin } = useAuth();

  // Wheel state
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(1);

  // Admin rigged state
  const [riggedSliceIndex, setRiggedSliceIndex] = useState<number | null>(null);
  const [riggedJackpotNumber, setRiggedJackpotNumber] = useState<string>("88");

  // Mini Jackpot State
  const [jackpotPool, setJackpotPool] = useState<number>(2850000);
  const [chosenNumber, setChosenNumber] = useState<string>("");
  const [myTickets, setMyTickets] = useState<string[]>(["28", "88"]);
  const [jackpotMsg, setJackpotMsg] = useState<string | null>(null);

  // Check daily free spin from localStorage
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const lastSpin = localStorage.getItem("txclonedriver_last_free_spin");
      if (lastSpin === today) {
        setFreeSpinsLeft(0);
      } else {
        setFreeSpinsLeft(1);
      }
    } catch {}
  }, []);

  // Spin Wheel Action
  const handleSpin = () => {
    if (isSpinning) return;

    if (freeSpinsLeft <= 0) {
      if (coins < 10000) {
        alert("Bạn đã hết lượt quay miễn phí hôm nay và không đủ 10,000 Xu để mua thêm lượt!");
        return;
      }
      if (!confirm("Dùng 10,000 Xu để mua thêm 1 lượt quay may mắn?")) return;
      deductCoins(10000);
    } else {
      setFreeSpinsLeft(0);
      try {
        localStorage.setItem("txclonedriver_last_free_spin", new Date().toDateString());
      } catch {}
    }

    setIsSpinning(true);
    setSpinResult(null);

    // Determine target slice (Rigged or Random)
    const targetSlice =
      riggedSliceIndex !== null
        ? riggedSliceIndex
        : Math.floor(Math.random() * SLICES.length);

    const sliceAngle = 360 / SLICES.length;
    // Rotate 5 full turns (1800 deg) + target angle
    const targetAngle = 1800 + (360 - targetSlice * sliceAngle - sliceAngle / 2);
    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SLICES[targetSlice];
      addCoins(prize.coinsReward, "Trúng Vòng Quay May Mắn");
      setSpinResult(`🎉 CHÚC MỪNG: Bạn đã trúng ${prize.label}! (+${prize.coinsReward.toLocaleString()} Xu)`);
    }, 4000);
  };

  // Buy Jackpot Ticket
  const handleBuyTicket = () => {
    if (!chosenNumber || chosenNumber.length !== 2) {
      alert("Vui lòng nhập số may mắn 2 chữ số (00 - 99)!");
      return;
    }

    if (coins < 5000) {
      alert("Bạn cần 5,000 Xu để mua 1 vé Xổ Số Thần Tài!");
      return;
    }

    if (deductCoins(5000)) {
      setMyTickets([...myTickets, chosenNumber]);
      setJackpotPool((prev) => prev + 5000);
      setJackpotMsg(`✅ Đã mua vé số #${chosenNumber} thành công! Chờ mở thưởng lúc 18:30.`);
      setChosenNumber("");
    }
  };

  // Simulate Instant Draw for demonstration
  const handleDrawJackpot = () => {
    const winningNum =
      isAdmin && riggedJackpotNumber
        ? riggedJackpotNumber
        : String(Math.floor(Math.random() * 100)).padStart(2, "0");

    const isWon = myTickets.includes(winningNum);
    if (isWon) {
      addCoins(jackpotPool, "Trúng Độc Đắc Xổ Số Jackpot");
      setJackpotMsg(
        `🎊 NỔ HŨ TOÀN SERVER: Con số #${winningNum} đã TRÚNG ĐỘC ĐẮC! Bạn nhận trọn ${jackpotPool.toLocaleString()} Xu!`
      );
      setJackpotPool(500000);
    } else {
      setJackpotMsg(`Kết quả kỳ này về con số: #${winningNum}. Rất tiếc bạn chưa trúng! Tiền thưởng cộng dồn.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-rose-950/40 relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5 mb-2">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              Daily Lucky Wheel & Mega Jackpot 18:30
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Vòng Quay May Mắn & Xổ Số Jackpot
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Quay miễn phí mỗi ngày trúng đến 500.000 Xu và tham gia Xổ Số Thần Tài tích lũy hàng triệu Xu mở thưởng hàng ngày!
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center gap-3 shadow-xl">
            <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                Hũ Độc Đắc Tích Lũy
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {jackpotPool.toLocaleString()} <span className="text-xs text-amber-200">XU</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Admin Rigged Panel */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ADMIN RIGGED WHEEL & JACKPOT:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={riggedSliceIndex ?? ""}
              onChange={(e) =>
                setRiggedSliceIndex(e.target.value === "" ? null : Number(e.target.value))
              }
              className="bg-black/60 border border-rose-500/30 rounded-xl px-2.5 py-1 text-xs text-rose-200"
            >
              <option value="">🎲 Vòng quay tự nhiên</option>
              <option value="5">🔥 Ép trúng 500K Xu VIP</option>
              <option value="4">⭐ Ép trúng 100K Xu</option>
              <option value="3">⚡ Ép trúng 50K Xu</option>
            </select>

            <span className="text-muted-foreground">| Số Jackpot:</span>
            <input
              type="text"
              maxLength={2}
              value={riggedJackpotNumber}
              onChange={(e) => setRiggedJackpotNumber(e.target.value)}
              className="w-12 bg-black/60 border border-rose-500/30 rounded-xl px-2 py-1 text-center font-mono font-bold text-amber-300"
            />
          </div>
        </div>
      )}

      {/* GRID: LUCKY WHEEL (LEFT) & MINI JACKPOT (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* SECTION 1: LUCKY WHEEL */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between w-full border-b border-white/10 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Vòng Quay Thần Tài
            </h3>
            <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              {freeSpinsLeft > 0 ? "🟢 1 Lượt Miễn Phí" : "10,000 Xu / lượt"}
            </span>
          </div>

          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2">
            {/* Pointer / Needle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 filter drop-shadow(0 2px 8px rgba(245,158,11,0.8))" />

            {/* Rotating Wheel Circle */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl overflow-hidden relative transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                background:
                  "conic-gradient(#ef4444 0deg 45deg, #f59e0b 45deg 90deg, #10b981 90deg 135deg, #3b82f6 135deg 180deg, #8b5cf6 180deg 225deg, #ec4899 225deg 270deg, #06b6d4 270deg 315deg, #6366f1 315deg 360deg)",
              }}
            >
              {SLICES.map((s, idx) => {
                const angle = (360 / SLICES.length) * idx + 22.5;
                return (
                  <div
                    key={s.id}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-bottom text-center text-white font-black text-[11px] drop-shadow-md select-none"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-85px)`,
                    }}
                  >
                    {s.label}
                  </div>
                );
              })}

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center text-amber-400 font-black text-xs shadow-xl">
                TX
              </div>
            </div>
          </div>

          {/* Result Alert */}
          {spinResult && (
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold animate-in fade-in">
              {spinResult}
            </div>
          )}

          {/* Spin Trigger Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
            {isSpinning ? "ĐANG QUAY..." : freeSpinsLeft > 0 ? "QUAY MIỄN PHÍ NGAY!" : "QUAY (10,000 XU)"}
          </button>
        </div>

        {/* SECTION 2: MINI JACKPOT */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-rose-400" />
              Xổ Số Thần Tài (Mini Jackpot)
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Mở thưởng 18:30
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Chọn 2 Số May Mắn (00 - 99):
            </span>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={2}
                placeholder="Ví dụ: 88"
                value={chosenNumber}
                onChange={(e) => setChosenNumber(e.target.value)}
                className="w-28 text-center text-xl font-mono font-black py-2 rounded-xl bg-black/60 border border-white/15 text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleBuyTicket}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Mua Vé Số (5,000 Xu)
              </button>
            </div>
          </div>

          {/* My Tickets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase block">
              Vé Của Bạn Hôm Nay ({myTickets.length} vé):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {myTickets.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-sm"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Jackpot Status */}
          {jackpotMsg && (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-xs text-amber-200 font-semibold">
              {jackpotMsg}
            </div>
          )}

          {/* Test Draw Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Demo Quay Số Thử:</span>
            <button
              onClick={handleDrawJackpot}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold border border-white/10"
            >
              🎲 Mở Thưởng Thử Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
