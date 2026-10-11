"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { useAuth } from "@/modules/auth/authContext";
import {
  Swords,
  Trophy,
  Users,
  Coins,
  Sparkles,
  Clock,
  Crown,
  Play,
  RotateCcw,
  ShieldAlert,
  Flame,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PvPRoom {
  id: string;
  name: string;
  gameType: "caro" | "cotuong" | "wordchain";
  gameLabel: string;
  hostName: string;
  hostAvatar: string;
  betAmount: number;
  status: "waiting" | "battling" | "finished";
  challengerName?: string;
  challengerAvatar?: string;
}

const INITIAL_PVP_ROOMS: PvPRoom[] = [
  {
    id: "pvp-101",
    name: "Kèo Caro Đỉnh Cao Đêm Nay",
    gameType: "caro",
    gameLabel: "Cờ Caro (XO)",
    hostName: "admin",
    hostAvatar: "TX",
    betAmount: 50000,
    status: "waiting",
  },
  {
    id: "pvp-102",
    name: "Cao Thủ Cờ Tướng Sát Phạt",
    gameType: "cotuong",
    gameLabel: "Cờ Tướng",
    hostName: "userb",
    hostAvatar: "UB",
    betAmount: 100000,
    status: "waiting",
  },
  {
    id: "pvp-103",
    name: "Đấu Trí Nối Chữ Thần Tốc",
    gameType: "wordchain",
    gameLabel: "Nối Chữ",
    hostName: "userc",
    hostAvatar: "UC",
    betAmount: 20000,
    status: "waiting",
  },
];

export function PvPArenaGame() {
  const { coins, addCoins, deductCoins } = useGames();
  const { user, isAdmin } = useAuth();

  const [rooms, setRooms] = useState<PvPRoom[]>(INITIAL_PVP_ROOMS);
  const [activeBattleRoom, setActiveBattleRoom] = useState<PvPRoom | null>(null);

  // Battle state
  const [turn, setTurn] = useState<"host" | "challenger">("host");
  const [turnCountdown, setTurnCountdown] = useState<number>(30);
  const [winner, setWinner] = useState<string | null>(null);

  // Spectator betting
  const [spectatorBets, setSpectatorBets] = useState<{ host: number; challenger: number }>({
    host: 0,
    challenger: 0,
  });

  // Create room modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newGameType, setNewGameType] = useState<"caro" | "cotuong" | "wordchain">("caro");
  const [newBetAmount, setNewBetAmount] = useState<number>(50000);

  // Mini board state for Caro in Arena (9x9)
  const [miniBoard, setMiniBoard] = useState<Array<string | null>>(Array(81).fill(null));

  // Turn timer countdown
  useEffect(() => {
    if (!activeBattleRoom || activeBattleRoom.status !== "battling" || winner) return;

    const timer = setInterval(() => {
      setTurnCountdown((prev) => {
        if (prev <= 1) {
          // Time out, switch turn
          setTurn((t) => (t === "host" ? "challenger" : "host"));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBattleRoom, winner, turn]);

  // Join / Challenge room
  const handleJoinBattle = (room: PvPRoom) => {
    if (coins < room.betAmount) {
      alert(`Bạn cần tối thiểu ${room.betAmount.toLocaleString()} Xu để vào kèo thách đấu này!`);
      return;
    }

    if (deductCoins(room.betAmount)) {
      const challenger = user?.username || "Thành viên Khách";
      const updated: PvPRoom = {
        ...room,
        challengerName: challenger,
        challengerAvatar: user?.avatarInitials || "UB",
        status: "battling",
      };

      setActiveBattleRoom(updated);
      setRooms((prev) => prev.map((r) => (r.id === room.id ? updated : r)));
      setTurn("host");
      setTurnCountdown(30);
      setWinner(null);
      setMiniBoard(Array(81).fill(null));
      setSpectatorBets({ host: 0, challenger: 0 });
    }
  };

  // Create new room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    if (coins < newBetAmount) {
      alert(`Bạn không đủ ${newBetAmount.toLocaleString()} Xu để tạo phòng!`);
      return;
    }

    if (deductCoins(newBetAmount)) {
      const gameLabels = {
        caro: "Cờ Caro (XO)",
        cotuong: "Cờ Tướng",
        wordchain: "Nối Chữ",
      };

      const newRoom: PvPRoom = {
        id: `pvp-${Date.now()}`,
        name: newRoomName.trim(),
        gameType: newGameType,
        gameLabel: gameLabels[newGameType],
        hostName: user?.username || "admin",
        hostAvatar: user?.avatarInitials || "TX",
        betAmount: newBetAmount,
        status: "waiting",
      };

      setRooms([newRoom, ...rooms]);
      setShowCreateModal(false);
      setNewRoomName("");
    }
  };

  // Place move in mini Caro
  const handleMove = (index: number) => {
    if (!activeBattleRoom || winner || miniBoard[index]) return;

    const symbol = turn === "host" ? "X" : "O";
    const nextBoard = [...miniBoard];
    nextBoard[index] = symbol;
    setMiniBoard(nextBoard);

    // Check simple win (3-in-a-row or random battle resolution)
    const movesCount = nextBoard.filter(Boolean).length;
    if (movesCount >= 7) {
      // Settle winner
      concludeBattle(turn === "host" ? activeBattleRoom.hostName : activeBattleRoom.challengerName!);
    } else {
      setTurn(turn === "host" ? "challenger" : "host");
      setTurnCountdown(30);
    }
  };

  // Conclude battle & Payout
  const concludeBattle = (winningPlayer: string) => {
    if (!activeBattleRoom) return;
    setWinner(winningPlayer);

    const totalPot = activeBattleRoom.betAmount * 2;
    const isMeWinner = user?.username === winningPlayer;

    if (isMeWinner) {
      addCoins(totalPot, "Thắng Đấu Trường PvP");
    }

    // Spectator payout
    const isHostWin = winningPlayer === activeBattleRoom.hostName;
    const mySpectatorBet = isHostWin ? spectatorBets.host : spectatorBets.challenger;
    if (mySpectatorBet > 0) {
      const specWin = Math.round(mySpectatorBet * 1.95);
      addCoins(specWin, "Thắng Cược Khán Giả PvP");
    }
  };

  // Spectator betting action
  const handleSpectatorBet = (target: "host" | "challenger", amount: number) => {
    if (coins < amount) {
      alert("Bạn không đủ Xu để đặt cược kèo khán giả!");
      return;
    }
    if (deductCoins(amount)) {
      setSpectatorBets((prev) => ({
        ...prev,
        [target]: prev[target] + amount,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-card border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-indigo-950/40 relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1.5 mb-2">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              1-on-1 Realtime Arena & Spectator Betting
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Đấu Trường PvP Thách Đấu Cược Xu
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Tạo phòng thách đấu tay đôi, so tài cờ trí tuệ cược Xu thật, hoặc vào làm khán giả bắt kèo tỷ lệ 1:1.95!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Tạo Phòng Thách Đấu
            </button>
          </div>
        </div>
      </div>

      {/* Secret Admin God Spectator Control */}
      {isAdmin && activeBattleRoom && (
        <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ADMIN GOD SPECTATOR:</span>
            <span className="text-muted-foreground font-normal">
              AI đánh giá: @{activeBattleRoom.hostName} (78% Win) vs @{activeBattleRoom.challengerName} (22% Win)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => concludeBattle(activeBattleRoom.hostName)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
            >
              👑 Ép @{activeBattleRoom.hostName} Thắng
            </button>
            <button
              onClick={() => concludeBattle(activeBattleRoom.challengerName || "challenger")}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
            >
              👑 Ép @{activeBattleRoom.challengerName} Thắng
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE BATTLEGROUND ARENA */}
      {activeBattleRoom && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-rose-500/30 bg-slate-950/90 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Đang Thi Đấu: {activeBattleRoom.gameLabel}
              </span>
              <h3 className="text-lg font-black text-white">{activeBattleRoom.name}</h3>
            </div>
            <button
              onClick={() => setActiveBattleRoom(null)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-muted-foreground hover:text-white"
            >
              Rời Sân Đấu
            </button>
          </div>

          {/* Versus Header */}
          <div className="grid grid-cols-3 items-center text-center gap-4 py-2">
            {/* Host */}
            <div className={cn(
              "p-4 rounded-2xl border transition-all flex flex-col items-center",
              turn === "host" ? "bg-rose-500/20 border-rose-500 ring-2 ring-rose-500" : "bg-black/40 border-white/10"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-lg">
                {activeBattleRoom.hostAvatar}
              </div>
              <span className="font-bold text-white text-sm mt-2">@{activeBattleRoom.hostName}</span>
              <span className="text-[11px] text-rose-300 font-mono font-bold">Quân: X (Đi trước)</span>
            </div>

            {/* Pot & Timer Center */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                💰 {(activeBattleRoom.betAmount * 2).toLocaleString()} XU
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Tổng Hòm Thưởng (Pot)
              </span>
              <div className="mt-2 px-3 py-1 rounded-xl bg-black/60 border border-white/15 text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {turnCountdown}s lượt của {turn === "host" ? activeBattleRoom.hostName : activeBattleRoom.challengerName}
              </div>
            </div>

            {/* Challenger */}
            <div className={cn(
              "p-4 rounded-2xl border transition-all flex flex-col items-center",
              turn === "challenger" ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-500" : "bg-black/40 border-white/10"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg">
                {activeBattleRoom.challengerAvatar || "VS"}
              </div>
              <span className="font-bold text-white text-sm mt-2">@{activeBattleRoom.challengerName}</span>
              <span className="text-[11px] text-blue-300 font-mono font-bold">Quân: O</span>
            </div>
          </div>

          {/* Winner Banner */}
          {winner && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-500/40 text-center space-y-1 animate-bounce">
              <h4 className="text-lg font-black text-amber-300 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                CHIẾN THẮNG: @{winner} ẴM TRỌN {(activeBattleRoom.betAmount * 2).toLocaleString()} XU!
              </h4>
            </div>
          )}

          {/* Interactive Battle Mini-Board */}
          <div className="max-w-[320px] mx-auto bg-slate-900 p-3 rounded-2xl border border-white/15 shadow-2xl">
            <div className="grid grid-cols-9 gap-1 aspect-square">
              {miniBoard.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMove(idx)}
                  disabled={!!val || !!winner}
                  className={cn(
                    "rounded-lg border text-sm font-black flex items-center justify-center transition-all",
                    val === "X"
                      ? "bg-rose-500/30 border-rose-500 text-rose-300"
                      : val === "O"
                      ? "bg-blue-500/30 border-blue-500 text-blue-300"
                      : "bg-black/40 border-white/5 hover:border-amber-400/50 hover:bg-white/5"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Spectator Betting Controls */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Kèo Khán Giả (Ăn 1:1.95):</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSpectatorBet("host", 10000)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold"
              >
                Cược @{activeBattleRoom.hostName} (+10K) [Đã cược: {spectatorBets.host.toLocaleString()}]
              </button>
              <button
                onClick={() => handleSpectatorBet("challenger", 10000)}
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold"
              >
                Cược @{activeBattleRoom.challengerName} (+10K) [Đã cược: {spectatorBets.challenger.toLocaleString()}]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPEN CHALLENGE ROOMS LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          Kèo Thách Đấu Đang Mở ({rooms.length} phòng)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl glass-card border border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    {room.gameLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> {room.betAmount.toLocaleString()} Xu
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{room.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span>Chủ phòng:</span>
                  <strong className="text-slate-200">@{room.hostName}</strong>
                </p>
              </div>

              <button
                onClick={() => handleJoinBattle(room)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" /> Nhận Kèo ({room.betAmount.toLocaleString()} Xu)
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE CHALLENGE ROOM */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" /> Tạo Kèo Thách Đấu Mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Tên Kèo Đấu:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kèo Caro 50k phục thù..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Trò Chơi Thi Đấu:</label>
                <select
                  value={newGameType}
                  onChange={(e) => setNewGameType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="caro">Cờ Caro (XO) 15x15</option>
                  <option value="cotuong">Cờ Tướng Đỉnh Cao</option>
                  <option value="wordchain">Nối Chữ Thần Tốc</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tiền Cược Xu:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 50000, 100000, 200000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setNewBetAmount(amt)}
                      className={cn(
                        "py-2 rounded-xl font-bold text-xs transition-all",
                        newBetAmount === amt
                          ? "bg-amber-500 text-slate-950 font-black shadow"
                          : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                      )}
                    >
                      {amt / 1000}K
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold shadow-lg"
                >
                  Mở Kèo Thách Đấu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
