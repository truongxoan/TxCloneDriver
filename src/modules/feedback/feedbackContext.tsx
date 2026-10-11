"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BugReport, BugSeverity, BugStatus, FeedbackContextType } from "./types";
import { useAuth } from "@/modules/auth/authContext";

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const STORAGE_KEY = "txclonedriver_bug_reports";

const INITIAL_REPORTS: BugReport[] = [
  {
    id: "bug-1",
    title: "Link tải file video lớn đôi lúc cần chờ 2-3 giây",
    description: "Khi xem phim chất lượng 4K trên Google Drive, luồng stream khởi tạo mất một chút thời gian để đệm trước.",
    category: "Google Drive",
    severity: "low",
    author: "userb",
    authorName: "Thành viên B",
    createdAt: "10/10/2026",
    status: "resolved",
    adminNote: "Đã tối ưu luồng HTTP Range Streaming trong route.ts!",
  },
  {
    id: "bug-2",
    title: "Đề xuất thêm tính năng lắc xúc xắc có âm thanh và soi cầu",
    description: "Nhờ Admin bổ sung bảng lịch sử cầu Tài Xỉu và Xóc Đĩa để dễ dự đoán kết quả hơn.",
    category: "Trò chơi",
    severity: "medium",
    author: "11",
    authorName: "Thành viên A",
    createdAt: "11/10/2026",
    status: "resolved",
    adminNote: "Đã hoàn thành bảng soi cầu và hiệu ứng mở bát 3D!",
  },
];

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reports, setReports] = useState<BugReport[]>(INITIAL_REPORTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReports(JSON.parse(saved));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      }
    } catch {}
  }, []);

  const saveReports = (list: BugReport[]) => {
    setReports(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const addReport = (
    title: string,
    description: string,
    category: BugReport["category"],
    severity: BugSeverity
  ) => {
    const newReport: BugReport = {
      id: `bug-${Date.now()}`,
      title,
      description,
      category,
      severity,
      author: user?.username || "guest",
      authorName: user?.name || "Khách",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      status: "open",
    };

    saveReports([newReport, ...reports]);
  };

  const updateReportStatus = (id: string, status: BugStatus, adminNote?: string) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status, adminNote: adminNote !== undefined ? adminNote : r.adminNote } : r
    );
    saveReports(updated);
  };

  const deleteReport = (id: string) => {
    saveReports(reports.filter((r) => r.id !== id));
  };

  return (
    <FeedbackContext.Provider
      value={{
        reports,
        addReport,
        updateReportStatus,
        deleteReport,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}
