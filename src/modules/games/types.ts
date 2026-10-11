export type GameId =
  | "taixiu"
  | "xocdia"
  | "baccarat"
  | "baucua"
  | "caro"
  | "cotuong"
  | "tetris"
  | "wordchain";

export interface GameInfo {
  id: GameId;
  name: string;
  tagline: string;
  category: "casino_fun" | "boardgame" | "puzzle";
  icon: string;
  badge?: string;
  playersCount: string;
  minBet: number;
}

export interface PlayerInRoom {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  isHost: boolean;
  status: "ready" | "playing" | "spectating";
}

export interface GameRoom {
  id: string;
  name: string;
  gameId: GameId;
  hostName: string;
  players: PlayerInRoom[];
  createdAt: string;
  isPrivate: boolean;
}
