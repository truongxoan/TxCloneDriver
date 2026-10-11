"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Moon,
  Sun,
  Star,
  Brain,
  RotateCw,
  Compass,
  Send,
  Eye,
  Heart,
  Crown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface TarotCard {
  id: string;
  nameVi: string;
  nameEn: string;
  arcana: string;
  icon: any;
  iconColor: string;
  keywords: string[];
  meaning: string;
  luckyNumber: number;
  gradient: string;
}

const TAROT_DECK: TarotCard[] = [
  {
    id: "the-sun",
    nameVi: "The Sun (Thái Dương)",
    nameEn: "The Sun",
    arcana: "Major Arcana XIX",
    icon: Sun,
    iconColor: "text-amber-400",
    keywords: ["Thành Công", "Sức Sống", "Rực Rỡ", "Tài Lộc"],
    meaning: "Năng lượng tích cực ngập tràn ngày hôm nay. Mọi dự định hoặc kế hoạch học tập/công việc đều thuận buồm xuôi gió và gặt hái kết quả xuất sắc.",
    luckyNumber: 19,
    gradient: "from-amber-500/20 via-yellow-600/20 to-orange-600/30",
  },
  {
    id: "the-star",
    nameVi: "The Star (Ngôi Sao Hy Vọng)",
    nameEn: "The Star",
    arcana: "Major Arcana XVII",
    icon: Star,
    iconColor: "text-sky-400",
    keywords: ["Niềm Tin", "Bình An", "Chữa Lành", "Ý Tưởng Mới"],
    meaning: "Tâm trí bạn đang ở trạng thái thanh tịnh nhất. Hãy lắng nghe trực giác và tiếp tục kiên trì với những mục tiêu học tập bạn đang theo đuổi.",
    luckyNumber: 17,
    gradient: "from-sky-500/20 via-blue-600/20 to-indigo-600/30",
  },
  {
    id: "the-magician",
    nameVi: "The Magician (Nhà Ảo Thuật)",
    nameEn: "The Magician",
    arcana: "Major Arcana I",
    icon: Sparkles,
    iconColor: "text-purple-400",
    keywords: ["Khởi Đầu", "Sáng Tạo", "Năng Lực Tối Thượng", "Tập Trung"],
    meaning: "Bạn đang nắm trong tay mọi công cụ để biến ý tưởng thành hiện thực. Đừng do dự, hãy bắt tay vào thực hiện dự án mới ngay hôm nay.",
    luckyNumber: 1,
    gradient: "from-purple-500/20 via-violet-600/20 to-pink-600/30",
  },
  {
    id: "the-empress",
    nameVi: "The Empress (Nữ Hoàng Đất Mẹ)",
    nameEn: "The Empress",
    arcana: "Major Arcana III",
    icon: Crown,
    iconColor: "text-rose-400",
    keywords: ["Dồi Dào", "Thịnh Vượng", "Tình Cảm", "Phúc Lộc"],
    meaning: "Sự ấm áp, viên mãn và nguồn cảm hứng bất tận. Mối quan hệ xung quanh bạn sẽ đem lại sự hỗ trợ đắc lực và may mắn tài chính.",
    luckyNumber: 3,
    gradient: "from-rose-500/20 via-pink-600/20 to-emerald-600/30",
  },
  {
    id: "wheel-of-fortune",
    nameVi: "Wheel of Fortune (Vòng Quay Số Phận)",
    nameEn: "Wheel of Fortune",
    arcana: "Major Arcana X",
    icon: RotateCw,
    iconColor: "text-emerald-400",
    keywords: ["Chuyển Vận", "May Mắn Bất Ngờ", "Cơ Hội Lớn", "Chu Kỳ Mới"],
    meaning: "Vận may đang xoay chuyển về phía bạn! Một tin vui bất ngờ hoặc sự thay đổi tích cực sắp diễn ra trong ngày.",
    luckyNumber: 10,
    gradient: "from-emerald-500/20 via-teal-600/20 to-cyan-600/30",
  },
];

export function TarotDreamWidget() {
  // Tarot State
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Dream Journal State
  const [dreamQuery, setDreamQuery] = useState("");
  const [dreamAnalysis, setDreamAnalysis] = useState<string | null>(null);
  const [isAnalyzingDream, setIsAnalyzingDream] = useState(false);

  const handleDrawTarot = () => {
    setIsFlipping(true);
    setDrawnCard(null);

    setTimeout(() => {
      const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
      setDrawnCard(randomCard);
      setIsFlipping(false);
    }, 800);
  };

  const handleAnalyzeDream = () => {
    if (!dreamQuery.trim()) return;
    setIsAnalyzingDream(true);

    setTimeout(() => {
      const q = dreamQuery.toLowerCase();
      let analysis = "";
      let luckyNum = Math.floor(Math.random() * 89) + 10;

      if (q.includes("bay") || q.includes("trời")) {
        analysis =
          "🔮 Giấc mơ bay lượn biểu trưng cho sự giải phóng tâm thức và khát vọng tự do. Bạn đang vượt qua các rào cản áp lực cũ và sẵn sàng cho một tầm nhìn lớn hơn.";
      } else if (q.includes("nước") || q.includes("biển") || q.includes("sông")) {
        analysis =
          "🌊 Nước đại diện cho tiềm thức cảm xúc và sự thanh lọc tâm hồn. Giấc mơ báo hiệu năng lượng tài lộc hanh thông và sự bình yên trong tâm trí.";
      } else if (q.includes("tiền") || q.includes("vàng") || q.includes("ngọc")) {
        analysis =
          "🪙 Biểu tượng của sự ghi nhận giá trị bản thân và quả ngọt từ công sức bền bỉ. Sắp có thu hoạch tích cực trong tài chính và công việc.";
      } else {
        analysis =
          "✨ Giấc mơ phản ánh quá trình tiềm thức đang sắp xếp lại những trải nghiệm ban ngày. Đây là dấu hiệu của sự tái tạo năng lượng và phát triển nội tâm.";
      }

      setDreamAnalysis(`${analysis}\n\n🍀 Con số phong thủy may mắn hôm nay: ${luckyNum}`);
      setIsAnalyzingDream(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: 3D TAROT CARD DRAW */}
      <Card className="p-6 sm:p-8 bg-slate-900/60 border-purple-500/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Rút Bài Tarot 3D Năng Lượng Ngày Mới
              </h3>
              <p className="text-xs text-muted-foreground">
                Lắng nghe thông điệp tiềm thức và phong thủy tài lộc qua 78 lá bài Arcana
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDrawTarot}
            disabled={isFlipping}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 text-xs"
          >
            <Compass className={cn("w-4 h-4", isFlipping && "animate-spin")} />
            <span>{isFlipping ? "Đang xáo bài..." : "🔮 Rút Lá Bài Mới"}</span>
          </Button>
        </div>

        {/* Tarot Display Arena */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
          {/* Card Visual Container */}
          <div
            onClick={handleDrawTarot}
            className={cn(
              "w-52 h-80 rounded-3xl border-2 p-5 flex flex-col justify-between cursor-pointer transition-all duration-500 relative shadow-2xl group select-none",
              drawnCard
                ? "border-purple-500/50 bg-gradient-to-b " + drawnCard.gradient
                : "border-purple-500/30 bg-gradient-to-b from-purple-950 via-slate-950 to-black hover:border-purple-400"
            )}
          >
            {!drawnCard ? (
              /* Card Back Design */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Moon className="w-8 h-8 animate-pulse" />
                </div>
                <div className="font-mono text-xs text-purple-300 font-bold tracking-widest uppercase">
                  TxLab Tarot Deck
                </div>
                <div className="text-[10px] text-slate-400">
                  Nhấp để rút lá bài năng lượng
                </div>
              </div>
            ) : (
              /* Card Front Design */
              <div className="h-full flex flex-col justify-between animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 font-bold uppercase">
                  <span>{drawnCard.arcana}</span>
                  <span>#{drawnCard.luckyNumber}</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 py-4">
                  {React.createElement(drawnCard.icon, {
                    className: cn("w-14 h-14 drop-shadow-md", drawnCard.iconColor),
                  })}
                  <div className="font-bold text-white text-base leading-tight">
                    {drawnCard.nameVi}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {drawnCard.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white border border-white/10"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reading & Interpretation Info */}
          <div className="max-w-md space-y-3 text-xs leading-relaxed">
            {drawnCard ? (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {drawnCard.nameEn} &bull; Số may mắn: {drawnCard.luckyNumber}
                  </Badge>
                </div>
                <h4 className="text-base font-bold text-white">
                  Lời Luận Giải Năng Lượng:
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/10">
                  {drawnCard.meaning}
                </p>
              </div>
            ) : (
              <div className="text-slate-400 space-y-2">
                <h4 className="text-sm font-bold text-white">Hướng Dẫn Rút Bài:</h4>
                <p>
                  Tập trung suy nghĩ về câu hỏi hoặc mục tiêu trong ngày, sau đó nhấp vào lá bài hoặc bấm nút &ldquo;Rút Lá Bài Mới&rdquo;.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 2: AI DREAM JOURNAL */}
      <Card className="p-6 sm:p-8 bg-slate-900/60 border-sky-500/20 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Sổ Tay Giải Mã Giấc Mơ AI (Carl Jung Dream Analyst)
            </h3>
            <p className="text-xs text-muted-foreground">
              Giải mã biểu tượng giấc mơ tiềm thức và luận thông điệp tâm lý học
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập giấc mơ đêm qua của bạn (Ví dụ: Mơ thấy bay lượn trên bầu trời xanh, mơ thấy nhặt được vàng)..."
              value={dreamQuery}
              onChange={(e) => setDreamQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyzeDream()}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={isAnalyzingDream || !dreamQuery.trim()}
              onClick={handleAnalyzeDream}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold gap-1.5 text-xs h-10 px-4 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzingDream ? "Đang giải mã..." : "Giải Mã AI"}</span>
            </Button>
          </div>

          {/* Quick Dream Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium">Gợi ý mẫu:</span>
            {[
              "Mơ thấy bay lượn trên bầu trời",
              "Mơ thấy dòng sông trong vắt",
              "Mơ thấy nhặt được hũ vàng",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => setDreamQuery(p)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Analysis Output */}
          {dreamAnalysis && (
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-100 text-xs whitespace-pre-wrap leading-relaxed animate-in fade-in">
              {dreamAnalysis}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
