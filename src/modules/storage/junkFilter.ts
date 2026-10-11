import { DriveFileItem } from "./driveEndpointsContext";

export type JunkCategory =
  | "os_metadata"
  | "office_lock"
  | "temp_cache"
  | "incomplete_down"
  | "empty_ghost"
  | "system_log";

export interface JunkDetail {
  category: JunkCategory;
  categoryLabel: string;
  reason: string;
  safetyAdvice: string;
  badgeColor: string;
}

export interface JunkScanResult {
  hasJunk: boolean;
  totalCount: number;
  totalBytes: number;
  junkIds: Set<string>;
  junkItems: DriveFileItem[];
  cleanItems: DriveFileItem[];
  byCategory: Record<JunkCategory, { label: string; count: number; items: DriveFileItem[] }>;
}

/**
 * Inspect a file name, size, and mimeType to check if it's a junk/system/ghost file.
 */
export function getJunkDetail(item: {
  name: string;
  sizeBytes?: number;
  mimeType?: string;
}): JunkDetail | null {
  const name = item.name.trim();
  const lower = name.toLowerCase();
  const size = item.sizeBytes ?? 0;
  const isFolder = item.mimeType?.includes("folder");

  // 1. macOS OS Metadata
  if (
    lower === ".ds_store" ||
    lower.startsWith("._") ||
    lower === "__macosx" ||
    lower.startsWith("__macosx/") ||
    lower === ".spotlight-v100" ||
    lower === ".trashes" ||
    lower === ".fseventsd"
  ) {
    return {
      category: "os_metadata",
      categoryLabel: "Ẩn hệ điều hành macOS",
      reason: `Tệp siêu dữ liệu ẩn hệ thống macOS (${name}), chứa vị trí icon và thuộc tính Finder.`,
      safetyAdvice: "An toàn để xóa hoặc tự động ẩn mà không ảnh hưởng đến dữ liệu gốc.",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
  }

  // 2. Windows OS Metadata
  if (
    lower === "thumbs.db" ||
    lower === "ehthumbs.db" ||
    lower === "desktop.ini" ||
    lower === "folder.jpg" ||
    lower.startsWith("$recycle.bin")
  ) {
    return {
      category: "os_metadata",
      categoryLabel: "Ẩn hệ điều hành Windows",
      reason: `Tệp bộ nhớ đệm thumbnail hoặc cấu hình hiển thị thư mục của Windows Explorer.`,
      safetyAdvice: "Tệp rác tự sinh, an toàn để ẩn hoặc dọn dẹp.",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    };
  }

  // 3. Microsoft Office Lock & Auto-Save
  if (name.startsWith("~$") && (lower.endsWith(".docx") || lower.endsWith(".xlsx") || lower.endsWith(".pptx") || lower.endsWith(".doc") || lower.endsWith(".xls"))) {
    return {
      category: "office_lock",
      categoryLabel: "Tệp khóa tạm Office",
      reason: `Tệp lock/auto-save tạm thời của MS Office tạo khi chỉnh sửa tài liệu.`,
      safetyAdvice: "Nếu không còn ai mở file, đây là tệp thừa còn sót lại do đóng máy đột ngột.",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
  }

  // 4. Incomplete Downloads
  if (
    lower.endsWith(".crdownload") ||
    lower.endsWith(".part") ||
    lower.endsWith(".partial") ||
    lower.endsWith(".download")
  ) {
    return {
      category: "incomplete_down",
      categoryLabel: "Tải dở dang / Lỗi mạng",
      reason: `Tệp tải xuống chưa hoàn tất do ngắt kết nối mạng hoặc hủy giữa chừng từ trình duyệt.`,
      safetyAdvice: "Tệp bị lỗi cắt cụt dữ liệu, không thể phát hoặc mở đầy đủ.",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    };
  }

  // 5. Temporary & Editor Swap files
  if (
    lower.endsWith(".tmp") ||
    lower.endsWith(".temp") ||
    lower.endsWith(".swp") ||
    lower.endsWith(".swo") ||
    lower.endsWith("~") ||
    lower.endsWith(".bak") ||
    lower.endsWith(".orig")
  ) {
    return {
      category: "temp_cache",
      categoryLabel: "Tệp tạm & Bộ nhớ đệm",
      reason: `Tệp hoán đổi tạm thời (.tmp, .swp, .bak) được tạo tự động bởi ứng dụng biên tập.`,
      safetyAdvice: "An toàn để dọn dẹp để làm sạch kho lưu trữ.",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
  }

  // 6. System Log & Crash Dumps
  if (
    (lower.endsWith(".log") && (lower.startsWith("npm-debug") || lower.startsWith("yarn-error") || lower.includes("crash") || lower.includes("error"))) ||
    lower.endsWith(".dmp")
  ) {
    return {
      category: "system_log",
      categoryLabel: "Nhật ký lỗi & Dump crash",
      reason: `Tệp báo cáo sự cố sập hoặc log lỗi lập trình bị vô tình tải lên cùng thư mục.`,
      safetyAdvice: "Không chứa nội dung đa phương tiện hữu ích.",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
  }

  // 7. Ghost Empty 0-Byte Corrupt Files (excluding folders)
  if (size === 0 && !isFolder && !lower.endsWith(".md") && !lower.endsWith(".txt") && !lower.endsWith(".keep") && !lower.endsWith(".gitignore")) {
    // Flag suspicious 0-byte media or binary files (like 0-byte mp3, mp4, zip, exe, pdf)
    if (
      lower.endsWith(".mp3") ||
      lower.endsWith(".mp4") ||
      lower.endsWith(".mkv") ||
      lower.endsWith(".zip") ||
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".xlsx") ||
      lower.endsWith(".png") ||
      lower.endsWith(".jpg")
    ) {
      return {
        category: "empty_ghost",
        categoryLabel: "Tệp rỗng 0-Byte hỏng",
        reason: `Tệp đa phương tiện/tài liệu bị lỗi kích thước 0 Bytes (do tải lên bị gián đoạn).`,
        safetyAdvice: "Tệp hoàn toàn không có dữ liệu để mở hoặc phát.",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      };
    }
  }

  return null;
}

/**
 * Quick boolean check if a file is classified as junk.
 */
export function isJunkFile(item: { name: string; sizeBytes?: number; mimeType?: string }): boolean {
  return getJunkDetail(item) !== null;
}

/**
 * Scan an entire list of Drive items, grouping junk files by category.
 */
export function scanJunkFiles(items: DriveFileItem[]): JunkScanResult {
  const junkIds = new Set<string>();
  const junkItems: DriveFileItem[] = [];
  const cleanItems: DriveFileItem[] = [];

  const byCategory: Record<JunkCategory, { label: string; count: number; items: DriveFileItem[] }> = {
    os_metadata: { label: "Ẩn hệ điều hành (.DS_Store, Thumbs.db)", count: 0, items: [] },
    office_lock: { label: "Tệp khóa tạm MS Office (~$)", count: 0, items: [] },
    temp_cache: { label: "Tệp tạm & Đệm (.tmp, .bak, .swp)", count: 0, items: [] },
    incomplete_down: { label: "Tải dở dang (.crdownload, .part)", count: 0, items: [] },
    empty_ghost: { label: "Tệp rỗng 0-Byte hỏng", count: 0, items: [] },
    system_log: { label: "Nhật ký log lỗi (.log, .dmp)", count: 0, items: [] },
  };

  let totalBytes = 0;

  for (const item of items) {
    const detail = getJunkDetail(item);
    if (detail) {
      junkIds.add(item.id);
      junkItems.push(item);
      totalBytes += item.sizeBytes || 0;
      byCategory[detail.category].count++;
      byCategory[detail.category].items.push(item);
    } else {
      cleanItems.push(item);
    }
  }

  return {
    hasJunk: junkItems.length > 0,
    totalCount: junkItems.length,
    totalBytes,
    junkIds,
    junkItems,
    cleanItems,
    byCategory,
  };
}
