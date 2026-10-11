"use client";

import React, { useState, useEffect } from "react";
import { useGames } from "../gamesContext";
import { Send, RotateCcw, Sparkles, Bot, AlertCircle, Lightbulb, Trophy, HelpCircle } from "lucide-react";

// Massive smart Vietnamese word pairs dictionary for smooth gameplay
const VIETNAMESE_DICTIONARY: Record<string, string[]> = {
  học: ["tập", "sinh", "hành", "vấn", "thức", "đường", "hỏi", "vẹt", "viên", "bổng"],
  tập: ["làm", "thể", "hợp", "quán", "trung", "luyện", "kết", "san", "tranh", "tục"],
  làm: ["giàu", "việc", "quen", "ăn", "lụng", "bộ", "chứng", "duyên", "lại", "thuê"],
  giàu: ["có", "sang", "đẹp", "mạnh", "sụ", "nứt"],
  có: ["ích", "học", "tiền", "nghĩa", "lý", "tài", "hiếu", "hạn", "duyên", "thể"],
  ích: ["lợi", "kỷ", "nước", "chung", "hữu"],
  lợi: ["ích", "nhuận", "thế", "lộc", "dụng", "hại", "bất", "quyền"],
  sinh: ["sống", "viên", "hoạt", "thái", "đẻ", "học", "sản", "tồn", "vật", "khí"],
  sống: ["còn", "động", "lại", "chết", "mòn", "gấp"],
  hoạt: ["động", "bát", "họa", "chất", "kê", "cảnh"],
  động: ["lực", "từ", "vật", "viên", "não", "đất", "tác", "viên", "kinh", "tĩnh"],
  lực: ["lượng", "sĩ", "học", "điền", "hút", "chiến", "bất"],
  lượng: ["tử", "giác", "thứ", "hóa", "sức", "giá"],
  tử: ["tế", "chiến", "thần", "vi", "hình", "biệt", "nạn"],
  tế: ["nhị", "bào", "lễ", "độ", "bần", "điển"],
  viên: ["mãn", "chức", "ngọc", "đạn", "tịch", "thành"],
  thể: ["thao", "hiện", "lực", "chế", "xác", "diện", "thống", "nghiệm"],
  thao: ["tác", "trường", "diễn", "luyện", "túng", "thức"],
  tác: ["phẩm", "chiến", "giả", "dụng", "động", "hợp", "vụ", "phong"],
  phẩm: ["chất", "giá", "cách", "hàm", "vật", "trật"],
  chất: ["lượng", "phác", "vấn", "chứa", "độc", "khoáng"],
  thành: ["phố", "công", "tựu", "nhân", "thật", "quả", "viên", "tâm", "thạo"],
  phố: ["xá", "phường", "cổ", "hoa", "thị"],
  công: ["nghệ", "nhân", "việc", "sức", "đoàn", "cụ", "bằng", "lý", "dân", "viên"],
  nghệ: ["thuật", "nhân", "sĩ", "nghiệp", "quật", "danh"],
  thuật: ["toán", "ngữ", "số", "sư", "pháp", "điều"],
  toán: ["học", "đố", "cộng", "trừ", "nhân", "chia", "toàn"],
  nhân: ["dân", "loại", "tài", "ái", "nghĩa", "vật", "cách", "sự", "hậu", "viên"],
  dân: ["chủ", "tộc", "gian", "cư", "sinh", "trí", "lập", "nghèo"],
  chủ: ["quyền", "đề", "nghĩa", "nhật", "yếu", "tọa", "tịch", "quan", "trương"],
  quyền: ["lợi", "lực", "hạn", "năng", "biến", "quản"],
  đất: ["nước", "đai", "sét", "lành", "thổ", "trời", "mẹ"],
  nước: ["nhà", "mắt", "ngọt", "khoáng", "biển", "ngoài", "sôi", "lọc"],
  nhà: ["cửa", "bếp", "kho", "trường", "văn", "xe", "hàng", "ga"],
  cửa: ["sổ", "khẩu", "ải", "nhà", "biển", "chính", "ngõ"],
  sổ: ["tay", "sách", "lồng", "bụi", "đỏ"],
  tay: ["chân", "lái", "nghề", "trắng", "mặt", "hòm", "vịn"],
  lái: ["xe", "đò", "buôn", "thuyền", "máy"],
  xe: ["máy", "cộ", "tải", "buýt", "lửa", "hơi", "đạp", "lăn"],
  máy: ["tính", "móc", "bay", "ảnh", "in", "quay", "hút"],
  tính: ["toán", "cách", "nết", "chất", "mạng", "năng", "kế", "tiền"],
  tiền: ["bạc", "tài", "túi", "án", "đạo", "bối", "phong", "tuyến"],
  bạc: ["liêu", "màu", "tình", "nhược", "phận"],
  bạn: ["bè", "hữu", "đời", "đọc", "thân", "đường"],
  bè: ["phái", "bạn", "xuôi"],
  hoa: ["hồng", "cúc", "mai", "lan", "quà", "lệ", "mỹ", "tiêu"],
  quà: ["tặng", "cáp", "bánh", "vặt"],
  tặng: ["phẩm", "thưởng", "cho", "tặng"],
  thưởng: ["thức", "phạt", "tiền", "nóng", "công"],
  thức: ["tỉnh", "khuya", "dậy", "ăn", "uống", "giác"],
  uống: ["nước", "rượu", "trà", "thuốc", "say"],
  trà: ["xanh", "sữa", "đá", "đạo", "thơm"],
  sữa: ["chua", "tươi", "mẹ", "bột"],
  yêu: ["thương", "quý", "đời", "nước", "dấu", "chuộng"],
  thương: ["yêu", "mến", "nhớ", "hại", "gia", "mại", "trường"],
  mại: ["dâm", "bản", "tài"],
  nhớ: ["nhung", "mong", "thương", "về", "lại"],
  mong: ["chờ", "đợi", "ước", "muốn", "ngóng"],
  chờ: ["đợi", "trông", "người", "thời"],
  đợi: ["chờ", "mong", "ai"],
  vui: ["vẻ", "tươi", "mừng", "sướng", "chơi", "nhộn"],
  vẻ: ["đẹp", "mặt", "ngoài"],
  đẹp: ["đẽ", "xinh", "mắt", "lòng", "gái", "trai"],
  gái: ["gú", "hư", "ngoan", "xinh"],
  trai: ["tráng", "tài", "trẻ", "thẳng"],
  trẻ: ["trung", "con", "thơ", "măng"],
  trung: ["thực", "tâm", "thành", "học", "niên", "ương"],
  thực: ["tế", "hiện", "tập", "phẩm", "vật", "chất", "hành"],
};

export function WordChainGame() {
  const { addCoins } = useGames();

  const [chain, setChain] = useState<Array<{ word: string; author: "you" | "bot" }>>([
    { word: "học tập", author: "bot" },
  ]);
  const [inputWord, setInputWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const lastWord = chain[chain.length - 1]?.word || "học tập";
  const requiredFirstChar = lastWord.split(" ")[1]?.toLowerCase() || "";

  // 20s countdown per round
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          setErrorMsg("Hết 20 giây! Bạn đã thua lượt này.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [chain, isGameOver]);

  const handleGetHint = () => {
    const options = VIETNAMESE_DICTIONARY[requiredFirstChar] || [];
    const available = options.filter(
      (opt) => !chain.some((c) => c.word.toLowerCase() === `${requiredFirstChar} ${opt}`)
    );
    if (available.length > 0) {
      setHint(`${requiredFirstChar} ${available[0]}`);
    } else {
      setHint(`${requiredFirstChar} ... (Thử từ ghép hợp lệ bắt đầu bằng "${requiredFirstChar}")`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGameOver) return;

    const trimmed = inputWord.trim().toLowerCase();
    const parts = trimmed.split(/\s+/);

    if (parts.length !== 2) {
      setErrorMsg("Từ phải gồm đúng 2 tiếng tiếng Việt (VD: 'tập làm', 'làm việc')!");
      return;
    }

    if (parts[0] !== requiredFirstChar) {
      setErrorMsg(`Tiếng đầu tiên bắt buộc phải là '${requiredFirstChar.toUpperCase()}'!`);
      return;
    }

    // Check if word was already used
    if (chain.some((c) => c.word.toLowerCase() === trimmed)) {
      setErrorMsg(`Từ '${trimmed}' đã được sử dụng trước đó trong ván này!`);
      return;
    }

    setErrorMsg(null);
    setHint(null);
    const newChain = [...chain, { word: trimmed, author: "you" as const }];
    setChain(newChain);
    setInputWord("");
    setScore((prev) => prev + 1);
    addCoins(1000, "Nối từ tiếng Việt thành công");

    // Smart Bot response logic
    setTimeout(() => {
      const botFirst = parts[1];
      const botOptions = VIETNAMESE_DICTIONARY[botFirst] || [];

      // Pick an unused word
      const available = botOptions.filter((opt) => {
        const candidate = `${botFirst} ${opt}`;
        return !newChain.some((c) => c.word.toLowerCase() === candidate);
      });

      if (available.length > 0) {
        const picked = available[Math.floor(Math.random() * available.length)];
        const botWord = `${botFirst} ${picked}`;
        setChain((prev) => [...prev, { word: botWord, author: "bot" }]);
        setTimeLeft(20);
      } else {
        // Fallback generator for smart bot
        const commonCompanions = ["này", "kia", "đó", "người", "nhà", "hoa", "tiền", "nước"];
        const fallbackAvailable = commonCompanions
          .map((comp) => `${botFirst} ${comp}`)
          .filter((w) => !newChain.some((c) => c.word.toLowerCase() === w));

        if (fallbackAvailable.length > 0 && Math.random() > 0.4) {
          const fallbackPick = fallbackAvailable[0];
          setChain((prev) => [...prev, { word: fallbackPick, author: "bot" }]);
          setTimeLeft(20);
        } else {
          // Bot has no word -> User wins!
          setIsGameOver(true);
          addCoins(5000, "Thắng Bot nối chữ");
          setErrorMsg(`🎉 Bot đã 'bí từ'! Chúc mừng bạn đã CHIẾN THẮNG (+5,000 Xu)!`);
        }
      }
    }, 500);
  };

  const handleReset = () => {
    setChain([{ word: "học tập", author: "bot" }]);
    setInputWord("");
    setTimeLeft(20);
    setIsGameOver(false);
    setScore(0);
    setErrorMsg(null);
    setHint(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            🔤 NỐI CHỮ TIẾNG VIỆT THÔNG MINH
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              AI Đối Kháng
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nối tiếp từ 2 tiếng với chữ cái bắt đầu bằng đuôi từ trước. Đánh bại Bot khi Bot hết từ!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGetHint}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Gợi Ý
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Game Arena */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-5">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Điểm số:</span>
            <span className="font-black text-amber-400 text-sm">{score} từ</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Thời gian lượt:</span>
            <span
              className={`font-black font-mono text-sm px-2.5 py-0.5 rounded-lg ${
                timeLeft <= 5 ? "bg-rose-500/20 text-rose-400 animate-pulse" : "bg-blue-500/20 text-blue-300"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Word Chain History Stream */}
        <div className="min-h-[220px] max-h-[320px] overflow-y-auto p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5">
          {chain.map((c, i) => {
            const isMe = c.author === "you";
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[10px] text-sky-400 font-bold shrink-0">
                    Bot
                  </div>
                )}
                <div
                  className={`px-3 py-1.5 rounded-2xl font-bold uppercase tracking-wide text-xs shadow-sm ${
                    isMe
                      ? "bg-amber-600 text-white rounded-br-none"
                      : "bg-slate-800 text-sky-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {c.word}
                </div>
                {isMe && (
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">
                    Bạn
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hint Box */}
        {hint && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Gợi ý cho bạn: <strong className="font-mono text-white underline cursor-pointer" onClick={() => setInputWord(hint)}>{hint}</strong> (Bấm để chọn)</span>
          </div>
        )}

        {/* Error / Result Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              disabled={isGameOver}
              placeholder={`Bắt đầu bằng từ '${requiredFirstChar.toUpperCase()}...' (VD: ${requiredFirstChar} ${
                VIETNAMESE_DICTIONARY[requiredFirstChar]?.[0] || "..."
              })`}
              className="w-full px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <span className="absolute right-3.5 top-3 px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-bold text-amber-300">
              Chữ đầu: {requiredFirstChar}
            </span>
          </div>

          <button
            type="submit"
            disabled={isGameOver || !inputWord.trim()}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Nối Từ</span>
          </button>
        </form>
      </div>
    </div>
  );
}
