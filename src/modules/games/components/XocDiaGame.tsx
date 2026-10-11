"use client";

import React, { useState } from "react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";
import { Sparkles, RotateCcw, Crown } from "lucide-react";

type XocDiaBetZone = "chan" | "le" | "tu_do" | "tu_trang" | "ba_do" | "ba_trang";

export function XocDiaGame() {
  const { coins, addCoins, deductCoins, xocDiaRiggedOutcome, setXocDiaRiggedOutcome } = useGames();
  const { isAdmin } = useAuth();

  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [bets, setBets] = useState<Record<XocDiaBetZone, number>>({
    chan: 0,
    le: 0,
    tu_do: 0,
    tu_trang: 0,
    ba_do: 0,
    ba_trang: 0,
  });

  // 4 coins: true = Red (Đỏ), false = White (Trắng)
  const [coinsState, setCoinsState] = useState<[boolean, boolean, boolean, boolean]>([true, false, true, false]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ redCount: number; isChan: boolean }>>([
    { redCount: 2, isChan: true },
    { redCount: 3, isChan: false },
    { redCount: 4, isChan: true },
    { redCount: 1, isChan: false },
    { redCount: 2, isChan: true },
  ]);
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [roundId, setRoundId] = useState<number>(7701);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const handlePlaceBet = (zone: XocDiaBetZone) => {
    if (isShaking || countdown <= 3) return;
    if (coins < selectedChip) {
      alert("Bạn không đủ Xu để đặt cược thêm!");
      return;
    }
    if (deductCoins(selectedChip)) {
      setBets((prev) => ({
        ...prev,
        [zone]: prev[zone] + selectedChip,
      }));
    }
  };

  const handleClearBets = () => {
    if (isShaking || totalBet === 0 || countdown <= 3) return;
    addCoins(totalBet, "Hủy cược xóc đĩa");
    setBets({ chan: 0, le: 0, tu_do: 0, tu_trang: 0, ba_do: 0, ba_trang: 0 });
  };

  const executeShake = () => {
    setIsShaking(true);
    setIsCovered(true);
    setResultMsg(null);

    setTimeout(() => {
      let newCoins: [boolean, boolean, boolean, boolean];
      if (xocDiaRiggedOutcome === "chan") {
        newCoins = [true, false, true, false]; // 2 Đỏ 2 Trắng (Chẵn)
      } else if (xocDiaRiggedOutcome === "le") {
        newCoins = [true, true, true, false]; // 3 Đỏ 1 Trắng (Lẻ)
      } else if (xocDiaRiggedOutcome === "tu_do") {
        newCoins = [true, true, true, true]; // Tứ Đỏ
      } else if (xocDiaRiggedOutcome === "tu_trang") {
        newCoins = [false, false, false, false]; // Tứ Trắng
      } else {
        const c1 = Math.random() < 0.5;
        const c2 = Math.random() < 0.5;
        const c3 = Math.random() < 0.5;
        const c4 = Math.random() < 0.5;
        newCoins = [c1, c2, c3, c4];
      }

      const redCount = newCoins.filter(Boolean).length;
      const isChan = redCount % 2 === 0;

      setCoinsState(newCoins);
      setIsShaking(false);

      setTimeout(() => {
        setIsCovered(false);

        let winAmount = 0;
        let wonItems: string[] = [];

        // Chẵn / Lẻ
        if (isChan && bets.chan > 0) {
          const w = bets.chan * 1.96;
          winAmount += w;
          wonItems.push(`Chẵn (+${Math.round(w).toLocaleString()})`);
        } else if (!isChan && bets.le > 0) {
          const w = bets.le * 1.96;
          winAmount += w;
          wonItems.push(`Lẻ (+${Math.round(w).toLocaleString()})`);
        }

        // Tứ đỏ (4 Red)
        if (redCount === 4 && bets.tu_do > 0) {
          const w = bets.tu_do * 12;
          winAmount += w;
          wonItems.push(`Tứ Đỏ x12 (+${Math.round(w).toLocaleString()})`);
        }

        // Tứ trắng (4 White)
        if (redCount === 0 && bets.tu_trang > 0) {
          const w = bets.tu_trang * 12;
          winAmount += w;
          wonItems.push(`Tứ Trắng x12 (+${Math.round(w).toLocaleString()})`);
        }

        // 3 Đỏ 1 Trắng
        if (redCount === 3 && bets.ba_do > 0) {
          const w = bets.ba_do * 3.5;
          winAmount += w;
          wonItems.push(`3 Đỏ 1 Trắng (+${Math.round(w).toLocaleString()})`);
        }

        // 3 Trắng 1 Đỏ
        if (redCount === 1 && bets.ba_trang > 0) {
          const w = bets.ba_trang * 3.5;
          winAmount += w;
          wonItems.push(`3 Trắng 1 Đỏ (+${Math.round(w).toLocaleString()})`);
        }

        if (winAmount > 0) {
          addCoins(Math.round(winAmount), "Thắng Xóc Đĩa");
          setResultMsg(`🎉 THẮNG LỚN: +${Math.round(winAmount).toLocaleString()} Xu! (${wonItems.join(", ")})`);
        } else if (totalBet > 0) {
          setResultMsg(`Kết quả: ${redCount} Đỏ - ${4 - redCount} Trắng (${isChan ? "CHẴN" : "LẺ"}).`);
        } else {
          setResultMsg(`Phiên #${roundId} xong: ${redCount} Đỏ - ${4 - redCount} Trắng (${isChan ? "CHẴN" : "LẺ"}).`);
        }

        setHistory((prev) => [{ redCount, isChan }, ...prev.slice(0, 15)]);
      }, 800);
    }, 1200);
  };

  // Continuous 10s auto-run loop
  React.useEffect(() => {
    if (!autoRun) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 4) {
          executeShake();
          return 3;
        }
        if (prev <= 1) {
          setRoundId((r) => r + 1);
          setBets({ chan: 0, le: 0, tu_do: 0, tu_trang: 0, ba_do: 0, ba_trang: 0 });
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, bets, coins, xocDiaRiggedOutcome, roundId]);

  const handleShake = () => {
    if (isShaking) return;
    executeShake();
  };

  const currentRedCount = coinsState.filter(Boolean).length;
  const currentIsChan = currentRedCount % 2 === 0;

  return (
    <div className="space-y-6">
      {/* SECRET ADMIN GOD-MODE (Chỉ Admin mới nhìn thấy) */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ADMIN GOD-MODE (ẨN VỚI THÀNH VIÊN):</span>
            <span className="text-muted-foreground font-normal">Thao túng 4 đồng xu ván tới</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-rose-500/30">
            {[
              { id: "random", label: "🎲 Tự Nhiên" },
              { id: "chan", label: "🔴 Ép CHẴN (2-2)" },
              { id: "le", label: "⚪ Ép LẺ (3-1)" },
              { id: "tu_do", label: "⚡ TỨ ĐỎ x12" },
              { id: "tu_trang", label: "⚡ TỨ TRẮNG x12" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setXocDiaRiggedOutcome(mode.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  xocDiaRiggedOutcome === mode.id
                    ? "bg-rose-500 text-white shadow font-black"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header & Bảng Vị */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-rose-400 flex items-center gap-2">
            ⚪🔴 XÓC ĐĨA DÂN GIAN 4 ĐỒNG XU
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Tứ Tử x12
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            4 đồng xu hai màu Đỏ/Trắng. Đặt Chẵn (2Đ-2T, 4Đ, 4T), Lẻ (3Đ-1T, 1Đ-3T) hoặc cược Vị đặc biệt!
          </p>
        </div>

        {/* Lịch sử bảng vị */}
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Vị:</span>
          {history.slice(0, 10).map((h, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                h.isChan
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-700 text-slate-200 border border-slate-500"
              }`}
              title={`${h.redCount} Đỏ - ${4 - h.redCount} Trắng`}
            >
              {h.isChan ? "C" : "L"}
            </div>
          ))}
        </div>
      </div>

      {/* 10s Auto-Run Live Round Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300">
            Phiên <strong className="text-white font-mono">#{roundId}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                countdown > 3
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-bounce"
              }`}
            >
              ⏱️ {countdown}s ({countdown > 3 ? "🟢 Đang đặt cược" : "🔴 Đóng cược & Mở đĩa"})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              autoRun
                ? "bg-emerald-600 text-white shadow"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {autoRun ? "⚡ Tự động 10s: BẬT" : "Tự động 10s: TẮT"}
          </button>
        </div>
      </div>

      {/* Arena Bát Xóc Đĩa */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-red-950/60 via-slate-950/90 to-black/90 border border-rose-500/20 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-amber-700/40 via-slate-900 to-amber-950/90 border-4 border-amber-600/40 p-4 shadow-2xl flex items-center justify-center relative">
            <div className="w-full h-full rounded-full bg-stone-900 border-2 border-amber-500/30 flex items-center justify-center relative">
              {isCovered ? (
                <div
                  className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-stone-800 via-stone-700 to-stone-900 border-4 border-amber-400/50 shadow-2xl flex flex-col items-center justify-center text-amber-200 font-black cursor-pointer ${
                    isShaking ? "animate-bounce" : ""
                  }`}
                >
                  <Sparkles className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="text-sm tracking-wider uppercase mt-1">Đang Xóc Đĩa...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-4 animate-in zoom-in-75 duration-300">
                  {coinsState.map((isRed, idx) => (
                    <div
                      key={idx}
                      className={`w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center ${
                        isRed
                          ? "bg-gradient-to-br from-red-500 to-rose-700 border-red-300 shadow-rose-900/60"
                          : "bg-gradient-to-br from-slate-100 to-slate-300 border-white text-slate-800 shadow-slate-950/40"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-black/20" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kết quả chữ to */}
        {!isCovered && (
          <div className="mt-2 animate-in fade-in">
            <span
              className={`text-2xl font-black px-4 py-1.5 rounded-2xl ${
                currentIsChan
                  ? "bg-rose-600/30 text-rose-300 border border-rose-500/50"
                  : "bg-sky-600/30 text-sky-300 border border-sky-500/50"
              }`}
            >
              {currentRedCount} ĐỎ - {4 - currentRedCount} TRẮNG ({currentIsChan ? "CHẴN" : "LẺ"})
            </span>
          </div>
        )}

        {resultMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-bold">
            {resultMsg}
          </div>
        )}
      </div>

      {/* Bàn Cược Xóc Đĩa */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* CHẴN */}
        <button
          onClick={() => handlePlaceBet("chan")}
          disabled={isShaking}
          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.chan > 0
              ? "bg-rose-600/20 border-rose-500 ring-2 ring-rose-500"
              : "glass-card border-white/10 hover:border-rose-500/50"
          }`}
        >
          <span className="text-2xl font-black text-rose-400">CHẴN</span>
          <span className="text-xs text-muted-foreground mt-0.5">4 Đỏ, 4 Trắng, 2Đ-2T</span>
          <span className="text-xs font-bold text-rose-300 mt-0.5">Ăn 1:0.96</span>
          {bets.chan > 0 && (
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
              {bets.chan.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* LẺ */}
        <button
          onClick={() => handlePlaceBet("le")}
          disabled={isShaking}
          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.le > 0
              ? "bg-sky-600/20 border-sky-500 ring-2 ring-sky-500"
              : "glass-card border-white/10 hover:border-sky-500/50"
          }`}
        >
          <span className="text-2xl font-black text-sky-400">LẺ</span>
          <span className="text-xs text-muted-foreground mt-0.5">3 Đỏ 1 Trắng, 1 Đỏ 3 Trắng</span>
          <span className="text-xs font-bold text-sky-300 mt-0.5">Ăn 1:0.96</span>
          {bets.le > 0 && (
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-xs font-black">
              {bets.le.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* TỨ ĐỎ */}
        <button
          onClick={() => handlePlaceBet("tu_do")}
          disabled={isShaking}
          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.tu_do > 0
              ? "bg-amber-600/20 border-amber-500 ring-2 ring-amber-500"
              : "glass-card border-white/10 hover:border-amber-500/50"
          }`}
        >
          <span className="text-lg font-black text-amber-400">🔴 TỨ ĐỎ (4 Đỏ)</span>
          <span className="text-xs font-bold text-amber-300 mt-0.5">ĂN x12</span>
          {bets.tu_do > 0 && (
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black">
              {bets.tu_do.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* TỨ TRẮNG */}
        <button
          onClick={() => handlePlaceBet("tu_trang")}
          disabled={isShaking}
          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.tu_trang > 0
              ? "bg-amber-600/20 border-amber-500 ring-2 ring-amber-500"
              : "glass-card border-white/10 hover:border-amber-500/50"
          }`}
        >
          <span className="text-lg font-black text-slate-200">⚪ TỨ TRẮNG (4 Trắng)</span>
          <span className="text-xs font-bold text-amber-300 mt-0.5">ĂN x12</span>
          {bets.tu_trang > 0 && (
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black">
              {bets.tu_trang.toLocaleString()} Xu
            </div>
          )}
        </button>
      </div>

      {/* Chip selector & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Mức cược:</span>
          {[1000, 5000, 10000, 50000, 100000].map((val) => (
            <button
              key={val}
              onClick={() => setSelectedChip(val)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                selectedChip === val
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              }`}
            >
              {val >= 1000 ? `${val / 1000}K` : val}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {totalBet > 0 && (
            <button
              onClick={handleClearBets}
              disabled={isShaking || countdown <= 3}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Hủy Cược ({totalBet.toLocaleString()})
            </button>
          )}

          <button
            onClick={handleShake}
            disabled={isShaking || countdown <= 3}
            className="px-6 py-2.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:opacity-95 shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isShaking
              ? "ĐANG XÓC..."
              : countdown <= 3
              ? "ĐANG MỞ ĐĨA..."
              : "XÓC & MỞ ĐĨA"}
          </button>
        </div>
      </div>
    </div>
  );
}
