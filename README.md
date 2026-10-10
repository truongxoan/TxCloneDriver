# DataVault Cloud Hub

> **Nền tảng quản lý dữ liệu cá nhân cao cấp** tích hợp Google Drive, Telegram, Lịch âm dương Việt Nam, Thời tiết thời gian thực và Giao diện 3D theo mùa.

---

## 📌 Tổng quan Giai đoạn 1 (Phase 1 — Foundation & Master UI)

Dự án hiện đã hoàn thành **Giai đoạn 1** theo đúng chuẩn quy trình phát triển:
- **Design System cao cấp**: Tông màu Dark Navy / Midnight Blue / Violet / Cyan với phong cách glassmorphism có chiều sâu, viền mảnh và bóng mờ tinh tế.
- **Theme Engine 8 Mùa**: Hỗ trợ chuyển đổi tức thì không cần tải lại trang:
  1. `Spring Blossom` (Xuân Anh Đào)
  2. `Summer Nature` (Hạ Thiên Nhiên)
  3. `Autumn Leaves` (Thu Phong Lá Vàng)
  4. `Winter Crystal` (Đông Băng Tuyết)
  5. `Cyber 3D` (Không Gian Số Cyber)
  6. `Midnight Luxury` (Đêm Hoàng Gia)
  7. `Ocean Glass` (Đại Dương Xanh)
  8. `Minimal Pro` (Tối Giản Chuyên Nghiệp)
- **Seasonal Effects Engine (Canvas)**: Hệ thống hiệu ứng hạt độc lập, tự động điều tiết theo FPS, tạm dừng khi ẩn tab, tôn trọng `prefers-reduced-motion` và có nút bật/tắt trực tiếp.
- **Smart Header**: Đồng hồ thời gian thực (ticking clock mỗi giây theo múi giờ `Asia/Ho_Chi_Minh`), Thứ, Dương lịch, Âm lịch Việt Nam, Can Chi, Tiết khí, viên nang thời tiết, bộ chọn theme nhanh và tìm kiếm toàn cục (`Ctrl+K`).
- **Lịch Âm Dương Thiên Văn**: Tích hợp thuật toán chuyển đổi âm dương Hồ Ngọc Đức chuẩn thiên văn GMT+7, tính toán chính xác Can Chi ngày/tháng/năm, 24 tiết khí và 12 khung giờ hoàng đạo/hắc đạo.
- **Trạng thái Dữ liệu Mô phỏng có Nhãn (Giai đoạn 1)**: Các dịch vụ Google Drive và Telegram Bot được ghi nhãn rõ ràng `[CHƯA KẾT NỐI - CHỜ GIAI ĐOẠN TIẾP THEO]`, tuyệt đối không giả mạo kết nối thành công.
- **Điều hướng & Trang Chức năng**:
  - `/overview`: Tổng quan trạm dữ liệu, widget thông minh, tệp tin gần đây, đếm ngược ngày lễ.
  - `/storage`: Giao diện duyệt tệp Google Drive (Grid/List view, tìm kiếm, lọc danh mục).
  - `/calendar`: Lịch tháng âm dương tương tác với chi tiết từng ngày.
  - `/weather`: Trung tâm thời tiết đa thành phố, dự báo theo giờ và 5 ngày tới.
  - `/traditional-calendar`: Tra cứu 12 khung giờ hoàng đạo chi tiết và lưu ý văn hóa dân gian.
  - `/events`: Trung tâm đếm ngược các ngày lễ lớn Việt Nam và thêm sự kiện cá nhân.
  - `/themes`: Studio tùy biến giao diện và cường độ hiệu ứng hạt.
  - `/telegram`: Đặc tả bộ lệnh Bot Telegram và cổng kiểm tra webhook.
  - `/backups`: Trung tâm lập lịch sao lưu snapshot và chế độ Dry-run.
  - `/activity`: Nhật ký hoạt động và audit log hệ thống.
  - `/settings`: Cấu hình múi giờ, giao diện và bí mật môi trường.

---

## 🛠️ Công nghệ Sử dụng

- **Frontend**: Next.js 14 (App Router), TypeScript Strict Mode, Tailwind CSS, Lucide Icons, Framer Motion.
- **Rendering**: Canvas HTML5 hiệu năng cao cho hiệu ứng mùa 3D.
- **Lịch Thiên Văn**: Thuật toán chuyển đổi Julian Day & Tọa độ mặt trăng mặt trời GMT+7.
- **Testing**: TypeScript typecheck (`tsc --noEmit`), ESLint (`next lint`), Unit test lịch âm (`tests/unit/lunar.test.ts`).

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy trên Windows PowerShell

### 1. Yêu cầu Môi trường
- Node.js >= 18.x hoặc 20.x / 24.x
- npm >= 9.x hoặc 10.x / 11.x
- Windows PowerShell hoặc Command Prompt

### 2. Cài đặt Phụ thuộc
Mở Windows PowerShell tại thư mục dự án và chạy:
```powershell
npm.cmd install
```

### 3. Chạy Môi trường Phát triển (Dev Mode)
```powershell
npm.cmd run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000`

### 4. Kiểm tra Chất lượng Mã Nguồn & Build
```powershell
# Kiểm tra TypeScript strict mode (0 errors)
npm.cmd run typecheck

# Kiểm tra cú pháp và định dạng mã nguồn ESLint
npm.cmd run lint

# Chạy Unit test xác minh thuật toán Lịch thiên văn
npx.cmd tsx tests/unit/lunar.test.ts

# Build phiên bản Production
npm.cmd run build
```

---

## 📁 Cấu trúc Thư mục

```text
src/
├── app/
│   ├── globals.css              # Glassmorphism & biến CSS động của 8 theme
│   ├── layout.tsx               # Root Layout tích hợp ThemeProvider & AppShell
│   ├── page.tsx                 # Điều hướng tới /overview
│   ├── overview/                # Trang Tổng quan chính
│   ├── storage/                 # Kho lưu trữ Google Drive Hub
│   ├── calendar/                # Lịch Âm Dương tương tác
│   ├── weather/                 # Trung tâm thời tiết
│   ├── traditional-calendar/    # Lịch cổ truyền & Giờ hoàng đạo
│   ├── events/                  # Đếm ngược ngày lễ
│   ├── themes/                  # Theme Studio & hiệu ứng
│   ├── telegram/                # Telegram Control Hub
│   ├── backups/                 # Sao lưu & tự động hóa
│   ├── activity/                # Nhật ký hoạt động
│   └── settings/                # Cài đặt hệ thống
├── components/
│   ├── layout/                  # Sidebar, Header, AppShell, QuickSearchModal
│   └── ui/                      # Button, Card, Badge
├── modules/
│   ├── theme-engine/            # ThemeContext, definitions của 8 theme
│   ├── seasonal-effects/        # Canvas hạt hiệu năng cao (hoa, lá, tuyết, cyber...)
│   ├── lunar-calendar/          # Thuật toán thiên văn Hồ Ngọc Đức & Giờ Hoàng Đạo
│   ├── weather/                 # Dịch vụ thời tiết mô phỏng
│   ├── storage/                 # Cấu trúc tệp mẫu & dung lượng
│   └── holiday-countdown/       # Tính toán đếm ngược ngày lễ theo múi giờ
├── lib/
│   └── utils.ts                 # Trợ năng định dạng dữ liệu (cn, formatBytes)
└── tests/
    └── unit/
        └── lunar.test.ts        # Unit test kiểm chứng Tết và Giờ hoàng đạo
```

---

## 🔒 Bản đồ Lộ trình Phát triển (Roadmap)

- [x] **Giai đoạn 1**: Foundation, Design System, Sidebar/Header, Dashboard, Theme Engine 8 mùa, Seasonal Effects, Dữ liệu Demo có nhãn.
- [ ] **Giai đoạn 2**: Authentication (NextAuth / JWT), PostgreSQL Database & Prisma ORM, Phân quyền người dùng.
- [ ] **Giai đoạn 3**: Tích hợp Google Drive API v3 thật (OAuth 2.0, Upload/Download, Quản lý tệp thực tế).
- [ ] **Giai đoạn 4**: Lịch Âm Dương hoàn thiện với lưu trữ sự kiện cá nhân vào CSDL.
- [ ] **Giai đoạn 5**: Kết nối Weather API thực tế có Redis / Memory Cache chống vượt quota.
- [ ] **Giai đoạn 6**: Triển khai Telegram Bot API với webhook HTTPS và xác thực Secret.
- [ ] **Giai đoạn 7**: Engine Sao lưu Snapshot tự động, hàng đợi BullMQ / Cron jobs.
- [ ] **Giai đoạn 8**: Security Audit, E2E Tests, Tối ưu hóa hiệu năng và triển khai Production.
