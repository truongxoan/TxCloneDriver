export type LicenseClass = "A1" | "A2" | "B1" | "B2" | "C";

export type QuestionCategory =
  | "critical" // 60 câu điểm liệt
  | "concepts_rules" // Khái niệm & Quy tắc
  | "transport" // Nghiệp vụ vận tải
  | "culture_ethics" // Văn hóa & Đạo đức
  | "technique" // Kỹ thuật lái xe
  | "mechanics" // Cấu tạo sửa chữa
  | "traffic_signs" // Biển báo hiệu đường bộ
  | "sa_hinh"; // Sa hình

export interface LicenseExamConfig {
  classId: LicenseClass;
  title: string;
  vehicleType: string;
  totalQuestions: number;
  durationMinutes: number;
  passScore: number;
  maxCriticalFail: number; // 0 = sai 1 câu điểm liệt là rớt
}

export interface LicenseQuestion {
  id: string;
  questionNumber: number;
  category: QuestionCategory;
  isCritical: boolean; // Điểm liệt
  question: string;
  image?: string; // Sa hình / Biển báo
  options: string[];
  correctIndex: number; // 0-based
  explanation: string;
  tip?: string; // Mẹo thi nhanh
}
