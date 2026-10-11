"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Download,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  PieChart,
} from "lucide-react";

export interface ExpenseItem {
  id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  paymentMethod: "cash" | "bank" | "ewallet";
}

const CATEGORIES = [
  { id: "food", name: "Ăn uống", icon: "🍜", color: "text-amber-400 bg-amber-500/20" },
  { id: "transport", name: "Đi lại & Xăng xe", icon: "🛵", color: "text-blue-400 bg-blue-500/20" },
  { id: "shopping", name: "Mua sắm", icon: "🛍️", color: "text-pink-400 bg-pink-500/20" },
  { id: "bills", name: "Hóa đơn & Tiền nhà", icon: "⚡", color: "text-rose-400 bg-rose-500/20" },
  { id: "entertainment", name: "Giải trí", icon: "🎬", color: "text-purple-400 bg-purple-500/20" },
  { id: "study", name: "Học tập & Sách", icon: "📚", color: "text-emerald-400 bg-emerald-500/20" },
  { id: "health", name: "Sức khỏe & Y tế", icon: "💊", color: "text-cyan-400 bg-cyan-500/20" },
  { id: "salary", name: "Lương & Thưởng", icon: "💰", color: "text-emerald-400 bg-emerald-500/20" },
  { id: "other", name: "Khoản khác", icon: "✨", color: "text-slate-400 bg-slate-500/20" },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    type: "expense",
    amount: 35000,
    category: "Ăn uống",
    note: "Bữa sáng phở bò & cà phê",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "ewallet",
  },
  {
    id: "exp-2",
    type: "expense",
    amount: 50000,
    category: "Đi lại & Xăng xe",
    note: "Đổ xăng xe máy đi làm",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
  },
  {
    id: "exp-3",
    type: "expense",
    amount: 120000,
    category: "Học tập & Sách",
    note: "Mua giáo trình luyện thi HSK 4",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "bank",
  },
  {
    id: "exp-4",
    type: "income",
    amount: 15000000,
    category: "Lương & Thưởng",
    note: "Nhận tiền công dự án TxCloneDriver",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "bank",
  },
];

const EXPENSES_STORAGE_KEY = "txclonedriver_expenses";
const BUDGET_STORAGE_KEY = "txclonedriver_daily_budget";

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [dailyBudget, setDailyBudget] = useState<number>(200000); // 200,000 VND / day
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "month">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Add Form state
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Ăn uống");
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMethod, setFormMethod] = useState<"cash" | "bank" | "ewallet">("ewallet");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(DEFAULT_EXPENSES));
      }
      const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (savedBudget) {
        setDailyBudget(parseInt(savedBudget, 10));
      }
    } catch {}
  }, []);

  const saveItems = (updated: ExpenseItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleUpdateBudget = (newVal: number) => {
    setDailyBudget(newVal);
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, newVal.toString());
    } catch {}
  };

  // Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  const todayExpense = useMemo(() => {
    return items
      .filter((i) => i.type === "expense" && i.date === todayStr)
      .reduce((sum, i) => sum + i.amount, 0);
  }, [items, todayStr]);

  const monthExpense = useMemo(() => {
    return items
      .filter((i) => i.type === "expense" && i.date.startsWith(currentMonthStr))
      .reduce((sum, i) => sum + i.amount, 0);
  }, [items, currentMonthStr]);

  const monthIncome = useMemo(() => {
    return items
      .filter((i) => i.type === "income" && i.date.startsWith(currentMonthStr))
      .reduce((sum, i) => sum + i.amount, 0);
  }, [items, currentMonthStr]);

  const netBalance = monthIncome - monthExpense;

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Time filter
      if (timeFilter === "today" && item.date !== todayStr) return false;
      if (timeFilter === "month" && !item.date.startsWith(currentMonthStr)) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNote = item.note.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchNote && !matchCat) return false;
      }

      return true;
    });
  }, [items, timeFilter, categoryFilter, searchTerm, todayStr, currentMonthStr]);

  // Breakdown by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    items
      .filter((i) => i.type === "expense")
      .forEach((i) => {
        map[i.category] = (map[i.category] || 0) + i.amount;
      });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: total > 0 ? Math.round((amt / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [items]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(formAmount.replace(/\D/g, ""), 10);
    if (isNaN(val) || val <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      type: formType,
      amount: val,
      category: formCategory,
      note: formNote.trim() || formCategory,
      date: formDate,
      paymentMethod: formMethod,
    };

    saveItems([newItem, ...items]);
    setFormAmount("");
    setFormNote("");
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      saveItems(items.filter((i) => i.id !== id));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Loai,SoTien,DanhMuc,GhiChu,Ngay,PhuongThuc\n";
    const rows = items
      .map(
        (i) =>
          `"${i.id}","${i.type}","${i.amount}","${i.category}","${i.note}","${i.date}","${i.paymentMethod}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chitieu_txclonedriver_${todayStr}.csv`;
    link.click();
  };

  const isOverBudget = todayExpense > dailyBudget;
  const budgetPercent = Math.min(100, Math.round((todayExpense / dailyBudget) * 100));

  return (
    <ModuleGuard moduleId="expenses" moduleName="Tính Chi Tiêu">
      <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-blue-600/20 glass-panel border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Wallet className="h-4 w-4" />
              <span>Sổ Tay Quản Lý Tài Chính Cá Nhân</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tính Chi Tiêu & Ngân Sách Hàng Ngày
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Theo dõi dòng tiền vào/ra, cảnh báo hạn mức mỗi ngày và thống kê biểu đồ chi tiêu thông minh.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Khoản Chi / Thu</span>
          </button>
        </div>

        {/* 4 Cards KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Hôm nay */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Tổng chi hôm nay</span>
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {todayExpense.toLocaleString("vi-VN")} ₫
            </div>
            {/* Budget indicator */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={isOverBudget ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {isOverBudget ? "⚠️ Vượt hạn mức ngày!" : "Trong hạn mức"}
                </span>
                <span className="text-slate-400 font-mono">
                  {budgetPercent}% / {dailyBudget.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Chi tháng này */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Tổng chi tháng này</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300">
              {monthExpense.toLocaleString("vi-VN")} ₫
            </div>
            <p className="text-[11px] text-slate-400">
              Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </p>
          </div>

          {/* Card 3: Thu nhập tháng này */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Thu nhập tháng này</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              +{monthIncome.toLocaleString("vi-VN")} ₫
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Dòng tiền thực thu
            </p>
          </div>

          {/* Card 4: Số dư ròng */}
          <div className="rounded-3xl glass-card p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Số dư còn lại</span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl font-black ${netBalance >= 0 ? "text-blue-400" : "text-rose-400"}`}>
              {netBalance >= 0 ? "+" : ""}
              {netBalance.toLocaleString("vi-VN")} ₫
            </div>
            <p className="text-[11px] text-slate-400">
              Thu nhập trừ đi Chi tiêu
            </p>
          </div>
        </div>

        {/* Budget Settings & Quick Filters */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold">Thời gian:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "today", label: "Hôm nay" },
              { id: "month", label: "Tháng này" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeFilter === t.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="h-4 w-px bg-white/10 mx-1" />

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm giao dịch..."
                className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 w-40 sm:w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-[11px] text-slate-400">Hạn mức/ngày:</span>
              <input
                type="number"
                step="50000"
                value={dailyBudget}
                onChange={(e) => handleUpdateBudget(parseInt(e.target.value, 10) || 0)}
                className="w-24 px-2 py-1 rounded-lg glass-input text-xs text-amber-300 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400">₫</span>
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              title="Xuất file CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Breakdown & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Transaction History (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Danh Sách Giao Dịch ({filteredItems.length})</span>
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Chưa có giao dịch nào phù hợp với bộ lọc.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExp = item.type === "expense";
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                            isExp ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {isExp ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                            {item.note}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-medium">
                              {item.category}
                            </span>
                            <span>&bull;</span>
                            <span>{item.date}</span>
                            <span>&bull;</span>
                            <span className="uppercase">
                              {item.paymentMethod === "bank"
                                ? "Ngân hàng"
                                : item.paymentMethod === "ewallet"
                                ? "Ví MoMo"
                                : "Tiền mặt"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-sm font-black font-mono ${
                            isExp ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {isExp ? "-" : "+"}
                          {item.amount.toLocaleString("vi-VN")} ₫
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-opacity"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Category Breakdown (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl glass-card p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <PieChart className="h-4 w-4 text-emerald-400" />
              <span>Cơ Cấu Chi Tiêu</span>
            </h3>

            <div className="space-y-3">
              {categoryBreakdown.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-8">
                  Chưa có dữ liệu chi tiêu.
                </div>
              ) : (
                categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-white font-mono font-bold">
                        {cat.amount.toLocaleString("vi-VN")} ₫ ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>Thêm Giao Dịch Mới</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3.5">
                {/* Type: Expense vs Income */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setFormType("expense")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      formType === "expense"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Chi tiêu (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("income")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      formType === "income"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Thu nhập (+)
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Số tiền (VND)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="VD: 50000..."
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-base text-white font-mono font-bold"
                    required
                    autoFocus
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Ghi chú diễn giải</label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="VD: Mua trà sữa, Tiền gửi xe..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                {/* Date & Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Ngày giao dịch</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Thanh toán bằng</label>
                    <select
                      value={formMethod}
                      onChange={(e) => setFormMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                    >
                      <option value="ewallet">Ví MoMo / ZaloPay</option>
                      <option value="bank">Tài khoản Ngân hàng</option>
                      <option value="cash">Tiền mặt</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                  >
                    Lưu Giao Dịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
