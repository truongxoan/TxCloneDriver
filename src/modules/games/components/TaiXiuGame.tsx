"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { Sparkles, RotateCcw, Volume2, VolumeX, Flame } from "lucide-react";

type BetZone = "tai" | "xiu" | "chan" | "le" | "bao";

interface BetPlaced {
  zone: BetZone;
  amount: number;
}

export function TaiXiuGame() {
  const { coins, addCoins, deductCoins } = useGames();

  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [bets, setBets] = useState<Record<BetZone, number>>({
    tai: 0,
    xiu: 0,
    chan: 0,
    le: 0,
    bao: 0,
  });

  const [dice, setDice] = useState<[number, number, number]>([3, 4, 4]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isBowlCovered, setIsBowlCovered] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ sum: number; isTai: boolean; dice: [number, number, number] }>>([
    { sum: 11, isTai: true, dice: [3, 4, 4] },
    { sum: 8, isTai: false, dice: [1, 2, 5] },
    { sum: 14, isTai: true, dice: [4, 5, 5] },
    { sum: 9, isTai: false, dice: [2, 3, 4] },
    { sum: 15, isTai: true, dice: [5, 5, 5] },
  ]);
  const [lastWinMessage, setLastWinMessage] = useState<string | null>(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const handlePlaceBet = (zone: BetZone) => {
    if (isRolling) return;
    if (coins < selectedChip) {
      alert("Bạn không đủ Xu để đặt cược thêm!");
      return;
    }
    if (deductCoins(selectedChip)) {
      setBets((prev) => ({
        ...prev,
        zone,
        [zone]: prev[zone] + selectedChip,
      }));
    }
  };

  const handleClearBets = () => {
    if (isRolling || totalBet === 0) return;
    addCoins(totalBet, "Hủy cược");
    setBets({ tai: 0, xiu: 0, chan: 0, le: 0, bao: 0 });
  };

  const handleRoll = () => {
    if (isRolling) return;
    if (totalBet === 0) {
      alert("Vui lòng đặt cược trước khi lắc xúc xắc!");
      return;
    }

    setIsRolling(true);
    setIsBowlCovered(true);
    setLastWinMessage(null);

    // Roll animation delay
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2 + d3;
      const isTriple = d1 === d2 && d2 === d3;
      const isTai = sum >= 11 && sum <= 17;
      const isEven = sum % 2 === 0;

      setDice([d1, d2, d3]);
      setIsRolling(false);

      // Automatic open or wait for user to open
      setTimeout(() => {
        setIsBowlCovered(false);

        // Calculate payout
        let totalWin = 0;
        let details: string[] = [];

        // Tài / Xỉu
        if (isTai && bets.tai > 0) {
          const win = bets.tai * 2;
          totalWin += win;
          details.push(`Tài (+${win.toLocaleString()})`);
        } else if (!isTai && bets.xiu > 0) {
          const win = bets.xiu * 2;
          totalWin += win;
          details.push(`Xỉu (+${win.toLocaleString()})`);
        }

        // Chẵn / Lẻ
        if (isEven && bets.chan > 0) {
          const win = bets.chan * 1.95;
          totalWin += win;
          details.push(`Chẵn (+${Math.round(win).toLocaleString()})`);
        } else if (!isEven && bets.le > 0) {
          const win = bets.le * 1.95;
          totalWin += win;
          details.push(`Lẻ (+${Math.round(win).toLocaleString()})`);
        }

        // Bão (Bộ 3 giống nhau)
        if (isTriple && bets.bao > 0) {
          const win = bets.bao * 30;
          totalWin += win;
          details.push(`BÃO x30 (+${win.toLocaleString()})`);
        }

        if (totalWin > 0) {
          addCoins(Math.round(totalWin), "Thắng Tài Xỉu");
          setLastWinMessage(`🎉 THẮNG LỚN: +${Math.round(totalWin).toLocaleString()} Xu! (${details.join(", ")})`);
        } else {
          setLastWinMessage(`Rất tiếc! Kết quả: ${sum} điểm (${isTai ? "TÀI" : "XỈU"}). Chúc bạn may mắn lần sau!`);
        }

        // Save history
        setHistory((prev) => [{ sum, isTai, dice: [d1, d2, d3] }, ...prev.slice(0, 19)]);
        // Reset bets
        setBets({ tai: 0, xiu: 0, chan: 0, le: 0, bao: 0 });
      }, 1200);
    }, 1500);
  };

  const currentSum = dice[0] + dice[1] + dice[2];

  return (
    <div className="space-y-6">
      {/* Table Header & Soi Cầu */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            🎲 TÀI XỈU SIC BO 3D
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Tỷ lệ 1:1
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng 3 xúc xắc từ 11 - 17 là TÀI, từ 4 - 10 là XỈU. Bão bộ 3 ăn x30!
          </p>
        </div>

        {/* Lịch sử soi cầu */}
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Cầu:</span>
          {history.slice(0, 12).map((h, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                h.isTai
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-500/50"
                  : "bg-slate-800 text-slate-200 border border-slate-600 shadow-sm"
              }`}
              title={`${h.sum} điểm [${h.dice.join("-")}]`}
            >
              {h.isTai ? "T" : "X"}
            </div>
          ))}
        </div>
      </div>

      {/* Main Dice Arena */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-emerald-950/70 via-slate-950/90 to-black/90 border border-emerald-500/20 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bát Đĩa Lắc 3D */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-amber-600/30 via-slate-900 to-amber-950/80 border-4 border-amber-500/40 p-4 shadow-2xl shadow-amber-950/80 flex items-center justify-center relative">
            {/* Đĩa lót */}
            <div className="w-full h-full rounded-full bg-slate-950 border-2 border-amber-400/20 flex items-center justify-center relative">
              {isBowlCovered ? (
                <div
                  className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-500 to-amber-400 border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-amber-950 font-black cursor-pointer transform ${
                    isRolling ? "animate-bounce" : ""
                  }`}
                >
                  <Sparkles className="w-8 h-8 animate-spin" />
                  <span className="text-sm tracking-wider uppercase mt-1">Đang Lắc...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 animate-in zoom-in-75 duration-300">
                  {dice.map((val, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-slate-950 shadow-xl border-2 border-slate-300 flex items-center justify-center font-black text-2xl relative"
                    >
                      {/* Dice Face Render */}
                      <span className={val === 1 || val === 4 ? "text-rose-600" : "text-slate-900"}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kết quả chữ to */}
        {!isBowlCovered && (
          <div className="mt-2 animate-in fade-in slide-in-from-bottom-2">
            <span
              className={`text-2xl sm:text-3xl font-black px-4 py-1.5 rounded-2xl ${
                currentSum >= 11
                  ? "bg-rose-600/30 text-rose-300 border border-rose-500/50"
                  : "bg-sky-600/30 text-sky-300 border border-sky-500/50"
              }`}
            >
              {currentSum} ĐIỂM — {currentSum >= 11 ? "TÀI (LỚN)" : "XỈU (NHỎ)"}
            </span>
          </div>
        )}

        {/* Thông báo thắng / thua */}
        {lastWinMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-bold animate-in zoom-in-95">
            {lastWinMessage}
          </div>
        )}
      </div>

      {/* Betting Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* TÀI */}
        <button
          onClick={() => handlePlaceBet("tai")}
          disabled={isRolling}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
            bets.tai > 0
              ? "bg-rose-600/20 border-rose-500 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500"
              : "glass-card border-white/10 hover:border-rose-500/50 hover:bg-rose-950/20"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-black text-rose-500 group-hover:scale-110 transition-transform">
            TÀI
          </span>
          <span className="text-xs text-muted-foreground mt-1">11 - 17 Điểm</span>
          <span className="text-xs font-bold text-rose-400 mt-0.5">Ăn 1:1</span>
          {bets.tai > 0 && (
            <div className="mt-2 px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow">
              {bets.tai.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* XỈU */}
        <button
          onClick={() => handlePlaceBet("xiu")}
          disabled={isRolling}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
            bets.xiu > 0
              ? "bg-sky-600/20 border-sky-500 shadow-lg shadow-sky-950/50 ring-2 ring-sky-500"
              : "glass-card border-white/10 hover:border-sky-500/50 hover:bg-sky-950/20"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-black text-sky-400 group-hover:scale-110 transition-transform">
            XỈU
          </span>
          <span className="text-xs text-muted-foreground mt-1">4 - 10 Điểm</span>
          <span className="text-xs font-bold text-sky-300 mt-0.5">Ăn 1:1</span>
          {bets.xiu > 0 && (
            <div className="mt-2 px-2.5 py-1 rounded-full bg-sky-600 text-white text-xs font-black shadow">
              {bets.xiu.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* CHẴN */}
        <button
          onClick={() => handlePlaceBet("chan")}
          disabled={isRolling}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden ${
            bets.chan > 0
              ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500"
              : "glass-card border-white/10 hover:border-purple-500/50"
          }`}
        >
          <span className="text-xl font-black text-purple-300">CHẴN</span>
          <span className="text-xs text-muted-foreground mt-1">4, 6, 8, 10, 12...</span>
          <span className="text-xs font-bold text-purple-400 mt-0.5">Ăn 1:0.95</span>
          {bets.chan > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-black">
              {bets.chan.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* LẺ */}
        <button
          onClick={() => handlePlaceBet("le")}
          disabled={isRolling}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden ${
            bets.le > 0
              ? "bg-teal-600/20 border-teal-500 ring-2 ring-teal-500"
              : "glass-card border-white/10 hover:border-teal-500/50"
          }`}
        >
          <span className="text-xl font-black text-teal-300">LẺ</span>
          <span className="text-xs text-muted-foreground mt-1">5, 7, 9, 11, 13...</span>
          <span className="text-xs font-bold text-teal-400 mt-0.5">Ăn 1:0.95</span>
          {bets.le > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-teal-600 text-white text-xs font-black">
              {bets.le.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* BÃO */}
        <button
          onClick={() => handlePlaceBet("bao")}
          disabled={isRolling}
          className={`col-span-2 md:col-span-1 p-5 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden ${
            bets.bao > 0
              ? "bg-amber-600/30 border-amber-500 ring-2 ring-amber-500"
              : "glass-card border-amber-500/20 hover:border-amber-500/50 bg-amber-950/10"
          }`}
        >
          <span className="text-xl font-black text-amber-400 flex items-center gap-1">
            <Flame className="w-4 h-4" /> BÃO
          </span>
          <span className="text-xs text-muted-foreground mt-1">3 Mặt Giống Nhau</span>
          <span className="text-xs font-black text-amber-300 mt-0.5">ĂN x30</span>
          {bets.bao > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black">
              {bets.bao.toLocaleString()} Xu
            </div>
          )}
        </button>
      </div>

      {/* Chip Selector & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        {/* Chip Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Mức cược:</span>
          {[1000, 5000, 10000, 50000, 100000].map((val) => (
            <button
              key={val}
              onClick={() => setSelectedChip(val)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                selectedChip === val
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              }`}
            >
              {val >= 1000 ? `${val / 1000}K` : val}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {totalBet > 0 && (
            <button
              onClick={handleClearBets}
              disabled={isRolling}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Hủy Cược ({totalBet.toLocaleString()})
            </button>
          )}

          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="px-6 py-2.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isRolling ? "ĐANG XÓC..." : "LẮC & MỞ BÁT"}
          </button>
        </div>
      </div>
    </div>
  );
}
