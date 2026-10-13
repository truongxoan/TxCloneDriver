"use client";

import React, { useState } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { GamesProvider, useGames } from "@/modules/games/gamesContext";
import { GameId } from "@/modules/games/types";
import { TaiXiuGame } from "@/modules/games/components/TaiXiuGame";
import { XocDiaGame } from "@/modules/games/components/XocDiaGame";
import { BaccaratGame } from "@/modules/games/components/BaccaratGame";
import { BauCuaGame } from "@/modules/games/components/BauCuaGame";
import { CaroGame } from "@/modules/games/components/CaroGame";
import { CoTuongGame } from "@/modules/games/components/CoTuongGame";
import { TetrisGame } from "@/modules/games/components/TetrisGame";
import { WordChainGame } from "@/modules/games/components/WordChainGame";
import { PvPArenaGame } from "@/modules/games/components/PvPArenaGame";
import { LuckyWheelGame } from "@/modules/games/components/LuckyWheelGame";
import { RewardShop } from "@/modules/games/components/RewardShop";
import {
  Coins,
  Sparkles,
  Users,
  Trophy,
  Share2,
  PlusCircle,
  Copy,
  Check,
  Gamepad2,
  ShoppingBag,
} from "lucide-react";

const GAME_TABS: Array<{ id: GameId; label: string; icon: string; category: string }> = [
  { id: "reward_shop", label: "🛍️ Chợ Đổi Quà & Danh Hiệu", icon: "🛍️", category: "Kinh Tế & Xu" },
  { id: "pvp_arena", label: "⚔️ Đấu Trường PvP", icon: "⚔️", category: "Đối Kháng Cược Xu" },
  { id: "lucky_wheel", label: "🎰 Vòng Quay & Xổ Số", icon: "🎰", category: "May Mắn & Jackpot" },
  { id: "taixiu", label: "Tài Xỉu", icon: "🎲", category: "Dân Gian & Casino" },
  { id: "xocdia", label: "Xóc Đĩa", icon: "⚪🔴", category: "Dân Gian & Casino" },
  { id: "baccarat", label: "Baccarat", icon: "♠️", category: "Dân Gian & Casino" },
  { id: "baucua", label: "Bầu Cua", icon: "🎃", category: "Dân Gian & Casino" },
  { id: "caro", label: "Cờ Caro (XO)", icon: "⚔️", category: "Trí Tuệ & Boardgame" },
  { id: "cotuong", label: "Cờ Tướng", icon: "🏮", category: "Trí Tuệ & Boardgame" },
  { id: "tetris", label: "Xếp Hình Tetris", icon: "🧱", category: "Arcade & Nhanh Tay" },
  { id: "wordchain", label: "Nối Chữ", icon: "🔤", category: "Ngôn Ngữ & Đố Vui" },
];

function GamesContent() {
  const {
    coins,
    addCoins,
    claimDailyCoins,
    canClaimDaily,
    activeGameId,
    setActiveGameId,
    activeRoom,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useGames();

  const [copiedRoom, setCopiedRoom] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");

  const handleClaim = () => {
    const res = claimDailyCoins();
    alert(res.message);
  };

  const handleCopyRoom = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(
      `Vào chơi game "${activeRoom.name}" cùng tôi tại TxCloneDriver! Mã phòng: ${activeRoom.id}`
    );
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Coin Wallet */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-sky-600/20 glass-panel border border-white/10 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Gamepad2 className="w-4 h-4" /> Gaming Arcade & Multiplayer Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Khu Trò Chơi Giải Trí & Chơi Chung
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Cùng so tài Tài Xỉu, Xóc Đĩa, Baccarat, Bầu Cua, Cờ Tướng, Cờ Caro và Tetris cùng bạn bè!
            </p>
          </div>

          {/* Ví Xu Giải Trí */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center gap-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Ví Xu Vui Vẻ
                </span>
                <span className="text-xl font-black text-amber-400">
                  {coins.toLocaleString()} <span className="text-xs font-normal text-amber-200">XU</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleClaim}
                disabled={!canClaimDaily}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  canClaimDaily
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:scale-105"
                    : "bg-white/5 text-muted-foreground border border-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {canClaimDaily ? "Điểm Danh (+10K Xu)" : "Đã Điểm Danh Hôm Nay"}
              </button>

              <button
                onClick={() => addCoins(20000, "Bơm xu miễn phí")}
                className="px-4 py-1.5 rounded-xl text-[11px] font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" /> Nhận Thêm 20K Xu
              </button>
            </div>
          </div>
        </div>

        {/* Room bar if in a room */}
        {activeRoom ? (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
                PHÒNG: {activeRoom.id}
              </span>
              <span className="text-white font-bold">{activeRoom.name}</span>
              <span className="text-muted-foreground">({activeRoom.players.length} người chơi trong bàn)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyRoom}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1"
              >
                {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRoom ? "Đã sao chép!" : "Chia sẻ mã phòng"}
              </button>
              <button
                onClick={leaveRoom}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30"
              >
                Rời phòng
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRoomModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Tạo hoặc Vào Phòng Bạn Bè
            </button>
          </div>
        )}
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GAME_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGameId(tab.id)}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeGameId === tab.id
                ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105"
                : "glass-card border-white/10 text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Game Component Area */}
      <div className="min-h-[500px]">
        {activeGameId === "reward_shop" && <RewardShop />}
        {activeGameId === "pvp_arena" && <PvPArenaGame />}
        {activeGameId === "lucky_wheel" && <LuckyWheelGame />}
        {activeGameId === "taixiu" && <TaiXiuGame />}
        {activeGameId === "xocdia" && <XocDiaGame />}
        {activeGameId === "baccarat" && <BaccaratGame />}
        {activeGameId === "baucua" && <BauCuaGame />}
        {activeGameId === "caro" && <CaroGame />}
        {activeGameId === "cotuong" && <CoTuongGame />}
        {activeGameId === "tetris" && <TetrisGame />}
        {activeGameId === "wordchain" && <WordChainGame />}
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/15 space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Tạo & Vào Phòng Chơi Cùng Bạn Bè
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Tên phòng (khi tạo mới):
                </label>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  placeholder="Ví dụ: Bàn vui của Tx và Anh Em"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    createRoom(activeGameId, roomNameInput);
                    setShowRoomModal(false);
                  }}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg"
                >
                  Tạo Phòng Mới Ngay
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-xs text-muted-foreground font-semibold">HOẶC</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nhập Mã Phòng (từ bạn bè gửi):
                </label>
                <input
                  type="text"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  placeholder="Ví dụ: TX-8888"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm uppercase focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={() => {
                    if (joinRoom(inputRoomId)) {
                      setShowRoomModal(false);
                    } else {
                      alert("Vui lòng nhập mã phòng hợp lệ!");
                    }
                  }}
                  className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg"
                >
                  Vào Bàn Chơi
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <ModuleGuard moduleId="games" moduleName="Game Giải Trí">
      <GamesProvider>
        <GamesContent />
      </GamesProvider>
    </ModuleGuard>
  );
}
