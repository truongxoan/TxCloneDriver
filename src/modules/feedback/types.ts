export type BugSeverity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "in_progress" | "resolved";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  category: "Giao diện" | "Google Drive" | "Trò chơi" | "Học tập" | "Hệ thống & Đăng nhập" | "Khác";
  severity: BugSeverity;
  author: string;
  authorName: string;
  createdAt: string;
  status: BugStatus;
  adminNote?: string;
}

export interface FeedbackContextType {
  reports: BugReport[];
  addReport: (
    title: string,
    description: string,
    category: BugReport["category"],
    severity: BugSeverity
  ) => void;
  updateReportStatus: (id: string, status: BugStatus, adminNote?: string) => void;
  deleteReport: (id: string) => void;
}
