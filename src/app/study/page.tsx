"use client";

import React, { useState, useEffect } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { LanguageId, VocabItem, QuizQuestion, DuolingoSentenceExercise } from "@/modules/study/types";
import {
  VOCAB_DATABASE,
  generateRandomQuizQuestion,
  STUDY_TIPS,
  CHINESE_DRIVE_RESOURCES,
  DUOLINGO_CHINESE_EXERCISES,
} from "@/modules/study/vocabData";
import { BilingualReaderWidget } from "@/modules/study/BilingualReaderWidget";
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
  ExternalLink,
  Folder,
  FileText,
  Heart,
  Undo2,
  Send,
} from "lucide-react";

export default function StudyPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageId>("chinese");
  const [hskFilter, setHskFilter] = useState<string>("HSK 1");
  const [studyMode, setStudyMode] = useState<"quiz" | "duolingo" | "bilingual_reader" | "drive_course" | "flashcard" | "pomodoro" | "tips">("quiz");

  // Infinite Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>(() =>
    generateRandomQuizQuestion("chinese", "HSK 1")
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Duolingo Sentence Builder state
  const [duoIndex, setDuoIndex] = useState<number>(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [duoStatus, setDuoStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [hearts, setHearts] = useState<number>(5);
  const [duoScore, setDuoScore] = useState<number>(0);

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

  // Web Speech API Text-to-Speech
  const speakText = (text: string, lang: LanguageId = selectedLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "chinese") utterance.lang = "zh-CN";
    else if (lang === "english") utterance.lang = "en-US";
    else if (lang === "korean") utterance.lang = "ko-KR";
    else if (lang === "japanese") utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

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
      speakText(currentQuestion.targetVocab.word);
      // Give fun coins in localStorage
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 500).toString());
      } catch {}
    } else {
      setStreak(0);
    }
  };

  // Duolingo exercise handler
  const currentDuo = DUOLINGO_CHINESE_EXERCISES[duoIndex] || DUOLINGO_CHINESE_EXERCISES[0];

  const handleAddWord = (word: string) => {
    if (duoStatus !== "idle") return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (duoStatus !== "idle") return;
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckDuolingo = () => {
    if (duoStatus !== "idle") return;
    const constructed = selectedWords.join("");
    if (constructed === currentDuo.correctSentence) {
      setDuoStatus("correct");
      setDuoScore((prev) => prev + 1);
      speakText(currentDuo.audioText, "chinese");
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 1000).toString());
      } catch {}
    } else {
      setDuoStatus("wrong");
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextDuolingo = () => {
    setSelectedWords([]);
    setDuoStatus("idle");
    setDuoIndex((prev) => (prev + 1) % DUOLINGO_CHINESE_EXERCISES.length);
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
                <GraduationCap className="h-4 w-4" />
                <span>Trung Tâm Học Ngoại Ngữ & Luyện Thi HSK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Học Tiếng Trung, Anh, Hàn, Nhật
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Tích hợp khóa học Google Drive độc quyền, luyện câu kiểu Duolingo, phát âm bản xứ và ngân hàng câu hỏi vô hạn HSK 1 - 6.
              </p>
            </div>

            {/* Score & Streak Counters */}
            <div className="flex items-center gap-3">
              <div className="p-3 px-4 rounded-2xl glass-card border border-amber-500/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Flame className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Streak</div>
                  <div className="text-lg font-black text-white">{streak} ngày</div>
                </div>
              </div>

              <div className="p-3 px-4 rounded-2xl glass-card border border-emerald-500/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Điểm đúng</div>
                  <div className="text-lg font-black text-white">{quizScore} câu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-white/10 mt-5">
            {[
              { id: "chinese", label: "🇨🇳 Tiếng Trung (HSK)", icon: "🇨🇳" },
              { id: "english", label: "🇬🇧 Tiếng Anh (TOEIC/IELTS)", icon: "🇬🇧" },
              { id: "korean", label: "🇰🇷 Tiếng Hàn (TOPIK)", icon: "🇰🇷" },
              { id: "japanese", label: "🇯🇵 Tiếng Nhật (JLPT)", icon: "🇯🇵" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleChangeLang(lang.id as LanguageId)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedLang === lang.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "quiz", label: "❓ Trắc Nghiệm Vô Hạn", icon: HelpCircle },
            { id: "bilingual_reader", label: "📖 Đọc & Dịch Song Ngữ AI", icon: BookOpen },
            { id: "duolingo", label: "🦉 Ghép Câu Duolingo", icon: Sparkles },
            { id: "drive_course", label: "📁 Khóa Học Drive Độc Quyền", icon: Folder },
            { id: "flashcard", label: "📇 Flashcard Từ Vựng", icon: BookOpen },
            { id: "pomodoro", label: "⏱️ Đồng Hồ Pomodoro", icon: Timer },
            { id: "tips", label: "💡 Mẹo Ôn Tập Hiệu Quả", icon: Lightbulb },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setStudyMode(mode.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                  studyMode === mode.id
                    ? "bg-white/15 text-white border border-white/20 shadow-md scale-102"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4 text-emerald-400" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* HSK Level Filter when Chinese is active */}
        {selectedLang === "chinese" && (studyMode === "quiz" || studyMode === "flashcard") && (
          <div className="p-3 rounded-2xl glass-panel border border-white/10 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold px-2">Cấp độ HSK:</span>
            {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((hsk) => (
              <button
                key={hsk}
                onClick={() => {
                  setHskFilter(hsk);
                  setCurrentQuestion(generateRandomQuizQuestion("chinese", hsk));
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  hskFilter === hsk
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {hsk}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: INFINITE QUIZ                                      */}
        {/* ========================================================= */}
        {studyMode === "quiz" && (
          <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {currentQuestion.targetVocab.difficulty}
                </span>
                <button
                  onClick={() => speakText(currentQuestion.targetVocab.word)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition-colors"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                Thưởng: <strong className="text-amber-400">+500 Xu</strong> / câu đúng
              </span>
            </div>

            {/* Question */}
            <div className="py-2 text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentQuestion.question}
              </h2>
              <p className="text-xs text-slate-400">
                Hãy chọn đáp án chính xác nhất trong 4 phương án dưới đây
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                let btnStyle = "bg-white/5 border-white/10 text-white hover:bg-white/10";

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 border-rose-500/60 text-rose-300";
                  } else {
                    btnStyle = "bg-white/5 border-white/5 text-slate-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(option)}
                    className={`p-4 rounded-2xl border text-sm font-semibold text-left transition-all flex items-center justify-between group ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in">
                <div className="text-xs text-slate-200 leading-relaxed">
                  💡 <strong>Giải thích:</strong> {currentQuestion.explanation}
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: BILINGUAL READER & VIDEO AI                         */}
        {/* ========================================================= */}
        {studyMode === "bilingual_reader" && <BilingualReaderWidget />}

        {/* ========================================================= */}
        {/* TAB 2: DUOLINGO SENTENCE BUILDER                          */}
        {/* ========================================================= */}
        {studyMode === "duolingo" && (
          <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {currentDuo.difficulty}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  Điểm Duolingo: {duoScore} ⭐
                </span>
              </div>

              {/* Hearts system */}
              <div className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-4 w-4 ${i < hearts ? "fill-rose-500 text-rose-500" : "text-slate-600"}`}
                  />
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2 text-center py-2">
              <div className="inline-flex items-center gap-2 p-2 px-3 rounded-2xl bg-white/5 border border-white/10">
                <button
                  onClick={() => speakText(currentDuo.audioText, "chinese")}
                  className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20"
                  title="Nghe câu mẫu"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
                <p className="text-sm sm:text-base font-bold text-white">
                  &ldquo;{currentDuo.vietnamese}&rdquo;
                </p>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Pinyin gợi ý: {currentDuo.pinyin}
              </p>
            </div>

            {/* Answer Construction Zone */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-slate-900/60 border-2 border-dashed border-white/20 flex flex-wrap items-center justify-center gap-2">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  Bấm các khối chữ bên dưới để xếp thành câu hoàn chỉnh...
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveWord(idx)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-1 group"
                  >
                    <span>{word}</span>
                    <span className="text-[10px] text-blue-200 group-hover:text-white">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Available Word Chips Pool */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {currentDuo.words.map((word, idx) => {
                const usedCount = selectedWords.filter((w) => w === word).length;
                const totalInWords = currentDuo.words.filter((w) => w === word).length;
                const isMaxUsed = usedCount >= totalInWords;

                return (
                  <button
                    key={idx}
                    disabled={isMaxUsed || duoStatus !== "idle"}
                    onClick={() => handleAddWord(word)}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-sm border transition-all ${
                      isMaxUsed
                        ? "bg-slate-800/40 text-slate-600 border-white/5 cursor-not-allowed"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setSelectedWords([])}
                disabled={duoStatus !== "idle" || selectedWords.length === 0}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Xóa làm lại</span>
              </button>

              <div className="flex items-center gap-3">
                {duoStatus === "idle" && (
                  <button
                    onClick={handleCheckDuolingo}
                    disabled={selectedWords.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Kiểm tra</span>
                  </button>
                )}

                {duoStatus === "correct" && (
                  <div className="flex items-center gap-3 animate-in fade-in">
                    <span className="text-xs font-bold text-emerald-400">
                      🎉 Hoàn hảo! +1,000 Xu
                    </span>
                    <button
                      onClick={handleNextDuolingo}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg"
                    >
                      <span>Tiếp tục</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {duoStatus === "wrong" && (
                  <div className="flex items-center gap-3 animate-in fade-in">
                    <span className="text-xs font-bold text-rose-400">
                      ❌ Sai trật tự câu! (-1 Tim)
                    </span>
                    <button
                      onClick={() => setDuoStatus("idle")}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {duoStatus !== "idle" && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
                📖 <strong>Đáp án đúng:</strong> {currentDuo.correctSentence} ({currentDuo.explanation})
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DRIVE COURSE RESOURCES (THE USER'S 2 LINKS)        */}
        {/* ========================================================= */}
        {studyMode === "drive_course" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
              📌 <strong>Kho Học Liệu Google Drive Chính Thức:</strong> Hệ thống đã kết nối trực tiếp đến File giáo trình và Thư mục lưu trữ khóa học của bạn. Bấm để mở tài liệu hoặc xem bài giảng.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHINESE_DRIVE_RESOURCES.map((res) => (
                <div
                  key={res.id}
                  className="rounded-3xl glass-card p-6 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        {res.type === "file" ? <FileText className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                        {res.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {res.type === "file" ? "PDF Document" : "Google Drive Folder"}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                    >
                      <span>Mở trên Drive</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: FLASHCARDS                                         */}
        {/* ========================================================= */}
        {studyMode === "flashcard" && (
          <div className="rounded-3xl glass-card p-8 border border-white/10 max-w-xl mx-auto space-y-6 text-center">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Thẻ {cardIndex + 1} / {activeVocabs.length}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {currentCard.difficulty}
              </span>
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[220px] rounded-3xl bg-slate-900/80 border border-white/15 p-6 flex flex-col items-center justify-center space-y-3 hover:border-emerald-500/50 transition-all shadow-xl"
            >
              {!isFlipped ? (
                <>
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {currentCard.word}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-emerald-400">
                      {currentCard.pronunciation}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentCard.word);
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 pt-3">
                    (Bấm vào thẻ để lật xem nghĩa tiếng Việt)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                    {currentCard.vietnameseMeaning}
                  </span>
                  <p className="text-xs text-slate-300 italic max-w-xs">
                    &ldquo;{currentCard.exampleSentence}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentCard.exampleTranslation}
                  </p>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev > 0 ? prev - 1 : activeVocabs.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
              >
                Trước
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Lật thẻ</span>
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev + 1) % activeVocabs.length);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: POMODORO TIMER                                     */}
        {/* ========================================================= */}
        {studyMode === "pomodoro" && (
          <div className="rounded-3xl glass-card p-8 border border-white/10 max-w-md mx-auto space-y-6 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {pomoMode === "focus" ? "🎯 Phiên Tập Trung" : "☕ Nghỉ Ngơi Phục Hồi"}
              </h3>
              <p className="text-xs text-slate-400">
                Đã hoàn thành {pomoCount} chu kỳ hôm nay
              </p>
            </div>

            <div className="text-6xl font-black font-mono text-white tracking-widest py-4">
              {String(Math.floor(pomoSeconds / 60)).padStart(2, "0")}:
              {String(pomoSeconds % 60).padStart(2, "0")}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                {isPomoRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPomoRunning ? "Tạm dừng" : "Bắt đầu"}</span>
              </button>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoSeconds(pomoMode === "focus" ? 25 * 60 : 5 * 60);
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                title="Đặt lại"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: TIPS                                               */}
        {/* ========================================================= */}
        {studyMode === "tips" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDY_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="rounded-3xl glass-card p-6 border border-white/10 space-y-2"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <h4>{tip.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
