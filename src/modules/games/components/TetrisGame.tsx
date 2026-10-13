"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGames } from "../gamesContext";
import { Play, Pause, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, RotateCw } from "lucide-react";

const COLS = 10;
const ROWS = 20;

type Grid = (string | null)[][];

const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-500" },
  O: { shape: [[1, 1], [1, 1]], color: "bg-yellow-400" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "bg-purple-500" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-emerald-500" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "bg-rose-500" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "bg-blue-500" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "bg-orange-500" },
};

export function TetrisGame() {
  const { addCoins } = useGames();

  const [grid, setGrid] = useState<Grid>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );

  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    color: string;
    r: number;
    c: number;
  } | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const spawnPiece = useCallback((): { shape: number[][]; color: string; r: number; c: number } => {
    const keys = Object.keys(TETROMINOES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const t = TETROMINOES[key];
    return {
      shape: t.shape,
      color: t.color,
      r: 0,
      c: Math.floor((COLS - t.shape[0].length) / 2),
    };
  }, []);

  const checkCollision = useCallback(
    (piece: { shape: number[][]; r: number; c: number }, currentGrid: Grid): boolean => {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const nr = piece.r + r;
            const nc = piece.c + c;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true;
            if (currentGrid[nr][nc] !== null) return true;
          }
        }
      }
      return false;
    },
    []
  );

  const mergePiece = useCallback(
    (piece: { shape: number[][]; color: string; r: number; c: number }, currentGrid: Grid) => {
      const nextGrid = currentGrid.map((row) => [...row]);
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            nextGrid[piece.r + r][piece.c + c] = piece.color;
          }
        }
      }

      // Check full lines
      let cleared = 0;
      const filtered = nextGrid.filter((row) => {
        const isFull = row.every((cell) => cell !== null);
        if (isFull) cleared++;
        return !isFull;
      });

      while (filtered.length < ROWS) {
        filtered.unshift(Array(COLS).fill(null));
      }

      if (cleared > 0) {
        const points = cleared === 1 ? 100 : cleared === 2 ? 300 : cleared === 3 ? 500 : 800;
        setScore((prev) => prev + points);
        setLines((prev) => prev + cleared);
        addCoins(points * 10, "Xóa hàng Tetris");
      }

      setGrid(filtered);

      // Spawn next piece
      const nextP = spawnPiece();
      if (checkCollision(nextP, filtered)) {
        setGameOver(true);
        setIsPlaying(false);
      } else {
        setCurrentPiece(nextP);
      }
    },
    [addCoins, checkCollision, spawnPiece]
  );

  const moveDown = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;
    const moved = { ...currentPiece, r: currentPiece.r + 1 };
    if (!checkCollision(moved, grid)) {
      setCurrentPiece(moved);
    } else {
      mergePiece(currentPiece, grid);
    }
  }, [checkCollision, currentPiece, gameOver, grid, isPlaying, mergePiece]);

  const moveHoriz = (dir: -1 | 1) => {
    if (!currentPiece || !isPlaying || gameOver) return;
    const moved = { ...currentPiece, c: currentPiece.c + dir };
    if (!checkCollision(moved, grid)) {
      setCurrentPiece(moved);
    }
  };

  const rotate = () => {
    if (!currentPiece || !isPlaying || gameOver) return;
    // Transpose and reverse
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map((row) => row[index]).reverse()
    );
    const candidate = { ...currentPiece, shape: rotatedShape };
    if (!checkCollision(candidate, grid)) {
      setCurrentPiece(candidate);
    }
  };

  const dropInstant = () => {
    if (!currentPiece || !isPlaying || gameOver) return;
    let curr = { ...currentPiece };
    while (!checkCollision({ ...curr, r: curr.r + 1 }, grid)) {
      curr.r += 1;
    }
    mergePiece(curr, grid);
  };

  // Game loop interval
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(moveDown, 600);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") moveHoriz(-1);
      else if (e.key === "ArrowRight") moveHoriz(1);
      else if (e.key === "ArrowDown") moveDown();
      else if (e.key === "ArrowUp") rotate();
      else if (e.key === " ") dropInstant();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver, moveHoriz, moveDown, rotate, dropInstant]);

  const handleStart = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    setCurrentPiece(spawnPiece());
  };

  // Render composite display grid
  const displayGrid = grid.map((row) => [...row]);
  if (currentPiece) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const nr = currentPiece.r + r;
          const nc = currentPiece.c + c;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            displayGrid[nr][nc] = currentPiece.color;
          }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-cyan-400 flex items-center gap-2">
            🧱 XẾP HÌNH TETRIS ARCADE
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Kinh Điển
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xoay và xếp các khối gạch lấp đầy hàng ngang. Mỗi hàng xóa nhận Xu thưởng!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Tạm Dừng" : "Tiếp Tục"}
          </button>
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Main Tetris Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Game Board */}
        <div className="p-3 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl relative">
          <div className="grid grid-cols-10 gap-[1px] bg-slate-900 border border-slate-800">
            {displayGrid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[2px] transition-colors ${
                    cell ? cell : "bg-slate-950/80 border border-white/5"
                  }`}
                />
              ))
            )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <span className="text-2xl font-black text-rose-500 mb-1">GAME OVER!</span>
              <p className="text-xs text-muted-foreground mb-4">Bạn đạt {score} điểm ({lines} hàng)</p>
              <button
                onClick={handleStart}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg"
              >
                Chơi Ván Mới
              </button>
            </div>
          )}
        </div>

        {/* Score & Mobile Controls */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {/* Stats Card */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-semibold">Điểm số:</span>
              <span className="text-xl font-black text-cyan-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-semibold">Hàng đã xóa:</span>
              <span className="text-lg font-black text-amber-400">{lines}</span>
            </div>
          </div>

          {/* On-Screen Mobile Touch Controls */}
          <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase text-center block">
              Phím Điều Khiển Cảm Ứng
            </span>
            <div className="flex justify-center">
              <button
                onClick={rotate}
                className="w-12 h-12 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 flex items-center justify-center text-white"
                title="Xoay Khối"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => moveHoriz(-1)}
                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white"
                title="Sang Trái"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={moveDown}
                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white"
                title="Rơi Xuống"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => moveHoriz(1)}
                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white"
                title="Sang Phải"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={dropInstant}
              className="w-full py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs"
            >
              Thả Rơi Nhanh (Space)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
