"use client";

import React, { useState } from "react";
import {
  HardDrive,
  Upload,
  FolderPlus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  Archive,
  Download,
  Trash2,
  Share2,
  Info,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBytes, cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/authContext";
import { useDriveEndpoints, DriveFileItem } from "@/modules/storage/driveEndpointsContext";

export default function StoragePage() {
  const { user, isAdmin } = useAuth();
  const {
    endpoints,
    activeEndpoint,
    files,
    loading,
    error,
    refreshFiles,
    setActiveEndpointId,
    addEndpoint,
    removeEndpoint,
    testEndpoint,
  } = useDriveEndpoints();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showToast, setShowToast] = useState<string | null>(null);

  // Manage endpoints modal
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState("");
  const [newEndpointUrl, setNewEndpointUrl] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const filteredFiles = files.filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const triggerAction = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpointName.trim() || !newEndpointUrl.trim()) return;
    addEndpoint(newEndpointName, newEndpointUrl);
    setNewEndpointName("");
    setNewEndpointUrl("");
    triggerAction("Đã thêm liên kết thư mục mới thành công!");
  };

  const handleTestLink = async (id: string) => {
    setTestingId(id);
    const res = await testEndpoint(id);
    setTestingId(null);
    if (res.success) {
      triggerAction(`Kiểm tra thành công: Tìm thấy ${res.fileCount} tệp.`);
    } else {
      triggerAction(`Lỗi: ${res.error || "Không thể kết nối"}`);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-rose-400" />;
    if (mimeType.includes("image")) return <ImageIcon className="h-5 w-5 text-emerald-400" />;
    if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar"))
      return <Archive className="h-5 w-5 text-amber-400" />;
    if (mimeType.includes("folder")) return <Folder className="h-5 w-5 text-yellow-400" />;
    return <FileSpreadsheet className="h-5 w-5 text-sky-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Top Banner: Active Endpoint Status */}
      <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>Đang kết nối thư mục:</span>
              <span className="text-emerald-300 font-bold">
                {activeEndpoint?.name || "Chưa chọn thư mục"}
              </span>
              <Badge variant="success" size="sm" className="font-mono text-[10px]">
                Google Drive Live
              </Badge>
            </div>
            <p className="text-slate-300 text-[11px] truncate max-w-xl">
              URL: <code className="text-slate-400 font-mono text-[10px]">{activeEndpoint?.url}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshFiles}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>{loading ? "Đang tải..." : "Làm mới"}</span>
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowEndpointModal(true)}
              className="gap-1.5 text-xs"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>Quản lý thư mục dự phòng</span>
            </Button>
          )}
        </div>
      </div>

      {/* Storage Header & Folder Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-primary" />
            Kho lưu trữ Google Drive
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đồng bộ trực tiếp qua Google Apps Script Web App &bull; Không cần thẻ thanh toán
          </p>
        </div>

        {/* Quick Endpoint Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline">Thư mục:</span>
          <select
            value={activeEndpoint?.id || ""}
            onChange={(e) => setActiveEndpointId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-xs font-semibold bg-slate-900 border border-white/20 text-white cursor-pointer"
          >
            {endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.name} {ep.isActive ? "(Đang dùng)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tệp trong thư mục..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Tìm thấy: <strong className="text-white">{filteredFiles.length}</strong> tệp
            </span>

            {/* View Mode */}
            <div className="flex items-center gap-1 border-l border-surface-border pl-3">
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
            </div>
          </div>
        </div>
      </Card>

      {/* Error Notice if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Lỗi đồng bộ thư mục</p>
            <p className="text-[11px] text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Main Files Area: Empty State or Files List */}
      {files.length === 0 && !loading && !error ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-white">
              Đã kết nối thành công với Thư mục Google Drive!
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thư mục Google Drive của bạn hiện tại đang trống. Bất kỳ tệp nào bạn kéo thả hoặc tải lên thư mục này trên Google Drive sẽ tự động xuất hiện tại đây khi bấm &ldquo;Làm mới&rdquo;.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={refreshFiles} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Làm mới danh sách tệp ngay</span>
          </Button>
        </Card>
      ) : viewMode === "list" ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/40 border-b border-surface-border text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Tên tệp</th>
                  <th className="py-3 px-4 font-medium">Định dạng</th>
                  <th className="py-3 px-4 font-medium">Dung lượng</th>
                  <th className="py-3 px-4 font-medium">Cập nhật lần cuối</th>
                  <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredFiles.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-elevated/40 transition-colors group"
                  >
                    <td className="py-3 px-4 flex items-center gap-3 font-medium text-foreground">
                      <span className="p-1.5 rounded-xl bg-surface-elevated border border-surface-border">
                        {getFileIcon(item.mimeType)}
                      </span>
                      <span className="truncate max-w-[280px] sm:max-w-md font-semibold text-white">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px] truncate max-w-[150px]">
                      {item.mimeType}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      {item.downloadUrl ? (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Tải xuống</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => triggerAction(`Tải xuống "${item.name}"`)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((item) => (
            <Card
              key={item.id}
              className="p-4 flex flex-col justify-between hover:border-primary/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-surface-elevated border border-surface-border">
                    {getFileIcon(item.mimeType)}
                  </div>
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Tải xuống tệp tin"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <h4 className="font-semibold text-foreground text-xs line-clamp-2">
                  {item.name}
                </h4>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-mono">{formatBytes(item.sizeBytes)}</span>
                <span>{item.updatedAt}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Multi-Folder & Backup Endpoints Management Modal */}
      {showEndpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setShowEndpointModal(false)} />
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 shadow-glass border border-white/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-white">
                  Quản lý Thư mục Drive & Dự phòng Nhiều Tài khoản
                </h3>
              </div>
              <button
                onClick={() => setShowEndpointModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Bạn có thể cấu hình nhiều thư mục Google Apps Script từ các tài khoản Gmail khác nhau. Nếu đường dẫn chính gặp sự cố, hệ thống sẽ tự động chuyển sang thư mục dự phòng!
            </p>

            {/* List of existing endpoints */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={cn(
                    "p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs",
                    ep.isActive
                      ? "bg-primary/20 border-primary/40 shadow-sm"
                      : "bg-surface-elevated/40 border-white/10"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ep.name}</span>
                      {ep.isActive && (
                        <Badge variant="primary" size="sm" className="text-[10px]">
                          Đang kích hoạt
                        </Badge>
                      )}
                      {ep.status === "connected" && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Hoạt động ({ep.fileCount || 0} tệp)
                        </span>
                      )}
                      {ep.status === "error" && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Lỗi
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {ep.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTestLink(ep.id)}
                      disabled={testingId === ep.id}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition-colors"
                    >
                      {testingId === ep.id ? "Đang thử..." : "Kiểm tra"}
                    </button>

                    {!ep.isActive && (
                      <button
                        onClick={() => setActiveEndpointId(ep.id)}
                        className="px-2.5 py-1 rounded-xl bg-primary text-white text-[11px] font-semibold transition-colors shadow-sm"
                      >
                        Sử dụng
                      </button>
                    )}

                    {endpoints.length > 1 && (
                      <button
                        onClick={() => removeEndpoint(ep.id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        title="Xóa cấu hình này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add new endpoint form */}
            <form onSubmit={handleAddEndpoint} className="pt-3 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Thêm thư mục Drive mới
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tên thư mục (VD: Kho Dự Án, Backup Gmail 2)..."
                  value={newEndpointName}
                  onChange={(e) => setNewEndpointName(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
                <input
                  type="url"
                  required
                  placeholder="URL Google Apps Script (https://script.google.com/.../exec)"
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Thêm vào danh sách
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
