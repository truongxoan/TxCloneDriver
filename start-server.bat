@echo off
chcp 65001 >nul
title TxCloneDriver Host Server Launcher
color 0b

echo ======================================================
echo    🚀 TXCLONEDRIVER — KHỞI ĐỘNG MÁY CHỦ WEB
echo ======================================================
echo.

cd /d "%~dp0"

echo [*] Đang kiểm tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Máy tính này chưa cài Node.js. Vui lòng cài đặt Node.js trước!
    pause
    exit /b
)

echo [*] Đang khởi động Web Server trên http://localhost:3000...
start /b cmd /c "npm run start"

echo [*] Chờ máy chủ sẵn sàng trong 3 giây...
timeout /t 3 /nobreak >nul

echo.
echo ======================================================
echo [1] Máy chủ nội bộ đang chạy tại: http://localhost:3000
echo [2] Đang mở đường hầm phát sóng ra toàn cầu...
echo ======================================================
echo.

if exist "cloudflared.exe" (
    cloudflared.exe tunnel --url http://localhost:3000
) else (
    echo [*] Đang tải công cụ Cloudflare Tunnel tự động...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
    cloudflared.exe tunnel --url http://localhost:3000
)

pause
