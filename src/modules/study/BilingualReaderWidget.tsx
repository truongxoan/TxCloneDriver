"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Film,
  Sparkles,
  Volume2,
  Bookmark,
  Languages,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DictionaryPopup {
  word: string;
  pinyin: string;
  vietnamese: string;
  hskLevel: string;
  example: string;
}

interface BilingualStory {
  id: string;
  title: string;
  lang: string;
  level: string;
  tokens: Array<{
    text: string;
    pinyin?: string;
    meaning?: string;
    hsk?: string;
    isPunctuation?: boolean;
  }>;
  vietnameseTranslation: string;
}

interface VideoSubtitleItem {
  id: string;
  title: string;
  videoUrl: string;
  subtitles: Array<{
    timeSec: number;
    timeLabel: string;
    original: string;
    pinyin: string;
    vietnamese: string;
  }>;
}

const SAMPLE_STORIES: BilingualStory[] = [
  {
    id: "story-1",
    title: "一杯温暖的咖啡 (Một Tách Cà Phê Ấm Áp)",
    lang: "Tiếng Trung (HSK 2-3)",
    level: "HSK 2 - 3",
    tokens: [
      { text: "今天", pinyin: "Jīntiān", meaning: "Hôm nay", hsk: "HSK 1" },
      { text: "天气", pinyin: "tiānqì", meaning: "Thời tiết", hsk: "HSK 1" },
      { text: "很", pinyin: "hěn", meaning: "Rất", hsk: "HSK 1" },
      { text: "冷", pinyin: "lěng", meaning: "Lạnh", hsk: "HSK 1" },
      { text: "，", isPunctuation: true },
      { text: "我", pinyin: "wǒ", meaning: "Tôi", hsk: "HSK 1" },
      { text: "去", pinyin: "qù", meaning: "Đi", hsk: "HSK 1" },
      { text: "了", pinyin: "le", meaning: "Rồi/trợ từ", hsk: "HSK 1" },
      { text: "学校", pinyin: "xuéxiào", meaning: "Trường học", hsk: "HSK 1" },
      { text: "旁边", pinyin: "pángbiān", meaning: "Bên cạnh", hsk: "HSK 2" },
      { text: "的", pinyin: "de", meaning: "Của", hsk: "HSK 1" },
      { text: "咖啡馆", pinyin: "kāfēiguǎn", meaning: "Quán cà phê", hsk: "HSK 3" },
      { text: "。", isPunctuation: true },
      { text: "服务员", pinyin: "fúwùyuán", meaning: "Người phục vụ", hsk: "HSK 2" },
      { text: "给", pinyin: "gěi", meaning: "Cho/đưa cho", hsk: "HSK 2" },
      { text: "我", pinyin: "wǒ", meaning: "Tôi", hsk: "HSK 1" },
      { text: "倒了", pinyin: "dàole", meaning: "Rót cho", hsk: "HSK 3" },
      { text: "一杯", pinyin: "yībēi", meaning: "Một cốc/tách", hsk: "HSK 1" },
      { text: "热咖啡", pinyin: "rè kāfēi", meaning: "Cà phê nóng", hsk: "HSK 2" },
      { text: "，", isPunctuation: true },
      { text: "味道", pinyin: "wèidào", meaning: "Hương vị", hsk: "HSK 3" },
      { text: "非常", pinyin: "fēicháng", meaning: "Vô cùng", hsk: "HSK 2" },
      { text: "香", pinyin: "xiāng", meaning: "Thơm", hsk: "HSK 3" },
      { text: "。", isPunctuation: true },
    ],
    vietnameseTranslation:
      "Hôm nay thời tiết rất lạnh, tôi đã đến quán cà phê bên cạnh trường học. Nhân viên phục vụ rót cho tôi một tách cà phê nóng, hương vị vô cùng thơm ngon.",
  },
  {
    id: "story-2",
    title: "迷路的小猫 (Chú Mèo Nhỏ Lạc Đường)",
    lang: "Tiếng Trung (HSK 1-2)",
    level: "HSK 1 - 2",
    tokens: [
      { text: "昨天", pinyin: "Zuótiān", meaning: "Hôm qua", hsk: "HSK 1" },
      { text: "晚上", pinyin: "wǎnshang", meaning: "Buổi tối", hsk: "HSK 1" },
      { text: "，", isPunctuation: true },
      { text: "我", pinyin: "wǒ", meaning: "Tôi", hsk: "HSK 1" },
      { text: "在", pinyin: "zài", meaning: "Ở/tại", hsk: "HSK 1" },
      { text: "路上", pinyin: "lùshang", meaning: "Trên đường", hsk: "HSK 2" },
      { text: "看见", pinyin: "kànjiàn", meaning: "Nhìn thấy", hsk: "HSK 1" },
      { text: "了", pinyin: "le", meaning: "Đã", hsk: "HSK 1" },
      { text: "一只", pinyin: "yīzhī", meaning: "Một con", hsk: "HSK 2" },
      { text: "小白猫", pinyin: "xiǎo báimāo", meaning: "Mèo trắng nhỏ", hsk: "HSK 1" },
      { text: "。", isPunctuation: true },
      { text: "它", pinyin: "tā", meaning: "Nó", hsk: "HSK 2" },
      { text: "好像", pinyin: "hǎoxiàng", meaning: "Dường như", hsk: "HSK 3" },
      { text: "迷路", pinyin: "mílù", meaning: "Lạc đường", hsk: "HSK 3" },
      { text: "了", pinyin: "le", meaning: "Rồi", hsk: "HSK 1" },
      { text: "，", isPunctuation: true },
      { text: "一直", pinyin: "yīzhí", meaning: "Liên tục", hsk: "HSK 3" },
      { text: "在", pinyin: "zài", meaning: "Đang", hsk: "HSK 1" },
      { text: "叫", pinyin: "jiào", meaning: "Kêu", hsk: "HSK 1" },
      { text: "。", isPunctuation: true },
    ],
    vietnameseTranslation:
      "Tối hôm qua, tôi nhìn thấy một chú mèo trắng nhỏ trên đường. Nó dường như bị lạc đường, cứ kêu liên tục.",
  },
];

const SAMPLE_VIDEO_SUBS: VideoSubtitleItem = {
  id: "vid-1",
  title: "Đoạn Hội Thoại Hàng Ngày Trong Phim Trung Quốc (Có Sub Song Ngữ)",
  videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
  subtitles: [
    {
      timeSec: 0,
      timeLabel: "00:05",
      original: "你好，很高兴认识你！",
      pinyin: "Nǐ hǎo, hěn gāoxìng rènshí nǐ!",
      vietnamese: "Xin chào, rất vui được làm quen với bạn!",
    },
    {
      timeSec: 10,
      timeLabel: "00:15",
      original: "你最近工作忙不忙？",
      pinyin: "Nǐ zuìjìn gōngzuò máng bù máng?",
      vietnamese: "Dạo gần đây công việc của bạn có bận không?",
    },
    {
      timeSec: 25,
      timeLabel: "00:30",
      original: "还可以，周末我们一起去喝茶吧。",
      pinyin: "Hái kěyǐ, zhōumò wǒmen yīqǐ qù hē chá ba.",
      vietnamese: "Cũng tàm tạm, cuối tuần chúng ta cùng đi uống trà nhé.",
    },
    {
      timeSec: 40,
      timeLabel: "00:45",
      original: "好啊，那周六下午见！",
      pinyin: "Hǎo a, nà zhōuliù xiàwǔ jiàn!",
      vietnamese: "Được thôi, vậy hẹn gặp chiều thứ Bảy nhé!",
    },
  ],
};

export function BilingualReaderWidget() {
  const [activeTab, setActiveTab] = useState<"stories" | "video">("stories");
  const [selectedStory, setSelectedStory] = useState<BilingualStory>(SAMPLE_STORIES[0]);
  const [showFullTranslation, setShowFullTranslation] = useState<boolean>(false);
  const [popupData, setPopupData] = useState<DictionaryPopup | null>(null);
  const [savedFlashcards, setSavedFlashcards] = useState<string[]>([]);
  const [activeSubIndex, setActiveSubIndex] = useState<number>(0);

  // Text-to-Speech
  const speakChinese = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (token: any) => {
    if (token.isPunctuation) return;
    speakChinese(token.text);
    setPopupData({
      word: token.text,
      pinyin: token.pinyin || "",
      vietnamese: token.meaning || "",
      hskLevel: token.hsk || "HSK 1",
      example: `${token.text} - ${token.meaning}`,
    });
  };

  const handleSaveCard = (word: string) => {
    if (!savedFlashcards.includes(word)) {
      setSavedFlashcards([...savedFlashcards, word]);
      alert(`Đã lưu "${word}" vào Flashcard cá nhân!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Stories or Video Subtitle */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("stories")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "stories"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
            )}
          >
            <BookOpen className="w-4 h-4" /> Đọc Truyện & Tra Từ 1-Chạm
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "video"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
            )}
          >
            <Film className="w-4 h-4" /> Phim & Video Sub Song Ngữ
          </button>
        </div>

        {savedFlashcards.length > 0 && (
          <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Đã lưu {savedFlashcards.length} từ vào Flashcard
          </span>
        )}
      </div>

      {/* VIEW 1: BILINGUAL STORIES WITH INSTANT AI DICTIONARY */}
      {activeTab === "stories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stories List (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
              Chọn Bài Đọc Truyện Ngắn:
            </span>
            {SAMPLE_STORIES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStory(s);
                  setPopupData(null);
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border text-left transition-all space-y-1 block",
                  selectedStory.id === s.id
                    ? "bg-blue-600/20 border-blue-500 shadow-lg"
                    : "glass-card border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-sky-300">
                    {s.level}
                  </span>
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <h4 className="font-bold text-white text-sm leading-snug">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{s.vietnameseTranslation}</p>
              </button>
            ))}
          </div>

          {/* Reading Arena (Right 8 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-card border border-white/15 bg-slate-900/80 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] text-sky-400 font-bold uppercase">{selectedStory.lang}</span>
                <h3 className="text-xl font-black text-white">{selectedStory.title}</h3>
              </div>
              <button
                onClick={() => setShowFullTranslation(!showFullTranslation)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10"
              >
                {showFullTranslation ? "Ẩn Dịch Tiếng Việt" : "Xem Bản Dịch Đầy Đủ"}
              </button>
            </div>

            {/* Clickable Word Token Flow */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 leading-loose text-lg sm:text-xl font-serif select-none flex flex-wrap items-baseline gap-1">
              {selectedStory.tokens.map((token, idx) => (
                <span
                  key={idx}
                  onClick={() => handleWordClick(token)}
                  className={cn(
                    "transition-all cursor-pointer rounded-lg px-1 py-0.5",
                    token.isPunctuation
                      ? "text-slate-400 cursor-default"
                      : "text-white hover:bg-sky-500/20 hover:text-sky-300 hover:scale-105 active:scale-95"
                  )}
                  title={token.pinyin ? `${token.pinyin} - ${token.meaning}` : undefined}
                >
                  <span className="block">{token.text}</span>
                  {token.pinyin && (
                    <span className="block text-[10px] text-muted-foreground -mt-1 font-mono">
                      {token.pinyin}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground italic text-center">
              💡 <strong>Mẹo hay:</strong> Nhấp vào bất kỳ chữ Hán nào ở trên để xem Pinyin, giải nghĩa, cấp độ HSK và nghe phát âm chuẩn!
            </p>

            {/* Full Vietnamese Translation */}
            {showFullTranslation && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 text-xs text-slate-200 leading-relaxed animate-in fade-in">
                <span className="font-bold text-sky-300 block mb-1">Dịch nghĩa tiếng Việt:</span>
                &ldquo;{selectedStory.vietnameseTranslation}&rdquo;
              </div>
            )}

            {/* INSTANT AI DICTIONARY POPUP */}
            {popupData && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/90 border border-sky-500/50 shadow-2xl space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-amber-400 font-serif">
                      {popupData.word}
                    </span>
                    <div>
                      <span className="font-mono text-xs text-sky-300 font-bold block">
                        [{popupData.pinyin}]
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {popupData.hskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakChinese(popupData.word)}
                      className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300"
                      title="Nghe phát âm bản xứ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSaveCard(popupData.word)}
                      className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
                      title="Lưu vào Flashcard"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPopupData(null)}
                      className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-muted-foreground">Nghĩa tiếng Việt: </span>
                  <strong className="text-white text-sm">{popupData.vietnamese}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VIDEO SUBTITLES PLAYER */}
      {activeTab === "video" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/15 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[11px] font-bold text-pink-400 uppercase">Học Qua Video Phim</span>
              <h3 className="text-base sm:text-lg font-black text-white">{SAMPLE_VIDEO_SUBS.title}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Video Iframe Player (7 cols) */}
            <div className="lg:col-span-7 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe
                src={SAMPLE_VIDEO_SUBS.videoUrl}
                title={SAMPLE_VIDEO_SUBS.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Interactive Subtitles Stream (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-muted-foreground uppercase block px-1">
                Dòng Phụ Đề Song Ngữ Chạy Cùng Video:
              </span>
              {SAMPLE_VIDEO_SUBS.subtitles.map((sub, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveSubIndex(idx);
                    speakChinese(sub.original);
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1",
                    activeSubIndex === idx
                      ? "bg-purple-600/20 border-purple-500 shadow-md ring-1 ring-purple-500"
                      : "bg-black/30 border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="text-pink-300 font-bold">{sub.timeLabel}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakChinese(sub.original);
                      }}
                      className="hover:text-white"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-white text-sm">{sub.original}</p>
                  <p className="text-[11px] text-sky-300 font-mono">{sub.pinyin}</p>
                  <p className="text-xs text-slate-300 border-t border-white/5 pt-1 mt-1">
                    {sub.vietnamese}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
