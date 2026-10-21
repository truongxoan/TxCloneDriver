"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageItem } from "./types";

export interface DriveEndpoint {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  fileCount?: number;
  lastChecked?: string;
  status: "connected" | "error" | "pending";
  errorMessage?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  updatedAt: string;
  downloadUrl?: string;
  starred?: boolean;
  isFolder?: boolean;
  folderPath?: string;
  parentFolderId?: string;
}

export const DEFAULT_COURSE_FOLDERS: DriveFileItem[] = [
  {
    id: "folder-course-chinese-hub",
    name: "Kho Học Liệu Tiếng Trung HSK 1-6 & Video Bài Giảng",
    sizeBytes: 0,
    mimeType: "application/vnd.google-apps.folder",
    updatedAt: "Vừa xong",
    downloadUrl: "https://drive.google.com/drive/folders/1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy?usp=sharing",
    isFolder: true,
    starred: true,
    folderPath: "",
  },
  {
    id: "file-course-chinese-pdf",
    name: "Giáo Trình Tiếng Trung Toàn Diện (File PDF / Sách Bài Tập).pdf",
    sizeBytes: 15728640,
    mimeType: "application/pdf",
    updatedAt: "Vừa xong",
    downloadUrl: "https://drive.google.com/file/d/1wS58hrA9S3IiJlKzMLkRMkp5bVI4x0-o/view",
    isFolder: false,
    starred: true,
    folderPath: "Kho Học Liệu Tiếng Trung HSK 1-6",
  },
  {
    id: "folder-course-coding",
    name: "Khóa Học Lập Trình Web, Python & Automation",
    sizeBytes: 0,
    mimeType: "application/vnd.google-apps.folder",
    updatedAt: "Vừa xong",
    downloadUrl: "https://drive.google.com/drive/folders/1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy",
    isFolder: true,
    starred: true,
    folderPath: "",
  },
  {
    id: "folder-course-multimedia",
    name: "Kho Giáo Trình Kỹ Năng & Bài Giảng Đa Phương Tiện",
    sizeBytes: 0,
    mimeType: "application/vnd.google-apps.folder",
    updatedAt: "Vừa xong",
    downloadUrl: "https://drive.google.com/drive/folders/1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy",
    isFolder: true,
    starred: false,
    folderPath: "",
  },
];

interface DriveEndpointsContextType {
  endpoints: DriveEndpoint[];
  activeEndpoint: DriveEndpoint | null;
  files: DriveFileItem[];
  loading: boolean;
  error: string | null;
  addEndpoint: (name: string, url: string) => void;
  updateEndpoint: (id: string, name: string, url: string) => void;
  removeEndpoint: (id: string) => void;
  setActiveEndpointId: (id: string) => void;
  refreshFiles: () => Promise<void>;
  testEndpoint: (id: string) => Promise<{ success: boolean; fileCount?: number; error?: string }>;
}

const DEFAULT_ENDPOINTS: DriveEndpoint[] = [
  {
    id: "ep-primary",
    name: "Thư mục Drive Chính (Apps Script)",
    url: "https://script.google.com/macros/s/AKfycbwrV8cCwa5zJxeNJp3ezGS75dYbYK5u6-TCRpWJbg6SCiahOWzqywDmLwSYrnT-20Mp8Q/exec",
    isActive: true,
    status: "connected",
    lastChecked: "Vừa xong",
  },
];

const DriveEndpointsContext = createContext<DriveEndpointsContextType | undefined>(undefined);

export function DriveEndpointsProvider({ children }: { children: React.ReactNode }) {
  const [endpoints, setEndpoints] = useState<DriveEndpoint[]>(DEFAULT_ENDPOINTS);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("datavault_drive_endpoints");
      if (saved) {
        const parsed = JSON.parse(saved) as DriveEndpoint[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee default endpoint is retained if not present
          const hasPrimary = parsed.some((e) => e.url === DEFAULT_ENDPOINTS[0].url);
          if (!hasPrimary) {
            setEndpoints([...parsed, DEFAULT_ENDPOINTS[0]]);
          } else {
            setEndpoints(parsed);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveEndpoints = (list: DriveEndpoint[]) => {
    setEndpoints(list);
    try {
      localStorage.setItem("datavault_drive_endpoints", JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const activeEndpoint = endpoints.find((e) => e.isActive) || endpoints[0] || null;

  // Fetch files from active endpoint
  const refreshFiles = async () => {
    if (!activeEndpoint) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: activeEndpoint.url }),
      });

      const data = await res.json();
      if (data.success) {
        let loadedFiles: DriveFileItem[] = data.files || [];
        // If current Apps Script only returns flat files, enrich with default course folders
        const hasFolders = loadedFiles.some(
          (f) => f.isFolder || f.mimeType === "application/vnd.google-apps.folder"
        );
        if (!hasFolders) {
          loadedFiles = [...DEFAULT_COURSE_FOLDERS, ...loadedFiles];
        }

        setFiles(loadedFiles);
        // Update endpoint metadata
        const updated = endpoints.map((e) =>
          e.id === activeEndpoint.id
            ? {
                ...e,
                status: "connected" as const,
                fileCount: loadedFiles.length,
                lastChecked: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                errorMessage: undefined,
              }
            : e
        );
        saveEndpoints(updated);
      } else {
        const errMsg = data.error || "Không thể tải danh sách tệp từ đường dẫn này.";
        setError(errMsg);
        // Mark active as error
        const updated = endpoints.map((e) =>
          e.id === activeEndpoint.id ? { ...e, status: "error" as const, errorMessage: errMsg } : e
        );
        saveEndpoints(updated);

        // Auto-fallback: try backup endpoint if exists
        const fallback = endpoints.find((e) => e.id !== activeEndpoint.id && e.status !== "error");
        if (fallback) {
          setActiveEndpointId(fallback.id);
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Lỗi kết nối tới thư mục Google Drive.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeEndpoint) {
      refreshFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEndpoint?.id]);

  const addEndpoint = (name: string, url: string) => {
    const newEp: DriveEndpoint = {
      id: `ep-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      isActive: false,
      status: "pending",
    };
    saveEndpoints([...endpoints, newEp]);
  };

  const updateEndpoint = (id: string, name: string, url: string) => {
    const updated = endpoints.map((e) =>
      e.id === id ? { ...e, name: name.trim(), url: url.trim(), status: "pending" as const } : e
    );
    saveEndpoints(updated);
  };

  const removeEndpoint = (id: string) => {
    if (endpoints.length <= 1) return; // Keep at least one
    const remaining = endpoints.filter((e) => e.id !== id);
    if (activeEndpoint?.id === id && remaining.length > 0) {
      remaining[0].isActive = true;
    }
    saveEndpoints(remaining);
  };

  const setActiveEndpointId = (id: string) => {
    const updated = endpoints.map((e) => ({
      ...e,
      isActive: e.id === id,
    }));
    saveEndpoints(updated);
  };

  const testEndpoint = async (id: string) => {
    const target = endpoints.find((e) => e.id === id);
    if (!target) return { success: false, error: "Không tìm thấy thư mục." };

    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.url }),
      });
      const data = await res.json();
      if (data.success) {
        const count = (data.files || []).length;
        const updated = endpoints.map((e) =>
          e.id === id
            ? {
                ...e,
                status: "connected" as const,
                fileCount: count,
                lastChecked: "Vừa xong",
                errorMessage: undefined,
              }
            : e
        );
        saveEndpoints(updated);
        return { success: true, fileCount: count };
      } else {
        const updated = endpoints.map((e) =>
          e.id === id ? { ...e, status: "error" as const, errorMessage: data.error } : e
        );
        saveEndpoints(updated);
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kiểm tra kết nối";
      return { success: false, error: msg };
    }
  };

  return (
    <DriveEndpointsContext.Provider
      value={{
        endpoints,
        activeEndpoint,
        files,
        loading,
        error,
        addEndpoint,
        updateEndpoint,
        removeEndpoint,
        setActiveEndpointId,
        refreshFiles,
        testEndpoint,
      }}
    >
      {children}
    </DriveEndpointsContext.Provider>
  );
}

export function useDriveEndpoints() {
  const context = useContext(DriveEndpointsContext);
  if (!context) {
    throw new Error("useDriveEndpoints must be used within DriveEndpointsProvider");
  }
  return context;
}
