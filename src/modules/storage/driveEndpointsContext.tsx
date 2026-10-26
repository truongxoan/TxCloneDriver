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


export const DEFAULT_DRIVE_AUDIO_TRACKS: DriveFileItem[] = [
  {
    id: "audio-demo-1",
    name: "Lofi Chill Sunset (TxCloneDriver).mp3",
    mimeType: "audio/mp3",
    sizeBytes: 5242880,
    updatedAt: "26/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "audio-demo-2",
    name: "Night Walk Acoustic Melodies.mp3",
    mimeType: "audio/mp3",
    sizeBytes: 4194304,
    updatedAt: "25/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "audio-demo-3",
    name: "Cyberpunk Ambient Wave.mp3",
    mimeType: "audio/mp3",
    sizeBytes: 6291456,
    updatedAt: "24/04/2025",
    downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export const DEFAULT_DRIVE_VIDEO_ITEMS: DriveFileItem[] = [
  {
    id: "video-demo-1",
    name: "TxCloneDriver Sci-Fi Cinematic Trailer 4K.mp4",
    mimeType: "video/mp4",
    sizeBytes: 157286400,
    updatedAt: "26/04/2025",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "video-demo-2",
    name: "Nature & Aurora TimeLapse 1080p.mp4",
    mimeType: "video/mp4",
    sizeBytes: 94371840,
    updatedAt: "25/04/2025",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
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
    name: "Thư mục Drive Chính (Apps Script 2.0)",
    url: "https://script.google.com/macros/s/AKfycbwzAuEs2os1eZyntbyJ4RwXAvOemyXTO0wWsA47Uc3IQkDF71bvKr8rsEyzsppoE2yJ6w/exec",
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

  // Load from localStorage & auto-upgrade old endpoint URL to new Apps Script
  useEffect(() => {
    try {
      const saved = localStorage.getItem("datavault_drive_endpoints");
      if (saved) {
        const parsed = JSON.parse(saved) as DriveEndpoint[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-upgrade any old endpoint URL to the new recursive crawler URL
          const upgraded = parsed.map((e) =>
            e.url.includes("AKfycbwrV8cCwa5zJxeNJp3ezGS75dYbYK5u6")
              ? { ...e, url: DEFAULT_ENDPOINTS[0].url, name: "Thư mục Drive Chính (Apps Script 2.0)" }
              : e
          );
          const hasPrimary = upgraded.some((e) => e.url === DEFAULT_ENDPOINTS[0].url);
          const finalList = hasPrimary ? upgraded : [DEFAULT_ENDPOINTS[0], ...upgraded];
          setEndpoints(finalList);
          try {
            localStorage.setItem("datavault_drive_endpoints", JSON.stringify(finalList));
          } catch {}
          return;
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

  // Fetch with a timeout so the refresh button can never stay stuck in
  // "loading" forever if the endpoint hangs (audit fix #4).
  const fetchWithTimeout = async (url: string, body: unknown) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      return await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  // Fetch files from active endpoint
  const refreshFiles = async () => {
    if (!activeEndpoint) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout("/api/drive", { url: activeEndpoint.url });

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
      const errMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Hết thời gian chờ (15 giây) khi tải danh sách tệp từ Google Drive. Vui lòng bấm Làm mới để thử lại."
          : err instanceof Error
            ? err.message
            : "Lỗi kết nối tới thư mục Google Drive.";
      setError(errMsg);
    } finally {
      // Always reset loading, even on timeout/abort, so the refresh
      // button is enabled again (audit fix #4).
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
      const res = await fetchWithTimeout("/api/drive", { url: target.url });
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
      const msg =
        err instanceof Error && err.name === "AbortError"
          ? "Hết thời gian chờ (15 giây) khi kiểm tra kết nối."
          : err instanceof Error
            ? err.message
            : "Lỗi kiểm tra kết nối";
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
