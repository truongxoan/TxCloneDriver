"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  HardDrive,
  Calendar,
  CloudSun,
  Compass,
  Palette,
  X,
  FileText,
  KeyRound,
  Gamepad2,
  GraduationCap,
  Download,
  Wallet,
  Folder,
  Settings,
  Link2,
} from "lucide-react";
import { MOCK_STORAGE_ITEMS } from "@/modules/storage/mockDriveData";
import { VIETNAMESE_HOLIDAYS } from "@/modules/holiday-countdown/holidaysData";

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface AppRouteItem {
  name: string;
  href: string;
  category: string;
  icon: any;
}

const APP_ROUTES: AppRouteItem[] = [
  { name: "Tổng quan Dashboard", href: "/overview", category: "Trang hệ thống", icon: Compass },
  { name: "Google Drive Cloud Hub", href: "/storage", category: "Lưu trữ", icon: HardDrive },
  { name: "Xem & Nghe Chung Đồng Bộ", href: "/watch-together", category: "Giải trí", icon: Compass },
  { name: "Tải Video YouTube / TikTok / FB", href: "/downloader", category: "Công cụ", icon: Download },
  { name: "Kỷ Niệm Cá Nhân & 3D Album", href: "/memories", category: "Lưu trữ", icon: Folder },
  { name: "Game Hub & Giải Trí PvP", href: "/games", category: "Giải trí", icon: Gamepad2 },
  { name: "Học Ngoại Ngữ HSK / Tiếng Anh", href: "/study", category: "Học tập", icon: GraduationCap },
  { name: "Ôn Thi Giấy Phép Lái Xe GPLX", href: "/driver-license", category: "Học tập", icon: Compass },
  { name: "Két Sắt Mật Khẩu & 2FA TOTP", href: "/vault", category: "Bảo mật", icon: KeyRound },
  { name: "Sổ Quản Lý Chi Tiêu & Ngân Sách", href: "/expenses", category: "Tài chính", icon: Wallet },
  { name: "Tạo Mã QR Cá Nhân & Wifi", href: "/qr", category: "Công cụ", icon: Compass },
  { name: "Ghi Chú & Liên Kết Bookmark", href: "/notes", category: "Ghi chú", icon: Link2 },
  { name: "Quản Lý Dự Án & Tasks", href: "/projects", category: "Công việc", icon: Folder },
  { name: "Lịch Âm Dương & Đếm Ngược Ngày Lễ", href: "/events", category: "Lịch & Sự kiện", icon: Calendar },
  { name: "Dự Báo Thời Tiết Toàn Quốc", href: "/weather", category: "Tiện ích", icon: CloudSun },
  { name: "Bộ Sưu Tập Giao Diện 8 Mùa & Bento", href: "/themes", category: "Giao diện", icon: Palette },
  { name: "Cài Đặt Hệ Thống & Quản Trị Viên", href: "/settings", category: "Cài đặt", icon: Settings },
];

export function QuickSearchModal({ open, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<{ id: string; title: string; category?: string }[]>([]);

  // Load user notes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("datavault_notes_v2") || localStorage.getItem("datavault_notes");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotes(
            parsed.map((item: any) => ({
              id: item.id || `n-${Math.random()}`,
              title: item.title || item.name || "Ghi chú không tiêu đề",
              category: item.category || "notes",
            }))
          );
        }
      }
    } catch {
      // ignore
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const filteredRoutes = APP_ROUTES.filter((r) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  );

  const filteredFiles = MOCK_STORAGE_ITEMS.filter((f) =>
    f.name.toLowerCase().includes(q)
  );

  const filteredHolidays = VIETNAMESE_HOLIDAYS.filter((h) =>
    h.name.toLowerCase().includes(q)
  );

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(q)
  );

  const hasAnyResults =
    filteredRoutes.length > 0 ||
    filteredFiles.length > 0 ||
    filteredHolidays.length > 0 ||
    filteredNotes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-3xl glass-panel p-4 sm:p-5 shadow-2xl border border-white/15 ring-1 ring-primary/20">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm chức năng, tệp Drive, ghi chú, ngày lễ (Ctrl+K)..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
            ESC để đóng
          </kbd>
        </div>

        {/* Results */}
        <div className="mt-3.5 max-h-[60vh] overflow-y-auto space-y-3.5 pr-1">
          {/* Default Quick Links when query is empty */}
          {!q && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Lối Tắt Nhanh
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {APP_ROUTES.slice(0, 6).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/5 hover:bg-primary/20 text-foreground transition-all text-left border border-white/5 hover:border-primary/30"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* App Routes Found */}
          {q && filteredRoutes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5 px-1">
                Chức Năng & Trang ({filteredRoutes.length})
              </p>
              <div className="space-y-1">
                {filteredRoutes.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.href}
                      onClick={() => {
                        router.push(r.href);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate text-white font-medium group-hover:text-primary transition-colors">
                          {r.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {r.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Found */}
          {q && filteredNotes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1.5 px-1">
                Ghi Chú & Liên Kết ({filteredNotes.length})
              </p>
              <div className="space-y-1">
                {filteredNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      router.push("/notes");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="truncate text-white">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-purple-300">
                      Ghi chú cá nhân
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drive Files Found */}
          {q && filteredFiles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1.5 px-1">
                Tệp Tin Google Drive ({filteredFiles.length})
              </p>
              <div className="space-y-1">
                {filteredFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      router.push("/storage");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="truncate text-white">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {f.updatedAt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Holidays Found */}
          {q && filteredHolidays.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 px-1">
                Ngày Lễ & Sự Kiện ({filteredHolidays.length})
              </p>
              <div className="space-y-1">
                {filteredHolidays.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      router.push("/events");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate text-white">{h.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-300">
                      {h.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && !hasAnyResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              Không tìm thấy kết quả nào phù hợp với từ khóa &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
