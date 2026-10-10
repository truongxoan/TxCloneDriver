"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  HardDrive,
  Send,
  RotateCw,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  FileCode,
  Archive,
  ChevronRight,
  Folder,
  CloudSun,
  ChevronLeft,
  Gift,
  Landmark,
  Star,
  Cake,
  Compass,
  ScrollText,
  Calendar,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { convertSolar2Lunar, getAuspiciousHours } from "@/modules/lunar-calendar/lunarConverter";
import { getWeather } from "@/modules/weather/weatherMockService";

export default function OverviewPage() {
  const { currentTheme } = useTheme();
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2025, 3, 26)); // Tháng 4 2025
  const [searchVal, setSearchVal] = useState("");

  // Telegram switches state
  const [tgReminders, setTgReminders] = useState(true);
  const [tgWeather, setTgWeather] = useState(true);
  const [tgSystem, setTgSystem] = useState(true);

  const weather = getWeather("hanoi");
  const lunar = convertSolar2Lunar(26, 4, 2025);
  const auspiciousHours = getAuspiciousHours(26, 4, 2025, 12);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* LEFT & CENTER MAIN WORKSPACE (8 COLS on XL) */}
      {/* ============================================================== */}
      <div className="xl:col-span-8 space-y-4">
        {/* Hero Greeting & Search Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Xin chào, Người dùng
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Mọi dữ liệu quan trọng của bạn đều được lưu trữ an toàn tại đây.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-xs italic text-slate-300 font-serif opacity-90 max-w-xs">
              &ldquo;Hôm nay là một ngày tuyệt vời để bắt đầu những điều tốt đẹp!&rdquo;
            </p>
          </div>
        </div>

        {/* Global Search Pill Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Tìm kiếm tệp, thư mục, ..."
            className="w-full pl-10 pr-20 py-2.5 rounded-2xl glass-input text-xs placeholder:text-slate-400 shadow-sm"
          />
          <kbd className="absolute right-3.5 top-2.5 rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
            Ctrl + K
          </kbd>
        </div>

        {/* 4 Quick Service Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Card 1: Google Drive */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-sm">
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
              <h3 className="text-xs font-bold text-white truncate">Google Drive</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">Đã kết nối</p>
              <p className="text-[10px] text-slate-400">12.5 GB / 15 GB</p>
            </div>
          </div>

          {/* Card 2: Telegram */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-sm">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">Telegram</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">Đã kết nối</p>
              <p className="text-[10px] text-slate-400 truncate">Nhận thông báo</p>
            </div>
          </div>

          {/* Card 3: Sao lưu tự động */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <RotateCw className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">Sao lưu tự động</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">Đang hoạt động</p>
              <p className="text-[10px] text-slate-400 truncate">Lần gần nhất: 15:30</p>
            </div>
          </div>

          {/* Card 4: Theme hiện tại */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-400 shrink-0 shadow-sm text-lg">
              🌸
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">Theme hiện tại</h3>
              <p className="text-[11px] text-pink-300 font-semibold truncate">
                {currentTheme.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{currentTheme.nameVi}</p>
            </div>
          </div>
        </div>

        {/* Middle 3 Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Dung lượng lưu trữ (Circular Donut Chart) */}
          <div className="rounded-3xl glass-card p-4 border border-white/10 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-white mb-2">Dung lượng lưu trữ</h3>

            <div className="flex items-center gap-4 my-auto">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="80.3"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-white font-mono">68%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400">Đã sử dụng</p>
                <p className="text-sm font-black text-white">68.5 GB / 100 GB</p>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Google Drive
                </span>
                <span className="font-mono text-slate-400">42.3 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Telegram
                </span>
                <span className="font-mono text-slate-400">12.7 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Khác
                </span>
                <span className="font-mono text-slate-400">13.5 GB</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tệp gần đây */}
          <div className="rounded-3xl glass-card p-4 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white">Tệp gần đây</h3>
              <button className="text-slate-400 hover:text-white">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 my-1">
              {[
                { name: "Báo cáo_Tháng_04.pdf", size: "2.4 MB · 2 giờ trước", color: "bg-rose-500/20 text-rose-400" },
                { name: "Hình ảnh đẹp.jpg", size: "4.8 MB · 5 giờ trước", color: "bg-emerald-500/20 text-emerald-400" },
                { name: "Tài liệu quan trọng.docx", size: "1.2 MB · 8 giờ trước", color: "bg-blue-500/20 text-blue-400" },
                { name: "Bản sao lưu.zip", size: "256 MB · 1 ngày trước", color: "bg-amber-500/20 text-amber-400" },
              ].map((file, idx) => (
                <div key={idx} className="flex items-center gap-2.5 group cursor-pointer">
                  <div className={cn("p-1.5 rounded-xl shrink-0", file.color)}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate transition-colors">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {file.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 text-right">
              <Link
                href="/storage"
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
              >
                Xem tất cả &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Nhận thông báo Telegram */}
          <div className="rounded-3xl glass-card p-4 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white">Nhận thông báo Telegram</h3>
              <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <div className="h-7 w-7 rounded-full bg-sky-500 flex items-center justify-center text-white shrink-0">
                <Send className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">Đã kết nối tài khoản</p>
                <p className="text-[10px] text-slate-400 truncate">@your_username</p>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Nhắc sự kiện</span>
                <button
                  onClick={() => setTgReminders(!tgReminders)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    tgReminders ? "bg-blue-600" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                      tgReminders ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Cảnh báo thời tiết</span>
                <button
                  onClick={() => setTgWeather(!tgWeather)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    tgWeather ? "bg-blue-600" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                      tgWeather ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Thông báo hệ thống</span>
                <button
                  onClick={() => setTgSystem(!tgSystem)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    tgSystem ? "bg-blue-600" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                      tgSystem ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            <button className="mt-3 w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-semibold transition-all">
              Cài đặt chi tiết
            </button>
          </div>
        </div>

        {/* Bottom Section 1: Thư mục của tôi (8 folders) */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Thư mục của tôi</h3>
            <Link
              href="/storage"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { name: "Công việc", count: "12 thư mục · 256 tệp", color: "text-amber-400" },
              { name: "Học tập", count: "8 thư mục · 132 tệp", color: "text-cyan-400" },
              { name: "Cá nhân", count: "6 thư mục · 98 tệp", color: "text-amber-500" },
              { name: "Ảnh & Video", count: "24 thư mục · 524 tệp", color: "text-teal-400" },
              { name: "Tài liệu quan trọng", count: "5 thư mục · 86 tệp", color: "text-orange-400" },
              { name: "Dự án", count: "9 thư mục · 174 tệp", color: "text-yellow-400" },
              { name: "Tải xuống", count: "28 tệp", color: "text-blue-400" },
              { name: "Thùng rác", count: "12 tệp", color: "text-slate-400" },
            ].map((folder, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className={cn("h-5 w-5 shrink-0 fill-current", folder.color)} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {folder.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {folder.count}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white shrink-0 ml-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section 2: Dự báo thời tiết Ribbon Card */}
        <div className="rounded-3xl glass-card p-4 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: City & Current */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-3xl">🌤️</div>
              <div>
                <span className="text-[11px] text-slate-400 block">Dự báo thời tiết</span>
                <span className="text-sm font-bold text-white">Hà Nội</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-lg font-black text-white font-mono">28°C</span>
                  <span className="text-xs text-slate-300">Có mây</span>
                </div>
              </div>
            </div>

            {/* Middle: Hourly */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 text-center text-xs">
              {[
                { time: "17:00", temp: "28°", icon: "🌤️" },
                { time: "20:00", temp: "26°", icon: "⛅" },
                { time: "23:00", temp: "24°", icon: "🌙" },
                { time: "02:00", temp: "23°", icon: "🌙" },
                { time: "05:00", temp: "22°", icon: "🌧️" },
              ].map((h, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 min-w-[54px]">
                  <span className="text-[10px] text-slate-400 font-mono">{h.time}</span>
                  <div className="my-0.5 text-sm">{h.icon}</div>
                  <span className="font-bold text-white text-xs">{h.temp}</span>
                </div>
              ))}
            </div>

            {/* Right: Daily */}
            <div className="flex items-center gap-2.5 overflow-x-auto text-xs text-center border-t lg:border-t-0 lg:border-l border-white/10 pt-2 lg:pt-0 lg:pl-4">
              {[
                { day: "Hôm nay", range: "28°/21°" },
                { day: "CN", range: "29°/22°" },
                { day: "Th 2", range: "31°/23°" },
                { day: "Th 3", range: "32°/24°" },
                { day: "Th 4", range: "30°/22°" },
              ].map((d, idx) => (
                <div key={idx} className="min-w-[48px]">
                  <span className="text-[10px] text-slate-400 block">{d.day}</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">{d.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT SIDEBAR PANEL (4 COLS on XL) */}
      {/* ============================================================== */}
      <div className="xl:col-span-4 space-y-4">
        {/* Card 1: Interactive Mini Calendar Tháng 4 2025 */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Tháng 4 2025</h3>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-white"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button className="p-1 hover:text-white"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            <span className="text-rose-400">CN</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {/* Trailing days of March */}
            <span className="py-1 text-slate-600">31</span>
            <span className="py-1 text-slate-600">1</span>
            <span className="py-1 text-slate-600">2</span>
            <span className="py-1 text-slate-600">3</span>
            <span className="py-1 text-slate-600">4</span>
            <span className="py-1 text-slate-600">5</span>
            <span className="py-1 text-rose-800">6</span>

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

            {/* Week 4 */}
            <span className="py-1 text-slate-300">21</span>
            <span className="py-1 text-slate-300">22</span>
            <span className="py-1 text-slate-300">23</span>
            <span className="py-1 text-slate-300">24</span>
            <span className="py-1 text-slate-300">25</span>
            {/* Today: 26 highlighted with blue circle */}
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
            <span className="py-1 text-rose-800">4</span>
          </div>

          {/* Today Pill at bottom of calendar */}
          <div className="p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
            <span className="text-sm">🌸</span>
            <div>
              <span className="text-[10px] text-pink-300 font-semibold block leading-none">
                Ngày hôm nay
              </span>
              <span className="text-xs font-bold text-white">
                26/04/2025 &bull; Âm lịch: 29/03/2025
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Sự kiện sắp tới */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Sự kiện sắp tới
            </h3>
            <Link href="/events" className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Tết Nguyên Đán */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Gift className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Tết Nguyên Đán</p>
                  <p className="text-[10px] text-rose-400 font-semibold">Còn 281 ngày</p>
                  <p className="text-[10px] text-slate-400">10/02/2026 (Âm lịch: 23/12/2025)</p>
                </div>
              </div>
            </div>

            {/* Giỗ Tổ Hùng Vương */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Giỗ Tổ Hùng Vương</p>
                  <p className="text-[10px] text-amber-400 font-semibold">Còn 351 ngày</p>
                  <p className="text-[10px] text-slate-400">07/04/2026 (Âm lịch: 10/03/2026)</p>
                </div>
              </div>
            </div>

            {/* 30/4 - Giải phóng miền Nam */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">30/4 - Giải phóng miền Nam</p>
                  <p className="text-[10px] text-red-400 font-semibold">Còn 375 ngày</p>
                  <p className="text-[10px] text-slate-400">30/04/2026 (Âm lịch: 14/03/2026)</p>
                </div>
              </div>
            </div>

            {/* Sinh nhật của bạn */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Cake className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sinh nhật của bạn</p>
                  <p className="text-[10px] text-amber-300 font-semibold">Còn 32 ngày</p>
                  <p className="text-[10px] text-slate-400">28/05/2025 (Âm lịch: 01/05/2025)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Giờ hoàng đạo hôm nay */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              Giờ hoàng đạo hôm nay
            </h3>
            <Link
              href="/traditional-calendar"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              Xem chi tiết
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-amber-300 text-xs block">Dần</span>
              <span className="text-[10px] text-slate-400 font-mono">03:00 - 05:00</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-amber-300 text-xs block">Thìn</span>
              <span className="text-[10px] text-slate-400 font-mono">07:00 - 09:00</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-amber-300 text-xs block">Tỵ</span>
              <span className="text-[10px] text-slate-400 font-mono">09:00 - 11:00</span>
            </div>
            {/* Ngọ (Active Highlighted Blue Pill) */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/50 text-white shadow-lg shadow-blue-500/30">
              <span className="font-bold text-white text-xs block">Ngọ (Hiện tại)</span>
              <span className="text-[10px] text-blue-100 font-mono">11:00 - 13:00</span>
            </div>
          </div>
        </div>

        {/* Card 4: Lịch truyền thống */}
        <div className="rounded-3xl glass-card p-4 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-amber-400" />
              Lịch truyền thống
            </h3>
            <span className="text-lg">🏮</span>
          </div>

          <div className="pt-1">
            <p className="text-sm font-extrabold text-white">
              Ngày trực: <span className="text-amber-300">Thành</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              (Thông tin mang tính chất tham khảo văn hóa dân gian)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
