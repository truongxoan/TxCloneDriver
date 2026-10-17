"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGames } from "../gamesContext";
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Flame } from "lucide-react";

const GRID_SIZE = 4;

type Board = number[][];

const TILE_COLORS: Record<number, string> = {
  2: "bg-slate-800 text-slate-100 border-slate-700",
  4: "bg-slate-700 text-amber-300 border-amber-600/30",
  8: "bg-amber-600/80 text-white border-amber-500 shadow-amber-500/20 shadow-lg",
  16: "bg-orange-600 text-white border-orange-500 shadow-orange-500/30 shadow-lg",
  32: "bg-rose-600 text-white border-rose-500 shadow-rose-500/30 shadow-lg",
  64: "bg-pink-600 text-white border-pink-500 shadow-pink-500/40 shadow-lg",
  128: "bg-purple-600 text-white border-purple-400 shadow-purple-500/50 shadow-xl font-bold",
  256: "bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/50 shadow-xl font-bold",
  512: "bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/50 shadow-xl font-bold",
  1024: "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/60 shadow-2xl font-black",
  2048: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-yellow-300 shadow-yellow-500/80 shadow-2xl font-black animate-pulse",
};

export function Game2048() {
  const { addCoins } = useGames();

  const createEmptyBoard = (): Board =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

  const addRandomTile = (board: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return board;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const [board, setBoard] = useState<Board>(() => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    return addRandomTile(b);
  });

  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Load best score
  useEffect(() => {
    try {
      const saved = localStorage.getItem("txclonedriver_2048_best");
      if (saved) setBestScore(parseInt(saved, 10));
    } catch {}
  }, []);

  const handleRestart = () => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setHasWon(false);
    setIsGameOver(false);
  };

  // Movement Logic
  const slideAndMerge = (row: number[]): { newRow: number[]; gainedScore: number } => {
    let filtered = row.filter((val) => val !== 0);
    let gainedScore = 0;

    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        gainedScore += filtered[i];
        filtered[i + 1] = 0;
      }
    }

    filtered = filtered.filter((val) => val !== 0);
    while (filtered.length < GRID_SIZE) {
      filtered.push(0);
    }

    return { newRow: filtered, gainedScore };
  };

  const checkGameOver = (currentBoard: Board): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (r < GRID_SIZE - 1 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
        if (c < GRID_SIZE - 1 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }
    return true;
  };

  const moveLeft = useCallback(() => {
    if (isGameOver) return;
    let changed = false;
    let turnScore = 0;
    const newBoard = board.map((row) => {
      const { newRow, gainedScore } = slideAndMerge(row);
      turnScore += gainedScore;
      if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true;
      return newRow;
    });

    if (changed) {
      const withTile = addRandomTile(newBoard);
      setBoard(withTile);
      const nextScore = score + turnScore;
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
        try {
          localStorage.setItem("txclonedriver_2048_best", nextScore.toString());
        } catch {}
      }
      if (turnScore > 0) addCoins(turnScore, "Điểm 2048");

      // Check 2048 victory
      if (!hasWon && withTile.some((r) => r.includes(2048))) {
        setHasWon(true);
        addCoins(50000, "Chiến thắng 2048!");
      }
      if (checkGameOver(withTile)) setIsGameOver(true);
    }
  }, [addCoins, bestScore, board, hasWon, isGameOver, score]);

  const moveRight = useCallback(() => {
    if (isGameOver) return;
    let changed = false;
    let turnScore = 0;
    const newBoard = board.map((row) => {
      const reversed = [...row].reverse();
      const { newRow, gainedScore } = slideAndMerge(reversed);
      turnScore += gainedScore;
      const unreversed = newRow.reverse();
      if (JSON.stringify(row) !== JSON.stringify(unreversed)) changed = true;
      return unreversed;
    });

    if (changed) {
      const withTile = addRandomTile(newBoard);
      setBoard(withTile);
      const nextScore = score + turnScore;
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
        try {
          localStorage.setItem("txclonedriver_2048_best", nextScore.toString());
        } catch {}
      }
      if (turnScore > 0) addCoins(turnScore, "Điểm 2048");
      if (!hasWon && withTile.some((r) => r.includes(2048))) {
        setHasWon(true);
        addCoins(50000, "Chiến thắng 2048!");
      }
      if (checkGameOver(withTile)) setIsGameOver(true);
    }
  }, [addCoins, bestScore, board, hasWon, isGameOver, score]);

  const moveUp = useCallback(() => {
    if (isGameOver) return;
    let changed = false;
    let turnScore = 0;
    const newBoard = createEmptyBoard();

    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const { newRow, gainedScore } = slideAndMerge(col);
      turnScore += gainedScore;
      for (let r = 0; r < GRID_SIZE; r++) {
        newBoard[r][c] = newRow[r];
        if (newBoard[r][c] !== board[r][c]) changed = true;
      }
    }

    if (changed) {
      const withTile = addRandomTile(newBoard);
      setBoard(withTile);
      const nextScore = score + turnScore;
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
        try {
          localStorage.setItem("txclonedriver_2048_best", nextScore.toString());
        } catch {}
      }
      if (turnScore > 0) addCoins(turnScore, "Điểm 2048");
      if (!hasWon && withTile.some((r) => r.includes(2048))) {
        setHasWon(true);
        addCoins(50000, "Chiến thắng 2048!");
      }
      if (checkGameOver(withTile)) setIsGameOver(true);
    }
  }, [addCoins, bestScore, board, hasWon, isGameOver, score]);

  const moveDown = useCallback(() => {
    if (isGameOver) return;
    let changed = false;
    let turnScore = 0;
    const newBoard = createEmptyBoard();

    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const { newRow, gainedScore } = slideAndMerge(col);
      turnScore += gainedScore;
      for (let r = 0; r < GRID_SIZE; r++) {
        newBoard[3 - r][c] = newRow[r];
        if (newBoard[3 - r][c] !== board[3 - r][c]) changed = true;
      }
    }

    if (changed) {
      const withTile = addRandomTile(newBoard);
      setBoard(withTile);
      const nextScore = score + turnScore;
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
        try {
          localStorage.setItem("txclonedriver_2048_best", nextScore.toString());
        } catch {}
      }
      if (turnScore > 0) addCoins(turnScore, "Điểm 2048");
      if (!hasWon && withTile.some((r) => r.includes(2048))) {
        setHasWon(true);
        addCoins(50000, "Chiến thắng 2048!");
      }
      if (checkGameOver(withTile)) setIsGameOver(true);
    }
  }, [addCoins, bestScore, board, hasWon, isGameOver, score]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") moveLeft();
      else if (e.key === "ArrowRight") moveRight();
      else if (e.key === "ArrowUp") moveUp();
      else if (e.key === "ArrowDown") moveDown();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLeft, moveRight, moveUp, moveDown]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
            ✨ SIÊU PHẨM 2048 MASTER
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Trí Tuệ
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ghép các ô cùng số để đạt mốc 2048. Mỗi lần gộp ô nhận Xu thưởng tương ứng!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Điểm số</div>
              <div className="text-sm font-black text-white">{score.toLocaleString()}</div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Kỷ Lục</div>
              <div className="text-sm font-black text-amber-400">{bestScore.toLocaleString()}</div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Ván Mới
          </button>
        </div>
      </div>

      {/* Main Board & Mobile Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="p-4 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
          <div className="grid grid-cols-4 gap-2.5 w-full h-full">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const colorClass =
                  cell > 0 ? TILE_COLORS[cell] || "bg-amber-500 text-white" : "bg-slate-900/60 border border-white/5";
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black border transition-all duration-150 ${colorClass}`}
                  >
                    {cell > 0 ? cell : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* Victory Overlay */}
          {hasWon && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <span className="text-3xl font-black text-amber-400 mb-1">🎉 BẠN ĐẠT 2048!</span>
              <p className="text-xs text-slate-300 mb-4">+50,000 Xu Thưởng Chiến Thắng!</p>
              <button
                onClick={() => setHasWon(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg"
              >
                Tiếp Tục Chơi Lên 4096
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <span className="text-3xl font-black text-rose-500 mb-1">HẾT NƯỚC ĐI!</span>
              <p className="text-xs text-slate-400 mb-4">Bạn đạt tổng cộng {score} điểm</p>
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg"
              >
                Chơi Lại Ván Khác
              </button>
            </div>
          )}
        </div>

        {/* Touch controls for mobile */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <span className="text-xs font-bold text-muted-foreground uppercase text-center block">
            Điều Khiển Bằng Phím Mũi Tên Hoặc Cảm Ứng
          </span>

          <div className="grid grid-cols-3 gap-2 w-48">
            <div />
            <button
              onClick={moveUp}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowUp className="w-6 h-6 text-amber-400" />
            </button>
            <div />

            <button
              onClick={moveLeft}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowLeft className="w-6 h-6 text-amber-400" />
            </button>
            <button
              onClick={moveDown}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowDown className="w-6 h-6 text-amber-400" />
            </button>
            <button
              onClick={moveRight}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowRight className="w-6 h-6 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
