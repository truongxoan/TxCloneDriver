"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, HardDrive, Calendar, CloudSun, Compass, Palette, X } from "lucide-react";
import { MOCK_STORAGE_ITEMS } from "@/modules/storage/mockDriveData";
import { VIETNAMESE_HOLIDAYS } from "@/modules/holiday-countdown/holidaysData";

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ open, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

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

  const filteredFiles = MOCK_STORAGE_ITEMS.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHolidays = VIETNAMESE_HOLIDAYS.filter((h) =>
    h.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-2xl glass-panel p-4 shadow-glass border border-surface-border">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-surface-border pb-3">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tệp tin, ngày lễ, tính năng (VD: 'Tết', 'Báo cáo', 'Thời tiết')..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
          {/* Quick Nav Links */}
          {!query && (
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">
                Đường dẫn nhanh
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    router.push("/storage");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated hover:bg-primary/20 text-foreground transition-colors text-left"
                >
                  <HardDrive className="h-4 w-4 text-primary" />
                  <span>Kho lưu trữ Google Drive</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/calendar");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated hover:bg-primary/20 text-foreground transition-colors text-left"
                >
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>Lịch Âm Dương Việt Nam</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/weather");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated hover:bg-primary/20 text-foreground transition-colors text-left"
                >
                  <CloudSun className="h-4 w-4 text-cyan-400" />
                  <span>Trung tâm Thời tiết</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/themes");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated hover:bg-primary/20 text-foreground transition-colors text-left"
                >
                  <Palette className="h-4 w-4 text-pink-400" />
                  <span>Cài đặt Giao diện 8 Mùa</span>
                </button>
              </div>
            </div>
          )}

          {/* Files Found */}
          {query && filteredFiles.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                Tệp tin (Dữ liệu Demo)
              </p>
              <div className="space-y-1">
                {filteredFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      router.push("/storage");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-elevated text-xs text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate text-foreground">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {f.updatedAt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Holidays Found */}
          {query && filteredHolidays.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                Ngày lễ & Sự kiện
              </p>
              <div className="space-y-1">
                {filteredHolidays.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      router.push("/events");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-elevated text-xs text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="truncate text-foreground">{h.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {h.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredFiles.length === 0 && filteredHolidays.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Không tìm thấy kết quả phù hợp với từ khóa &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
