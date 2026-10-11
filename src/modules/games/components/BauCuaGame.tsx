"use client";

import React, { useState } from "react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";
import { Sparkles, RotateCcw, Crown } from "lucide-react";

type AnimalId = "nai" | "bau" | "ga" | "ca" | "cua" | "tom";

interface AnimalDef {
  id: AnimalId;
  name: string;
  icon: string;
  bgGradient: string;
}

const ANIMALS: AnimalDef[] = [
  { id: "nai", name: "Nai", icon: "🦌", bgGradient: "from-amber-600/30 to-amber-900/40 border-amber-500/40" },
  { id: "bau", name: "Bầu", icon: "🎃", bgGradient: "from-emerald-600/30 to-emerald-900/40 border-emerald-500/40" },
  { id: "ga", name: "Gà", icon: "🐓", bgGradient: "from-red-600/30 to-red-900/40 border-red-500/40" },
  { id: "ca", name: "Cá", icon: "🐟", bgGradient: "from-sky-600/30 to-sky-900/40 border-sky-500/40" },
  { id: "cua", name: "Cua", icon: "🦀", bgGradient: "from-rose-600/30 to-rose-900/40 border-rose-500/40" },
  { id: "tom", name: "Tôm", icon: "🦐", bgGradient: "from-orange-600/30 to-orange-900/40 border-orange-500/40" },
];

export function BauCuaGame() {
  const { coins, addCoins, deductCoins, bauCuaRiggedAnimals, setBauCuaRiggedAnimals } = useGames();
  const { isAdmin } = useAuth();

  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [bets, setBets] = useState<Record<AnimalId, number>>({
    nai: 0,
    bau: 0,
    ga: 0,
    ca: 0,
    cua: 0,
    tom: 0,
  });

  const [diceResult, setDiceResult] = useState<[AnimalDef, AnimalDef, AnimalDef]>([
    ANIMALS[1], // Bầu
    ANIMALS[4], // Cua
    ANIMALS[5], // Tôm
  ]);

  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const handlePlaceBet = (animalId: AnimalId) => {
    if (isShaking) return;
    if (coins < selectedChip) {
      alert("Bạn không đủ Xu để đặt cược thêm!");
      return;
    }
    if (deductCoins(selectedChip)) {
      setBets((prev) => ({
        ...prev,
        [animalId]: prev[animalId] + selectedChip,
      }));
    }
  };

  const handleClearBets = () => {
    if (isShaking || totalBet === 0) return;
    addCoins(totalBet, "Hủy cược Bầu Cua");
    setBets({ nai: 0, bau: 0, ga: 0, ca: 0, cua: 0, tom: 0 });
  };

  const handleShake = () => {
    if (isShaking) return;
    if (totalBet === 0) {
      alert("Vui lòng đặt cược ít nhất 1 linh vật trước khi lắc!");
      return;
    }

    setIsShaking(true);
    setIsCovered(true);
    setResultMsg(null);

    setTimeout(() => {
      let results: [AnimalDef, AnimalDef, AnimalDef];
      if (bauCuaRiggedAnimals && bauCuaRiggedAnimals.length === 3) {
        const findA = (id: string) => ANIMALS.find((a) => a.id === id) || ANIMALS[0];
        results = [findA(bauCuaRiggedAnimals[0]), findA(bauCuaRiggedAnimals[1]), findA(bauCuaRiggedAnimals[2])];
      } else {
        const a1 = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const a2 = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const a3 = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        results = [a1, a2, a3];
      }

      setDiceResult(results);
      setIsShaking(false);

      setTimeout(() => {
        setIsCovered(false);

        // Count occurrences
        const counts: Record<AnimalId, number> = {
          nai: 0,
          bau: 0,
          ga: 0,
          ca: 0,
          cua: 0,
          tom: 0,
        };
        results.forEach((r) => {
          counts[r.id]++;
        });

        // Payout calculation
        let totalWin = 0;
        let wonItems: string[] = [];

        (Object.keys(bets) as AnimalId[]).forEach((id) => {
          const betAmount = bets[id];
          const count = counts[id];
          if (betAmount > 0 && count > 0) {
            // Original bet returned + (betAmount * count)
            const win = betAmount + betAmount * count;
            totalWin += win;
            const name = ANIMALS.find((a) => a.id === id)?.name;
            wonItems.push(`${name} x${count}`);
          }
        });

        if (totalWin > 0) {
          addCoins(totalWin, "Thắng Bầu Cua");
          setResultMsg(`🎉 THẮNG: +${totalWin.toLocaleString()} Xu! Trúng: ${wonItems.join(", ")}`);
        } else {
          setResultMsg(
            `Kết quả: ${results.map((r) => r.name).join(" - ")}. Chúc bạn may mắn lượt sau!`
          );
        }

        setBets({ nai: 0, bau: 0, ga: 0, ca: 0, cua: 0, tom: 0 });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* SECRET ADMIN GOD-MODE (Chỉ Admin mới nhìn thấy) */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ADMIN GOD-MODE (ẨN VỚI THÀNH VIÊN):</span>
            <span className="text-muted-foreground font-normal">Điều hướng 3 con Bầu Cua</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-amber-500/30">
            <button
              onClick={() => setBauCuaRiggedAnimals(null)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                bauCuaRiggedAnimals === null
                  ? "bg-amber-500 text-slate-950 shadow font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              🎲 Tự Nhiên
            </button>
            <button
              onClick={() => setBauCuaRiggedAnimals(["bau", "bau", "bau"])}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                bauCuaRiggedAnimals?.[0] === "bau" && bauCuaRiggedAnimals?.[1] === "bau"
                  ? "bg-amber-500 text-slate-950 shadow font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              🎃 3 BẦU (x3)
            </button>
            <button
              onClick={() => setBauCuaRiggedAnimals(["cua", "cua", "cua"])}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                bauCuaRiggedAnimals?.[0] === "cua" && bauCuaRiggedAnimals?.[1] === "cua"
                  ? "bg-amber-500 text-slate-950 shadow font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              🦀 3 CUA (x3)
            </button>
            <button
              onClick={() => setBauCuaRiggedAnimals(["tom", "tom", "tom"])}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                bauCuaRiggedAnimals?.[0] === "tom" && bauCuaRiggedAnimals?.[1] === "tom"
                  ? "bg-amber-500 text-slate-950 shadow font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              🦐 3 TÔM (x3)
            </button>
            <button
              onClick={() => setBauCuaRiggedAnimals(["bau", "cua", "tom"])}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                bauCuaRiggedAnimals?.[0] === "bau" && bauCuaRiggedAnimals?.[1] === "cua"
                  ? "bg-amber-500 text-slate-950 shadow font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              🎃🦀🦐 Bầu-Cua-Tôm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            🎃 BẦU CUA TÔM CÁ DÂN GIAN
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Ăn Lũy Tiến x1 - x3
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            6 linh vật truyền thống. Đặt linh vật nào, lắc ra bấy nhiêu con ăn gấp bấy nhiêu lần tiền thưởng!
          </p>
        </div>
      </div>

      {/* Đĩa Lắc Bầu Cua */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-amber-950/60 via-slate-950/90 to-black/90 border border-amber-500/20 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-amber-700/40 via-slate-900 to-amber-950/90 border-4 border-amber-500/40 p-4 shadow-2xl flex items-center justify-center relative">
            <div className="w-full h-full rounded-full bg-stone-900 border-2 border-amber-500/30 flex items-center justify-center relative">
              {isCovered ? (
                <div
                  className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-900 border-4 border-amber-400/60 shadow-2xl flex flex-col items-center justify-center text-amber-200 font-black cursor-pointer ${
                    isShaking ? "animate-bounce" : ""
                  }`}
                >
                  <Sparkles className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="text-sm tracking-wider uppercase mt-1">Đang Lắc Bầu Cua...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 animate-in zoom-in-75 duration-300">
                  {diceResult.map((a, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 text-slate-950 shadow-xl border-2 border-amber-300 flex flex-col items-center justify-center p-1"
                    >
                      <span className="text-2xl leading-none">{a.icon}</span>
                      <span className="text-[10px] font-black leading-none mt-0.5 text-slate-800">{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isCovered && (
          <div className="mt-2 animate-in fade-in">
            <span className="text-xl font-black px-4 py-1.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {diceResult.map((a) => `${a.icon} ${a.name}`).join("  |  ")}
            </span>
          </div>
        )}

        {resultMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-bold">
            {resultMsg}
          </div>
        )}
      </div>

      {/* Bàn Cược 6 Linh Vật */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {ANIMALS.map((a) => (
          <button
            key={a.id}
            onClick={() => handlePlaceBet(a.id)}
            disabled={isShaking}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
              bets[a.id] > 0
                ? "bg-amber-600/20 border-amber-400 ring-2 ring-amber-400 shadow-lg shadow-amber-950/40"
                : `glass-card ${a.bgGradient} hover:scale-105`
            }`}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">{a.icon}</span>
            <span className="text-base font-black text-white mt-1.5">{a.name}</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Ăn 1:1, 1:2, 1:3</span>
            {bets[a.id] > 0 && (
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow">
                {bets[a.id].toLocaleString()} Xu
              </div>
            )}
          </button>
        ))}
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
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
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
              disabled={isShaking}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Hủy Cược ({totalBet.toLocaleString()})
            </button>
          )}

          <button
            onClick={handleShake}
            disabled={isShaking}
            className="px-6 py-2.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isShaking ? "ĐANG LẮC..." : "LẮC & MỞ BÁT"}
          </button>
        </div>
      </div>
    </div>
  );
}
