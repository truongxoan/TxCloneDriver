import { ProjectItem } from "@/types/notesAndProjects";

// Single shared source for the real project list (audit fix #2).
// Both /projects and /overview import this, so the two pages can never
// drift apart again. Do not invent projects here: these are the 4 real
// defaults that /projects shipped with.
export const DEFAULT_PROJECTS: ProjectItem[] = [
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

export const PROJECT_STATUS_LABELS: Record<ProjectItem["status"], string> = {
  idea: "Ý tưởng",
  not_started: "Chờ xử lý",
  in_progress: "Đang làm",
  almost_done: "Sắp hoàn thành",
  completed: "Hoàn tất",
};

// Parse a dd/mm/yyyy date (the format stored for projects). Returns null
// for malformed dates so a bad date never shows a false overdue badge.
export function parseDueDate(value: string): Date | null {
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map((part) => Number(part));
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

// A project is overdue when its due date is before today and it is not
// completed. Stored dates are NOT changed (audit fix #6).
export function isProjectOverdue(project: ProjectItem, today = new Date()): boolean {
  if (project.status === "completed") return false;
  const due = parseDueDate(project.dueDate);
  if (!due) return false;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due < startOfToday;
}
