@echo off
chcp 65001 > nul
title TxCloneDriver - Localhost 3000 Server

echo ======================================================================
echo    🚀 KHỞI CHẠY THỬ NGHIỆM TXCLONEDRIVER TRÊN LOCALHOST:3000
echo ======================================================================
echo.

REM 1. Di chuyển về thư mục dự án
cd /d "%~dp0"

if not exist "package.json" (
    echo [LỖI] Không tìm thấy file package.json trong thư mục: %CD%
    pause
    exit /b 1
)

REM 2. Kiểm tra cài đặt Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Chưa cài đặt Node.js! Vui lòng tải tại https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js: %NODE_VERSION%
echo.

REM 3. Hẹn giờ tự động mở trình duyệt sau 3 giây
echo [INFO] Đang mở trình duyệt tới http://localhost:3000 ...
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

REM 4. Khởi chạy máy chủ
echo ----------------------------------------------------------------------
echo  Server đang lắng nghe tại:
echo    • Localhost: http://localhost:3000
echo    • Mạng nội bộ: http://127.0.0.1:3000
echo.
echo  Tài khoản đăng nhập mặc định:
echo    - Admin: admin / kdkctrkn@123
echo    - User A: 11 / 21
echo    - PIN Két Sắt Vault: 080497 (hoặc 123456)
echo ----------------------------------------------------------------------
echo.

if exist ".next\BUILD_ID" (
    echo [CHẾ ĐỘ] Đang chạy bản Production siêu mượt (npm start)...
    call npm run start -- -p 3000
) else (
    echo [CHẾ ĐỘ] Đang chạy chế độ Development (npm run dev)...
    call npm run dev -- -p 3000
)

pause
