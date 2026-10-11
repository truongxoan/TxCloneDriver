"use client";

import React, { useState } from "react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";
import { Sparkles, RotateCcw, Crown } from "lucide-react";

type BaccaratBet = "player" | "banker" | "tie";

interface Card {
  suit: "♠" | "♥" | "♦" | "♣";
  val: string;
  points: number;
}

const SUITS: Array<"♠" | "♥" | "♦" | "♣"> = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { val: "A", points: 1 },
  { val: "2", points: 2 },
  { val: "3", points: 3 },
  { val: "4", points: 4 },
  { val: "5", points: 5 },
  { val: "6", points: 6 },
  { val: "7", points: 7 },
  { val: "8", points: 8 },
  { val: "9", points: 9 },
  { val: "10", points: 0 },
  { val: "J", points: 0 },
  { val: "Q", points: 0 },
  { val: "K", points: 0 },
];

function drawCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const v = VALUES[Math.floor(Math.random() * VALUES.length)];
  return { suit, val: v.val, points: v.points };
}

function calculateHandScore(cards: Card[]): number {
  const sum = cards.reduce((acc, c) => acc + c.points, 0);
  return sum % 10;
}

export function BaccaratGame() {
  const { coins, addCoins, deductCoins, baccaratRiggedOutcome, setBaccaratRiggedOutcome } = useGames();
  const { isAdmin } = useAuth();

  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [bets, setBets] = useState<Record<BaccaratBet, number>>({
    player: 0,
    banker: 0,
    tie: 0,
  });

  const [playerCards, setPlayerCards] = useState<Card[]>([
    { suit: "♠", val: "8", points: 8 },
    { suit: "♦", val: "K", points: 0 },
  ]);
  const [bankerCards, setBankerCards] = useState<Card[]>([
    { suit: "♥", val: "6", points: 6 },
    { suit: "♣", val: "A", points: 1 },
  ]);

  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<"player" | "banker" | "tie">>([
    "player", "banker", "banker", "player", "tie", "banker"
  ]);
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [roundId, setRoundId] = useState<number>(6601);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const totalBet = bets.player + bets.banker + bets.tie;

  const handlePlaceBet = (zone: BaccaratBet) => {
    if (isDealing || countdown <= 3) return;
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
    if (isDealing || totalBet === 0 || countdown <= 3) return;
    addCoins(totalBet, "Hủy cược Baccarat");
    setBets({ player: 0, banker: 0, tie: 0 });
  };

  const executeDeal = () => {
    setIsDealing(true);
    setResultMsg(null);

    // Initial 2 cards for Player and Banker
    let pHand: Card[];
    let bHand: Card[];

    if (baccaratRiggedOutcome === "player") {
      pHand = [{ suit: "♠", val: "9", points: 9 }, { suit: "♦", val: "K", points: 0 }]; // Natural 9
      bHand = [{ suit: "♥", val: "3", points: 3 }, { suit: "♣", val: "3", points: 3 }]; // 6
    } else if (baccaratRiggedOutcome === "banker") {
      pHand = [{ suit: "♠", val: "2", points: 2 }, { suit: "♦", val: "3", points: 3 }]; // 5
      bHand = [{ suit: "♥", val: "9", points: 9 }, { suit: "♣", val: "K", points: 0 }]; // Natural 9
    } else if (baccaratRiggedOutcome === "tie") {
      pHand = [{ suit: "♠", val: "8", points: 8 }, { suit: "♦", val: "K", points: 0 }]; // Natural 8
      bHand = [{ suit: "♥", val: "8", points: 8 }, { suit: "♣", val: "K", points: 0 }]; // Natural 8
    } else {
      pHand = [drawCard(), drawCard()];
      bHand = [drawCard(), drawCard()];
    }

    setTimeout(() => {
      let pScore = calculateHandScore(pHand);
      let bScore = calculateHandScore(bHand);

      // Check Natural 8 or 9
      const isNatural = pScore >= 8 || bScore >= 8;

      if (!isNatural) {
        // Player draws 3rd card if score <= 5
        let p3: Card | null = null;
        if (pScore <= 5) {
          p3 = drawCard();
          pHand.push(p3);
          pScore = calculateHandScore(pHand);
        }

        // Banker drawing logic based on Player's 3rd card
        if (!p3) {
          // If Player stood with 6 or 7, Banker draws if <= 5
          if (bScore <= 5) {
            bHand.push(drawCard());
            bScore = calculateHandScore(bHand);
          }
        } else {
          // Tableau standard drawing rule
          const p3Val = p3.points;
          let bankerMustDraw = false;
          if (bScore <= 2) bankerMustDraw = true;
          else if (bScore === 3 && p3Val !== 8) bankerMustDraw = true;
          else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bankerMustDraw = true;
          else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bankerMustDraw = true;
          else if (bScore === 6 && [6, 7].includes(p3Val)) bankerMustDraw = true;

          if (bankerMustDraw) {
            bHand.push(drawCard());
            bScore = calculateHandScore(bHand);
          }
        }
      }

      setPlayerCards(pHand);
      setBankerCards(bHand);
      setIsDealing(false);

      // Determine Winner
      let outcome: "player" | "banker" | "tie" = "tie";
      if (pScore > bScore) outcome = "player";
      else if (bScore > pScore) outcome = "banker";

      let winPayout = 0;
      if (outcome === "player" && bets.player > 0) {
        winPayout += bets.player * 2;
      }
      if (outcome === "banker" && bets.banker > 0) {
        winPayout += bets.banker * 1.95; // 5% commission
      }
      if (outcome === "tie" && bets.tie > 0) {
        winPayout += bets.tie * 9; // 1:8 payout + return principal
      }

      // If tie, return Player/Banker bets
      if (outcome === "tie") {
        winPayout += bets.player + bets.banker;
      }

      if (winPayout > 0) {
        addCoins(Math.round(winPayout), "Thắng Baccarat");
        setResultMsg(
          `🎉 THẮNG: +${Math.round(winPayout).toLocaleString()} Xu! (${outcome.toUpperCase()} ${
            outcome === "player" ? pScore : bScore
          } điểm)`
        );
      } else if (totalBet > 0) {
        setResultMsg(
          `Kết thúc ván: Player ${pScore} - Banker ${bScore} (${
            outcome === "tie" ? "HÒA (TIE)" : outcome === "player" ? "PLAYER THẮNG" : "BANKER THẮNG"
          })`
        );
      } else {
        setResultMsg(
          `Phiên #${roundId}: Player ${pScore} - Banker ${bScore} (${
            outcome === "tie" ? "HÒA (TIE)" : outcome === "player" ? "PLAYER THẮNG" : "BANKER THẮNG"
          })`
        );
      }

      setHistory((prev) => [outcome, ...prev.slice(0, 19)]);
    }, 1200);
  };

  // Continuous 10s auto-run loop
  React.useEffect(() => {
    if (!autoRun) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 4) {
          executeDeal();
          return 3;
        }
        if (prev <= 1) {
          setRoundId((r) => r + 1);
          setBets({ player: 0, banker: 0, tie: 0 });
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, bets, coins, baccaratRiggedOutcome, roundId]);

  const handleDeal = () => {
    if (isDealing) return;
    executeDeal();
  };

  const pScoreNow = calculateHandScore(playerCards);
  const bScoreNow = calculateHandScore(bankerCards);

  return (
    <div className="space-y-6">
      {/* SECRET ADMIN GOD-MODE (Chỉ Admin mới nhìn thấy) */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ADMIN GOD-MODE (ẨN VỚI THÀNH VIÊN):</span>
            <span className="text-muted-foreground font-normal">Thao túng ván bài Baccarat</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-indigo-500/30">
            {[
              { id: "random", label: "🎲 Tự Nhiên" },
              { id: "player", label: "🔵 Ép PLAYER THẮNG (9đ)" },
              { id: "banker", label: "🔴 Ép BANKER THẮNG (9đ)" },
              { id: "tie", label: "🟢 Ép TIE HÒA x8 (8-8)" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setBaccaratRiggedOutcome(mode.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  baccaratRiggedOutcome === mode.id
                    ? "bg-indigo-500 text-white shadow font-black"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header & Cầu Baccarat */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2">
            ♠️♥️ BACCARAT CHUẨN QUỐC TẾ
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              Tie Ăn x8
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            So điểm giữa Nhà con (Player) & Nhà cái (Banker). Tự động rút lá thứ 3 theo luật Tableau chuẩn.
          </p>
        </div>

        {/* Lịch sử cầu Baccarat */}
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Cầu:</span>
          {history.slice(0, 12).map((res, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                res === "player"
                  ? "bg-blue-600 text-white"
                  : res === "banker"
                  ? "bg-rose-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
              title={res.toUpperCase()}
            >
              {res === "player" ? "P" : res === "banker" ? "B" : "T"}
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
              ⏱️ {countdown}s ({countdown > 3 ? "🟢 Đang đặt cược" : "🔴 Đóng cược & Chia bài"})
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

      {/* Sân Đấu Chia Bài */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-indigo-950/60 via-slate-950/90 to-black/90 border border-indigo-500/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Player Hand */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-black text-blue-400">PLAYER</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                {pScoreNow} Điểm
              </span>
            </div>

            <div className="flex items-center gap-3 min-h-[90px]">
              {playerCards.map((c, i) => (
                <div
                  key={i}
                  className={`w-16 h-24 rounded-xl bg-white border border-slate-300 shadow-xl flex flex-col justify-between p-2 animate-in zoom-in-75 ${
                    c.suit === "♥" || c.suit === "♦" ? "text-rose-600" : "text-slate-950"
                  }`}
                >
                  <span className="text-sm font-black leading-none">{c.val}</span>
                  <span className="text-2xl self-center leading-none">{c.suit}</span>
                  <span className="text-xs font-bold self-end leading-none">{c.suit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banker Hand */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-black text-rose-400">BANKER</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {bScoreNow} Điểm
              </span>
            </div>

            <div className="flex items-center gap-3 min-h-[90px]">
              {bankerCards.map((c, i) => (
                <div
                  key={i}
                  className={`w-16 h-24 rounded-xl bg-white border border-slate-300 shadow-xl flex flex-col justify-between p-2 animate-in zoom-in-75 ${
                    c.suit === "♥" || c.suit === "♦" ? "text-rose-600" : "text-slate-950"
                  }`}
                >
                  <span className="text-sm font-black leading-none">{c.val}</span>
                  <span className="text-2xl self-center leading-none">{c.suit}</span>
                  <span className="text-xs font-bold self-end leading-none">{c.suit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {resultMsg && (
          <div className="mt-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-sm font-bold text-center">
            {resultMsg}
          </div>
        )}
      </div>

      {/* Cửa Đặt Baccarat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* PLAYER */}
        <button
          onClick={() => handlePlaceBet("player")}
          disabled={isDealing}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.player > 0
              ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500"
              : "glass-card border-white/10 hover:border-blue-500/50"
          }`}
        >
          <span className="text-2xl font-black text-blue-400">PLAYER</span>
          <span className="text-xs text-muted-foreground mt-0.5">Nhà Con</span>
          <span className="text-xs font-bold text-blue-300 mt-0.5">Ăn 1:1</span>
          {bets.player > 0 && (
            <div className="mt-2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
              {bets.player.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* TIE (HÒA) */}
        <button
          onClick={() => handlePlaceBet("tie")}
          disabled={isDealing}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.tie > 0
              ? "bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500"
              : "glass-card border-white/10 hover:border-emerald-500/50"
          }`}
        >
          <span className="text-2xl font-black text-emerald-400">TIE (HÒA)</span>
          <span className="text-xs text-muted-foreground mt-0.5">Hai Bên Bằng Điểm</span>
          <span className="text-xs font-black text-emerald-300 mt-0.5">ĂN x8</span>
          {bets.tie > 0 && (
            <div className="mt-2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
              {bets.tie.toLocaleString()} Xu
            </div>
          )}
        </button>

        {/* BANKER */}
        <button
          onClick={() => handlePlaceBet("banker")}
          disabled={isDealing}
          className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center ${
            bets.banker > 0
              ? "bg-rose-600/20 border-rose-500 ring-2 ring-rose-500"
              : "glass-card border-white/10 hover:border-rose-500/50"
          }`}
        >
          <span className="text-2xl font-black text-rose-400">BANKER</span>
          <span className="text-xs text-muted-foreground mt-0.5">Nhà Cái</span>
          <span className="text-xs font-bold text-rose-300 mt-0.5">Ăn 1:0.95</span>
          {bets.banker > 0 && (
            <div className="mt-2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
              {bets.banker.toLocaleString()} Xu
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
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
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
              disabled={isDealing || countdown <= 3}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Hủy Cược ({totalBet.toLocaleString()})
            </button>
          )}

          <button
            onClick={handleDeal}
            disabled={isDealing || countdown <= 3}
            className="px-6 py-2.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isDealing
              ? "ĐANG CHIA BÀI..."
              : countdown <= 3
              ? "ĐANG LẬT BÀI..."
              : "CHIA BÀI"}
          </button>
        </div>
      </div>
    </div>
  );
}
