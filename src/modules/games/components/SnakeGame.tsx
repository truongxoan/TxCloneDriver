"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGames } from "../gamesContext";
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Trophy } from "lucide-react";

const COLS = 20;
const ROWS = 20;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };

export function SnakeGame() {
  const { addCoins } = useGames();

  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [bonusFood, setBonusFood] = useState<Point | null>(null);
  const [dir, setDir] = useState<Point>({ x: 0, y: -1 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  const dirRef = useRef<Point>(dir);
  dirRef.current = dir;

  // Load High score
  useEffect(() => {
    try {
      const saved = localStorage.getItem("txclonedriver_snake_high");
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {}
  }, []);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let p: Point;
    while (true) {
      p = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      if (!currentSnake.some((segment) => segment.x === p.x && segment.y === p.y)) {
        break;
      }
    }
    return p;
  }, []);

  const handleStart = () => {
    const initSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initSnake);
    setFood(generateFood(initSnake));
    setBonusFood(null);
    setDir({ x: 0, y: -1 });
    dirRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const changeDirection = useCallback((newDir: Point) => {
    // Prevent 180 reverse
    if (dirRef.current.x + newDir.x === 0 && dirRef.current.y + newDir.y === 0) return;
    setDir(newDir);
    dirRef.current = newDir;
  }, []);

  // Main game tick
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const nextHead: Point = {
          x: (head.x + dirRef.current.x + COLS) % COLS,
          y: (head.y + dirRef.current.y + ROWS) % ROWS,
        };

        // Self collision check
        if (prev.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return prev;
        }

        const newSnake = [nextHead, ...prev];

        // Eat normal food
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setScore((s) => {
            const next = s + 10;
            if (next > highScore) {
              setHighScore(next);
              try {
                localStorage.setItem("txclonedriver_snake_high", next.toString());
              } catch {}
            }
            return next;
          });
          addCoins(500, "Rắn săn mồi");
          setFood(generateFood(newSnake));

          // 25% chance to spawn bonus diamond
          if (Math.random() < 0.25) {
            setBonusFood(generateFood(newSnake));
          }
          return newSnake;
        }

        // Eat bonus food
        if (bonusFood && nextHead.x === bonusFood.x && nextHead.y === bonusFood.y) {
          setScore((s) => s + 50);
          addCoins(3000, "Rắn ăn Kim Cương");
          setBonusFood(null);
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [addCoins, bonusFood, food, generateFood, gameOver, highScore, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp") changeDirection({ x: 0, y: -1 });
      else if (e.key === "ArrowDown") changeDirection({ x: 0, y: 1 });
      else if (e.key === "ArrowLeft") changeDirection({ x: -1, y: 0 });
      else if (e.key === "ArrowRight") changeDirection({ x: 1, y: 0 });
      else if (e.key === " ") setIsPlaying((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
            🐍 RẮN SĂN MỒI NEON CYBER
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Arcade Cực Cuốn
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Điều khiển rắn ăn ngọc năng lượng và kim cương. Đi xuyên tường không sợ va đập!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Điểm số</div>
              <div className="text-sm font-black text-white">{score}</div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Kỷ Lục</div>
              <div className="text-sm font-black text-amber-400">{highScore}</div>
            </div>
          </div>

          <button
            onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Tạm Dừng" : "Tiếp Tục"}
          </button>

          <button
            onClick={handleStart}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="p-3 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
          <div className="grid grid-cols-20 grid-rows-20 w-full h-full bg-slate-900/60 rounded-2xl relative overflow-hidden">
            {/* Snake Body */}
            {snake.map((segment, index) => (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute rounded-sm transition-all duration-75 ${
                  index === 0
                    ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-lg shadow-emerald-400/50 z-10"
                    : "bg-emerald-500/80 border border-emerald-300/30"
                }`}
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${(segment.x * 100) / COLS}%`,
                  top: `${(segment.y * 100) / ROWS}%`,
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute rounded-full bg-rose-500 shadow-lg shadow-rose-500/80 animate-ping"
              style={{
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                left: `${(food.x * 100) / COLS}%`,
                top: `${(food.y * 100) / ROWS}%`,
              }}
            />
            <div
              className="absolute rounded-full bg-rose-400 shadow-md shadow-rose-400 z-10"
              style={{
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                left: `${(food.x * 100) / COLS}%`,
                top: `${(food.y * 100) / ROWS}%`,
              }}
            />

            {/* Bonus Diamond */}
            {bonusFood && (
              <div
                className="absolute rounded-md bg-cyan-400 shadow-lg shadow-cyan-400/90 animate-bounce flex items-center justify-center text-[10px] z-10"
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${(bonusFood.x * 100) / COLS}%`,
                  top: `${(bonusFood.y * 100) / ROWS}%`,
                }}
              >
                💎
              </div>
            )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 z-20">
              <span className="text-3xl font-black text-rose-500 mb-1">RẮN ĐÃ TỬ TRẬN!</span>
              <p className="text-xs text-slate-400 mb-4">Bạn đạt {score} điểm</p>
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg"
              >
                Hồi Sinh Chơi Lại
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <span className="text-xs font-bold text-muted-foreground uppercase text-center block">
            Phím Điều Hướng Cảm Ứng
          </span>

          <div className="grid grid-cols-3 gap-2 w-48">
            <div />
            <button
              onClick={() => changeDirection({ x: 0, y: -1 })}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowUp className="w-6 h-6 text-emerald-400" />
            </button>
            <div />

            <button
              onClick={() => changeDirection({ x: -1, y: 0 })}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-400" />
            </button>
            <button
              onClick={() => changeDirection({ x: 0, y: 1 })}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowDown className="w-6 h-6 text-emerald-400" />
            </button>
            <button
              onClick={() => changeDirection({ x: 1, y: 0 })}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <ArrowRight className="w-6 h-6 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
