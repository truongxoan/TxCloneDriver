"use client";

import React, { useState } from "react";
import { useFeedback } from "@/modules/feedback/feedbackContext";
import { useAuth } from "@/modules/auth/authContext";
import { BugReport, BugSeverity } from "@/modules/feedback/types";
import { AlertCircle, Plus, CheckCircle2, Clock, Trash2, ShieldCheck } from "lucide-react";

export function BugReportWidget() {
  const { reports, addReport, updateReportStatus, deleteReport } = useFeedback();
  const { user, isAdmin } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BugReport["category"]>("Google Drive");
  const [severity, setSeverity] = useState<BugSeverity>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addReport(title, description, category, severity);
    setTitle("");
    setDescription("");
    setShowModal(false);
  };

  return (
    <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Báo Cáo Lỗi & Hỗ Trợ
            </h3>
            <p className="text-[10px] text-muted-foreground">Theo dõi và sửa các vấn đề gặp phải</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow"
        >
          <Plus className="w-3.5 h-3.5" /> Báo Lỗi
        </button>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {reports.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center">
            Không có báo cáo lỗi nào đang mở. Hệ thống hoạt động hoàn hảo!
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className={`p-3 rounded-2xl border transition-all ${
                r.status === "resolved"
                  ? "bg-emerald-950/20 border-emerald-500/20 text-slate-300"
                  : "bg-black/30 border-white/10 text-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        r.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : r.status === "in_progress"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {r.status === "resolved"
                        ? "Đã sửa xong"
                        : r.status === "in_progress"
                        ? "Đang xử lý"
                        : "Đang mở"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      [{r.category}] • bởi @{r.author}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug">{r.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
                  {r.adminNote && (
                    <div className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                      🛠️ Admin: {r.adminNote}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-1 shrink-0">
                    {r.status !== "resolved" && (
                      <button
                        onClick={() =>
                          updateReportStatus(r.id, "resolved", "Đã khắc phục hoàn tất!")
                        }
                        className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-0.5"
                        title="Đánh dấu đã sửa xong"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(r.id)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                      title="Xóa báo cáo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Bug Report */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/15 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" /> Gửi Báo Cáo Lỗi & Vấn Đề
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-muted-foreground hover:text-white"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Tiêu đề vấn đề:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Không nghe được nhạc từ link Drive..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Phân hệ gặp lỗi:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="Google Drive">Google Drive</option>
                    <option value="Trò chơi">Trò chơi</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Giao diện">Giao diện</option>
                    <option value="Hệ thống & Đăng nhập">Hệ thống & Đăng nhập</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Mức độ nghiêm trọng:
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="low">Nhẹ (Thấp)</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Nghiêm trọng</option>
                    <option value="critical">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Mô tả chi tiết:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả cụ thể lỗi xảy ra khi thực hiện thao tác gì..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
                >
                  Gửi Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
