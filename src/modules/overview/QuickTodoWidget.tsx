"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickTodo {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

const STORAGE_KEY = "txclonedriver_quick_todos";

const DEFAULT_TODOS: QuickTodo[] = [
  {
    id: "todo-1",
    text: "Kiểm tra và đồng bộ tệp tin Google Drive",
    completed: true,
    priority: "high",
    createdAt: "Hôm nay",
  },
  {
    id: "todo-2",
    text: "Học 15 từ vựng HSK / ngoại ngữ",
    completed: false,
    priority: "medium",
    createdAt: "Hôm nay",
  },
  {
    id: "todo-3",
    text: "Sao lưu khóa Két sắt & mã 2FA TOTP",
    completed: false,
    priority: "high",
    createdAt: "Hôm nay",
  },
  {
    id: "todo-4",
    text: "Kiểm tra chi tiêu và hạn mức ngân sách tháng",
    completed: false,
    priority: "low",
    createdAt: "Hôm nay",
  },
];

export function QuickTodoWidget() {
  const [todos, setTodos] = useState<QuickTodo[]>(DEFAULT_TODOS);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isAdding, setIsAdding] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTodos(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TODOS));
    } catch {
      // ignore
    }
  }, []);

  const saveTodos = (updated: QuickTodo[]) => {
    setTodos(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggle = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const handleDelete = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newTodo: QuickTodo = {
      id: `todo-${Date.now()}`,
      text: newText.trim(),
      completed: false,
      priority: newPriority,
      createdAt: "Vừa xong",
    };

    saveTodos([newTodo, ...todos]);
    setNewText("");
    setIsAdding(false);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter((t) => !t.completed);
    saveTodos(updated);
  };

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Việc Cần Làm Nhanh
            </h3>
            <span className="text-[11px] text-slate-400">
              {activeCount === 0 ? "Tuyệt vời! Đã hoàn thành tất cả" : `${activeCount} việc còn lại`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {/* Add New Form */}
      {isAdding && (
        <form onSubmit={handleAddTodo} className="p-3 rounded-2xl bg-white/5 border border-white/15 space-y-2.5 animate-in fade-in duration-200">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Nội dung công việc cần làm..."
            className="w-full px-3 py-2 rounded-xl glass-input text-xs placeholder:text-slate-400 text-white border border-white/15"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400">Ưu tiên:</span>
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
                    newPriority === p
                      ? p === "high"
                        ? "bg-rose-500 text-white shadow-sm"
                        : p === "medium"
                        ? "bg-amber-500 text-black shadow-sm"
                        : "bg-emerald-500 text-white shadow-sm"
                      : "bg-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  {p === "high" ? "🔴 Cao" : p === "medium" ? "🟡 Vừa" : "🟢 Thấp"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newText.trim()}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
        <div className="flex items-center gap-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all",
                filter === f
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {f === "all" ? `Tất cả (${todos.length})` : f === "active" ? `Chưa xong (${activeCount})` : `Đã xong (${completedCount})`}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
          >
            Xóa đã xong
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {filteredTodos.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {filter === "completed"
              ? "Chưa có công việc nào hoàn thành."
              : "Danh sách trống. Hãy thêm một công việc mới!"}
          </div>
        ) : (
          filteredTodos.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggle(t.id)}
              className={cn(
                "p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group select-none",
                t.completed
                  ? "bg-white/5 border-white/5 opacity-60"
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(t.id);
                  }}
                  className="shrink-0 text-slate-400 group-hover:text-white transition-colors"
                >
                  {t.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs truncate transition-all",
                      t.completed ? "line-through text-slate-400" : "text-white font-medium"
                    )}
                  >
                    {t.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase",
                    t.priority === "high"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : t.priority === "medium"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  )}
                >
                  {t.priority === "high" ? "Cao" : t.priority === "medium" ? "Vừa" : "Thấp"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Xóa việc này"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
