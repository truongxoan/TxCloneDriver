"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  Pin,
  CheckCircle2,
  Tag,
  Folder,
  Globe,
  HardDrive,
  Code2,
  Terminal,
  Sparkles,
  FileText,
  Grid,
  List,
  Check,
  Monitor,
  Zap,
  Lightbulb,
  Download,
  RefreshCw,
  Upload,
  FolderGit2,
  Star,
  GitFork,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { NoteItem, NoteCategory } from "@/types/notesAndProjects";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { INITIAL_ALL_NOTES } from "@/modules/notes/notesData";
import {
  syncGitHubRepos,
  syncTrienNguyenRepos,
  syncTrienNguyenHubTips,
  exportNotesToJson,
  exportNotesToMarkdown,
} from "@/modules/notes/notesSyncService";

const STORAGE_KEY = "datavault_notes_v2";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_ALL_NOTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync loading states
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [isSyncingTrienNguyen, setIsSyncingTrienNguyen] = useState(false);

  // Note Detail Drawer / Modal
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<NoteItem | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<NoteCategory>("github");
  const [formUrl, setFormUrl] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formShortcut, setFormShortcut] = useState("");
  const [formCodeSnippet, setFormCodeSnippet] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount, merge with initial rich dataset
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: NoteItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure built-in curated items exist while keeping user additions
          const existingIds = new Set(parsed.map((p) => p.id));
          const missingBuiltIn = INITIAL_ALL_NOTES.filter((b) => !existingIds.has(b.id));
          setNotes([...parsed, ...missingBuiltIn]);
          return;
        }
      }
      setNotes(INITIAL_ALL_NOTES);
    } catch {
      setNotes(INITIAL_ALL_NOTES);
    }
  }, []);

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast(`Đã sao chép "${label}" vào clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sync GitHub Repositories for user truongxoan
  const handleSyncGitHub = async () => {
    setIsSyncingGitHub(true);
    triggerToast("Đang kết nối GitHub API để đồng bộ repos của @truongxoan...");
    try {
      const res = await syncGitHubRepos("truongxoan");
      if (res.items.length > 0) {
        // Merge without duplicate URLs
        const liveMap = new Map<string, NoteItem>();
        res.items.forEach((item) => {
          const key = (item.url || item.id).toLowerCase();
          liveMap.set(key, item);
        });

        // Filter out old version of these repos and prepend new
        const others = notes.filter((n) => {
          const key = (n.url || n.id).toLowerCase();
          return !liveMap.has(key) && !key.includes("truongxoan");
        });

        const merged = [...res.items, ...others];
        saveNotes(merged);
        triggerToast(res.message);
      } else {
        triggerToast("Không tìm thấy repository nào mới trên GitHub.");
      }
    } catch (err: any) {
      triggerToast(`Lỗi đồng bộ GitHub: ${err.message || "Thử lại sau"}`);
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Sync from b2.triennguyen.com
  const handleSyncTrienNguyen = async () => {
    setIsSyncingTrienNguyen(true);
    triggerToast("Đang cào dữ liệu từ b2.triennguyen.com (Repositories & Hub Tips)...");
    try {
      const [reposRes, tipsRes] = await Promise.all([
        syncTrienNguyenRepos("1913869945242410752", "23d355f6c265716d", 1, 50),
        syncTrienNguyenHubTips("1913869945242410752", "23d355f6c265716d", 1, 30),
      ]);

      const fetchedItems = [...reposRes.items, ...tipsRes.items];
      if (fetchedItems.length > 0) {
        const urlMap = new Map<string, NoteItem>();
        fetchedItems.forEach((item) => {
          const key = (item.url || item.id).toLowerCase();
          urlMap.set(key, item);
        });

        const others = notes.filter((n) => {
          const key = (n.url || n.id).toLowerCase();
          return !urlMap.has(key);
        });

        const merged = [...fetchedItems, ...others];
        saveNotes(merged);
        triggerToast(
          `Đã cào thành công ${reposRes.count} Repos và ${tipsRes.count} Mẹo vặt từ b2.triennguyen.com!`
        );
      } else {
        triggerToast(reposRes.message || tipsRes.message || "Không thể cào dữ liệu lúc này.");
      }
    } catch (err: any) {
      triggerToast(`Lỗi khi cào dữ liệu: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsSyncingTrienNguyen(false);
    }
  };

  // Reset to full curated dataset
  const handleResetToCurated = () => {
    if (
      confirm(
        "Bạn có muốn đặt lại toàn bộ kho ghi chú về cấu hình tuyển chọn tiêu chuẩn (Bao gồm 19 Repos @truongxoan, Repos b2.triennguyen, Phím tắt Windows và Lệnh Terminal)?"
      )
    ) {
      saveNotes(INITIAL_ALL_NOTES);
      triggerToast(`Đã khôi phục thành công ${INITIAL_ALL_NOTES.length} mục dữ liệu chuẩn!`);
    }
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported: NoteItem[] = JSON.parse(content);
        if (Array.isArray(imported)) {
          const existingIds = new Set(notes.map((n) => n.id));
          const newItems = imported.filter((i) => !existingIds.has(i.id));
          const merged = [...newItems, ...notes];
          saveNotes(merged);
          triggerToast(`Đã nhập thành công ${newItems.length} mục mới từ file backup!`);
        } else {
          alert("File JSON không hợp lệ!");
        }
      } catch (err) {
        alert("Không thể đọc file backup JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add / Edit Modal handlers
  const handleOpenAddModal = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormCategory("github");
    setFormUrl("");
    setFormContent("");
    setFormShortcut("");
    setFormCodeSnippet("");
    setFormTags("");
    setFormIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: NoteItem) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormUrl(note.url || "");
    setFormContent(note.content || "");
    setFormShortcut(note.shortcut || "");
    setFormCodeSnippet(note.codeSnippet || "");
    setFormTags(note.tags.join(", "));
    setFormIsPinned(note.isPinned);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const dateStr = new Date().toLocaleDateString("vi-VN");

    if (editingNote) {
      const updated = notes.map((item) =>
        item.id === editingNote.id
          ? {
              ...item,
              title: formTitle.trim(),
              category: formCategory,
              url: formUrl.trim() || undefined,
              content: formContent.trim() || undefined,
              shortcut: formShortcut.trim() || undefined,
              codeSnippet: formCodeSnippet.trim() || undefined,
              tags: tagsArray,
              isPinned: formIsPinned,
              updatedAt: dateStr,
            }
          : item
      );
      saveNotes(updated);
      triggerToast("Đã cập nhật mục ghi chú thành công!");
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        url: formUrl.trim() || undefined,
        content: formContent.trim() || undefined,
        shortcut: formShortcut.trim() || undefined,
        codeSnippet: formCodeSnippet.trim() || undefined,
        tags: tagsArray,
        isPinned: formIsPinned,
        updatedAt: dateStr,
      };
      saveNotes([newNote, ...notes]);
      triggerToast("Đã thêm ghi chú mới vào danh sách!");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${title}" khỏi danh sách ghi chú?`)) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotes(updated);
      triggerToast(`Đã xóa "${title}"!`);
    }
  };

  const togglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    saveNotes(updated);
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const query = searchTerm.toLowerCase();
        const matchSearch =
          n.title.toLowerCase().includes(query) ||
          n.content?.toLowerCase().includes(query) ||
          n.url?.toLowerCase().includes(query) ||
          n.shortcut?.toLowerCase().includes(query) ||
          n.codeSnippet?.toLowerCase().includes(query) ||
          n.author?.toLowerCase().includes(query) ||
          n.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchSearch) return false;

        if (selectedCategory === "pinned") {
          return n.isPinned;
        }

        if (selectedCategory === "other") {
          return !["github", "triennguyen", "windows", "cheatsheet", "terminal", "tips"].includes(
            n.category
          );
        }

        if (selectedCategory !== "all" && n.category !== selectedCategory) {
          return false;
        }

        if (selectedTag !== "all" && !n.tags.includes(selectedTag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, searchTerm, selectedCategory, selectedTag]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      github: notes.filter((n) => n.category === "github").length,
      triennguyen: notes.filter((n) => n.category === "triennguyen").length,
      tips: notes.filter((n) => n.category === "tips").length,
      windows: notes.filter((n) => n.category === "windows").length,
      cheatsheet: notes.filter((n) => n.category === "cheatsheet").length,
      terminal: notes.filter((n) => n.category === "terminal").length,
      other: notes.filter(
        (n) => !["github", "triennguyen", "windows", "cheatsheet", "terminal", "tips"].includes(n.category)
      ).length,
    };
  }, [notes]);

  const getCategoryConfig = (cat: NoteCategory) => {
    switch (cat) {
      case "github":
        return {
          icon: <Code2 className="h-4 w-4 text-purple-400" />,
          label: "GitHub Repo",
          color: "border-purple-500/30 bg-purple-500/10 text-purple-300",
        };
      case "triennguyen":
        return {
          icon: <FolderGit2 className="h-4 w-4 text-indigo-400" />,
          label: "b2.triennguyen",
          color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
        };
      case "windows":
        return {
          icon: <Monitor className="h-4 w-4 text-sky-400" />,
          label: "Phím Tắt Windows",
          color: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        };
      case "cheatsheet":
        return {
          icon: <Zap className="h-4 w-4 text-amber-400" />,
          label: "Lệnh Run (Win+R)",
          color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        };
      case "terminal":
        return {
          icon: <Terminal className="h-4 w-4 text-emerald-400" />,
          label: "Lệnh Terminal CLI",
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        };
      case "tips":
        return {
          icon: <Lightbulb className="h-4 w-4 text-rose-400" />,
          label: "Mẹo Vặt & AI Hub",
          color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
        };
      case "website":
        return {
          icon: <Globe className="h-4 w-4 text-blue-400" />,
          label: "Website Link",
          color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
        };
      case "drive":
        return {
          icon: <HardDrive className="h-4 w-4 text-teal-400" />,
          label: "Google Drive",
          color: "border-teal-500/30 bg-teal-500/10 text-teal-300",
        };
      case "prompt":
        return {
          icon: <Sparkles className="h-4 w-4 text-pink-400" />,
          label: "Prompt AI",
          color: "border-pink-500/30 bg-pink-500/10 text-pink-300",
        };
      default:
        return {
          icon: <FileText className="h-4 w-4 text-slate-400" />,
          label: "Ghi chú văn bản",
          color: "border-slate-500/30 bg-slate-500/10 text-slate-300",
        };
    }
  };

  return (
    <ModuleGuard moduleId="notes" moduleName="Ghi chú & Repositories">
      <div className="space-y-6 pb-24 max-w-7xl mx-auto">
        {/* Hidden File Input for Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 bg-slate-950/95 backdrop-blur-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-200">{showToast}</span>
          </div>
        )}

        {/* Top Header & Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Kho Ghi Chú, Repositories & Cheatsheet Toàn Diện
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lưu trữ 19 Repos GitHub @truongxoan, tuyển tập Repos & Mẹo vặt b2.triennguyen.com, trọn bộ phím tắt Windows và cẩm nang lệnh Terminal CLI.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sync GitHub */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncGitHub}
              disabled={isSyncingGitHub}
              className="gap-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
              title="Đồng bộ tất cả Repositories từ tài khoản GitHub @truongxoan"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isSyncingGitHub && "animate-spin")} />
              <span>{isSyncingGitHub ? "Đang đồng bộ..." : "Đồng bộ GitHub @truongxoan"}</span>
            </Button>

            {/* Sync TrienNguyen */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncTrienNguyen}
              disabled={isSyncingTrienNguyen}
              className="gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              title="Cào danh sách repos tuyển chọn và mẹo vặt từ b2.triennguyen.com"
            >
              <FolderGit2 className={cn("h-3.5 w-3.5", isSyncingTrienNguyen && "animate-spin")} />
              <span>{isSyncingTrienNguyen ? "Đang cào..." : "Cào b2.triennguyen.com"}</span>
            </Button>

            {/* Export Menu */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => exportNotesToJson(notes)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Xuất file sao lưu JSON"
              >
                <Download className="h-3 w-3" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => exportNotesToMarkdown(notes)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Xuất tài liệu Markdown (.md)"
              >
                <Download className="h-3 w-3" />
                <span>MD</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Nhập file sao lưu JSON"
              >
                <Upload className="h-3 w-3" />
                <span>Nhập</span>
              </button>
            </div>

            {/* Reset to standard curated notes */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetToCurated}
              className="text-xs text-slate-400 hover:text-white border-white/10"
              title="Đặt lại toàn bộ dữ liệu mẫu tiêu chuẩn"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>

            {/* Add New Note */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Mới</span>
            </Button>
          </div>
        </div>

        {/* Top Quick Stats Pill Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setSelectedCategory("github")}
            className="p-3.5 rounded-2xl glass-card border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                GitHub @truongxoan
              </p>
              <p className="text-xl font-black text-white mt-0.5">
                {categoryCounts.github} <span className="text-xs font-normal text-purple-200">repos</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Code2 className="h-4 w-4" />
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory("triennguyen")}
            className="p-3.5 rounded-2xl glass-card border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                b2.triennguyen
              </p>
              <p className="text-xl font-black text-white mt-0.5">
                {categoryCounts.triennguyen + categoryCounts.tips}{" "}
                <span className="text-xs font-normal text-indigo-200">repos & tips</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory("windows")}
            className="p-3.5 rounded-2xl glass-card border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-sky-300">
                Phím Tắt Windows
              </p>
              <p className="text-xl font-black text-white mt-0.5">
                {categoryCounts.windows}{" "}
                <span className="text-xs font-normal text-sky-200">shortcuts</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <Monitor className="h-4 w-4" />
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory("terminal")}
            className="p-3.5 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Terminal & Run
              </p>
              <p className="text-xl font-black text-white mt-0.5">
                {categoryCounts.terminal + categoryCounts.cheatsheet}{" "}
                <span className="text-xs font-normal text-emerald-200">lệnh CLI</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Terminal className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 space-y-3.5 border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm repo, phím tắt, lệnh terminal, tác giả, tag..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">
                Đang hiển thị: <strong className="text-white font-black">{filteredNotes.length}</strong> /{" "}
                {notes.length} mục
              </span>

              {/* View Mode */}
              <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                  title="Dạng lưới thẻ"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                  title="Dạng danh sách gọn"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-white/10 pt-3">
            {[
              { id: "all", label: "🌐 Tất cả", count: categoryCounts.all },
              { id: "pinned", label: "⭐ Đã ghim", count: categoryCounts.pinned },
              { id: "github", label: "🐙 GitHub @truongxoan", count: categoryCounts.github },
              { id: "triennguyen", label: "🚀 Repos b2.triennguyen", count: categoryCounts.triennguyen },
              { id: "tips", label: "💡 Mẹo Vặt & AI Hub", count: categoryCounts.tips },
              { id: "windows", label: "💻 Phím Tắt Windows", count: categoryCounts.windows },
              { id: "cheatsheet", label: "⚡ Lệnh Run (Win+R)", count: categoryCounts.cheatsheet },
              { id: "terminal", label: "💻 Terminal & CLI", count: categoryCounts.terminal },
              { id: "other", label: "📝 Cá nhân & Khác", count: categoryCounts.other },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    selectedCategory === cat.id ? "bg-white/20 text-white font-mono" : "bg-black/30 text-slate-400"
                  )}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Tag Chips Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] border-t border-white/5">
              <span className="text-slate-400 mr-1 flex items-center gap-1 shrink-0 font-medium">
                <Tag className="h-3 w-3" /> Thẻ:
              </span>
              <button
                onClick={() => setSelectedTag("all")}
                className={cn(
                  "px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 font-bold",
                  selectedTag === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                Tất cả
              </button>
              {allTags.slice(0, 25).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                  className={cn(
                    "px-2 py-0.5 rounded-lg border transition-colors cursor-pointer shrink-0",
                    selectedTag === tag
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/40 font-bold"
                      : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Main Items Display */}
        {filteredNotes.length === 0 ? (
          <Card className="p-12 text-center space-y-3 bg-slate-950/60 border-white/10">
            <Bookmark className="h-12 w-12 text-slate-500 mx-auto opacity-40" />
            <h3 className="text-base font-bold text-white">Không tìm thấy ghi chú hoặc repo nào phù hợp</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để thêm mới hoặc đồng bộ dữ liệu.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="text-xs">
                Thêm mới ngay
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetToCurated} className="text-xs">
                Khôi phục kho mẫu
              </Button>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          /* ======================================================== */
          /* GRID VIEW                                                */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const catCfg = getCategoryConfig(note.category);
              const isCopied = copiedId === note.id;

              return (
                <Card
                  key={note.id}
                  className={cn(
                    "p-4 rounded-3xl flex flex-col justify-between hover:border-blue-400/40 transition-all group relative bg-slate-950/70 border-white/10 hover:shadow-xl",
                    note.isPinned && "border-blue-500/40 bg-blue-950/15"
                  )}
                >
                  <div className="space-y-3">
                    {/* Top Row: Category Badge, Stars/Forks, Pin, Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                            catCfg.color
                          )}
                        >
                          {catCfg.icon}
                          <span>{note.badgeLabel || catCfg.label}</span>
                        </span>

                        {note.language && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                            {note.language}
                          </span>
                        )}

                        {typeof note.stars === "number" && note.stars > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>{note.stars.toLocaleString()}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Pin Button */}
                        <button
                          onClick={() => togglePin(note.id)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors cursor-pointer",
                            note.isPinned
                              ? "text-amber-400 bg-amber-500/10"
                              : "text-slate-500 hover:text-white hover:bg-white/10"
                          )}
                          title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                        >
                          <Pin className="h-3.5 w-3.5 fill-current" />
                        </button>

                        {/* Quick Copy Snippet */}
                        {(note.codeSnippet || note.shortcut || note.content) && (
                          <button
                            onClick={() =>
                              handleCopyText(
                                note.codeSnippet || note.shortcut || note.content || "",
                                note.id,
                                note.title
                              )
                            }
                            className={cn(
                              "p-1.5 rounded-lg transition-colors cursor-pointer",
                              isCopied
                                ? "text-emerald-400 bg-emerald-500/10"
                                : "text-slate-400 hover:text-white hover:bg-white/10"
                            )}
                            title="Sao chép nội dung / lệnh"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div
                      onClick={() => setSelectedNoteDetail(note)}
                      className="cursor-pointer group/title"
                    >
                      <h3 className="font-bold text-sm text-white group-hover/title:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {note.title}
                      </h3>
                      {note.author && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tác giả / Nguồn: <span className="text-slate-200 font-medium">{note.author}</span>
                        </p>
                      )}
                    </div>

                    {/* Shortcut Badge if exists */}
                    {note.shortcut && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] text-slate-400">Phím tắt:</span>
                        <kbd className="px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 font-mono text-xs font-black shadow-inner tracking-wide">
                          {note.shortcut}
                        </kbd>
                      </div>
                    )}

                    {/* Code Snippet Box with Copy Button */}
                    {note.codeSnippet && (
                      <div className="relative rounded-2xl bg-black/70 border border-white/15 p-2.5 font-mono text-[11px] text-emerald-300 shadow-inner group/code overflow-hidden">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-all pr-7">
                          <code>{note.codeSnippet}</code>
                        </pre>
                        <button
                          onClick={() => handleCopyText(note.codeSnippet!, note.id, note.title)}
                          className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Sao chép lệnh"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Content Explanation */}
                    {note.content && (
                      <p
                        onClick={() => setSelectedNoteDetail(note)}
                        className="text-xs text-slate-300/90 leading-relaxed line-clamp-3 cursor-pointer hover:text-white"
                      >
                        {note.content}
                      </p>
                    )}

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => setSelectedTag(t)}
                            className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: URL Link, Updated Date, Edit/Delete */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-slate-500">{note.updatedAt}</span>

                    <div className="flex items-center gap-2">
                      {note.url && (
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-bold flex items-center gap-1 transition-colors text-[10px]"
                          title="Truy cập liên kết"
                        >
                          <span>Mở link</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenEditModal(note)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(note.id, note.title)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="Xóa mục này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* LIST VIEW                                                */
          /* ======================================================== */
          <div className="space-y-2.5">
            {filteredNotes.map((note) => {
              const catCfg = getCategoryConfig(note.category);
              const isCopied = copiedId === note.id;

              return (
                <div
                  key={note.id}
                  className={cn(
                    "p-3.5 rounded-2xl glass-card border border-white/10 bg-slate-950/70 hover:border-blue-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    note.isPinned && "border-blue-500/40 bg-blue-950/20"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => togglePin(note.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0",
                        note.isPinned ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5 fill-current" />
                    </button>

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1",
                            catCfg.color
                          )}
                        >
                          {catCfg.icon}
                          <span>{note.badgeLabel || catCfg.label}</span>
                        </span>

                        {note.shortcut && (
                          <kbd className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-400/30">
                            {note.shortcut}
                          </kbd>
                        )}

                        {note.language && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 font-mono">
                            {note.language}
                          </span>
                        )}

                        <span
                          onClick={() => setSelectedNoteDetail(note)}
                          className="font-bold text-xs sm:text-sm text-white hover:text-blue-400 transition-colors cursor-pointer truncate max-w-md"
                        >
                          {note.title}
                        </span>
                      </div>

                      {note.content && (
                        <p className="text-xs text-slate-400 truncate max-w-xl">
                          {note.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {(note.codeSnippet || note.shortcut || note.content) && (
                      <button
                        onClick={() =>
                          handleCopyText(
                            note.codeSnippet || note.shortcut || note.content || "",
                            note.id,
                            note.title
                          )
                        }
                        className={cn(
                          "px-2 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer",
                          isCopied
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                            : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                        )}
                        title="Sao chép lệnh"
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? "Đã chép" : "Copy"}</span>
                      </button>
                    )}

                    {note.url && (
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition-colors"
                        title="Mở liên kết"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: NOTE DETAIL DRAWER / POPUP                        */}
        {/* ======================================================== */}
        {selectedNoteDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-2xl rounded-3xl glass-card border border-white/20 p-6 shadow-2xl bg-slate-950/95 text-white space-y-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const cfg = getCategoryConfig(selectedNoteDetail.category);
                      return (
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                            cfg.color
                          )}
                        >
                          {cfg.icon}
                          <span>{selectedNoteDetail.badgeLabel || cfg.label}</span>
                        </span>
                      );
                    })()}
                    {selectedNoteDetail.language && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {selectedNoteDetail.language}
                      </span>
                    )}
                    {typeof selectedNoteDetail.stars === "number" && selectedNoteDetail.stars > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{selectedNoteDetail.stars.toLocaleString()} stars</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    {selectedNoteDetail.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedNoteDetail(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcut Banner if any */}
              {selectedNoteDetail.shortcut && (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-sky-200 font-bold">Phím tắt kích hoạt:</span>
                  </div>
                  <kbd className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-200 font-mono text-sm font-black border border-sky-400/40">
                    {selectedNoteDetail.shortcut}
                  </kbd>
                </div>
              )}

              {/* Code Snippet if any */}
              {selectedNoteDetail.codeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold flex items-center gap-1 text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Lệnh Dòng Lệnh / Code Snippet:
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          selectedNoteDetail.codeSnippet!,
                          selectedNoteDetail.id,
                          selectedNoteDetail.title
                        )
                      }
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép lệnh</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/80 border border-white/15 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    <code>{selectedNoteDetail.codeSnippet}</code>
                  </div>
                </div>
              )}

              {/* Full Description Content */}
              {selectedNoteDetail.content && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 block">Nội dung chi tiết & Hướng dẫn:</span>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedNoteDetail.content}
                  </div>
                </div>
              )}

              {/* Tags and Target Audience */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedNoteDetail.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="text-slate-400 text-[11px]">
                  Cập nhật: {selectedNoteDetail.updatedAt}
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                {selectedNoteDetail.url && (
                  <a
                    href={selectedNoteDetail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>Truy cập Repository / Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedNoteDetail(null)}
                  className="text-xs"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD / EDIT NOTE                                   */}
        {/* ======================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-xl rounded-3xl glass-card p-6 shadow-2xl border border-white/20 bg-slate-950/95 text-white space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-blue-400" />
                  {editingNote ? "Chỉnh Sửa Ghi Chú / Repo" : "Thêm Ghi Chú / Lệnh Mới"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Tiêu đề <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TxCloneDriver — Hệ thống Quản trị Đám mây..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Category & Pin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Danh mục</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="github" className="bg-slate-900">🐙 GitHub Repo</option>
                      <option value="triennguyen" className="bg-slate-900">🚀 b2.triennguyen Repo</option>
                      <option value="windows" className="bg-slate-900">💻 Phím Tắt Windows</option>
                      <option value="cheatsheet" className="bg-slate-900">⚡ Lệnh Run (Win+R)</option>
                      <option value="terminal" className="bg-slate-900">💻 Lệnh Terminal & CLI</option>
                      <option value="tips" className="bg-slate-900">💡 Mẹo Vặt & AI Hub</option>
                      <option value="website" className="bg-slate-900">🌐 Website Link</option>
                      <option value="drive" className="bg-slate-900">📁 Google Drive</option>
                      <option value="prompt" className="bg-slate-900">✨ Prompt AI</option>
                      <option value="text" className="bg-slate-900">📝 Ghi chú văn bản</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={(e) => setFormIsPinned(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-blue-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Pin className="h-3 w-3 fill-current" /> Ghim mục này lên đầu trang
                      </span>
                    </label>
                  </div>
                </div>

                {/* Shortcut & Code Snippet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Phím tắt (Nếu có)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Win + V, Ctrl + Shift + Esc..."
                      value={formShortcut}
                      onChange={(e) => setFormShortcut(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Liên kết URL (Nếu có)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Code Snippet */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Lệnh Terminal / Code Snippet (Sao chép 1 chạm)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: netstat -ano | findstr :3000\ntaskkill /PID <PID> /F..."
                    value={formCodeSnippet}
                    onChange={(e) => setFormCodeSnippet(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-emerald-300 font-mono placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Nội dung mô tả & Hướng dẫn sử dụng
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Giải thích repo làm gì, mẹo vặt hoặc các bước thực hiện..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Thẻ Tags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="GitHub, truongxoan, Python, Tools..."
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-500 font-bold"
                  >
                    {editingNote ? "Lưu Thay Đổi" : "Thêm Mục Mới"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
