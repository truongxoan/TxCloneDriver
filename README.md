# TxCloneDriver Cloud Hub

> **Hệ thống Quản trị & Đồng bộ Đám mây Đa Nền tảng** tích hợp Google Drive (Apps Script & Stream Range), Watch Party YouTube/Drive, Két Sắt Mật Khẩu & 2FA TOTP, Lịch Âm Dương Việt Nam và Kiểm soát Phân quyền Thành viên Nghiêm ngặt.

---

## 🌐 HƯỚNG DẪN ĐƯA WEBSITE LÊN MẠNG & GẮN TÊN MIỀN RIÊNG

Dự án đã được đẩy lên GitHub tại: `https://github.com/truongxoan/TxCloneDriver`

Bạn có **2 CÁCH** để biến dự án này thành một website trực tuyến cho tất cả mọi người truy cập:

---

### CÁCH 1: TRIỂN KHAI LÊN VERCEL (KHUYÊN DÙNG — MIỄN PHÍ 100%, 24/7, KHÔNG CẦN SERVER)

> **Ưu điểm vượt trội**: Không tốn tiền thuê server, không cần bật máy tính ở nhà, website online vĩnh viễn 24/24 trên toàn cầu, tự động cấp HTTPS miễn phí và gắn tên miền **`txlab.io.vn`** chỉ trong 1 phút.

1. **Bước 1**: Truy cập **[https://vercel.com](https://vercel.com)** &rarr; Đăng nhập bằng tài khoản GitHub `truongxoan`.
2. **Bước 2**: Bấm nút **"Add New..."** &rarr; Chọn **"Project"**.
3. **Bước 3**: Tìm kho lưu trữ **`TxCloneDriver`** và bấm nút **"Import"** &rarr; Bấm **"Deploy"**.
4. **Bước 4 (Gắn tên miền `txlab.io.vn` của bạn trên TenTen)**:
   - Sau khi Vercel build xong (khoảng 1 phút), vào mục **Settings** &rarr; **Domains**.
   - Nhập tên miền: `txlab.io.vn` (và `www.txlab.io.vn`).
   - Vercel sẽ hiển thị 2 bản ghi DNS cần trỏ:
     - **A Record**: Host `@` trỏ tới IP `76.76.21.21`
     - **CNAME Record**: Host `www` trỏ tới `cname.vercel-dns.com`
   - Đăng nhập vào trang quản trị tên miền TenTen (`id.tenten.vn`), vào mục **Quản lý tên miền** &rarr; **Cấu hình DNS** của `txlab.io.vn` và thêm 2 bản ghi trên là website chính thức hoạt động 24/7!

---

### CÁCH 2: CHẠY 1 DÒNG MÃ BIẾN BẤT KỲ MÁY TÍNH NÀO THÀNH MÁY CHỦ (REMOTE HOST)

> **Mục đích**: Bạn muốn máy tính bất kỳ (ở nhà, quán net, laptop) chạy 1 dòng mã là lập tức trở thành Server phát sóng cho các thành viên khác truy cập, không cần tải dự án thủ công.

#### Lệnh kích hoạt nhanh trên Windows PowerShell:
Mở PowerShell (Run as Administrator) và chạy đúng 1 dòng lệnh sau:

```powershell
irm https://raw.githubusercontent.com/truongxoan/TxCloneDriver/main/start-online.ps1 | iex
```

#### Hoặc chạy file kịch bản tại chỗ:
Nhấp đúp chuột vào file **`start-server.bat`** trong thư mục dự án:
- Tự động bật máy chủ Next.js trên cổng 3000.
- Tự động kích hoạt **Cloudflare Tunnel** tạo đường hầm HTTPS an toàn ra Internet.
- In ra màn hình đường link công khai dạng `https://xxxx.trycloudflare.com` để gửi cho mọi người truy cập ngay lập tức mà không cần mở port modem!

---

## 🚀 TÀI KHOẢN MẶC ĐỊNH HỆ THỐNG

Hệ thống **chỉ có 11 tài khoản cố định** — **không có chức năng đăng ký thành viên**:

- **Quản trị viên Tối cao (Admin)**:
  - Tài khoản: `admin`
  - Mật khẩu: `kdkctrkn@123`
  - Quyền hạn: Toàn quyền tất cả các phân hệ.
- **10 thành viên**: `11`, `22`, `33`, `44`, `55`, `66`, `77`, `88`, `99`, `100`
  - Đăng nhập: nhập đúng tài khoản, **mật khẩu gõ gì cũng được** (chỉ cần không để trống).
  - Quyền hạn (cả 10 người đều giống nhau): chỉ **Google Drive**, **Xem & Nghe Chung** và **Ghi chú & Link**.
  - Không xem được các phân hệ khác, kể cả khi gõ URL trực tiếp.
