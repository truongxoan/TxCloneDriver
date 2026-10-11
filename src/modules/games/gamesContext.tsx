"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GameId, GameRoom, PlayerInRoom } from "./types";
import { useAuth } from "@/modules/auth/authContext";

interface GamesContextType {
  coins: number;
  addCoins: (amount: number, reason?: string) => void;
  deductCoins: (amount: number) => boolean;
  claimDailyCoins: () => { success: boolean; amount: number; message: string };
  lastClaimDate: string | null;
  canClaimDaily: boolean;
  activeRoom: GameRoom | null;
  createRoom: (gameId: GameId, roomName: string) => string;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: () => void;
  activeGameId: GameId;
  setActiveGameId: (id: GameId) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const COINS_KEY = "txclonedriver_fun_coins";
const CLAIM_DATE_KEY = "txclonedriver_last_daily_claim";

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(50000);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [activeGameId, setActiveGameId] = useState<GameId>("taixiu");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load coins from localStorage on mount
  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem(COINS_KEY);
      if (savedCoins !== null) {
        setCoins(parseInt(savedCoins, 10));
      } else {
        localStorage.setItem(COINS_KEY, "50000");
        setCoins(50000);
      }

      const savedClaim = localStorage.getItem(CLAIM_DATE_KEY);
      setLastClaimDate(savedClaim);
    } catch {
      // ignore
    }
  }, []);

  const addCoins = (amount: number, reason?: string) => {
    setCoins((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem(COINS_KEY, next.toString());
      } catch {}
      return next;
    });
  };

  const deductCoins = (amount: number): boolean => {
    if (coins < amount) return false;
    setCoins((prev) => {
      const next = Math.max(0, prev - amount);
      try {
        localStorage.setItem(COINS_KEY, next.toString());
      } catch {}
      return next;
    });
    return true;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const canClaimDaily = lastClaimDate !== todayStr;

  const claimDailyCoins = () => {
    if (!canClaimDaily) {
      return { success: false, amount: 0, message: "Hôm nay bạn đã nhận thưởng điểm danh rồi!" };
    }
    const reward = 10000;
    addCoins(reward, "Điểm danh hàng ngày");
    try {
      localStorage.setItem(CLAIM_DATE_KEY, todayStr);
    } catch {}
    setLastClaimDate(todayStr);
    return {
      success: true,
      amount: reward,
      message: `Chúc mừng! Bạn đã nhận thành công ${reward.toLocaleString()} Xu vui vẻ!`,
    };
  };

  const createRoom = (gameId: GameId, roomName: string): string => {
    const roomId = "TX-" + Math.floor(1000 + Math.random() * 9000);
    const host: PlayerInRoom = {
      id: user?.username || "me",
      name: user?.name || "Bạn (Chủ phòng)",
      avatar: user?.avatarInitials || "TX",
      coins: coins,
      isHost: true,
      status: "ready",
    };

    // Add mock friend bots to simulate multiplayer room atmosphere
    const mockFriends: PlayerInRoom[] = [
      { id: "p2", name: "Nguyễn Tuấn", avatar: "NT", coins: 85000, isHost: false, status: "ready" },
      { id: "p3", name: "Minh Trang", avatar: "MT", coins: 120000, isHost: false, status: "ready" },
    ];

    const newRoom: GameRoom = {
      id: roomId,
      name: roomName || `Bàn chơi của ${user?.name || "Bạn"}`,
      gameId,
      hostName: user?.name || "Bạn",
      players: [host, ...mockFriends],
      createdAt: new Date().toLocaleTimeString("vi-VN"),
      isPrivate: false,
    };

    setActiveRoom(newRoom);
    setActiveGameId(gameId);
    return roomId;
  };

  const joinRoom = (roomId: string): boolean => {
    if (!roomId) return false;
    const player: PlayerInRoom = {
      id: user?.username || "guest",
      name: user?.name || "Khách",
      avatar: user?.avatarInitials || "KH",
      coins: coins,
      isHost: false,
      status: "ready",
    };

    setActiveRoom({
      id: roomId.toUpperCase(),
      name: `Phòng ${roomId.toUpperCase()}`,
      gameId: activeGameId,
      hostName: "Chủ phòng",
      players: [
        { id: "host", name: "Bảo Ngọc (Chủ phòng)", avatar: "BN", coins: 240000, isHost: true, status: "ready" },
        player,
        { id: "p3", name: "Hoàng Long", avatar: "HL", coins: 64000, isHost: false, status: "ready" },
      ],
      createdAt: new Date().toLocaleTimeString("vi-VN"),
      isPrivate: false,
    });
    return true;
  };

  const leaveRoom = () => {
    setActiveRoom(null);
  };

  return (
    <GamesContext.Provider
      value={{
        coins,
        addCoins,
        deductCoins,
        claimDailyCoins,
        lastClaimDate,
        canClaimDaily,
        activeRoom,
        createRoom,
        joinRoom,
        leaveRoom,
        activeGameId,
        setActiveGameId,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
}
