"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { NoteItem, NoteCategory } from "@/types/notesAndProjects";

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: "note-1",
    title: "Notion • Kế hoạch & Roadmap công việc",
    category: "website",
    url: "https://www.notion.so",
    content: "Trang tài liệu quản lý tiến độ, roadmap quý 2 và sprint backlog dự án DataVault.",
    tags: ["Workspace", "Kế hoạch", "Productivity"],
    isPinned: true,
    updatedAt: "26/04/2025",
  },
  {
    id: "note-2",
    title: "Google Drive • Kho dữ liệu quan trọng",
    category: "drive",
    url: "https://drive.google.com",
    content: "Thư mục lưu trữ hợp đồng, giấy tờ cá nhân và các bản backup cơ sở dữ liệu quan trọng.",
    tags: ["Cloud", "Tài liệu", "Lưu trữ"],
    isPinned: true,
    updatedAt: "25/04/2025",
  },
  {
    id: "note-3",
    title: "GitHub • DataVault Cloud Hub Repository",
    category: "github",
    url: "https://github.com",
    content: "Mã nguồn chính Next.js App Router, CI/CD pipeline và quản lý các pull request.",
    tags: ["Dev", "SourceCode", "Git"],
    isPinned: true,
    updatedAt: "24/04/2025",
  },
  {
    id: "note-4",
    title: "Lệnh khởi động Server Development",
    category: "terminal",
    content: "npm.cmd run dev -- -p 3000",
    tags: ["Command", "Next.js", "PowerShell"],
    isPinned: false,
    updatedAt: "23/04/2025",
  },
  {
    id: "note-5",
    title: "Prompt Tối ưu hóa UI/UX Glassmorphism",
    category: "prompt",
    content: "Hãy phân tích độ tương phản màu dark navy, midnight blue, hiệu ứng bóng đổ mờ và kích thước padding 16px-24px để đạt chuẩn SaaS cao cấp.",
    tags: ["AI", "Design", "Prompt"],
    isPinned: false,
    updatedAt: "22/04/2025",
  },
  {
    id: "note-6",
    title: "Ghi chú họp kiến trúc hệ thống",
    category: "text",
    content: "Thống nhất cơ chế failover: Khi Google Apps Script chính bị giới hạn, hệ thống tự động fallback sang endpoint phụ mà không làm ngắt session.",
    tags: ["Meeting", "Kiến trúc", "System"],
    isPinned: false,
    updatedAt: "21/04/2025",
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showToast, setShowToast] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<NoteCategory>("website");
  const [formUrl, setFormUrl] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("datavault_notes");
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem("datavault_notes", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Đã sao chép "${title}" vào clipboard!`);
  };

  const handleOpenAddModal = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormCategory("website");
    setFormUrl("");
    setFormContent("");
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

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;

    if (editingNote) {
      const updated = notes.map((item) =>
        item.id === editingNote.id
          ? {
              ...item,
              title: formTitle.trim(),
              category: formCategory,
              url: formUrl.trim() || undefined,
              content: formContent.trim() || undefined,
              tags: tagsArray,
              isPinned: formIsPinned,
              updatedAt: dateStr,
            }
          : item
      );
      saveNotes(updated);
      triggerToast("Đã cập nhật ghi chú thành công!");
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        url: formUrl.trim() || undefined,
        content: formContent.trim() || undefined,
        tags: tagsArray,
        isPinned: formIsPinned,
        updatedAt: dateStr,
      };
      saveNotes([newNote, ...notes]);
      triggerToast("Đã thêm ghi chú/liên kết mới!");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${title}" không?`)) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotes(updated);
      triggerToast(`Đã xóa "${title}"!`);
    }
  };

  const togglePin = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
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
        const matchSearch =
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchSearch) return false;

        if (selectedCategory !== "all" && n.category !== selectedCategory) return false;
        if (selectedTag !== "all" && !n.tags.includes(selectedTag)) return false;

        return true;
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, searchTerm, selectedCategory, selectedTag]);

  const getCategoryIcon = (cat: NoteCategory) => {
    switch (cat) {
      case "website":
        return <Globe className="h-4 w-4 text-sky-400" />;
      case "drive":
        return <HardDrive className="h-4 w-4 text-emerald-400" />;
      case "github":
        return <Code2 className="h-4 w-4 text-purple-400" />;
      case "terminal":
        return <Terminal className="h-4 w-4 text-amber-400" />;
      case "prompt":
        return <Sparkles className="h-4 w-4 text-pink-400" />;
      default:
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  const getCategoryLabel = (cat: NoteCategory) => {
    switch (cat) {
      case "website":
        return "Website Link";
      case "drive":
        return "Google Drive";
      case "github":
        return "GitHub Repo";
      case "terminal":
        return "Lệnh Terminal";
      case "prompt":
        return "Prompt AI";
      default:
        return "Ghi chú";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" />
            Ghi chú & Link Nhanh
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý liên kết quan trọng, tài liệu công việc, lệnh terminal và prompt AI cá nhân
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Ghi chú / Link</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, nội dung, URL hoặc tag..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Tổng số: <strong className="text-white">{filteredNotes.length}</strong> mục
            </span>

            {/* View Mode */}
            <div className="flex items-center gap-1 border-l border-surface-border pl-3">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dạng lưới"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dạng danh sách"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-white/10 pt-2.5">
          {[
            { id: "all", label: "Tất cả" },
            { id: "website", label: "Website Link" },
            { id: "drive", label: "Google Drive" },
            { id: "github", label: "GitHub Repo" },
            { id: "terminal", label: "Lệnh Terminal" },
            { id: "prompt", label: "Prompt AI" },
            { id: "text", label: "Ghi chú văn bản" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap",
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tags Bar if available */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px]">
            <span className="text-muted-foreground mr-1 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tag:
            </span>
            <button
              onClick={() => setSelectedTag("all")}
              className={cn(
                "px-2 py-0.5 rounded-lg transition-colors",
                selectedTag === "all"
                  ? "bg-white/20 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Tất cả
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                className={cn(
                  "px-2 py-0.5 rounded-lg border transition-colors",
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
        <Card className="p-8 text-center space-y-3">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">Không tìm thấy ghi chú hoặc link nào</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để tạo mục mới.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="mt-2 text-xs">
            Thêm mới ngay
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                "p-4 flex flex-col justify-between hover:border-blue-400/40 transition-all group relative",
                note.isPinned && "border-blue-500/30 bg-blue-500/5"
              )}
            >
              <div>
                {/* Card Top: Icon, Category & Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-surface-elevated border border-surface-border">
                      {getCategoryIcon(note.category)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {getCategoryLabel(note.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        note.isPinned ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                      )}
                      title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                    >
                      <Pin className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-1">
                  {note.title}
                </h3>

                {/* Content / Snippet */}
                {note.content && (
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-3 mb-2 bg-white/5 p-2 rounded-xl border border-white/5">
                    {note.content}
                  </p>
                )}

                {/* URL if any */}
                {note.url && (
                  <p className="text-[10px] text-sky-400 font-mono truncate mb-2" title={note.url}>
                    {note.url}
                  </p>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="mt-3 pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 text-[10px]">{note.updatedAt}</span>

                <div className="flex items-center gap-1.5">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(note.url || note.content || note.title, note.title)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    title="Sao chép nội dung/link"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>

                  {/* Open Link Button if URL */}
                  {note.url && (
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Mở link</span>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/40 border-b border-surface-border text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Tiêu đề & Loại</th>
                  <th className="py-3 px-4 font-medium">Nội dung / URL</th>
                  <th className="py-3 px-4 font-medium">Tag</th>
                  <th className="py-3 px-4 font-medium">Cập nhật</th>
                  <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-surface-elevated/40 transition-colors group"
                  >
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <span className="p-1 rounded-lg bg-surface-elevated border border-surface-border">
                        {getCategoryIcon(note.category)}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate max-w-xs block group-hover:text-blue-300">
                          {note.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {getCategoryLabel(note.category)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate font-mono">
                      {note.url || note.content || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {note.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{note.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(note.url || note.content || note.title, note.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          title="Sao chép"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {note.url && (
                          <a
                            href={note.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300"
                            title="Mở liên kết"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          title="Sửa"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id, note.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Thêm / Sửa Ghi chú & Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 shadow-2xl border border-white/20 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                {editingNote ? "Chỉnh sửa Ghi chú / Link" : "Thêm Ghi chú / Link Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Notion Sprint Planning, Lệnh deploy..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Phân loại
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 border border-white/20 text-white"
                  >
                    <option value="website">Website Link</option>
                    <option value="drive">Google Drive</option>
                    <option value="github">GitHub Repo</option>
                    <option value="terminal">Lệnh Terminal</option>
                    <option value="prompt">Prompt AI</option>
                    <option value="text">Ghi chú văn bản</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Tags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Work, DevOps, AI"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Liên kết URL (nếu có)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Nội dung chi tiết / Code snippet / Prompt
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung ghi chú, câu lệnh hoặc thông tin chi tiết..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded border-white/20 text-blue-600"
                  />
                  <span>Ghim lên đầu mục</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    {editingNote ? "Lưu thay đổi" : "Tạo mới"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
