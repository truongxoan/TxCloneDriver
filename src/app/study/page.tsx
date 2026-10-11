"use client";

import React, { useState, useEffect } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { LanguageId, VocabItem, QuizQuestion } from "@/modules/study/types";
import {
  VOCAB_DATABASE,
  generateRandomQuizQuestion,
  STUDY_TIPS,
} from "@/modules/study/vocabData";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  Timer,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCw,
  Trophy,
  Flame,
  Volume2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

export default function StudyPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageId>("chinese");
  const [hskFilter, setHskFilter] = useState<string>("HSK 1");
  const [studyMode, setStudyMode] = useState<"quiz" | "flashcard" | "pomodoro" | "tips">("quiz");

  // Infinite Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>(() =>
    generateRandomQuizQuestion("chinese", "HSK 1")
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Pomodoro state
  const [pomoSeconds, setPomoSeconds] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);
  const [pomoMode, setPomoMode] = useState<"focus" | "break">("focus");
  const [pomoCount, setPomoCount] = useState<number>(0);

  const currentVocabList = VOCAB_DATABASE[selectedLang] || [];
  const activeVocabs =
    selectedLang === "chinese"
      ? currentVocabList.filter((v) => v.difficulty.includes(hskFilter))
      : currentVocabList;

  // Next question for infinite quiz
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestion(generateRandomQuizQuestion(selectedLang, selectedLang === "chinese" ? hskFilter : undefined));
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setQuizScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      // Give fun coins in localStorage
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 500).toString());
      } catch {}
    } else {
      setStreak(0);
    }
  };

  // Change lang
  const handleChangeLang = (lang: LanguageId) => {
    setSelectedLang(lang);
    setCardIndex(0);
    setIsFlipped(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestion(generateRandomQuizQuestion(lang, lang === "chinese" ? hskFilter : undefined));
  };

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => {
        setPomoSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomoSeconds === 0) {
      if (pomoMode === "focus") {
        alert("🎉 Chúc mừng bạn đã hoàn thành 25 phút tập trung! Hãy nghỉ ngơi 5 phút (+2,000 Xu thưởng)!");
        setPomoCount((prev) => prev + 1);
        setPomoMode("break");
        setPomoSeconds(5 * 60);
        try {
          const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
          localStorage.setItem("txclonedriver_fun_coins", (c + 2000).toString());
        } catch {}
      } else {
        alert("Đã hết giờ nghỉ ngơi. Sẵn sàng cho chu kỳ tập trung tiếp theo nào!");
        setPomoMode("focus");
        setPomoSeconds(25 * 60);
      }
      setIsPomoRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomoRunning, pomoSeconds, pomoMode]);

  const currentCard = activeVocabs[cardIndex] || activeVocabs[0] || {
    word: "你好",
    pronunciation: "nǐ hǎo",
    vietnameseMeaning: "Xin chào",
    exampleSentence: "你好！",
    exampleTranslation: "Xin chào!",
    difficulty: "HSK 1",
  };

  return (
    <ModuleGuard moduleId="study" moduleName="Học Ngoại Ngữ">
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-sky-600/20 glass-panel border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <GraduationCap className="w-4 h-4" /> Multi-Language Mastery & Smart Learning
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Học Tập & Ngoại Ngữ Đỉnh Cao
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Luyện tiếng Trung (HSK 1 - 6), Tiếng Anh, Hàn, Nhật với câu hỏi trắc nghiệm vô hạn, Flashcard 3D và Đồng hồ Pomodoro!
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              {[
                { id: "chinese", label: "🇨🇳 Tiếng Trung", desc: "HSK 1-6" },
                { id: "english", label: "🇬🇧 Tiếng Anh", desc: "IELTS/TOEIC" },
                { id: "korean", label: "🇰🇷 Tiếng Hàn", desc: "TOPIK" },
                { id: "japanese", label: "🇯🇵 Tiếng Nhật", desc: "JLPT" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleChangeLang(item.id as LanguageId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedLang === item.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub HSK level selector for Chinese */}
          {selectedLang === "chinese" && (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Cấp độ HSK:</span>
              {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setHskFilter(level);
                    setCurrentQuestion(generateRandomQuizQuestion("chinese", level));
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    hskFilter === level
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Study Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "quiz", label: "Trắc Nghiệm Vô Hạn", icon: HelpCircle },
            { id: "flashcard", label: "Flashcard 3D Lật Thẻ", icon: BookOpen },
            { id: "pomodoro", label: "Đồng Hồ Pomodoro 25/5", icon: Timer },
            { id: "tips", label: "Mẹo & Phương Pháp Hay", icon: Lightbulb },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setStudyMode(mode.id as any)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  studyMode === mode.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-500/30 scale-105"
                    : "glass-card border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODE 1: TRẮC NGHIỆM VÔ HẠN */}
        {studyMode === "quiz" && (
          <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Đúng: {quizScore} câu
                </div>
                {streak > 1 && (
                  <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Chuỗi: {streak} câu liên tiếp!
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Mỗi câu đúng thưởng <strong className="text-amber-400">+500 Xu</strong> vào ví Game!
              </span>
            </div>

            {/* Question Text */}
            <div className="text-center py-4 space-y-2">
              <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
                {currentQuestion.targetVocab.difficulty} • Câu hỏi ngẫu nhiên
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let btnStyle = "glass-card border-white/10 hover:border-emerald-500/40 text-white";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500 font-black";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500";
                  } else {
                    btnStyle = "opacity-40 border-white/5";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between text-left ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next button */}
            {isAnswered && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-in zoom-in-95">
                <p className="text-xs text-muted-foreground">{currentQuestion.explanation}</p>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
                  >
                    Câu Tiếp Theo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: FLASHCARD 3D */}
        {studyMode === "flashcard" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-md h-72 rounded-3xl glass-panel border border-white/15 p-8 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] relative"
            >
              <div className="absolute top-4 right-4 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Nhấp để lật thẻ
              </div>

              {!isFlipped ? (
                <div className="space-y-3 animate-in fade-in">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {currentCard.difficulty}
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white">{currentCard.word}</h2>
                  <p className="text-lg text-emerald-400 font-bold">{currentCard.pronunciation}</p>
                </div>
              ) : (
                <div className="space-y-3 animate-in zoom-in-95">
                  <span className="text-xs uppercase font-bold text-muted-foreground">Nghĩa tiếng Việt</span>
                  <h3 className="text-2xl font-black text-amber-400">{currentCard.vietnameseMeaning}</h3>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-muted-foreground">
                    <p className="text-white font-medium">&ldquo;{currentCard.exampleSentence}&rdquo;</p>
                    <p className="text-muted-foreground mt-0.5">{currentCard.exampleTranslation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev > 0 ? prev - 1 : activeVocabs.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
              >
                Thẻ Trước
              </button>
              <span className="text-xs text-muted-foreground font-semibold">
                {cardIndex + 1} / {activeVocabs.length || 1}
              </span>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev + 1) % (activeVocabs.length || 1));
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                Thẻ Tiếp Theo
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: POMODORO 25/5 */}
        {studyMode === "pomodoro" && (
          <div className="rounded-3xl p-8 glass-panel border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                {pomoMode === "focus" ? "🎯 Phiên Tập Trung Cao Độ" : "☕ Giờ Nghỉ Ngơi Phục Hồi"}
              </span>
              <h3 className="text-xl font-black text-white">Đồng Hồ Pomodoro 25/5</h3>
            </div>

            {/* Big Countdown */}
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-600/30 to-teal-900/50 border-4 border-emerald-500/40 flex flex-col items-center justify-center shadow-2xl shadow-emerald-950/80">
              <span className="text-5xl font-black text-white font-mono">
                {Math.floor(pomoSeconds / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(pomoSeconds % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-emerald-300 font-bold mt-1">
                {pomoMode === "focus" ? "25 Phút Làm Việc" : "5 Phút Nghỉ Ngơi"}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className="px-6 py-3 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                {isPomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPomoRunning ? "Tạm Dừng" : "Bắt Đầu"}
              </button>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoSeconds(pomoMode === "focus" ? 25 * 60 : 5 * 60);
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
                title="Đặt Lại Thời Gian"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Đã hoàn thành: <strong className="text-white">{pomoCount}</strong> chu kỳ Pomodoro hôm nay.
            </div>
          </div>
        )}

        {/* MODE 4: MẸO & PHƯƠNG PHÁP HỌC */}
        {studyMode === "tips" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDY_TIPS.map((tip, i) => (
              <div key={i} className="p-6 rounded-3xl glass-card border border-white/10 space-y-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {tip.tag}
                </span>
                <h4 className="text-base font-black text-white">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
