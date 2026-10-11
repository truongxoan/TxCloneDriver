"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { RotateCcw, Bot, Users, Trophy } from "lucide-react";

const BOARD_SIZE = 15;
type CellVal = "X" | "O" | null;

export function CaroGame() {
  const { addCoins } = useGames();
  const [board, setBoard] = useState<CellVal[][]>(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );

  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [gameMode, setGameMode] = useState<"ai" | "pvp">("ai");
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number][] | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Check 5 in a row
  const checkWin = (b: CellVal[][], r: number, c: number, player: "X" | "O"): [number, number][] | null => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal up-right
    ];

    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[r, c]];

      // Check positive direction
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) {
          line.push([nr, nc]);
        } else {
          break;
        }
      }

      // Check negative direction
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i;
        const nc = c - dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) {
          line.push([nr, nc]);
        } else {
          break;
        }
      }

      if (line.length >= 5) {
        return line;
      }
    }
    return null;
  };

  // AI heuristic logic
  const makeAiMove = (currentBoard: CellVal[][]) => {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [-1, -1];

    // Priority check around existing moves
    const candidates: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === null) {
          // Check if neighboring cell has a piece
          let hasNeighbor = false;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] !== null) {
                hasNeighbor = true;
                break;
              }
            }
            if (hasNeighbor) break;
          }
          if (hasNeighbor) candidates.push([r, c]);
        }
      }
    }

    if (candidates.length === 0) {
      // First move at center
      bestMove = [7, 7];
    } else {
      for (const [r, c] of candidates) {
        // Evaluate attack score (O) and defense score (X)
        const oWin = checkWin(currentBoard, r, c, "O");
        if (oWin) {
          bestMove = [r, c];
          break;
        }

        const xWin = checkWin(currentBoard, r, c, "X");
        if (xWin) {
          bestMove = [r, c];
          bestScore = 99999;
          continue;
        }

        // Simple distance heuristic toward center
        const score = Math.random() * 10 - (Math.abs(r - 7) + Math.abs(c - 7));
        if (score > bestScore) {
          bestScore = score;
          bestMove = [r, c];
        }
      }
    }

    if (bestMove[0] !== -1) {
      applyMove(bestMove[0], bestMove[1], "O");
    }
  };

  const applyMove = (r: number, c: number, player: "X" | "O") => {
    const nextBoard = board.map((row) => [...row]);
    nextBoard[r][c] = player;
    setBoard(nextBoard);
    setLastMove([r, c]);
    setHistoryCount((prev) => prev + 1);

    const winLine = checkWin(nextBoard, r, c, player);
    if (winLine) {
      setWinner(player);
      setWinningLine(winLine);
      if (player === "X" && gameMode === "ai") {
        addCoins(5000, "Thắng Cờ Caro vs AI");
      }
      return;
    }

    // Switch turn
    const nextTurn = player === "X" ? "O" : "X";
    setCurrentTurn(nextTurn);

    if (gameMode === "ai" && nextTurn === "O") {
      setTimeout(() => {
        makeAiMove(nextBoard);
      }, 350);
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] !== null || winner !== null) return;
    if (gameMode === "ai" && currentTurn !== "X") return;
    applyMove(r, c, currentTurn);
  };

  const handleReset = () => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setCurrentTurn("X");
    setWinner(null);
    setWinningLine(null);
    setLastMove(null);
    setHistoryCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2">
            ⚔️ CỜ CARO (XO) TRÍ TUỆ
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              5 Quân Thắng
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xếp 5 quân cùng hàng liên tiếp (ngang, dọc, chéo). Thắng AI nhận ngay 5,000 Xu!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode switch */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => {
                setGameMode("ai");
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                gameMode === "ai"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Đấu Máy AI
            </button>
            <button
              onClick={() => {
                setGameMode("pvp");
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                gameMode === "pvp"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 2 Người (PvP)
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ván Mới
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lượt đi:</span>
            <span
              className={`px-2.5 py-0.5 rounded-lg font-black text-xs ${
                currentTurn === "X"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              }`}
            >
              {currentTurn === "X" ? "Bạn (X)" : gameMode === "ai" ? "Bot AI (O)" : "Đối thủ (O)"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Số nước: {historyCount}</span>
        </div>

        {winner && (
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/40 animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            {winner === "X"
              ? "Chúc mừng! Người chơi X đã CHIẾN THẮNG!"
              : winner === "O"
              ? gameMode === "ai"
                ? "Bot AI đã thắng! Hãy thử lại!"
                : "Người chơi O đã CHIẾN THẮNG!"
              : "Ván cờ Hòa!"}
          </div>
        )}
      </div>

      {/* Caro 15x15 Board */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div className="inline-block p-3 rounded-2xl bg-[#d8b078] shadow-2xl border-4 border-[#8c5e2d]">
          <div className="grid grid-cols-15 gap-[1px] bg-[#8c5e2d] border border-[#8c5e2d]">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
                const isWinCell = winningLine?.some(([wr, wc]) => wr === r && wc === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={cell !== null || winner !== null}
                    className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-black text-xs sm:text-base transition-colors relative ${
                      isWinCell
                        ? "bg-amber-400 animate-pulse text-slate-950 font-black"
                        : "bg-[#e8c592] hover:bg-[#edd0a4]"
                    }`}
                  >
                    {/* Cross line in center of cell */}
                    {cell === "X" && (
                      <span className="text-rose-600 drop-shadow-sm leading-none scale-110">
                        ✕
                      </span>
                    )}
                    {cell === "O" && (
                      <span className="text-sky-700 drop-shadow-sm leading-none scale-110">
                        ◯
                      </span>
                    )}
                    {isLast && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
