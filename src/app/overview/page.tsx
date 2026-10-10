"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  HardDrive,
  Folder,
  Cloud,
  ChevronRight,
  MoreVertical,
  Laptop,
  Smartphone,
  Server,
  Bookmark,
  Upload,
  Link2,
  CheckCircle2,
  ChevronLeft,
  X,
  FileText,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints } from "@/modules/storage/driveEndpointsContext";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

export default function OverviewPage() {
  const { user } = useAuth();
  const { activeEndpoint, files } = useDriveEndpoints();
  const [searchVal, setSearchVal] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Tháng 4 2025");

  return (
    <ModuleGuard moduleId="overview" moduleName="Tổng quan">
      <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
        {/* ============================================================== */}
        {/* 1. TOP ROW: GREETING & SEARCH (LEFT) + COMPACT CALENDAR (RIGHT) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: Greeting & Search Bar */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                <span>👋</span>
                <span>Xin chào, {user?.name || "Trường"}!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Chào mừng bạn trở lại với TxCloneDriver Cloud Hub.
              </p>
            </div>

          {/* Global Search Bar */}
          <div className="relative mt-5 max-w-2xl">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm tệp, thư mục, ghi chú, liên kết..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-slate-400 shadow-sm border border-white/10"
            />
            <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5">
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                Ctrl + K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Sleek Month Calendar Widget */}
        <div className="lg:col-span-4 rounded-3xl glass-card p-4 border border-white/10 shadow-glass">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-white tracking-wide">
              {selectedMonth}
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-white rounded-lg transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="p-1 hover:text-white rounded-lg transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-rose-400">CN</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {/* Trailing days of March */}
            <span className="py-1 text-slate-600">31</span>
            <span className="py-1 text-slate-400">1</span>
            <span className="py-1 text-slate-400">2</span>
            <span className="py-1 text-slate-400">3</span>
            <span className="py-1 text-slate-400">4</span>
            <span className="py-1 text-slate-400">5</span>
            <span className="py-1 text-rose-500/60">6</span>

            {/* Week 2 */}
            <span className="py-1 text-slate-300">7</span>
            <span className="py-1 text-slate-300">8</span>
            <span className="py-1 text-slate-300">9</span>
            <span className="py-1 text-slate-300">10</span>
            <span className="py-1 text-slate-300">11</span>
            <span className="py-1 text-slate-300">12</span>
            <span className="py-1 text-rose-400">13</span>

            {/* Week 3 */}
            <span className="py-1 text-slate-300">14</span>
            <span className="py-1 text-slate-300">15</span>
            <span className="py-1 text-slate-300">16</span>
            <span className="py-1 text-slate-300">17</span>
            <span className="py-1 text-slate-300">18</span>
            <span className="py-1 text-slate-300">19</span>
            <span className="py-1 text-rose-400">20</span>

            {/* Week 4 (with 26 highlighted) */}
            <span className="py-1 text-slate-300">21</span>
            <span className="py-1 text-slate-300">22</span>
            <span className="py-1 text-slate-300">23</span>
            <span className="py-1 text-slate-300">24</span>
            <span className="py-1 text-slate-300">25</span>
            <span className="py-1 flex items-center justify-center">
              <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-500/50">
                26
              </span>
            </span>
            <span className="py-1 text-rose-400">27</span>

            {/* Week 5 */}
            <span className="py-1 text-slate-300">28</span>
            <span className="py-1 text-slate-300">29</span>
            <span className="py-1 text-slate-300">30</span>
            <span className="py-1 text-slate-600">1</span>
            <span className="py-1 text-slate-600">2</span>
            <span className="py-1 text-slate-600">3</span>
            <span className="py-1 text-rose-500/60">4</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ROW OF 4 OVERVIEW CARDS                                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* Card 1: Dung lượng Drive */}
        <Link
          href="/storage"
          className="rounded-3xl glass-card p-4 border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 87.3 78" fill="none">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
                <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44C.4 50 0 51.55 0 53.1h27.5z" fill="#00AC47"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.3c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
                <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D"/>
                <path d="M59.8 53.1H87.3c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z" fill="#2684FC"/>
                <path d="M73.55 76.8H27.5L13.75 53h46.05z" fill="#FFBA00"/>
              </svg>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block font-medium">Dung lượng Drive</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">42.6 GB / 100 GB</span>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: "43%" }} />
            </div>

            <div className="flex items-center justify-between text-[11px] mt-2 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {activeEndpoint ? "Đã kết nối" : "Sẵn sàng"}
              </span>
              <span className="text-slate-400 font-mono">43%</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Ghi chú */}
        <Link
          href="/notes"
          className="rounded-3xl glass-card p-4 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Bookmark className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block font-medium">Ghi chú</span>
            <span className="text-2xl font-black text-white mt-0.5 block">18</span>
            <p className="text-[11px] text-purple-300 font-medium mt-1">
              +3 hôm nay
            </p>
          </div>
        </Link>

        {/* Card 3: Dự án đang làm */}
        <Link
          href="/projects"
          className="rounded-3xl glass-card p-4 border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Folder className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block font-medium">Dự án đang làm</span>
            <span className="text-2xl font-black text-white mt-0.5 block">3</span>
            <p className="text-[11px] text-emerald-300 font-medium mt-1">
              1 sắp hoàn thành
            </p>
          </div>
        </Link>

        {/* Card 4: Sao lưu */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block font-medium">Sao lưu</span>
            <span className="text-xs font-bold text-white mt-1 block">
              Lần gần nhất: 2 ngày trước
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hoạt động
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MIDDLE ROW: DỰ ÁN ĐANG LÀM (LEFT) & GHI CHÚ NHANH (RIGHT)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Column 1: Dự án đang làm */}
        <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Folder className="h-4 w-4 text-blue-400" />
              Dự án đang làm
            </h3>
            <Link
              href="/projects"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          {/* Project 1: Website TxCloneDriver */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Laptop className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Website TxCloneDriver</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-semibold">
                  Đang làm
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Phát triển giao diện và tích hợp API
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <button className="text-slate-400 hover:text-white p-1">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Project 2: Ứng dụng di động */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Ứng dụng di động</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold">
                  Chờ xử lý
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Thiết kế UI/UX và phát triển tính năng
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
            <button className="text-slate-400 hover:text-white p-1">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Project 3: Backup hệ thống */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Backup hệ thống</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold">
                  Sắp hoàn thành
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Tự động sao lưu dữ liệu quan trọng
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
            <button className="text-slate-400 hover:text-white p-1">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Column 2: Ghi chú & Link nhanh */}
        <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-purple-400" />
              Ghi chú & Link nhanh
            </h3>
            <Link
              href="/notes?action=new"
              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Thêm mới
            </Link>
          </div>

          {/* Link 1: Notion */}
          <a
            href="https://www.notion.so"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white font-serif font-black text-lg shrink-0">
                N
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  Notion &bull; Kế hoạch công việc
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  www.notion.so
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              <button
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 hover:text-white p-1"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </a>

          {/* Link 2: Google Drive */}
          <Link
            href="/storage"
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
                  <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44C.4 50 0 51.55 0 53.1h27.5z" fill="#00AC47"/>
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.3c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
                  <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D"/>
                  <path d="M59.8 53.1H87.3c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z" fill="#2684FC"/>
                  <path d="M73.55 76.8H27.5L13.75 53h46.05z" fill="#FFBA00"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  Google Drive &bull; Tài liệu quan trọng
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  drive.google.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              <button
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 hover:text-white p-1"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </Link>

          {/* Link 3: GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-white shrink-0">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  GitHub &bull; Repository
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  github.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              <button
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 hover:text-white p-1"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </a>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW: HOẠT ĐỘNG GẦN ĐÂY (FULL WIDTH)                 */}
      {/* ============================================================== */}
      <div className="rounded-3xl glass-card p-5 border border-white/10 shadow-glass space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            Hoạt động gần đây
          </h3>
          <Link
            href="/activity"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {/* Item 1 */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Đã tải lên 3 tệp vào Google Drive
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Hình ảnh dự án / concept-0914.zip
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            2 giờ trước
          </span>
        </div>

        {/* Item 2 */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Link2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Đã thêm liên kết mới
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Tài liệu tham khảo &bull; Figma
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            5 giờ trước
          </span>
        </div>

        {/* Item 3 */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Cập nhật dự án
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Website TxCloneDriver &bull; hoàn thành 2 task
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            1 ngày trước
          </span>
        </div>
      </div>
    </div>
    </ModuleGuard>
  );
}
