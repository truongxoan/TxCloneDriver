"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Users,
  Shield,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Tv,
  Eye,
  Film,
  Music,
} from "lucide-react";
import { useDriveEndpoints, DriveFileItem } from "@/modules/storage/driveEndpointsContext";
import { useAuth } from "@/modules/auth/authContext";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { useVault } from "@/modules/vault/vaultContext";
import { VIETNAMESE_HOLIDAYS } from "@/modules/holiday-countdown/holidaysData";
import { formatBytes, cn } from "@/lib/utils";

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface AppRouteItem {
  name: string;
  href: string;
  category: string;
  icon: any;
  keywords?: string[];
}

const APP_ROUTES: AppRouteItem[] = [
  { name: "Tổng quan Dashboard", href: "/overview", category: "Hệ thống", icon: Compass, keywords: ["home", "trang chu", "dashboard"] },
  { name: "Google Drive Cloud Hub (2,000+ Tệp)", href: "/storage", category: "Lưu trữ", icon: HardDrive, keywords: ["drive", "tai lieu", "khoa hoc", "clickbank", "tiktok"] },
  { name: "Xem & Nghe Chung Đồng Bộ (Watch Party)", href: "/watch-together", category: "Giải trí", icon: Tv, keywords: ["phim", "video", "xem chung", "stream"] },
  { name: "Tải Video Đa Nền Tảng (YouTube/TikTok/FB)", href: "/downloader", category: "Công cụ", icon: Download, keywords: ["download", "tiktok", "youtube"] },
  { name: "Kỷ Niệm Cá Nhân & Cuốn Album 3D", href: "/memories", category: "Lưu trữ", icon: Folder, keywords: ["album", "anh", "3d", "ky niem"] },
  { name: "Đấu Trường Game PvP & Tài Xỉu Cờ Tướng", href: "/games", category: "Giải trí", icon: Gamepad2, keywords: ["tai xiu", "co tuong", "game"] },
  { name: "Trung Tâm Học Ngoại Ngữ HSK 1-6", href: "/study", category: "Học tập", icon: GraduationCap, keywords: ["tieng trung", "hsk", "tu vung"] },
  { name: "Ôn Thi Giấy Phép Lái Xe 600 Câu", href: "/driver-license", category: "Học tập", icon: Compass, keywords: ["gplx", "bang lai", "o to", "xe may"] },
  { name: "Két Sắt Bảo Mật AES-256 & 2FA TOTP", href: "/vault", category: "Bảo mật", icon: KeyRound, keywords: ["mat khau", "pass", "ket sat", "totp"] },
  { name: "Sổ Quản Lý Chi Tiêu & Tài Chính Cá Nhân", href: "/expenses", category: "Tài chính", icon: Wallet, keywords: ["tien", "chi tieu", "ngan sach"] },
  { name: "Tạo Mã QR Cá Nhân & Wifi Chuyên Nghiệp", href: "/qr", category: "Công cụ", icon: Compass, keywords: ["qr code", "wifi", "barcode"] },
  { name: "Ghi Chú Đám Mây & Liên Kết Bookmark", href: "/notes", category: "Ghi chú", icon: Link2, keywords: ["note", "bookmark", "link"] },
  { name: "Quản Lý Dự Án & Tiến Độ Công Việc", href: "/projects", category: "Công việc", icon: Folder, keywords: ["task", "du an", "kanban"] },
  { name: "Lịch Âm Dương & Đếm Ngược Ngày Lễ", href: "/events", category: "Lịch & Sự kiện", icon: Calendar, keywords: ["lich am", "tet", "ngay le"] },
  { name: "Dự Báo Thời Tiết 63 Tỉnh Thành", href: "/weather", category: "Tiện ích", icon: CloudSun, keywords: ["thoi tiet", "nhiet do", "mua"] },
  { name: "Bộ Sưu Tập Giao Diện 8 Mùa & Bento Grid", href: "/themes", category: "Giao diện", icon: Palette, keywords: ["theme", "giao dien", "mau sac"] },
  { name: "Trung Tâm Sao Lưu & Tự Động Hóa 1-Chạm", href: "/backups", category: "Hệ thống", icon: Shield, keywords: ["backup", "sao luu", "khoi phuc"] },
  { name: "Cài Đặt Hệ Thống & Quản Trị Thành Viên", href: "/settings", category: "Cài đặt", icon: Settings, keywords: ["admin", "user", "phan quyen"] },
];

type CategoryFilter = "all" | "drive" | "routes" | "themes" | "vault" | "users";

export function QuickSearchModal({ open, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const { files } = useDriveEndpoints();
  const { managedUsers, isAdmin } = useAuth();
  const { themeId, setThemeId } = useTheme();
  const { isUnlocked: isVaultUnlocked, accounts: vaultAccounts } = useVault();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notes, setNotes] = useState<{ id: string; title: string; category?: string }[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

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
    } catch {}
  }, [open]);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setActiveCategory("all");
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  // 1. Filtered Routes
  const filteredRoutes = useMemo(() => {
    if (activeCategory !== "all" && activeCategory !== "routes") return [];
    if (!q) return APP_ROUTES;
    return APP_ROUTES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.keywords?.some((k) => k.includes(q))
    );
  }, [q, activeCategory]);

  // 2. Filtered Real Drive Files & Course Folders
  const filteredDriveFiles = useMemo(() => {
    if (activeCategory !== "all" && activeCategory !== "drive") return [];
    if (!q) return files.slice(0, 10);
    return files
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.folderPath && f.folderPath.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [q, files, activeCategory]);

  // 3. Filtered Themes
  const filteredThemes = useMemo(() => {
    if (activeCategory !== "all" && activeCategory !== "themes") return [];
    if (!q && activeCategory !== "themes") return [];
    return THEMES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.nameVi.toLowerCase().includes(q) ||
        t.badge?.toLowerCase().includes(q)
    );
  }, [q, activeCategory]);

  // 4. Filtered Vault accounts (if unlocked)
  const filteredVault = useMemo(() => {
    if (!isVaultUnlocked) return [];
    if (activeCategory !== "all" && activeCategory !== "vault") return [];
    if (!q && activeCategory !== "vault") return [];
    return vaultAccounts
      .filter(
        (acc) =>
          acc.title.toLowerCase().includes(q) ||
          acc.username.toLowerCase().includes(q) ||
          acc.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 15);
  }, [q, isVaultUnlocked, vaultAccounts, activeCategory]);

  // 5. Filtered Users (for Admin)
  const filteredUsers = useMemo(() => {
    if (!isAdmin) return [];
    if (activeCategory !== "all" && activeCategory !== "users") return [];
    if (!q && activeCategory !== "users") return [];
    return managedUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }, [q, isAdmin, managedUsers, activeCategory]);

  // Combined flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const list: Array<{
      id: string;
      type: "route" | "drive" | "theme" | "vault" | "user";
      title: string;
      subtitle?: string;
      badge?: string;
      icon: any;
      action: () => void;
    }> = [];

    // Routes
    filteredRoutes.forEach((r) => {
      list.push({
        id: `route-${r.href}`,
        type: "route",
        title: r.name,
        subtitle: r.category,
        icon: r.icon,
        action: () => {
          router.push(r.href);
          onClose();
        },
      });
    });

    // Drive Files & Courses
    filteredDriveFiles.forEach((f) => {
      list.push({
        id: `drive-${f.id}`,
        type: "drive",
        title: f.name,
        subtitle: f.isFolder
          ? `Thư mục khóa học • ${f.folderPath || "Gốc"}`
          : `${formatBytes(f.sizeBytes)} • ${f.folderPath || "Tệp Drive"}`,
        badge: f.isFolder ? "Folder" : "Tệp",
        icon: f.isFolder ? Folder : HardDrive,
        action: () => {
          if (f.isFolder) {
            router.push(`/storage?folder=${encodeURIComponent(f.name)}`);
          } else if (f.downloadUrl) {
            window.open(f.downloadUrl, "_blank");
          } else {
            router.push("/storage");
          }
          onClose();
        },
      });
    });

    // Themes
    filteredThemes.forEach((t) => {
      list.push({
        id: `theme-${t.id}`,
        type: "theme",
        title: `${t.nameVi} (${t.name})`,
        subtitle: t.description,
        badge: t.badge,
        icon: Palette,
        action: () => {
          setThemeId(t.id);
          onClose();
        },
      });
    });

    // Vault
    filteredVault.forEach((v) => {
      list.push({
        id: `vault-${v.id}`,
        type: "vault",
        title: v.title,
        subtitle: `Tài khoản: ${v.username}`,
        badge: "Két sắt",
        icon: KeyRound,
        action: () => {
          router.push("/vault");
          onClose();
        },
      });
    });

    // Users
    filteredUsers.forEach((u) => {
      const pass = u.plainPassword || u.password || "21";
      list.push({
        id: `user-${u.id}`,
        type: "user",
        title: `${u.name} (@${u.username})`,
        subtitle: `Quyền: ${u.role === "admin" ? "Quản trị viên" : "Thành viên"} • Mật khẩu: ${pass}`,
        badge: u.role === "admin" ? "Admin" : "Member",
        icon: Users,
        action: () => {
          router.push("/settings");
          onClose();
        },
      });
    });

    return list;
  }, [
    filteredRoutes,
    filteredDriveFiles,
    filteredThemes,
    filteredVault,
    filteredUsers,
    router,
    onClose,
    setThemeId,
  ]);

  // Keyboard Navigation: Up, Down, Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (flatResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 >= flatResults.length ? 0 : prev + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 < 0 ? flatResults.length - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flatResults[selectedIndex];
        if (target) {
          target.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flatResults, selectedIndex, onClose]);

  // Auto scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl glass-card p-4 sm:p-5 shadow-2xl border border-white/20 ring-1 ring-primary/30 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm khóa học, tệp Drive, két sắt, đổi theme (Ctrl + K)..."
            className="w-full bg-transparent text-sm sm:text-base text-foreground font-medium outline-none placeholder:text-slate-400"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 font-mono shrink-0">
            ESC để đóng
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-b border-white/5 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSelectedIndex(0);
            }}
            className={cn(
              "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer",
              activeCategory === "all"
                ? "bg-primary text-white shadow-md font-bold"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            Tất Cả ({flatResults.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("drive");
              setSelectedIndex(0);
            }}
            className={cn(
              "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
              activeCategory === "drive"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            <span>Drive & Khóa học ({files.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("routes");
              setSelectedIndex(0);
            }}
            className={cn(
              "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
              activeCategory === "routes"
                ? "bg-emerald-600 text-white shadow-md font-bold"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chức Năng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("themes");
              setSelectedIndex(0);
            }}
            className={cn(
              "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
              activeCategory === "themes"
                ? "bg-pink-600 text-white shadow-md font-bold"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Đổi Theme ({THEMES.length})</span>
          </button>

          {isVaultUnlocked && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("vault");
                setSelectedIndex(0);
              }}
              className={cn(
                "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                activeCategory === "vault"
                  ? "bg-amber-600 text-white shadow-md font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Két Sắt ({vaultAccounts.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("users");
                setSelectedIndex(0);
              }}
              className={cn(
                "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                activeCategory === "users"
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Thành Viên ({managedUsers.length})</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 max-h-[55vh]"
        >
          {flatResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Hãy thử tìm kiếm với tên khóa học, mã bài tập, hoặc đổi tab lọc phía trên.
              </p>
            </div>
          ) : (
            flatResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "p-2.5 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer border",
                    isSelected
                      ? "bg-primary/20 border-primary/40 shadow-lg text-white"
                      : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                        item.type === "drive" && "bg-blue-500/20 text-blue-300 border-blue-500/30",
                        item.type === "route" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        item.type === "theme" && "bg-pink-500/20 text-pink-300 border-pink-500/30",
                        item.type === "vault" && "bg-amber-500/20 text-amber-300 border-amber-500/30",
                        item.type === "user" && "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        <CornerDownLeft className="w-3 h-3" />
                        <span>Enter để mở</span>
                      </span>
                    )}
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isSelected ? "text-primary translate-x-1" : "text-slate-600"
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↓</kbd>
              <span>Di chuyển</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">Enter</kbd>
              <span>Chọn</span>
            </span>
          </div>

          <span className="font-mono text-[10px] text-slate-500">
            {flatResults.length} mục tìm thấy
          </span>
        </div>
      </div>
    </div>
  );
}
