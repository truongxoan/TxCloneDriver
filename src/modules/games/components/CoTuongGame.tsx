"use client";

import React, { useState } from "react";
import { useGames } from "../gamesContext";
import { RotateCcw, Trophy, Users } from "lucide-react";

type Side = "red" | "black";
type PieceType = "general" | "advisor" | "elephant" | "horse" | "chariot" | "cannon" | "soldier";

interface Piece {
  id: string;
  side: Side;
  type: PieceType;
  label: string;
}

type BoardState = (Piece | null)[][];

const INITIAL_PIECES: BoardState = [
  // Row 0: Black main line
  [
    { id: "b_r1", side: "black", type: "chariot", label: "車" },
    { id: "b_h1", side: "black", type: "horse", label: "馬" },
    { id: "b_e1", side: "black", type: "elephant", label: "象" },
    { id: "b_a1", side: "black", type: "advisor", label: "士" },
    { id: "b_g", side: "black", type: "general", label: "將" },
    { id: "b_a2", side: "black", type: "advisor", label: "士" },
    { id: "b_e2", side: "black", type: "elephant", label: "象" },
    { id: "b_h2", side: "black", type: "horse", label: "馬" },
    { id: "b_r2", side: "black", type: "chariot", label: "車" },
  ],
  // Row 1
  Array(9).fill(null),
  // Row 2: Black Cannons
  [
    null,
    { id: "b_c1", side: "black", type: "cannon", label: "砲" },
    null,
    null,
    null,
    null,
    null,
    { id: "b_c2", side: "black", type: "cannon", label: "砲" },
    null,
  ],
  // Row 3: Black Soldiers
  [
    { id: "b_s1", side: "black", type: "soldier", label: "卒" },
    null,
    { id: "b_s2", side: "black", type: "soldier", label: "卒" },
    null,
    { id: "b_s3", side: "black", type: "soldier", label: "卒" },
    null,
    { id: "b_s4", side: "black", type: "soldier", label: "卒" },
    null,
    { id: "b_s5", side: "black", type: "soldier", label: "卒" },
  ],
  // Row 4: Sông
  Array(9).fill(null),
  // Row 5: Sông
  Array(9).fill(null),
  // Row 6: Red Soldiers
  [
    { id: "r_s1", side: "red", type: "soldier", label: "兵" },
    null,
    { id: "r_s2", side: "red", type: "soldier", label: "兵" },
    null,
    { id: "r_s3", side: "red", type: "soldier", label: "兵" },
    null,
    { id: "r_s4", side: "red", type: "soldier", label: "兵" },
    null,
    { id: "r_s5", side: "red", type: "soldier", label: "兵" },
  ],
  // Row 7: Red Cannons
  [
    null,
    { id: "r_c1", side: "red", type: "cannon", label: "砲" },
    null,
    null,
    null,
    null,
    null,
    { id: "r_c2", side: "red", type: "cannon", label: "砲" },
    null,
  ],
  // Row 8
  Array(9).fill(null),
  // Row 9: Red main line
  [
    { id: "r_r1", side: "red", type: "chariot", label: "車" },
    { id: "r_h1", side: "red", type: "horse", label: "傌" },
    { id: "r_e1", side: "red", type: "elephant", label: "相" },
    { id: "r_a1", side: "red", type: "advisor", label: "仕" },
    { id: "r_g", side: "red", type: "general", label: "帥" },
    { id: "r_a2", side: "red", type: "advisor", label: "仕" },
    { id: "r_e2", side: "red", type: "elephant", label: "相" },
    { id: "r_h2", side: "red", type: "horse", label: "傌" },
    { id: "r_r2", side: "red", type: "chariot", label: "車" },
  ],
];

export function CoTuongGame() {
  const { addCoins } = useGames();
  const [board, setBoard] = useState<BoardState>(INITIAL_PIECES);
  const [currentSide, setCurrentSide] = useState<Side>("red");
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [winner, setWinner] = useState<Side | null>(null);
  const [capturedRed, setCapturedRed] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);

  const handleCellClick = (r: number, c: number) => {
    if (winner) return;

    const piece = board[r][c];

    // If already selected a piece
    if (selectedPos) {
      const [sr, sc] = selectedPos;
      const selectedPiece = board[sr][sc];

      // If clicked on same position -> deselect
      if (sr === r && sc === c) {
        setSelectedPos(null);
        return;
      }

      // If clicked on another piece of same side -> switch selection
      if (piece && piece.side === currentSide) {
        setSelectedPos([r, c]);
        return;
      }

      // Execute move / capture
      if (selectedPiece) {
        const nextBoard = board.map((row) => [...row]);
        const targetPiece = nextBoard[r][c];

        if (targetPiece) {
          if (targetPiece.side === "red") {
            setCapturedRed((prev) => [...prev, targetPiece]);
          } else {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          }

          // Check if General was captured
          if (targetPiece.type === "general") {
            setWinner(currentSide);
            if (currentSide === "red") {
              addCoins(10000, "Thắng Cờ Tướng");
            }
          }
        }

        nextBoard[r][c] = selectedPiece;
        nextBoard[sr][sc] = null;

        setBoard(nextBoard);
        setSelectedPos(null);
        setCurrentSide((prev) => (prev === "red" ? "black" : "red"));
      }
    } else {
      // Select piece of current turn
      if (piece && piece.side === currentSide) {
        setSelectedPos([r, c]);
      }
    }
  };

  const handleReset = () => {
    setBoard(INITIAL_PIECES);
    setCurrentSide("red");
    setSelectedPos(null);
    setWinner(null);
    setCapturedRed([]);
    setCapturedBlack([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-rose-400 flex items-center gap-2">
            🏮 CỜ TƯỚNG (XIANGQI) TRUYỀN THỐNG
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Sở Hà Hán Giới
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bàn cờ 9x10 với đầy đủ 32 quân. Nhấp chọn quân và ô đến để đi nước cờ hoặc ăn quân đối phương!
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Bắt Đầu Lại
        </button>
      </div>

      {/* Turn & Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Lượt đi:</span>
          <span
            className={`px-3 py-0.5 rounded-lg font-black text-xs ${
              currentSide === "red"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : "bg-slate-800 text-slate-200 border border-slate-600"
            }`}
          >
            {currentSide === "red" ? "🔴 BÊN ĐỎ (ĐI TRƯỚC)" : "⚫ BÊN ĐEN (ĐI SAU)"}
          </span>
        </div>

        {winner && (
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/40 animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            BÊN {winner === "red" ? "ĐỎ" : "ĐEN"} ĐÃ CHIẾN THẮNG BẮT TƯỚNG!
          </div>
        )}
      </div>

      {/* Xiangqi Board */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div className="inline-block p-4 rounded-3xl bg-[#d2a36b] shadow-2xl border-4 border-[#7b4e23]">
          <div className="flex flex-col gap-1">
            {board.map((row, r) => (
              <React.Fragment key={r}>
                {/* Sông Giữa Bàn Cờ (Row 4 & 5) */}
                {r === 5 && (
                  <div className="h-8 flex items-center justify-around bg-[#c79459] border-y border-[#7b4e23] my-0.5 text-xs font-black text-[#683f19] tracking-widest uppercase">
                    <span>SỞ HÀ (楚河)</span>
                    <span>HÁN GIỚI (漢界)</span>
                  </div>
                )}

                <div className="flex gap-1 justify-center">
                  {row.map((piece, c) => {
                    const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black transition-all relative ${
                          isSelected
                            ? "ring-4 ring-amber-400 scale-110 shadow-xl z-10"
                            : "hover:scale-105"
                        } ${
                          piece
                            ? piece.side === "red"
                              ? "bg-[#fff2db] border-2 border-[#b02222] text-[#b02222] shadow-md shadow-red-950/40"
                              : "bg-[#2d2f33] border-2 border-[#555] text-slate-100 shadow-md shadow-black/50"
                            : "bg-transparent border border-dashed border-[#a37544]/40 hover:bg-[#a37544]/20"
                        }`}
                      >
                        {piece ? (
                          <span className="text-lg sm:text-xl font-black drop-shadow-sm leading-none">
                            {piece.label}
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7b4e23]/30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
