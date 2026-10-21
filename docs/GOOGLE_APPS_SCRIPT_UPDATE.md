# HƯỚNG DẪN CẬP NHẬT GOOGLE APPS SCRIPT ĐỂ HIỂN THỊ THƯ MỤC & FILE CON

## ❓ TẠI SAO TRƯỚC ĐÓ CÁC FOLDER KHÓA HỌC KHÔNG ĐƯỢC HIỂN THỊ?

Trong mã nguồn Google Apps Script cơ bản ban đầu, lệnh quét tệp được viết dưới dạng:
```javascript
var files = folder.getFiles();
```
* **Vấn đề 1**: API của Google Drive phân tách hoàn toàn giữa **Tệp tin (`getFiles()`)** và **Thư mục (`getFolders()`)**. Lệnh `getFiles()` **hoàn toàn bỏ qua các Thư mục**, do đó các folder như *"Khóa học", "Tiếng Trung HSK", "Lập trình Web"...* không được trả về trong danh sách.
* **Vấn đề 2**: Lệnh `getFiles()` chỉ lấy các file nằm ngay ngoài cùng (Root), **không đệ quy vào trong các thư mục con**. Tất cả video bài giảng, file tài liệu, slide giáo trình nằm bên trong các folder đều bị bỏ qua.

---

## 🚀 GIẢI PHÁP ĐÃ ĐƯỢC CẬP NHẬT TRÊN HỆ THỐNG WEB

1. **Giao diện WebAdmin**:
   - Đã hỗ trợ đầy đủ đối tượng **Thư mục (`isFolder: true`)**.
   - Phân loại thông minh: Thư mục chứa từ khóa *khóa học, học tập, tiếng trung, lập trình, bài giảng, giáo trình* tự động gom vào nhóm **`Khóa học & Học tập 🎓`**.
   - Bổ sung nút **`Mở Thư Mục 📁`** mở trực tiếp kho Google Drive bằng 1 click.
   - Hiển thị đường dẫn thư mục phân cấp (`📁 /Kho Học Liệu/Module 1`).
   - Tự động tích hợp sẵn các thư mục học liệu mẫu để hiển thị ngay tức thì.

2. **Bộ mã Google Apps Script Crawler 2.0 (Hỗ trợ Đệ quy & Quét Thư mục)**:
   - File mã nguồn đã được tạo sẵn tại: [`scripts/GoogleAppsScript_DriveCrawler.gs`](file:///c:/Users/Tx/Desktop/webadmin/scripts/GoogleAppsScript_DriveCrawler.gs)

---

## 🛠️ CÁC BƯỚC NÂNG CẤP APPS SCRIPT LÊN GOOGLE DRIVE (CHỈ MẤT 1 PHÚT)

1. Truy cập trang quản lý script của bạn: **[https://script.google.com/](https://script.google.com/)**
2. Mở dự án Apps Script hiện tại đang liên kết với Web.
3. Mở tệp **`Code.gs`**, xóa hết mã cũ và dán toàn bộ nội dung từ file **[`scripts/GoogleAppsScript_DriveCrawler.gs`](file:///c:/Users/Tx/Desktop/webadmin/scripts/GoogleAppsScript_DriveCrawler.gs)** vào.
4. *(Tùy chọn)*: Nếu bạn muốn chỉ định đúng một thư mục gốc cụ thể, hãy điền ID thư mục vào dòng:
   ```javascript
   var ROOT_FOLDER_ID = "1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy"; // Điền ID thư mục của bạn
   ```
   *(Nếu để trống `""`, script sẽ tự động quét toàn bộ Google Drive của bạn).*
5. Bấm nút **"Triển khai" (Deploy)** ở góc trên bên phải &rarr; Chọn **"Bản triển khai mới" (New deployment)**:
   - Chọn loại: **Ứng dụng web (Web app)**
   - Thực thi dưới dạng (Execute as): **Tôi (Me)**
   - Ai có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)**
   - Bấm **Triển khai (Deploy)**.
6. Sao chép URL Web App mới (dạng `https://script.google.com/macros/s/.../exec`).
7. Mở trang WebAdmin của bạn, vào mục **Kho lưu trữ Google Drive** &rarr; Bấm **"Quản lý thư mục dự phòng"** &rarr; Thêm link mới vừa tạo (hoặc cập nhật link chính).
8. Bấm nút **"Làm mới"** &rarr; Toàn bộ các Folder khóa học và các file bên trong sẽ lập tức xuất hiện đầy đủ, ngăn nắp!
