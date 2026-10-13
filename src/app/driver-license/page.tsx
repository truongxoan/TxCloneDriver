"use client";

import React, { useState, useEffect } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import {
  LicenseClass,
  LicenseQuestion,
} from "@/modules/driver-license/types";
import {
  EXAM_CONFIGS,
  GPLX_QUESTIONS,
  generateMockExam,
  GPLX_TIPS,
} from "@/modules/driver-license/questionsData";
import {
  Car,
  AlertTriangle,
  FileCheck,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Search,
  ZoomIn,
  X,
  Sparkles,
  Info,
  Play,
  Volume2,
  VolumeX,
  Printer,
  Bookmark,
} from "lucide-react";
import { SaHinhSimulator } from "@/modules/driver-license/components/SaHinhSimulator";
import { MistakeNotebookModal } from "@/modules/driver-license/components/MistakeNotebookModal";
import { HolographicTiltCard } from "@/modules/interactions/HolographicTiltCard";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playCriticalFailSound,
  playExamPassFanfare,
  isSoundMuted,
  toggleSoundMute,
} from "@/lib/soundEffects";

export default function DriverLicensePage() {
  const [selectedClass, setSelectedClass] = useState<LicenseClass>("B2");
  const [tabMode, setTabMode] = useState<"exam" | "critical" | "topics" | "simulator" | "tips">("exam");

  // Mock Exam State
  const [examQuestions, setExamQuestions] = useState<LicenseQuestion[]>(() =>
    generateMockExam("B2")
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(22 * 60);
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    failedByCritical: boolean;
  } | null>(null);

  // Practice & Study Options
  const [studyMode, setStudyMode] = useState<boolean>(false); // Show explanation immediately when option selected
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Critical Questions Search State
  const [criticalSearch, setCriticalSearch] = useState<string>("");

  // Topics & Sa Hinh Explorer State
  const [topicFilter, setTopicFilter] = useState<"all" | "traffic_signs" | "sa_hinh" | "guide">("all");
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const config = EXAM_CONFIGS[selectedClass];

  // Initialize sound mute state
  useEffect(() => {
    setIsMuted(isSoundMuted());
  }, []);

  // Start new exam when class changes or reset
  const handleStartExam = (newClass = selectedClass) => {
    playClickSound();
    setSelectedClass(newClass);
    const newConfig = EXAM_CONFIGS[newClass];
    setExamQuestions(generateMockExam(newClass));
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setShowHint(false);
    setSecondsLeft(newConfig.durationMinutes * 60);
  };

  // Start custom practice test with mistake questions
  const handlePracticeMistakes = (mistakes: LicenseQuestion[]) => {
    playClickSound();
    setExamQuestions(mistakes.map((q, i) => ({ ...q, questionNumber: i + 1 })));
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setShowHint(false);
    setStudyMode(true); // Open in instant study mode for mistake revision
    setTabMode("exam");
    setSecondsLeft(mistakes.length * 60);
  };

  // Exam timer
  useEffect(() => {
    if (tabMode !== "exam" || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabMode, isSubmitted, examQuestions, userAnswers]);

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    playClickSound();

    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optionIdx,
    }));

    // Audio feedback in study mode
    if (studyMode) {
      const q = examQuestions[qIdx];
      if (optionIdx === q.correctIndex) {
        playCorrectSound();
      } else {
        if (q.isCritical) {
          playCriticalFailSound();
        } else {
          playWrongSound();
        }
      }
    }
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let score = 0;
    let failedByCritical = false;
    const wrongAnswersToRecord: Record<string, number> = {};

    try {
      const existingWrongs: Record<string, number> = JSON.parse(
        localStorage.getItem("tx_gplx_wrong_questions") || "{}"
      );
      Object.assign(wrongAnswersToRecord, existingWrongs);
    } catch {}

    examQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === q.correctIndex) {
        score++;
      } else {
        if (q.isCritical) {
          failedByCritical = true;
        }
        // Record into wrong questions dictionary
        wrongAnswersToRecord[q.id] = (wrongAnswersToRecord[q.id] || 0) + 1;
      }
    });

    const passed = score >= config.passScore && !failedByCritical;
    setExamResult({
      score,
      total: examQuestions.length,
      passed,
      failedByCritical,
    });

    // Play fanfare or failure alarm
    if (passed) {
      playExamPassFanfare();
    } else if (failedByCritical) {
      playCriticalFailSound();
    } else {
      playWrongSound();
    }

    // Persist wrong questions & exam history into localStorage
    try {
      localStorage.setItem("tx_gplx_wrong_questions", JSON.stringify(wrongAnswersToRecord));

      const existingHistory = JSON.parse(localStorage.getItem("tx_gplx_exam_history") || "[]");
      const newHistoryItem = {
        id: `exam-${Date.now()}`,
        date: new Date().toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }),
        classId: selectedClass,
        score,
        total: examQuestions.length,
        passed,
        failedByCritical,
      };
      existingHistory.unshift(newHistoryItem);
      localStorage.setItem("tx_gplx_exam_history", JSON.stringify(existingHistory.slice(0, 30)));
    } catch {}

    // Reward coins if passed!
    if (passed) {
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 5000).toString());
      } catch {}
    }
  };

  const handleToggleSound = () => {
    const s = toggleSoundMute();
    setIsMuted(s);
  };

  const handlePrintExam = () => {
    playClickSound();
    window.print();
  };

  const currentQ = examQuestions[currentIndex] || examQuestions[0];
  const criticalList = GPLX_QUESTIONS.filter((q) => q.isCritical);

  const filteredCriticalList = criticalList.filter((crit) => {
    if (!criticalSearch.trim()) return true;
    const query = criticalSearch.toLowerCase();
    return (
      crit.question.toLowerCase().includes(query) ||
      crit.explanation.toLowerCase().includes(query) ||
      crit.options.some((o) => o.toLowerCase().includes(query))
    );
  });

  const topicQuestions = GPLX_QUESTIONS.filter((q) => {
    if (topicFilter === "all") return !!q.image;
    if (topicFilter === "traffic_signs") return q.category === "traffic_signs";
    if (topicFilter === "sa_hinh") return q.category === "sa_hinh";
    return true;
  });

  const toggleRevealAnswer = (id: string) => {
    playClickSound();
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Determine if explanation should be shown for current question in Exam Tab
  const isAnswered = userAnswers[currentIndex] !== undefined;
  const shouldShowExplanation = isSubmitted || (studyMode && isAnswered) || showHint;

  return (
    <ModuleGuard moduleId="driver_license" moduleName="Ôn Thi GPLX">
      <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 glass-panel border border-white/10 shadow-2xl overflow-hidden print:hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Car className="w-4 h-4" /> Bộ Câu Hỏi &amp; Sa Hình Sát Hạch GPLX Chuẩn Bộ GTVT 2026
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ôn Thi Giấy Phép Lái Xe GPLX
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Tích hợp mô phỏng sa hình tương tác 2D, hình ảnh minh họa vector sắc nét, âm thanh phản hồi xúc giác và sổ tay câu sai thông minh!
              </p>
            </div>

            {/* Quick Action Buttons & License Class Selector */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Mute Toggle */}
                <button
                  onClick={handleToggleSound}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all shadow-md ${
                    isMuted
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-white/5 text-slate-300 hover:text-white border-white/10"
                  }`}
                  title={isMuted ? "Bật âm thanh haptic" : "Tắt âm thanh"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Print Sheet */}
                <button
                  onClick={handlePrintExam}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors shadow-md"
                  title="In đề thi / Xuất bản in A4"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Mistake Notebook Button */}
                <button
                  onClick={() => {
                    playClickSound();
                    setIsNotebookOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-amber-500/10"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Sổ Tay Câu Sai</span>
                </button>
              </div>

              {/* License Class Selector */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                {(["A1", "A2", "B1", "B2", "C"] as LicenseClass[]).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => handleStartExam(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === cls
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Đang chọn: <strong className="text-white">{config.title}</strong> • Đề thi: {config.totalQuestions} câu • Thời gian: {config.durationMinutes} phút • Yêu cầu đỗ: {config.passScore}/{config.totalQuestions} câu & Không sai câu điểm liệt.
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none print:hidden">
          {[
            { id: "exam", label: "Thi Thử Sát Hạch (Đếm Giờ)", icon: FileCheck },
            { id: "simulator", label: "Mô Phỏng Sa Hình Động (Mới)", icon: Play },
            { id: "critical", label: `60 Câu Hỏi Điểm Liệt (${criticalList.length})`, icon: AlertTriangle },
            { id: "topics", label: "Biển Báo & Sa Hình (Có Hình)", icon: BookOpen },
            { id: "tips", label: "Mẹo Thi 600 Câu Bao Đậu", icon: Lightbulb },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setTabMode(item.id as any);
                }}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  tabMode === item.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/30 scale-105"
                    : "glass-card border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: THI THỬ SÁT HẠCH & ÔN LUYỆN */}
        {/* ========================================================= */}
        {tabMode === "exam" && (
          <div className="space-y-6">
            {/* Exam Header, Timer & Mode Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10 print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                  Câu hỏi {currentIndex + 1} / {examQuestions.length}
                </span>
                {currentQ.isCritical && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs border border-rose-500/40 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> CÂU ĐIỂM LIỆT (CẤM SAI)
                  </span>
                )}
                {/* Practice Mode Switch */}
                <button
                  onClick={() => {
                    playClickSound();
                    setStudyMode((prev) => !prev);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    studyMode
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
                  }`}
                  title="Bật để xem lời giải và giải thích ngay khi chọn đáp án"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{studyMode ? "Chế độ: Ôn tập (Hiện giải thích ngay)" : "Chế độ: Thi thử chuẩn"}</span>
                </button>
              </div>

              {/* Countdown Timer & Actions */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-black text-sm ${
                    secondsLeft < 180
                      ? "bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse"
                      : "bg-black/50 text-sky-300 border border-white/10"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  {Math.floor(secondsLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(secondsLeft % 60).toString().padStart(2, "0")}
                </div>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitExam}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                  >
                    Nộp Bài
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartExam()}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Thi Đề Khác
                  </button>
                )}
              </div>
            </div>

            {/* Exam Result Banner if submitted (Wrapped with 3D Holographic Tilt) */}
            {examResult && (
              <HolographicTiltCard
                maxTilt={4}
                className={`p-6 sm:p-8 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
                  examResult.passed
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/60 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-2xl font-black flex items-center justify-center sm:justify-start gap-2">
                      {examResult.passed ? (
                        <>
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" /> KẾT QUẢ: ĐẠT SÁT HẠCH! 🎉
                        </>
                      ) : (
                        <>
                          <XCircle className="w-7 h-7 text-rose-400" /> KẾT QUẢ: KHÔNG ĐẠT (TRƯỢT)
                        </>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Điểm số của bạn: <strong className="text-white">{examResult.score}/{examResult.total}</strong> câu. (Yêu cầu đỗ: {config.passScore}/{config.totalQuestions}).
                    </p>
                    {examResult.failedByCritical && (
                      <p className="text-xs font-bold text-rose-400 mt-1">
                        ⚠️ CẢNH BÁO: Bạn đã trả lời SAI câu hỏi Điểm Liệt nên bị tính KHÔNG ĐẠT dù tổng điểm đạt tiêu chuẩn!
                      </p>
                    )}
                    {examResult.passed && (
                      <p className="text-xs font-bold text-amber-300 mt-1">
                        🎁 Thưởng +5,000 Xu vào Ví Game vì đã vượt qua bài thi xuất sắc!
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsNotebookOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Xem Sổ Câu Sai
                    </button>
                    <button
                      onClick={() => handleStartExam()}
                      className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg hover:opacity-95 transition-transform active:scale-95"
                    >
                      Thi Đề Mới Ngay
                    </button>
                  </div>
                </div>
              </HolographicTiltCard>
            )}

            {/* Main Question Display (Wrapped with 3D Holographic Tilt Card) */}
            <HolographicTiltCard
              maxTilt={5}
              className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  <span className="text-blue-400 mr-2">Câu {currentIndex + 1}:</span>
                  {currentQ.question}
                </h2>

                {/* Hint Toggle Button */}
                <button
                  onClick={() => {
                    playClickSound();
                    setShowHint((prev) => !prev);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all print:hidden ${
                    shouldShowExplanation
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:text-white"
                  }`}
                  title="Bấm để xem gợi ý & giải thích"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {shouldShowExplanation ? "Ẩn giải thích" : "Xem giải thích"}
                  </span>
                </button>
              </div>

              {/* ILLUSTRATION IMAGE (If question has image) */}
              {currentQ.image && (
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 p-4 flex flex-col items-center justify-center group shadow-inner">
                  <div className="relative max-h-72 sm:max-h-80 w-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentQ.image}
                      alt={currentQ.question}
                      className="max-h-72 sm:max-h-80 w-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                      onClick={() =>
                        setLightboxImage({
                          url: currentQ.image!,
                          title: `Câu ${currentIndex + 1}: ${currentQ.question}`,
                        })
                      }
                    />
                  </div>

                  <div className="mt-3 w-full flex items-center justify-between text-xs text-muted-foreground border-t border-white/10 pt-2.5 print:hidden">
                    <span className="inline-flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                      <Info className="w-3.5 h-3.5" /> Hình ảnh minh họa / Sa hình trực quan
                    </span>
                    <button
                      onClick={() =>
                        setLightboxImage({
                          url: currentQ.image!,
                          title: `Câu ${currentIndex + 1}: ${currentQ.question}`,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <ZoomIn className="w-3 h-3" /> Phóng to ảnh
                    </button>
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIndex] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  // Highlighting logic: show colors if submitted OR if in study mode with answer selected
                  const showResultHighlight = isSubmitted || (studyMode && isAnswered);

                  let optClass = "glass-card border-white/10 hover:border-blue-500/40 text-white";
                  if (isSelected && !showResultHighlight) {
                    optClass = "bg-blue-600/30 border-blue-500 text-blue-200 ring-2 ring-blue-500 font-bold";
                  } else if (showResultHighlight) {
                    if (isCorrect) {
                      optClass = "bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500 font-black";
                    } else if (isSelected && !isCorrect) {
                      optClass = "bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500";
                    } else {
                      optClass = "opacity-40 border-white/5";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentIndex, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full p-4 rounded-2xl border text-sm text-left transition-all flex items-start gap-3 ${optClass}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {optIdx + 1}
                      </div>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {showResultHighlight && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {showResultHighlight && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* DETAILED EXPLANATION & TIP CARD */}
              {shouldShowExplanation && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-emerald-500/30 space-y-3 text-xs shadow-xl animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> Giải thích chi tiết &amp; Căn cứ quy chuẩn
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Đáp án đúng: #{currentQ.correctIndex + 1}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                    {currentQ.explanation}
                  </p>

                  {currentQ.tip && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-start gap-2">
                      <span className="text-base shrink-0">⚡</span>
                      <span className="leading-snug">{currentQ.tip}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 print:hidden">
                <button
                  onClick={() => {
                    playClickSound();
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                    setShowHint(false);
                  }}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Câu Trước
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1));
                    setShowHint(false);
                  }}
                  disabled={currentIndex === examQuestions.length - 1}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-blue-600/30"
                >
                  Câu Tiếp Theo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </HolographicTiltCard>

            {/* Quick Question Navigation Grid 1..N */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2 print:hidden">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
                <span>Bảng danh sách câu hỏi:</span>
                <span className="text-[11px] lowercase font-normal">
                  (Dấu chấm đỏ: Câu điểm liệt • Đã trả lời: {Object.keys(userAnswers).length}/{examQuestions.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {examQuestions.map((q, idx) => {
                  const isAns = userAnswers[idx] !== undefined;
                  const isCur = currentIndex === idx;
                  const isCorrect = isSubmitted && userAnswers[idx] === q.correctIndex;
                  const isWrong = isSubmitted && userAnswers[idx] !== undefined && !isCorrect;

                  let style = "bg-white/5 text-white/70 border border-white/10 hover:border-white/30";
                  if (isCur) {
                    style = "ring-2 ring-blue-400 font-black scale-105 bg-blue-600/20";
                  }

                  if (isSubmitted) {
                    if (isCorrect) style += " bg-emerald-600/40 text-emerald-200 border-emerald-500";
                    else if (isWrong) style += " bg-rose-600/40 text-rose-200 border-rose-500";
                  } else if (isAns) {
                    style += " bg-blue-600/30 text-blue-300 border-blue-500";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        playClickSound();
                        setCurrentIndex(idx);
                        setShowHint(false);
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${style}`}
                    >
                      {idx + 1}
                      {q.isCritical && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MÔ PHỎNG SA HÌNH ĐỘNG 2D/3D (MỚI) */}
        {/* ========================================================= */}
        {tabMode === "simulator" && <SaHinhSimulator />}

        {/* ========================================================= */}
        {/* TAB 3: 60 CÂU HỎI ĐIỂM LIỆT (CẤM SAI) */}
        {/* ========================================================= */}
        {tabMode === "critical" && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 shrink-0 text-rose-400" />
              <div className="leading-relaxed">
                <strong className="text-white block mb-0.5">LƯU Ý ĐẶC BIỆT CỦA BỘ GTVT:</strong>
                Trong kỳ thi sát hạch thực tế, nếu bạn làm sai dù chỉ <strong>1 CÂU ĐIỂM LIỆT</strong>, bạn sẽ bị đình chỉ và tính <strong>TRƯỢT TRỰC TIẾP</strong> ngay cả khi đã làm đúng tất cả các câu còn lại!
              </div>
            </div>

            {/* Critical Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={criticalSearch}
                onChange={(e) => setCriticalSearch(e.target.value)}
                placeholder="Tìm kiếm câu hỏi điểm liệt theo từ khóa (rượu bia, ma túy, cao tốc, đường sắt...)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-4">
              {filteredCriticalList.map((crit, idx) => (
                <div key={crit.id} className="p-5 sm:p-6 rounded-3xl glass-card border border-rose-500/30 space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-600 text-white flex items-center gap-1.5 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" /> CÂU ĐIỂM LIỆT #{idx + 1}
                    </span>
                    {crit.tip && (
                      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        ⚡ {crit.tip}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {crit.question}
                  </h4>

                  {/* Critical Question Illustration Image */}
                  {crit.image && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 p-3 flex flex-col items-center justify-center max-w-md mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={crit.image}
                        alt={crit.question}
                        className="max-h-56 w-auto object-contain rounded-xl cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          setLightboxImage({
                            url: crit.image!,
                            title: `Câu điểm liệt: ${crit.question}`,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2 pl-2 border-l-2 border-rose-500/40">
                    {crit.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`text-xs sm:text-sm p-3 rounded-xl transition-all ${
                          oIdx === crit.correctIndex
                            ? "bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/40 flex items-center justify-between"
                            : "text-muted-foreground bg-white/5"
                        }`}
                      >
                        <span>
                          {oIdx + 1}. {opt}
                        </span>
                        {oIdx === crit.correctIndex && (
                          <span className="text-emerald-400 text-xs shrink-0 font-bold">
                            ✅ (Đáp án đúng)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation for Critical Question */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-slate-300">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Giải thích chi tiết theo Luật GTĐB:
                    </div>
                    <p className="leading-relaxed pl-5 text-muted-foreground">{crit.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BIỂN BÁO & SA HÌNH (CÓ HÌNH ẢNH MINH HỌA) */}
        {/* ========================================================= */}
        {tabMode === "topics" && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: `Tất Cả (${topicQuestions.length})` },
                { id: "traffic_signs", label: "Biển Báo Giao Thông" },
                { id: "sa_hinh", label: "Sa Hình & Giao Lộ" },
                { id: "guide", label: "Lý Thuyết & Quy Tắc Nhớ" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playClickSound();
                    setTopicFilter(f.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    topicFilter === f.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                      : "bg-white/5 text-muted-foreground hover:text-white border border-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Summary reference cards when "guide" is active or on "all" */}
            {(topicFilter === "guide" || topicFilter === "all") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
                  <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                    🛑 5 Nhóm Biển Báo Giao Thông Chính
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20">
                      <strong className="text-red-400">1. Biển báo cấm (Hình tròn viền đỏ):</strong> Biểu thị các điều cấm mà người tham gia giao thông không được vi phạm.
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-950/30 border border-yellow-500/20">
                      <strong className="text-amber-400">2. Biển báo nguy hiểm (Tam giác vàng viền đỏ):</strong> Cảnh báo trước các nguy hiểm có thể xảy ra trên đường.
                    </div>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20">
                      <strong className="text-sky-400">3. Biển hiệu lệnh (Hình tròn nền xanh):</strong> Báo các hiệu lệnh bắt buộc các phương tiện phải thi hành.
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                      <strong className="text-indigo-400">4. Biển chỉ dẫn (Hình vuông/chữ nhật xanh):</strong> Chỉ dẫn hướng đi hoặc các điều có ích trên đường.
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
                  <h3 className="text-base font-black text-sky-400 flex items-center gap-2">
                    🏎️ Quy Tắc Sa Hình Bất Bại
                  </h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <strong className="text-white block mb-1">1. Thứ tự xe ưu tiên:</strong>
                      &ldquo;HỎA - SỰ - AN - THƯƠNG&rdquo; (Cứu hỏa &rarr; Quân sự &rarr; Công an &rarr; Cứu thương).
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <strong className="text-white block mb-1">2. Thứ tự quyền đi tại ngã tư:</strong>
                      &ldquo;Nhất chớm, nhì ưu, tam đường, tứ hướng&rdquo; (Đã vào giao lộ trước &rarr; Xe ưu tiên &rarr; Xe trên đường ưu tiên &rarr; Xe bên phải không vướng).
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <strong className="text-white block mb-1">3. Hướng đi ưu tiên:</strong>
                      Rẽ phải &rarr; Đi thẳng &rarr; Rẽ trái.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List of visual questions with images and explanations */}
            {topicFilter !== "guide" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topicQuestions.map((q) => {
                  const isRevealed = revealedAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 space-y-4 flex flex-col justify-between shadow-xl"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {q.category === "traffic_signs" ? "Biển Báo Giao Thông" : "Sa Hình & Giao Lộ"}
                          </span>
                          {q.tip && (
                            <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              ⚡ {q.tip}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white leading-relaxed">
                          {q.question}
                        </h4>

                        {/* Image display */}
                        {q.image && (
                          <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 p-3 flex flex-col items-center justify-center group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={q.image}
                              alt={q.question}
                              className="max-h-56 w-auto object-contain rounded-xl cursor-pointer hover:scale-105 transition-transform"
                              onClick={() =>
                                setLightboxImage({
                                  url: q.image!,
                                  title: q.question,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setLightboxImage({
                                  url: q.image!,
                                  title: q.question,
                                })
                              }
                              className="mt-2 text-[10px] font-bold text-sky-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <ZoomIn className="w-3 h-3" /> Phóng to hình ảnh
                            </button>
                          </div>
                        )}

                        {/* Options */}
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctIndex;
                            return (
                              <div
                                key={oIdx}
                                className={`text-xs p-2.5 rounded-xl border transition-all ${
                                  isRevealed && isCorrect
                                    ? "bg-emerald-500/20 text-emerald-200 font-bold border-emerald-500/40"
                                    : "bg-white/5 border-white/5 text-muted-foreground"
                                }`}
                              >
                                {oIdx + 1}. {opt} {isRevealed && isCorrect && "✅ (Đáp án đúng)"}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 space-y-3">
                        {/* Toggle Reveal Answer & Explanation */}
                        <button
                          onClick={() => toggleRevealAnswer(q.id)}
                          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Ẩn đáp án &amp; Giải thích
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Xem đáp án &amp; Giải thích chi tiết
                            </>
                          )}
                        </button>

                        {isRevealed && (
                          <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5 animate-in fade-in-50 duration-200">
                            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Giải thích chi tiết:
                            </div>
                            <p className="leading-relaxed text-muted-foreground">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MẸO THI 600 CÂU BAO ĐẬU */}
        {/* ========================================================= */}
        {tabMode === "tips" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GPLX_TIPS.map((tip, idx) => (
              <div key={idx} className="p-6 rounded-3xl glass-card border border-white/10 space-y-2.5 shadow-xl">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Mẹo #{idx + 1}
                </span>
                <h4 className="text-base font-black text-white">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SỔ TAY CÂU SAI MODAL */}
      {/* ========================================================= */}
      <MistakeNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        onPracticeMistakes={handlePracticeMistakes}
      />

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL (ZOOM IMAGE PREVIEW) */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white max-w-lg truncate">
                {lightboxImage.title}
              </h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-black/60 rounded-2xl p-4 overflow-hidden max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Hình ảnh chuẩn độ phân giải cao SVG</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleGuard>
  );
}
