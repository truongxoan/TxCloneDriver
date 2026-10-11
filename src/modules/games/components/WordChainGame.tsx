"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { Send, RotateCcw, Sparkles, Bot, AlertCircle } from "lucide-react";

// Extensive Vietnamese word dictionary pairs for the game
const DICTIONARY: Record<string, string[]> = {
  học: ["tập", "sinh", "hành", "vấn", "thức", "đường"],
  tập: ["làm", "thể", "hợp", "quán", "trung", "luyện"],
  làm: ["giàu", "việc", "quen", "ăn", "lụng", "bộ"],
  giàu: ["có", "sang", "đẹp", "mạnh"],
  có: ["ích", "học", "tiền", "nghĩa", "lý"],
  ích: ["lợi", "kỷ", "nước", "chung"],
  lợi: ["ích", "nhuận", "thế", "lộc", "dụng"],
  sinh: ["sống", "viên", "hoạt", "thái", "đẻ", "học"],
  sống: ["còn", "động", "lại", "chết"],
  hoạt: ["động", "bát", "họa", "chất"],
  động: ["lực", "từ", "vật", "viên", "não", "đất"],
  lực: ["lượng", "sĩ", "học", "điền"],
  lượng: ["tử", "giác", "thứ", "hóa"],
  tử: ["tế", "chiến", "thần", "vi"],
  tế: ["nhị", "bào", "lễ", "độ"],
  viên: ["mãn", "chức", "ngọc", "đạn"],
  thể: ["thao", "hiện", "lực", "chế", "xác"],
  thao: ["tác", "trường", "diễn", "luyện"],
  tác: ["phẩm", "chiến", "giả", "dụng", "động"],
  phẩm: ["chất", "giá", "cách", "hàm"],
  chất: ["lượng", "phác", "vấn", "chứa"],
  thành: ["phố", "công", "tựu", "nhân", "thật"],
  phố: ["xá", "phường", "cổ", "hoa"],
  xá: ["xị", "miễn", "tội"],
  công: ["nghệ", "nhân", "việc", "sức", "đoàn"],
  nghệ: ["thuật", "nhân", "sĩ", "nghiệp"],
  thuật: ["toán", "ngữ", "số", "sư"],
  toán: ["học", "đố", "cộng", "trừ"],
  nhân: ["dân", "loại", "tài", "ái", "nghĩa"],
  dân: ["chủ", "tộc", "gian", "cư", "sinh"],
  chủ: ["quyền", "đề", "nghĩa", "nhật", "yếu"],
  quyền: ["lợi", "lực", "hạn", "năng"],
  đất: ["nước", "đai", "sét", "lành"],
  nước: ["nhà", "mắt", "ngọt", "khoáng"],
  nhà: ["cửa", "bếp", "kho", "trường"],
  cửa: ["sổ", "khẩu", "ải", "nhà"],
  sổ: ["tay", "sách", "lồng"],
  tay: ["chân", "lái", "nghề", "trắng"],
  lái: ["xe", "đò", "buôn"],
  xe: ["máy", "cộ", "tải", "buýt", "lửa"],
  máy: ["tính", "móc", "bay", "ảnh"],
  tính: ["toán", "cách", "nết", "chất"],
};

export function WordChainGame() {
  const { addCoins } = useGames();

  const [chain, setChain] = useState<Array<{ word: string; author: "you" | "bot" }>>([
    { word: "học tập", author: "bot" },
  ]);
  const [inputWord, setInputWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lastWord = chain[chain.length - 1]?.word || "học tập";
  const requiredFirstChar = lastWord.split(" ")[1]?.toLowerCase() || "";

  // 15s timer for user turn
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          setErrorMsg("Hết giờ! Bạn đã bị thua trong lượt này.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [chain, isGameOver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGameOver) return;

    const trimmed = inputWord.trim().toLowerCase();
    const parts = trimmed.split(/\s+/);

    if (parts.length !== 2) {
      setErrorMsg("Từ phải gồm đúng 2 tiếng (ví dụ: 'tập làm', 'làm việc')!");
      return;
    }

    if (parts[0] !== requiredFirstChar) {
      setErrorMsg(`Tiếng đầu tiên phải là '${requiredFirstChar.toUpperCase()}'!`);
      return;
    }

    // Check if word was already used in current chain
    if (chain.some((c) => c.word.toLowerCase() === trimmed)) {
      setErrorMsg("Từ này đã được dùng trước đó trong lượt nối!");
      return;
    }

    setErrorMsg(null);
    const newChain = [...chain, { word: trimmed, author: "you" as const }];
    setChain(newChain);
    setInputWord("");
    setScore((prev) => prev + 1);
    addCoins(1000, "Nối từ thành công");

    // Bot response logic
    setTimeout(() => {
      const botFirst = parts[1];
      const botOptions = DICTIONARY[botFirst] || [];

      // Pick an unused word
      const available = botOptions.filter((opt) => {
        const candidate = `${botFirst} ${opt}`;
        return !newChain.some((c) => c.word.toLowerCase() === candidate);
      });

      if (available.length > 0) {
        const picked = available[Math.floor(Math.random() * available.length)];
        const botWord = `${botFirst} ${picked}`;
        setChain((prev) => [...prev, { word: botWord, author: "bot" }]);
        setTimeLeft(15);
      } else {
        // Bot has no words -> User wins round
        setIsGameOver(true);
        addCoins(5000, "Thắng Bot nối chữ");
        setErrorMsg(`🎉 Bot đã 'bí từ'! Chúc mừng bạn đã CHIẾN THẮNG (+5,000 Xu)!`);
      }
    }, 600);
  };

  const handleReset = () => {
    setChain([{ word: "học tập", author: "bot" }]);
    setInputWord("");
    setTimeLeft(15);
    setIsGameOver(false);
    setScore(0);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            🔤 NỐI CHỮ TIẾNG VIỆT ĐỐI KHÁNG
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              15 Giây / Lượt
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nối tiếp từ 2 tiếng với chữ cái bắt đầu bằng đuôi từ trước. Đánh bại Bot khi Bot hết từ!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
            Chuỗi đúng: {score} từ
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Arena & Chat Chain */}
      <div className="rounded-3xl p-6 bg-slate-950/80 border border-white/10 shadow-2xl space-y-4">
        {/* Timer Bar */}
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-muted-foreground">
            Từ tiếp theo bắt đầu bằng: <strong className="text-amber-400 uppercase text-sm">&ldquo;{requiredFirstChar}&rdquo;</strong>
          </span>
          <span
            className={`font-black px-2.5 py-0.5 rounded-full ${
              timeLeft <= 5 ? "bg-rose-500/30 text-rose-300 animate-pulse" : "bg-sky-500/20 text-sky-300"
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>

        {/* Chain Display */}
        <div className="h-64 overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3 flex flex-col">
          {chain.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 max-w-[80%] ${
                item.author === "you" ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  item.author === "you" ? "bg-amber-500 text-slate-950" : "bg-purple-600 text-white"
                }`}
              >
                {item.author === "you" ? "B" : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`px-4 py-2 rounded-2xl text-sm font-bold shadow ${
                  item.author === "you"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950"
                    : "bg-slate-800 text-slate-100 border border-slate-700"
                }`}
              >
                {item.word}
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            disabled={isGameOver}
            placeholder={`Gõ từ 2 tiếng bắt đầu bằng '${requiredFirstChar}' (vd: ${requiredFirstChar} ...)`}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={isGameOver || !inputWord.trim()}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:opacity-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4" /> Nối Từ
          </button>
        </form>
      </div>
    </div>
  );
}
