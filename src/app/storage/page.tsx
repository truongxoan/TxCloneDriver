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
  Star,
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBytes, cn } from "@/lib/utils";
import { MOCK_STORAGE_ITEMS, MOCK_STORAGE_QUOTA } from "@/modules/storage/mockDriveData";
import { StorageItem, FileCategory } from "@/modules/storage/types";
import { useAuth } from "@/modules/auth/authContext";

export default function StoragePage() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<StorageItem[]>(MOCK_STORAGE_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showToast, setShowToast] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const triggerAction = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const getFileIcon = (category: FileCategory) => {
    switch (category) {
      case "document":
        return <FileText className="h-5 w-5 text-sky-400" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-emerald-400" />;
      case "backup":
        return <Archive className="h-5 w-5 text-amber-400" />;
      case "folder":
        return <Folder className="h-5 w-5 text-yellow-400" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-primary" />;
    }
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

      {/* Permission & Role Banner */}
      <div
        className={cn(
          "rounded-2xl glass-panel p-4 border flex items-start justify-between gap-3",
          isAdmin
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-blue-500/30 bg-blue-500/10"
        )}
      >
        <div className="flex items-start gap-3">
          {isAdmin ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>Vai trò hiện tại: {user?.name || "Người dùng"}</span>
              <Badge
                variant={isAdmin ? "success" : "primary"}
                size="sm"
                className="uppercase tracking-wider"
              >
                {isAdmin ? "Toàn quyền Admin" : "User Chỉ đọc & Tải xuống"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Tài khoản của bạn có toàn quyền quản lý: Thêm mới, chỉnh sửa, tải lên và xóa tệp tin trên hệ thống."
                : "Tài khoản Tiêu chuẩn: Bạn được xem toàn bộ danh mục tài liệu và tải xuống. Tính năng thêm tệp hoặc tạo thư mục đã được khóa theo chính sách phân quyền."}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-primary" />
            Kho lưu trữ Cloud Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý, đồng bộ và phân loại tài liệu với tích hợp Google Drive v3
          </p>
        </div>

        {/* Action Buttons: Only visible to ADMIN */}
        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => triggerAction("Tạo thư mục: Tính năng dành cho Quản trị viên")}
            >
              <FolderPlus className="h-4 w-4" />
              <span>Thư mục mới</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => triggerAction("Tải tệp lên: Đã xác thực quyền Quản trị viên")}
            >
              <Upload className="h-4 w-4" />
              <span>Tải tệp lên</span>
            </Button>
          </div>
        )}
      </div>

      {/* Storage Breakdown Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground">Tài liệu & Sách</span>
          <div className="text-lg font-bold text-foreground mt-1">
            {formatBytes(MOCK_STORAGE_QUOTA.breakdown.documentsBytes)}
          </div>
          <div className="h-1.5 w-full bg-surface-elevated rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-sky-400 w-1/4" />
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground">Hình ảnh & Đồ họa</span>
          <div className="text-lg font-bold text-foreground mt-1">
            {formatBytes(MOCK_STORAGE_QUOTA.breakdown.imagesBytes)}
          </div>
          <div className="h-1.5 w-full bg-surface-elevated rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400 w-2/5" />
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground">Bản sao lưu Hệ thống</span>
          <div className="text-lg font-bold text-foreground mt-1">
            {formatBytes(MOCK_STORAGE_QUOTA.breakdown.backupsBytes)}
          </div>
          <div className="h-1.5 w-full bg-surface-elevated rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-amber-400 w-1/3" />
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground">Khả dụng còn lại</span>
          <div className="text-lg font-bold text-foreground mt-1">
            {formatBytes(MOCK_STORAGE_QUOTA.totalBytes - MOCK_STORAGE_QUOTA.usedBytes)}
          </div>
          <div className="h-1.5 w-full bg-surface-elevated rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary w-2/3" />
          </div>
        </Card>
      </div>

      {/* Filter and View Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tệp theo tên..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Tất cả" },
              { id: "folder", label: "Thư mục" },
              { id: "document", label: "Tài liệu" },
              { id: "image", label: "Hình ảnh" },
              { id: "backup", label: "Sao lưu" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
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
      </Card>

      {/* Files Display: List or Grid */}
      {viewMode === "list" ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/40 border-b border-surface-border text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Tên tệp</th>
                  <th className="py-3 px-4 font-medium">Dung lượng</th>
                  <th className="py-3 px-4 font-medium">Người sở hữu</th>
                  <th className="py-3 px-4 font-medium">Thời gian sửa</th>
                  <th className="py-3 px-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-elevated/40 transition-colors group"
                  >
                    <td className="py-3 px-4 flex items-center gap-3 font-medium text-foreground">
                      <span className="p-1.5 rounded-xl bg-surface-elevated border border-surface-border">
                        {getFileIcon(item.category)}
                      </span>
                      <span className="truncate max-w-[280px] sm:max-w-md">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.owner}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download is allowed for EVERYONE (both Admin and User) */}
                        <button
                          onClick={() => triggerAction(`Đang tải xuống "${item.name}"...`)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Tải xuống tệp tin"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* Share and Delete are ONLY allowed for ADMIN */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => triggerAction(`Chia sẻ "${item.name}" (Admin)`)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                              title="Chia sẻ liên kết"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => triggerAction(`Xóa "${item.name}" (Admin)`)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Xóa tệp tin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-4 flex flex-col justify-between hover:border-primary/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-surface-elevated border border-surface-border">
                    {getFileIcon(item.category)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => triggerAction(`Đang tải xuống "${item.name}"...`)}
                      className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20"
                      title="Tải xuống"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => triggerAction(`Xóa "${item.name}" (Admin)`)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
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
    </div>
  );
}
