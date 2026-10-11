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
  HelpCircle,
  RotateCcw,
  BookOpen,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Flame,
} from "lucide-react";

export default function DriverLicensePage() {
  const [selectedClass, setSelectedClass] = useState<LicenseClass>("B2");
  const [tabMode, setTabMode] = useState<"exam" | "critical" | "topics" | "tips">("exam");

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

  const config = EXAM_CONFIGS[selectedClass];

  // Start new exam when class changes or reset
  const handleStartExam = (newClass = selectedClass) => {
    setSelectedClass(newClass);
    const newConfig = EXAM_CONFIGS[newClass];
    setExamQuestions(generateMockExam(newClass));
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setSecondsLeft(newConfig.durationMinutes * 60);
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
  }, [tabMode, isSubmitted, examQuestions, userAnswers]);

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optionIdx,
    }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let score = 0;
    let failedByCritical = false;

    examQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === q.correctIndex) {
        score++;
      } else {
        if (q.isCritical) {
          failedByCritical = true;
        }
      }
    });

    const passed = score >= config.passScore && !failedByCritical;
    setExamResult({
      score,
      total: examQuestions.length,
      passed,
      failedByCritical,
    });

    // Reward coins if passed!
    if (passed) {
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 5000).toString());
      } catch {}
    }
  };

  const currentQ = examQuestions[currentIndex] || examQuestions[0];
  const criticalList = GPLX_QUESTIONS.filter((q) => q.isCritical);

  return (
    <ModuleGuard moduleId="driver_license" moduleName="Ôn Thi GPLX">
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 glass-panel border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Car className="w-4 h-4" /> Bộ 600 Câu Hỏi Sát Hạch Lái Xe Chuẩn Bộ GTVT
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ôn Thi Giấy Phép Lái Xe GPLX
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Luyện thi trọn bộ Hạng A1, A2, B1, B2, C với đề thi thử bấm giờ, 60 câu điểm liệt bắt buộc và mẹo làm bài đỗ 100%!
              </p>
            </div>

            {/* License Class Selector */}
            <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              {(["A1", "A2", "B1", "B2", "C"] as LicenseClass[]).map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleStartExam(cls)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedClass === cls
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {cls} ({EXAM_CONFIGS[cls].vehicleType})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Đang chọn: <strong className="text-white">{config.title}</strong> • Đề thi: {config.totalQuestions} câu • Thời gian: {config.durationMinutes} phút • Yêu cầu đỗ: {config.passScore}/{config.totalQuestions} câu & Không sai câu điểm liệt.
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "exam", label: "Thi Thử Sát Hạch (Đếm Giờ)", icon: FileCheck },
            { id: "critical", label: "60 Câu Hỏi Điểm Liệt", icon: AlertTriangle },
            { id: "topics", label: "Biển Báo & Sa Hình", icon: BookOpen },
            { id: "tips", label: "Mẹo Thi 600 Câu Bao Đậu", icon: Lightbulb },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTabMode(item.id as any)}
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

        {/* TAB 1: THI THỬ SÁT HẠCH */}
        {tabMode === "exam" && (
          <div className="space-y-6">
            {/* Exam Header & Timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                  Câu hỏi {currentIndex + 1} / {examQuestions.length}
                </span>
                {currentQ.isCritical && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs border border-rose-500/40 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> CÂU ĐIỂM LIỆT (CẤM SAI)
                  </span>
                )}
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-4">
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
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                  >
                    Nộp Bài
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartExam()}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Làm Đề Khác
                  </button>
                )}
              </div>
            </div>

            {/* Exam Result Banner if submitted */}
            {examResult && (
              <div
                className={`p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
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

                  <button
                    onClick={() => handleStartExam()}
                    className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg hover:opacity-95"
                  >
                    Thi Đề Mới Ngay
                  </button>
                </div>
              </div>
            )}

            {/* Main Question Display */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                <span className="text-blue-400 mr-2">Câu {currentIndex + 1}:</span>
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIndex] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  let optClass = "glass-card border-white/10 hover:border-blue-500/40 text-white";
                  if (isSelected && !isSubmitted) {
                    optClass = "bg-blue-600/30 border-blue-500 text-blue-200 ring-2 ring-blue-500 font-bold";
                  } else if (isSubmitted) {
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
                      {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Tip when submitted */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="text-emerald-400 font-bold">
                    💡 Giải thích: <span className="text-muted-foreground font-normal">{currentQ.explanation}</span>
                  </div>
                  {currentQ.tip && (
                    <div className="text-amber-400 font-bold">
                      ⚡ {currentQ.tip}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Câu Trước
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))
                  }
                  disabled={currentIndex === examQuestions.length - 1}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1.5"
                >
                  Câu Tiếp Theo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Question Navigation Grid 1..N */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase block">
                Bảng danh sách câu hỏi:
              </span>
              <div className="flex flex-wrap gap-2">
                {examQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[idx] !== undefined;
                  const isCurrent = currentIndex === idx;
                  const isCorrect = isSubmitted && userAnswers[idx] === q.correctIndex;
                  const isWrong = isSubmitted && userAnswers[idx] !== undefined && !isCorrect;

                  let style = "bg-white/5 text-white/70 border border-white/10";
                  if (isCurrent) {
                    style = "ring-2 ring-blue-400 font-black scale-105";
                  }

                  if (isSubmitted) {
                    if (isCorrect) style += " bg-emerald-600/40 text-emerald-200 border-emerald-500";
                    else if (isWrong) style += " bg-rose-600/40 text-rose-200 border-rose-500";
                  } else if (isAnswered) {
                    style += " bg-blue-600/30 text-blue-300 border-blue-500";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${style}`}
                    >
                      {idx + 1}
                      {q.isCritical && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 60 CÂU HỎI ĐIỂM LIỆT */}
        {tabMode === "critical" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400" />
              <div>
                <strong>LƯU Ý ĐẶC BIỆT CỦA BỘ GTVT:</strong> Trong kỳ thi sát hạch thực tế, nếu bạn làm sai dù chỉ <strong>1 CÂU ĐIỂM LIỆT</strong>, bạn sẽ bị đình chỉ và tính <strong>TRƯỢT TRỰC TIẾP</strong> ngay cả khi đã làm đúng tất cả các câu còn lại!
              </div>
            </div>

            <div className="space-y-3">
              {criticalList.map((crit, idx) => (
                <div key={crit.id} className="p-5 rounded-2xl glass-card border border-rose-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                      CÂU ĐIỂM LIỆT #{idx + 1}
                    </span>
                    {crit.tip && <span className="text-xs text-amber-400 font-bold">{crit.tip}</span>}
                  </div>
                  <h4 className="text-sm font-bold text-white">{crit.question}</h4>
                  <div className="space-y-1.5 pl-2 border-l-2 border-rose-500/30">
                    {crit.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`text-xs p-2 rounded-lg ${
                          oIdx === crit.correctIndex
                            ? "bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/40"
                            : "text-muted-foreground"
                        }`}
                      >
                        {oIdx + 1}. {opt} {oIdx === crit.correctIndex && "✅ (Đáp án đúng)"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BIỂN BÁO & SA HÌNH */}
        {tabMode === "topics" && (
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

        {/* TAB 4: MẸO THI 600 CÂU BAO ĐẬU */}
        {tabMode === "tips" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GPLX_TIPS.map((tip, idx) => (
              <div key={idx} className="p-6 rounded-3xl glass-card border border-white/10 space-y-2">
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
    </ModuleGuard>
  );
}
