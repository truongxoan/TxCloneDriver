"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Database,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBytes } from "@/lib/utils";

const BACKUP_HISTORY = [
  {
    id: "bk-1004",
    name: "Sao_luu_He_thong_Full_20261009.tar.gz",
    type: "Tự động (Cron)",
    sizeBytes: 850 * 1024 * 1024,
    status: "Thành công",
    timestamp: "09/10/2026 23:00:15",
    duration: "42 giây",
  },
  {
    id: "bk-1003",
    name: "Snapshot_Database_PostgreSQL.sql",
    type: "Thủ công",
    sizeBytes: 420 * 1024 * 1024,
    status: "Thành công",
    timestamp: "08/10/2026 15:20:00",
    duration: "18 giây",
  },
  {
    id: "bk-1002",
    name: "Sync_Google_Drive_Mirror.tar",
    type: "Tự động (Cron)",
    sizeBytes: 1.4 * 1024 * 1024 * 1024,
    status: "Thành công",
    timestamp: "07/10/2026 23:00:10",
    duration: "1 phút 12 giây",
  },
];

export default function BackupsPage() {
  const [isRunningDryRun, setIsRunningDryRun] = useState(false);
  const [dryRunLog, setDryRunLog] = useState<string | null>(null);

  const handleRunDryRun = () => {
    setIsRunningDryRun(true);
    setDryRunLog("Khởi tạo phiên thử nghiệm Dry-run...");

    setTimeout(() => {
      setDryRunLog(
        "[DRY-RUN HOÀN TẤT] Kiểm tra 1,420 tệp dữ liệu, kích thước dự tính 2.4 GB. Tính toàn vẹn checksum MD5 đạt chuẩn. Sẵn sàng cho Giai đoạn 7!"
      );
      setIsRunningDryRun(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Trung tâm Sao lưu & Tự động hóa
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lập lịch backup snapshot, kiểm tra tính toàn vẹn dữ liệu và cơ chế khôi phục
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunDryRun}
            disabled={isRunningDryRun}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            <span>{isRunningDryRun ? "Đang chạy..." : "Chạy thử (Dry-run)"}</span>
          </Button>
        </div>
      </div>

      {/* Dry Run Output */}
      {dryRunLog && (
        <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{dryRunLog}</span>
        </div>
      )}

      {/* Backup Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="success" size="sm">
              Đang hoạt động
            </Badge>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-sm">PostgreSQL DB Snapshot</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Sao lưu cấu trúc bảng và toàn bộ bản ghi hệ thống.
          </p>
          <div className="mt-4 pt-3 border-t border-surface-border/60 text-xs flex justify-between">
            <span className="text-muted-foreground">Lập lịch:</span>
            <span className="font-semibold text-foreground">Hằng ngày lúc 02:00</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="primary" size="sm">
              Đang hoạt động
            </Badge>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Google Drive Mirror Sync</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Đồng bộ dữ liệu hai chiều và kiểm tra hash tệp tin.
          </p>
          <div className="mt-4 pt-3 border-t border-surface-border/60 text-xs flex justify-between">
            <span className="text-muted-foreground">Lập lịch:</span>
            <span className="font-semibold text-foreground">Hằng tuần (Chủ Nhật)</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" size="sm">
              Thủ công
            </Badge>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Cấu hình Hệ thống & Secret</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Mã hóa AES-256 các biến cấu hình môi trường.
          </p>
          <div className="mt-4 pt-3 border-t border-surface-border/60 text-xs flex justify-between">
            <span className="text-muted-foreground">Lập lịch:</span>
            <span className="font-semibold text-foreground">Theo yêu cầu</span>
          </div>
        </Card>
      </div>

      {/* Backup History Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="p-4 border-b border-surface-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileArchive className="h-4 w-4 text-primary" />
              Lịch sử các phiên Sao lưu (Audit Log)
            </CardTitle>
            <CardDescription>
              Danh sách các bản snapshot được lưu trữ an toàn
            </CardDescription>
          </div>
          <Badge variant="outline" size="sm">
            3 bản ghi gần nhất
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/40 text-muted-foreground border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Tên bản sao lưu</th>
                  <th className="py-3 px-4 font-medium">Loại hình</th>
                  <th className="py-3 px-4 font-medium">Dung lượng</th>
                  <th className="py-3 px-4 font-medium">Thời gian hoàn thành</th>
                  <th className="py-3 px-4 font-medium">Thời lượng</th>
                  <th className="py-3 px-4 font-medium text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {BACKUP_HISTORY.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-elevated/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.type}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timestamp}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.duration}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success" size="sm">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
