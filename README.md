# TxCloneDriver Cloud Hub

> **Hệ thống Quản trị & Đồng bộ Đám mây Đa Nền tảng** tích hợp Google Drive (Apps Script & Stream Range), Watch Party YouTube/Drive, Két Sắt Mật Khẩu & 2FA TOTP, Lịch Âm Dương Việt Nam và Kiểm soát Phân quyền Thành viên Nghiêm ngặt.

---

## 🌐 HƯỚNG DẪN ĐƯA WEBSITE LÊN MẠNG & GẮN TÊN MIỀN RIÊNG

Dự án đã được đẩy lên GitHub tại: `https://github.com/3122380192/TxCloneDriver`

Bạn có **2 CÁCH** để biến dự án này thành một website trực tuyến cho tất cả mọi người truy cập:

---

### CÁCH 1: TRIỂN KHAI LÊN VERCEL (KHUYÊN DÙNG — MIỄN PHÍ 100%, 24/7, KHÔNG CẦN SERVER)

> **Ưu điểm vượt trội**: Không tốn tiền thuê server, không cần bật máy tính ở nhà, website online vĩnh viễn 24/24 trên toàn cầu, tự động cấp HTTPS miễn phí và gắn tên miền bạn đã mua chỉ trong 1 phút.

1. **Bước 1**: Truy cập **[https://vercel.com](https://vercel.com)** &rarr; Đăng nhập bằng tài khoản GitHub `3122380192`.
2. **Bước 2**: Bấm nút **"Add New..."** &rarr; Chọn **"Project"**.
3. **Bước 3**: Tìm kho lưu trữ **`TxCloneDriver`** và bấm nút **"Import"** &rarr; Bấm **"Deploy"**.
4. **Bước 4 (Gắn tên miền của bạn)**:
   - Sau khi Vercel build xong (khoảng 1 phút), vào mục **Settings** &rarr; **Domains**.
   - Nhập tên miền bạn đã thuê (Ví dụ: `yourdomain.com`).
   - Vercel sẽ hiển thị 2 bản ghi DNS:
     - **A Record**: `76.76.21.21`
     - **CNAME Record**: `cname.vercel-dns.com`
   - Vào trang quản lý nơi bạn mua tên miền, thêm 2 bản ghi trên là website của bạn sẽ chính thức online toàn cầu!

---

### CÁCH 2: CHẠY 1 DÒNG MÃ BIẾN BẤT KỲ MÁY TÍNH NÀO THÀNH MÁY CHỦ (REMOTE HOST)

> **Mục đích**: Bạn muốn máy tính bất kỳ (ở nhà, quán net, laptop) chạy 1 dòng mã là lập tức trở thành Server phát sóng cho các thành viên khác truy cập, không cần tải dự án thủ công.

#### Lệnh kích hoạt nhanh trên Windows PowerShell:
Mở PowerShell (Run as Administrator) và chạy đúng 1 dòng lệnh sau:

```powershell
irm https://raw.githubusercontent.com/3122380192/TxCloneDriver/main/start-online.ps1 | iex
```

#### Hoặc chạy file kịch bản tại chỗ:
Nhấp đúp chuột vào file **`start-server.bat`** trong thư mục dự án:
- Tự động bật máy chủ Next.js trên cổng 3000.
- Tự động kích hoạt **Cloudflare Tunnel** tạo đường hầm HTTPS an toàn ra Internet.
- In ra màn hình đường link công khai dạng `https://xxxx.trycloudflare.com` để gửi cho mọi người truy cập ngay lập tức mà không cần mở port modem!

---

## 🚀 TÀI KHOẢN MẶC ĐỊNH HỆ THỐNG

- **Quản trị viên Tối cao (Admin)**:
  - Tài khoản: `admin`
  - Mật khẩu: `kdkctrkn@123`
  - Quyền hạn: Toàn quyền tất cả các phân hệ, duyệt thành viên, phân quyền.
- **Thành viên A**:
  - Tài khoản: `11`
  - Mật khẩu: `21`
  - Quyền hạn: Chỉ được mở Google Drive.
- **Thành viên B**:
  - Tài khoản: `userb`
  - Mật khẩu: `21`
  - Quyền hạn: Chỉ được mở Google Drive và Dự án.
- **Mã PIN mở Két Sắt Mật Khẩu**: `123456`
