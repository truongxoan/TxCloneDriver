"use client";

import React, { useState, useEffect } from "react";
import {
  Images,
  Lock,
  Unlock,
  ShieldCheck,
  Scan,
  Fingerprint,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Pause,
  Calendar,
  MapPin,
  Heart,
  Share2,
  Trash2,
  X,
  Camera,
} from "lucide-react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/modules/auth/authContext";
import { cn } from "@/lib/utils";

const MASTER_PIN = "080497";

interface MemoryItem {
  id: string;
  title: string;
  category: "family" | "love" | "travel" | "friends" | "self";
  categoryLabel: string;
  date: string;
  location: string;
  imageUrl: string;
  note: string;
  likes: number;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    title: "Chuyến Du Lịch Biển Phú Quốc Rực Nắng",
    category: "travel",
    categoryLabel: "Du Lịch ✈️",
    date: "15/06/2025",
    location: "Bãi Sao, Phú Quốc",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    note: "Những ngày thảnh thơi ngắm hoàng hôn đỏ rực buông xuống biển, tiếng sóng vỗ rì rào xua tan mọi mỏi mệt của công việc.",
    likes: 12,
  },
  {
    id: "mem-2",
    title: "Kỷ Niệm Sinh Nhật Đáng Nhớ Cùng Gia Đình",
    category: "family",
    categoryLabel: "Gia Đình 👨‍👩‍👧",
    date: "08/04/2025",
    location: "Nhà Ấm Cúng, Hà Nội",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    note: "Bữa cơm gia đình quây quần đầy ắp tiếng cười. Cảm ơn vì mọi người luôn là chỗ dựa vững chãi nhất cuộc đời con.",
    likes: 24,
  },
  {
    id: "mem-3",
    title: "Buổi Hẹn Hò Dưới Ánh Đèn Thành Phố",
    category: "love",
    categoryLabel: "Tình Yêu 💖",
    date: "14/02/2026",
    location: "Rooftop Sky Bar, Sài Gòn",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    note: "Dưới bầu trời đêm đầy sao lấp lánh và bản nhạc jazz êm dịu, khoảnh khắc ánh mắt nhìn nhau đong đầy yêu thương.",
    likes: 18,
  },
  {
    id: "mem-4",
    title: "Chinh Phục Đỉnh Đèo Mã Pí Lèng Hà Giang",
    category: "travel",
    categoryLabel: "Du Lịch ✈️",
    date: "20/10/2025",
    location: "Hà Giang Hùng Vĩ",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    note: "Dòng sông Nho Quế xanh như ngọc bích uốn lượn dưới chân đèo. Tuổi trẻ là những chuyến đi không thể nào quên!",
    likes: 31,
  },
  {
    id: "mem-5",
    title: "Họp Lớp Tri Kỷ Đêm Trà Đá Vỉa Hè",
    category: "friends",
    categoryLabel: "Bạn Bè 🥂",
    date: "01/01/2026",
    location: "Hồ Gươm, Hà Nội",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    note: "Dù mỗi đứa một phương trời bận rộn với cuộc sống, nhưng khi gặp lại vẫn vẹn nguyên những câu chuyện ngô nghê thuở nào.",
    likes: 15,
  },
  {
    id: "mem-6",
    title: "Góc Làm Việc Sáng Tạo Đầy Cảm Hứng",
    category: "self",
    categoryLabel: "Bản Thân 🌟",
    date: "05/03/2026",
    location: "Home Studio",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    note: "Không gian làm việc với âm thanh lofi và tách cà phê ấm nóng. Từng dòng code được hoàn thiện bằng cả niềm đam mê.",
    likes: 29,
  },
];

export default function MemoriesPage() {
  const { user } = useAuth();

  // Biometric & PIN lock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [scanType, setScanType] = useState<"face" | "finger">("face");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Album & 3D Flipbook state
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [currentPage, setCurrentPage] = useState(0); // 0 = page 1 & 2
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // New memory modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState<"family" | "love" | "travel" | "friends" | "self">("travel");

  // Filter memories by category
  const filteredMemories = memories.filter(
    (m) => selectedCategory === "all" || m.category === selectedCategory
  );

  // Total flipbook double-pages (2 items per spread)
  const totalPages = Math.ceil(filteredMemories.length / 2);

  // Auto flipbook slideshow
  useEffect(() => {
    if (!autoPlay || !isUnlocked) return;
    const interval = setInterval(() => {
      handleNextPage();
    }, 4500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, currentPage, totalPages, isUnlocked]);

  // Biometric scan action simulation
  const handleTriggerBiometric = (type: "face" | "finger") => {
    setScanType(type);
    setIsBiometricScanning(true);
    setPinError(null);

    setTimeout(() => {
      setIsBiometricScanning(false);
      setIsUnlocked(true);
    }, 1800);
  };

  // PIN unlock action
  const handlePinUnlock = () => {
    if (pinInput === MASTER_PIN) {
      setIsUnlocked(true);
      setPinInput("");
      setPinError(null);
    } else {
      setPinError("Mã PIN không đúng! (Mặc định: 080497)");
    }
  };

  // Flip page actions
  const handleNextPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("next");
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
      setIsFlipping(false);
    }, 500);
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("prev");
    setTimeout(() => {
      setCurrentPage((prev) => (prev - 1 < 0 ? totalPages - 1 : prev - 1));
      setIsFlipping(false);
    }, 500);
  };

  // Add memory action
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) {
      alert("Vui lòng nhập tiêu đề và liên kết hình ảnh!");
      return;
    }

    const catLabels: Record<string, string> = {
      family: "Gia Đình 👨‍👩‍👧",
      love: "Tình Yêu 💖",
      travel: "Du Lịch ✈️",
      friends: "Bạn Bè 🥂",
      self: "Bản Thân 🌟",
    };

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catLabels[newCategory],
      date: newDate || new Date().toLocaleDateString("vi-VN"),
      location: newLocation.trim() || "Kỷ Niệm Cá Nhân",
      imageUrl: newImageUrl.trim(),
      note: newNote.trim() || "Khoảnh khắc tuyệt vời được lưu giữ mãi mãi trong trái tim.",
      likes: 1,
    };

    setMemories([newItem, ...memories]);
    setShowAddModal(false);
    setNewTitle("");
    setNewLocation("");
    setNewDate("");
    setNewImageUrl("");
    setNewNote("");
  };

  // Current double-page items
  const leftItem = filteredMemories[currentPage * 2];
  const rightItem = filteredMemories[currentPage * 2 + 1];

  return (
    <ModuleGuard moduleId="memories" moduleName="Kỷ Niệm Cá Nhân">
      <div className="space-y-6">
        {/* Header Hero Banner */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 relative overflow-hidden bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-rose-950/40">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="max-w-2xl">
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 mb-3 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Kho Lưu Trữ Kỷ Niệm Cá Nhân Khóa FaceID & TouchID 3D Flipbook</span>
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Images className="w-8 h-8 text-pink-400" />
                Kho Ảnh & Video Kỷ Niệm 3D
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Cuốn album 3D lật trang độc bản lưu giữ những khoảnh khắc quý giá nhất trong cuộc đời. Bảo vệ bằng <strong>FaceID nhận diện khuôn mặt</strong>, <strong>TouchID vân tay</strong> và mã PIN độc lập (<strong>080497</strong>).
              </p>
            </div>

            {isUnlocked && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:opacity-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Thêm Kỷ Niệm
                </button>
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-300 border border-white/10 text-xs font-bold flex items-center gap-1.5"
                  title="Khóa Kỷ Niệm Lại"
                >
                  <Lock className="w-4 h-4" /> Khóa Lại
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LOCKED SCREEN: BIOMETRICS FACEID & TOUCHID & PIN */}
        {!isUnlocked ? (
          <div className="rounded-3xl p-8 sm:p-12 glass-card border border-pink-500/30 bg-slate-950/80 shadow-2xl flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
            <div className="relative">
              {isBiometricScanning ? (
                <div className="w-24 h-24 rounded-3xl bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-pink-400 shadow-2xl shadow-pink-500/50 animate-pulse">
                  {scanType === "face" ? (
                    <Scan className="w-12 h-12 text-pink-400 animate-spin" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-pink-400 animate-bounce" />
                  )}
                  <span className="absolute inset-0 rounded-3xl border-2 border-pink-400 animate-ping opacity-30" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xl">
                  <Lock className="w-10 h-10" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                {isBiometricScanning
                  ? scanType === "face"
                    ? "ĐANG QUÉT KHUÔN MẶT FACEID..."
                    : "ĐANG QUÉT VÂN TAY TOUCHID..."
                  : "ALBUM ĐƯỢC BẢO VỆ SINH TRẮC HỌC"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Xác thực danh tính chủ nhân bằng FaceID, Vân tay điện tử hoặc nhập Master PIN bảo mật để mở cuốn album kỷ niệm.
              </p>
            </div>

            {/* Biometric trigger buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={() => handleTriggerBiometric("face")}
                disabled={isBiometricScanning}
                className="flex-1 min-w-[150px] py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Scan className="w-4 h-4" /> Quét FaceID
              </button>

              <button
                onClick={() => handleTriggerBiometric("finger")}
                disabled={isBiometricScanning}
                className="flex-1 min-w-[150px] py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Fingerprint className="w-4 h-4" /> Quét Vân Tay
              </button>
            </div>

            {/* Fallback PIN input */}
            <div className="w-full pt-4 border-t border-white/10 space-y-2 max-w-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Hoặc nhập mã PIN két sắt (080497):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Mã PIN 6 số..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePinUnlock()}
                  className="flex-1 text-center font-mono tracking-[0.3em] text-sm px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handlePinUnlock}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Mở
                </button>
              </div>
              {pinError && <p className="text-[11px] font-bold text-rose-400">{pinError}</p>}
            </div>
          </div>
        ) : (
          /* UNLOCKED: 3D FLIPBOOK ALBUM VIEW */
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filter tags & Slideshow controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Chủ đề:</span>
                {[
                  { id: "all", label: "Tất Cả 📚" },
                  { id: "family", label: "Gia Đình 👨‍👩‍👧" },
                  { id: "love", label: "Tình Yêu 💖" },
                  { id: "travel", label: "Du Lịch ✈️" },
                  { id: "friends", label: "Bạn Bè 🥂" },
                  { id: "self", label: "Bản Thân 🌟" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setCurrentPage(0);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
                      selectedCategory === c.id
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    autoPlay
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                  )}
                >
                  {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {autoPlay ? "Dừng Slideshow" : "Tự Động Lật Trang"}
                </button>

                <div className="text-xs font-mono font-bold text-pink-300 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20">
                  Trang {currentPage + 1} / {totalPages || 1}
                </div>
              </div>
            </div>

            {/* 3D PERSPECTIVE FLIPBOOK SPREAD */}
            <div className="relative py-4 [perspective:1400px]">
              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 transition-all duration-500 ease-out",
                  isFlipping &&
                    (flipDirection === "next"
                      ? "rotate-y-[-8deg] scale-[0.98] opacity-75"
                      : "rotate-y-[8deg] scale-[0.98] opacity-75")
                )}
              >
                {/* LEFT PAGE */}
                {leftItem ? (
                  <div className="p-6 rounded-3xl glass-card border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/95 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={leftItem.imageUrl}
                        alt={leftItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-pink-300 font-bold text-xs border border-white/10">
                        {leftItem.categoryLabel}
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-[11px]">
                        {leftItem.date}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white leading-tight">
                        {leftItem.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-pink-400" />
                        <span>{leftItem.location}</span>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed font-serif">
                        &ldquo;{leftItem.note}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1 text-pink-400 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-pink-500" /> {leftItem.likes} Yêu thích
                      </span>
                      <span className="font-mono text-[10px]">#MEM-0{currentPage * 2 + 1}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl glass-card border border-dashed border-white/20 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[350px]">
                    <Images className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-xs">Trang kỷ niệm còn trống.</p>
                  </div>
                )}

                {/* RIGHT PAGE */}
                {rightItem ? (
                  <div className="p-6 rounded-3xl glass-card border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/95 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rightItem.imageUrl}
                        alt={rightItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-pink-300 font-bold text-xs border border-white/10">
                        {rightItem.categoryLabel}
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-[11px]">
                        {rightItem.date}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white leading-tight">
                        {rightItem.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-pink-400" />
                        <span>{rightItem.location}</span>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed font-serif">
                        &ldquo;{rightItem.note}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1 text-pink-400 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-pink-500" /> {rightItem.likes} Yêu thích
                      </span>
                      <span className="font-mono text-[10px]">#MEM-0{currentPage * 2 + 2}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl glass-card border border-dashed border-white/20 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[350px]">
                    <Images className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-xs">Hết trang trong chuyên mục này.</p>
                  </div>
                )}
              </div>

              {/* Navigation Flip Controls */}
              <button
                onClick={handlePrevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-pink-600 border border-white/20 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-all z-20"
                title="Lật Trang Trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-pink-600 border border-white/20 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-all z-20"
                title="Lật Trang Sau"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW MEMORY */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-lg p-6 rounded-3xl glass-card border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-pink-400" /> Thêm Kỷ Niệm Mới
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tiêu Đề Kỷ Niệm:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Chuyến đi cắm trại cùng bạn thân..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Chủ Đề:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="family">Gia Đình 👨‍👩‍👧</option>
                      <option value="love">Tình Yêu 💖</option>
                      <option value="travel">Du Lịch ✈️</option>
                      <option value="friends">Bạn Bè 🥂</option>
                      <option value="self">Bản Thân 🌟</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Địa Điểm:</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đà Lạt, Sapa..."
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Link Ảnh / Video (URL):</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nhật Ký Cảm Xúc:</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi lại những cảm xúc lắng đọng trong khoảnh khắc này..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold shadow-lg"
                  >
                    Lưu Kỷ Niệm
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
