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

  // Secret Admin Rigging & AI God Mode (Hidden from users)
  taiXiuRiggedOutcome: "random" | "tai" | "xiu" | "bao";
  setTaiXiuRiggedOutcome: (v: "random" | "tai" | "xiu" | "bao") => void;
  xocDiaRiggedOutcome: "random" | "chan" | "le" | "tu_do" | "tu_trang";
  setXocDiaRiggedOutcome: (v: "random" | "chan" | "le" | "tu_do" | "tu_trang") => void;
  baccaratRiggedOutcome: "random" | "player" | "banker" | "tie";
  setBaccaratRiggedOutcome: (v: "random" | "player" | "banker" | "tie") => void;
  bauCuaRiggedAnimals: string[] | null;
  setBauCuaRiggedAnimals: (v: string[] | null) => void;
  caroGodHint: boolean;
  setCaroGodHint: (v: boolean) => void;
  coTuongGodHint: boolean;
  setCoTuongGodHint: (v: boolean) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const COINS_KEY = "txclonedriver_fun_coins";
const CLAIM_DATE_KEY = "txclonedriver_last_daily_claim";
const RESET_DATE_KEY = "txclonedriver_last_daily_reset";

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const { user, adjustUserCoins } = useAuth();
  const [coins, setCoins] = useState<number>(user?.coins !== undefined ? user.coins : 50000);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [activeGameId, setActiveGameId] = useState<GameId>("taixiu");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Secret Admin Rigging Controls
  const [taiXiuRiggedOutcome, setTaiXiuRiggedOutcome] = useState<"random" | "tai" | "xiu" | "bao">("random");
  const [xocDiaRiggedOutcome, setXocDiaRiggedOutcome] = useState<"random" | "chan" | "le" | "tu_do" | "tu_trang">("random");
  const [baccaratRiggedOutcome, setBaccaratRiggedOutcome] = useState<"random" | "player" | "banker" | "tie">("random");
  const [bauCuaRiggedAnimals, setBauCuaRiggedAnimals] = useState<string[] | null>(null);
  const [caroGodHint, setCaroGodHint] = useState<boolean>(false);
  const [coTuongGodHint, setCoTuongGodHint] = useState<boolean>(false);

  // Synchronize with user's account coins from auth context
  useEffect(() => {
    if (user && user.coins !== undefined) {
      setCoins(user.coins);
      try {
        localStorage.setItem(COINS_KEY, user.coins.toString());
      } catch {}
    }
  }, [user?.coins]);

  // Load coins and perform daily 24h 50,000 reset if lower
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastReset = localStorage.getItem(RESET_DATE_KEY);

      let currentCoins = user?.coins !== undefined ? user.coins : 50000;
      const savedCoins = localStorage.getItem(COINS_KEY);
      if (savedCoins !== null && !user?.coins) {
        currentCoins = parseInt(savedCoins, 10);
      }

      // 24h reset: Every new day, if user has less than 50,000 coins, restore to 50,000!
      if (lastReset !== todayStr) {
        if (currentCoins < 50000) {
          currentCoins = 50000;
          localStorage.setItem(COINS_KEY, "50000");
          if (user?.id && adjustUserCoins) {
            adjustUserCoins(user.id, 50000 - (user.coins || 0));
          }
        }
        localStorage.setItem(RESET_DATE_KEY, todayStr);
      }

      setCoins(currentCoins);

      const savedClaim = localStorage.getItem(CLAIM_DATE_KEY);
      setLastClaimDate(savedClaim);
    } catch {
      // ignore
    }
  }, [user?.id]);

  const addCoins = (amount: number, reason?: string) => {
    setCoins((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem(COINS_KEY, next.toString());
      } catch {}
      return next;
    });
    if (user?.id && adjustUserCoins) {
      adjustUserCoins(user.id, amount);
    }
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
    if (user?.id && adjustUserCoins) {
      adjustUserCoins(user.id, -amount);
    }
    return true;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const canClaimDaily = lastClaimDate !== todayStr;

  const claimDailyCoins = () => {
    if (!canClaimDaily) {
      return { success: false, amount: 0, message: "Hôm nay bạn đã nhận thưởng điểm danh rồi!" };
    }

    // Check if it's the last day of the month for +100,000 bonus
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const isEndOfMonth = tomorrow.getDate() === 1;

    let reward = 10000;
    let bonusText = "";
    if (isEndOfMonth) {
      reward = 100000;
      bonusText = " (ĐẶC BIỆT: Ngày cuối tháng thưởng lớn +100,000 điểm!)";
    }

    addCoins(reward, "Điểm danh hàng ngày");
    try {
      localStorage.setItem(CLAIM_DATE_KEY, todayStr);
    } catch {}
    setLastClaimDate(todayStr);
    return {
      success: true,
      amount: reward,
      message: `Chúc mừng! Bạn đã nhận ${reward.toLocaleString()} Xu vui vẻ!${bonusText}`,
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

        // Secret Admin God Mode
        taiXiuRiggedOutcome,
        setTaiXiuRiggedOutcome,
        xocDiaRiggedOutcome,
        setXocDiaRiggedOutcome,
        baccaratRiggedOutcome,
        setBaccaratRiggedOutcome,
        bauCuaRiggedAnimals,
        setBauCuaRiggedAnimals,
        caroGodHint,
        setCaroGodHint,
        coTuongGodHint,
        setCoTuongGodHint,
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
