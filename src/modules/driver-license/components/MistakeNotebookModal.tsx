"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Trash2,
  TrendingUp,
  Award,
  Sparkles,
  Search,
} from "lucide-react";
import { LicenseQuestion } from "../types";
import { GPLX_QUESTIONS } from "../questionsData";
import { playClickSound } from "@/lib/soundEffects";

interface ExamHistoryItem {
  id: string;
  date: string;
  classId: string;
  score: number;
  total: number;
  passed: boolean;
  failedByCritical: boolean;
}

interface MistakeNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPracticeMistakes: (questions: LicenseQuestion[]) => void;
}

export function MistakeNotebookModal({
  isOpen,
  onClose,
  onPracticeMistakes,
}: MistakeNotebookModalProps) {
  const [activeTab, setActiveTab] = useState<"mistakes" | "history">("mistakes");
  const [wrongQuestionIds, setWrongQuestionIds] = useState<Record<string, number>>({});
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load from localStorage on open
  useEffect(() => {
    if (!isOpen) return;

    try {
      const storedWrongs = JSON.parse(localStorage.getItem("tx_gplx_wrong_questions") || "{}");
      setWrongQuestionIds(storedWrongs);

      const storedHistory = JSON.parse(localStorage.getItem("tx_gplx_exam_history") || "[]");
      setExamHistory(storedHistory);
    } catch {
      setWrongQuestionIds({});
      setExamHistory([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter questions that are in the wrong list
  const mistakeQuestions = GPLX_QUESTIONS.filter((q) => Boolean(wrongQuestionIds[q.id]));

  const filteredMistakes = mistakeQuestions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(query) ||
      q.explanation.toLowerCase().includes(query) ||
      q.options.some((o) => o.toLowerCase().includes(query))
    );
  });

  const handleRemoveMistake = (qId: string) => {
    playClickSound();
    const updated = { ...wrongQuestionIds };
    delete updated[qId];
    setWrongQuestionIds(updated);
    try {
      localStorage.setItem("tx_gplx_wrong_questions", JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllMistakes = () => {
    playClickSound();
    if (window.confirm("Bạn có chắc chắn muốn làm sạch toàn bộ Sổ tay câu sai không?")) {
      setWrongQuestionIds({});
      try {
        localStorage.removeItem("tx_gplx_wrong_questions");
      } catch {}
    }
  };

  const handleStartPracticeMistakes = () => {
    playClickSound();
    if (mistakeQuestions.length === 0) return;
    onPracticeMistakes(mistakeQuestions);
    onClose();
  };

  // Stats calculation
  const totalExams = examHistory.length;
  const passedExams = examHistory.filter((h) => h.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const highestScore = examHistory.reduce((max, h) => Math.max(max, h.score), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Sổ Tay Câu Sai &amp; Thống Kê GPLX
              </h2>
              <p className="text-xs text-muted-foreground">
                Ôn luyện có trọng tâm, biến câu sai thành điểm số tuyệt đối!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab("mistakes");
              }}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "mistakes"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sổ Tay Câu Sai ({mistakeQuestions.length})
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab("history");
              }}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Lịch Sử Thi &amp; Tiến Độ
            </button>
          </div>

          {activeTab === "mistakes" && mistakeQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAllMistakes}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
              </button>
              <button
                onClick={handleStartPracticeMistakes}
                className="px-4 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:opacity-95 shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" /> Luyện Tập Câu Sai Ngay
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: SỔ TAY CÂU SAI */}
          {activeTab === "mistakes" && (
            <div className="space-y-4">
              {mistakeQuestions.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm trong danh sách câu từng làm sai..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {filteredMistakes.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-black">
                    🎉
                  </div>
                  <h3 className="text-base font-bold text-white">Sổ tay câu sai đang trống!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Tuyệt vời! Bạn chưa có câu nào bị ghi vào danh sách câu sai. Hãy tiếp tục làm các đề thi thử để củng cố kiến thức!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMistakes.map((q) => {
                    const failCount = wrongQuestionIds[q.id] || 1;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl glass-card border border-amber-500/20 space-y-3 shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Đã sai {failCount} lần
                            </span>
                            {q.isCritical && (
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                                CÂU ĐIỂM LIỆT
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveMistake(q.id)}
                            className="text-xs text-muted-foreground hover:text-rose-400 font-semibold transition-colors flex items-center gap-1"
                            title="Xóa câu này khỏi sổ tay"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đã thuộc (Xóa)
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-white">{q.question}</h4>

                        {/* Image if available */}
                        {q.image && (
                          <div className="p-2 rounded-xl bg-black/50 border border-white/10 max-w-xs mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={q.image} alt={q.question} className="max-h-36 w-auto mx-auto object-contain rounded-lg" />
                          </div>
                        )}

                        {/* Correct Answer & Explanation */}
                        <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 text-xs space-y-1.5">
                          <div className="text-emerald-400 font-bold">
                            ✅ Đáp án đúng: {q.correctIndex + 1}. {q.options[q.correctIndex]}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                          {q.tip && (
                            <div className="text-amber-400 font-bold pt-1">
                              ⚡ {q.tip}
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

          {/* TAB 2: LỊCH SỬ THI & TIẾN ĐỘ */}
          {activeTab === "history" && (
            <div className="space-y-5">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
                  <span className="text-[11px] font-bold text-muted-foreground block">Tổng số đề đã thi</span>
                  <div className="text-2xl font-black text-white">{totalExams}</div>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
                  <span className="text-[11px] font-bold text-muted-foreground block">Tỷ lệ Đỗ</span>
                  <div className="text-2xl font-black text-emerald-400">{passRate}%</div>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
                  <span className="text-[11px] font-bold text-muted-foreground block">Điểm cao nhất</span>
                  <div className="text-2xl font-black text-amber-400">{highestScore} câu</div>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
                  <span className="text-[11px] font-bold text-muted-foreground block">Số câu trong Sổ sai</span>
                  <div className="text-2xl font-black text-rose-400">{mistakeQuestions.length}</div>
                </div>
              </div>

              {/* History Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">
                  Nhật ký bài thi gần đây:
                </h4>

                {examHistory.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    Chưa có nhật ký bài thi nào được ghi nhận. Hãy thi thử để ghi điểm số!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {examHistory.slice(0, 10).map((h) => (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-xl glass-card border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Hạng {h.classId}</span>
                            <span className="text-[10px] text-muted-foreground">{h.date}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Điểm: <strong className="text-white">{h.score}/{h.total}</strong> câu
                            {h.failedByCritical && (
                              <span className="text-rose-400 font-bold ml-1.5">(Sai câu điểm liệt)</span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black ${
                            h.passed
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {h.passed ? "ĐẠT 🎉" : "TRƯỢT"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
