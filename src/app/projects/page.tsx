"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Folder,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  Calendar,
  GitBranch,
  Github,
  AlertTriangle,
  Clock,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ProjectItem, ProjectStatus } from "@/types/notesAndProjects";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Website TxCloneDriver Cloud Hub",
    description: "Phát triển giao diện web SaaS quản lý dữ liệu cá nhân cao cấp, tích hợp Google Drive và Telegram Bot.",
    status: "in_progress",
    progressPercent: 75,
    priority: "high",
    dueDate: "30/05/2025",
    updatedAt: "26/04/2025",
    githubUrl: "https://github.com/txclonedriver/hub",
    branch: "main",
    tasks: [
      { id: "t1", title: "Thiết kế Glassmorphism SaaS 3D", completed: true },
      { id: "t2", title: "Tích hợp Google Apps Script Drive", completed: true },
      { id: "t3", title: "Xây dựng Music Player cho Google Drive", completed: true },
      { id: "t4", title: "Tối ưu hóa Lighthouse 90+", completed: false },
    ],
  },
  {
    id: "proj-2",
    title: "Ứng dụng Di động TxCloneDriver Mobile",
    description: "Phiên bản di động React Native hỗ trợ đồng bộ tệp ngoại tuyến và xác thực vân tay/FaceID.",
    status: "not_started",
    progressPercent: 40,
    priority: "medium",
    dueDate: "15/07/2025",
    updatedAt: "20/04/2025",
    githubUrl: "https://github.com/txclonedriver/mobile",
    branch: "dev",
    tasks: [
      { id: "t5", title: "Phác thảo Wireframe & UX", completed: true },
      { id: "t6", title: "Cấu hình Expo / React Native", completed: false },
      { id: "t7", title: "Đồng bộ offline SQLite", completed: false },
    ],
  },
  {
    id: "proj-3",
    title: "Backup Hệ thống & Multi-Endpoint Hub",
    description: "Cơ chế tự động hóa sao lưu và failover sang các tài khoản Drive dự phòng khi gặp sự cố.",
    status: "almost_done",
    progressPercent: 90,
    priority: "high",
    dueDate: "10/05/2025",
    updatedAt: "24/04/2025",
    githubUrl: "https://github.com/txclonedriver/backup-engine",
    branch: "feature/failover",
    tasks: [
      { id: "t8", title: "Thiết kế Route Handler Proxy", completed: true },
      { id: "t9", title: "Quản lý đa endpoint dự phòng", completed: true },
      { id: "t10", title: "Kiểm thử mã hóa AES-256", completed: false },
    ],
  },
  {
    id: "proj-4",
    title: "Telegram AI Bot Trợ lý",
    description: "Bot Telegram thông minh gửi thông báo thời tiết, sự kiện và tra cứu tệp qua chat lệnh.",
    status: "idea",
    progressPercent: 25,
    priority: "low",
    dueDate: "01/08/2025",
    updatedAt: "18/04/2025",
    tasks: [
      { id: "t11", title: "Đăng ký BotFather Token", completed: true },
      { id: "t12", title: "Viết lệnh /recent và /backup", completed: false },
      { id: "t13", title: "Tích hợp Gemini AI tóm tắt", completed: false },
    ],
  },
];

const STATUS_COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: "idea", label: "Ý tưởng", color: "border-purple-500/40 text-purple-300" },
  { id: "not_started", label: "Chờ xử lý", color: "border-amber-500/40 text-amber-300" },
  { id: "in_progress", label: "Đang làm", color: "border-blue-500/40 text-blue-300" },
  { id: "almost_done", label: "Sắp hoàn thành", color: "border-emerald-500/40 text-emerald-300" },
  { id: "completed", label: "Đã hoàn thành", color: "border-teal-500/40 text-teal-300" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showToast, setShowToast] = useState<string | null>(null);

  // Add Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<ProjectStatus>("in_progress");
  const [formPriority, setFormPriority] = useState<"high" | "medium" | "low">("medium");
  const [formDueDate, setFormDueDate] = useState("30/06/2025");
  const [formGithub, setFormGithub] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("datavault_projects");
      if (saved) {
        setProjects(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveProjects = (updated: ProjectItem[]) => {
    setProjects(updated);
    try {
      localStorage.setItem("datavault_projects", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Toggle Task Completion and auto-recalculate progress
  const toggleTask = (projectId: string, taskId: string) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const newTasks = p.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const completedCount = newTasks.filter((t) => t.completed).length;
      const progressPercent = Math.round((completedCount / newTasks.length) * 100);
      return {
        ...p,
        tasks: newTasks,
        progressPercent,
      };
    });
    saveProjects(updated);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: formTitle.trim(),
      description: formDesc.trim(),
      status: formStatus,
      progressPercent: 0,
      priority: formPriority,
      dueDate: formDueDate || "30/06/2025",
      updatedAt: dateStr,
      githubUrl: formGithub.trim() || undefined,
      branch: "main",
      tasks: [
        { id: `t-${Date.now()}-1`, title: "Lên kế hoạch và kiến trúc", completed: false },
        { id: `t-${Date.now()}-2`, title: "Phát triển tính năng chính", completed: false },
      ],
    };

    saveProjects([newProj, ...projects]);
    setIsModalOpen(false);
    setFormTitle("");
    setFormDesc("");
    setFormGithub("");
    triggerToast("Đã thêm dự án mới thành công!");
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa dự án "${title}" không?`)) {
      const updated = projects.filter((p) => p.id !== id);
      saveProjects(updated);
      triggerToast(`Đã xóa "${title}"!`);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
      return true;
    });
  }, [projects, searchTerm, selectedStatus]);

  const getPriorityBadge = (p: "high" | "medium" | "low") => {
    switch (p) {
      case "high":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">Ưu tiên cao</span>;
      case "medium":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">Trung bình</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 font-semibold">Thấp</span>;
    }
  };

  return (
    <ModuleGuard moduleId="projects" moduleName="Dự án">
      <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            Quản trị Dự án
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi tiến độ, checklist nhiệm vụ, kho lưu trữ GitHub và các mốc hoàn thành
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tạo Dự án Mới</span>
        </Button>
      </div>

      {/* Search and View Controls */}
      <Card className="p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Tổng số: <strong className="text-white">{filteredProjects.length}</strong> dự án
            </span>

            <div className="flex items-center gap-1 border-l border-surface-border pl-3">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "kanban"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Bảng Kanban"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Danh sách"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-white/10 pt-2.5">
          <button
            onClick={() => setSelectedStatus("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap",
              selectedStatus === "all"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            Tất cả trạng thái
          </button>
          {STATUS_COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedStatus(col.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap",
                selectedStatus === col.id
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              )}
            >
              {col.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Display: Kanban Board or List */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-3xl glass-card p-3 border border-white/10 space-y-3 min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className={cn("text-xs font-bold", col.color)}>
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {p.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                          title="Xóa dự án"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Tiến độ</span>
                          <span className="font-mono font-bold text-white">
                            {p.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Task checklist */}
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Nhiệm vụ ({p.tasks.filter((t) => t.completed).length}/{p.tasks.length}):
                        </span>
                        {p.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(p.id, task.id)}
                            className="flex items-center gap-2 w-full text-left text-[11px] hover:text-white py-0.5 transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            )}
                            <span
                              className={cn(
                                "truncate",
                                task.completed
                                  ? "line-through text-slate-500"
                                  : "text-slate-300"
                              )}
                            >
                              {task.title}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Hạn: {p.dueDate}</span>
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/40 border-b border-surface-border text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Tên dự án</th>
                  <th className="py-3 px-4 font-medium">Trạng thái</th>
                  <th className="py-3 px-4 font-medium">Tiến độ</th>
                  <th className="py-3 px-4 font-medium">Mức ưu tiên</th>
                  <th className="py-3 px-4 font-medium">Hạn chót</th>
                  <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{p.title}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {p.description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                        {STATUS_COLUMNS.find((c) => c.id === p.status)?.label || p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {p.progressPercent}%
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(p.priority)}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {p.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
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

      {/* Modal: Thêm Dự án Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 shadow-2xl border border-white/20 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                Tạo Dự án Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Tên Dự án *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cổng thanh toán, Mobile App..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Mô tả Dự án
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả mục tiêu và phạm vi của dự án..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 border border-white/20 text-white"
                  >
                    <option value="idea">Ý tưởng</option>
                    <option value="not_started">Chờ xử lý</option>
                    <option value="in_progress">Đang làm</option>
                    <option value="almost_done">Sắp hoàn thành</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Mức ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) =>
                      setFormPriority(e.target.value as "high" | "medium" | "low")
                    }
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 border border-white/20 text-white"
                  >
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Hạn chót
                  </label>
                  <input
                    type="text"
                    placeholder="30/06/2025"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formGithub}
                    onChange={(e) => setFormGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Tạo Dự án
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
