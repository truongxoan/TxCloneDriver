@echo off
chcp 65001 >nul
title MêÂmĐạoSỹ — Dev Live Server Launcher
color 0a

echo ==============================================================
echo       ☯️ MÊ ÂM ĐẠO SỸ — NEXT.JS LIVE DEV SERVER ☯️
echo ==============================================================
echo.

cd /d "%~dp0"

echo [*] Đang kiểm tra môi trường Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Máy tính chưa có Node.js! Vui lòng cài đặt Node.js trước.
    pause
    exit /b
)

echo [*] Kiểm tra thư mục node_modules...
if not exist "node_modules\" (
    echo [*] Thư mục node_modules chưa có, đang tiến hành npm install...
    call npm install
)

echo.
echo [*] Đang khởi động Server chế độ Live Dev (Hot-Reload)...
echo [*] Địa chỉ Web: http://localhost:3000
echo.

:: Mở tab trình duyệt tự động sau 3 giây khi server sẵn sàng
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: Khởi chạy Next.js dev server với Hot-Reload
npm run dev

pause
