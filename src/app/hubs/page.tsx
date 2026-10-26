"use client";

import { HubGrid, type HubGroup } from "@/components/ui/HubGrid";
import {
  Calendar,
  Car,
  CloudSun,
  Download,
  Folder,
  Gamepad2,
  GraduationCap,
  HardDrive,
  Home,
  Images,
  KeyRound,
  Link2,
  QrCode,
  Radio,
  Settings,
  Users2,
  Wallet,
  Wand2,
  Workflow,
} from "lucide-react";

/**
 * Trang Hub chức năng — giai đoạn 2.
 * Chỉ là trang điều hướng: gộp các chức năng thật đã có thành 6 Hub,
 * mỗi chức năng vẫn đi tới route cũ của nó. Không sửa logic, dữ liệu
 * hay phân quyền của bất kỳ module nào. Các trang đích tự kiểm tra
 * quyền bằng ModuleGuard của chính nó.
 */
const HUBS: HubGroup[] = [
  {
    title: "Lưu trữ & Chia sẻ",
    description: "File, Drive, chia sẻ và sao lưu trong một chỗ.",
    image: "/images/ocean-glass.jpg",
    items: [
      { href: "/overview", label: "Tổng quan", description: "Mở đầu ngày với mọi thứ quan trọng nhất.", icon: Home, image: "/images/vision-os.jpg" },
      { href: "/storage", label: "Google Drive", description: "Mở, tải lên và đồng bộ file Drive.", icon: HardDrive, image: "/images/ocean-glass.jpg" },
      { href: "/share", label: "Bắn tệp P2P", description: "Chia sẻ file trực tiếp giữa các thiết bị.", icon: Radio, image: "/images/cyber-3d.jpg" },
      { href: "/downloader", label: "Tải Video", description: "Tải video về để xem offline.", icon: Download, image: "/images/deep-space.jpg" },
      { href: "/backups", label: "Sao lưu", description: "Quản lý các bản sao lưu của bạn.", icon: Folder, image: "/images/midnight-luxury.jpg" },
    ],
  },
  {
    title: "Sáng tạo & AI",
    description: "Dự án, hình ảnh và công cụ AI trong một Hub.",
    image: "/images/cyber-3d.jpg",
    items: [
      { href: "/projects", label: "Dự án", description: "Theo dõi tiến độ và file của từng dự án.", icon: Folder, image: "/images/cyber-3d.jpg" },
      { href: "/image-studio", label: "AI Image Studio", description: "Tạo và chỉnh sửa hình ảnh bằng AI.", icon: Wand2, image: "/images/spring-blossom.jpg" },
      { href: "/google-flow", label: "Google Flow Tools", description: "Các công cụ Flow của Google.", icon: Workflow, image: "/images/vision-os.jpg" },
      { href: "/memories", label: "Kỷ niệm cá nhân", description: "Lưu giữ những khoảnh khắc đáng nhớ.", icon: Images, image: "/images/autumn-leaves.jpg" },
    ],
  },
  {
    title: "Giải trí",
    description: "Xem chung, nghe chung và chơi game cùng bạn bè.",
    image: "/images/midnight-luxury.jpg",
    items: [
      { href: "/watch-together", label: "Xem & Nghe Chung", description: "Xem video và nghe nhạc cùng nhau.", icon: Users2, image: "/images/midnight-luxury.jpg" },
      { href: "/games", label: "Game & Giải trí", description: "13 game: Tài Xỉu, Tetris, Cờ Tướng, 2048 và nhiều hơn.", icon: Gamepad2, image: "/images/cyber-3d.jpg" },
    ],
  },
  {
    title: "Học tập",
    description: "Ngoại ngữ và ôn thi bằng lái trong một chỗ.",
    image: "/images/spring-blossom.jpg",
    items: [
      { href: "/study", label: "Học ngoại ngữ", description: "Học từ vựng và luyện tập mỗi ngày.", icon: GraduationCap, image: "/images/spring-blossom.jpg" },
      { href: "/driver-license", label: "Ôn thi GPLX", description: "Ôn lý thuyết và thi thử bằng lái.", icon: Car, image: "/images/deep-space.jpg" },
    ],
  },
  {
    title: "Công cụ hàng ngày",
    description: "Két sắt, chi tiêu, QR, ghi chú và lịch.",
    image: "/images/winter-crystal.jpg",
    items: [
      { href: "/vault", label: "Két sắt & 2FA", description: "Mật khẩu và mã 2FA được khóa an toàn.", icon: KeyRound, image: "/images/deep-space.jpg" },
      { href: "/expenses", label: "Tính chi tiêu", description: "Theo dõi thu chi trong tháng.", icon: Wallet, image: "/images/autumn-leaves.jpg" },
      { href: "/qr", label: "Tạo mã QR", description: "Tạo mã QR nhanh cho link và nội dung.", icon: QrCode, image: "/images/ocean-glass.jpg" },
      { href: "/notes", label: "Ghi chú & Link", description: "Ghi nhanh ý tưởng và lưu link quan trọng.", icon: Link2, image: "/images/mid-autumn.jpg" },
      { href: "/calendar", label: "Lịch", description: "Lịch và sự kiện trong tháng của bạn.", icon: Calendar, image: "/images/spring-blossom.jpg" },
      { href: "/traditional-calendar", label: "Lịch âm dương", description: "Lịch âm dương Việt Nam.", icon: Calendar, image: "/images/tet-fireworks.jpg" },
      { href: "/weather", label: "Thời tiết", description: "Thời tiết hiện tại và dự báo.", icon: CloudSun, image: "/images/thunderstorm.jpg" },
    ],
  },
  {
    title: "Hệ thống",
    description: "Cài đặt và các công cụ hệ thống còn lại.",
    image: "/images/vision-os.jpg",
    items: [
      { href: "/settings", label: "Cài đặt", description: "Cài đặt tài khoản và hệ thống.", icon: Settings, image: "/images/vision-os.jpg" },
      { href: "/events", label: "Lịch & Sự kiện", description: "Quản lý lịch và các sự kiện.", icon: Calendar, image: "/images/mid-autumn.jpg" },
    ],
  },
];

export default function HubsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          Hub chức năng
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          Mọi chức năng, gộp lại trong 6 Hub 3D
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Bấm vào một thẻ để mở chức năng thật của nó. Các trang cũ vẫn giữ
          nguyên đường link, dữ liệu và phân quyền, chỉ có cách tìm và mở
          là gọn và đẹp hơn.
        </p>
      </div>
      <HubGrid groups={HUBS} />
    </div>
  );
}
