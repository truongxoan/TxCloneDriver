@echo off
chcp 65001 >nul
title MêÂmĐạoSỹ — Production Server Launcher
color 0b

echo ==============================================================
echo       ☯️ MÊ ÂM ĐẠO SỸ — NEXT.JS PRODUCTION SERVER ☯️
echo ==============================================================
echo.

cd /d "%~dp0"

echo [*] Đang kiểm tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Máy tính chưa có Node.js! Vui lòng cài đặt Node.js trước.
    pause
    exit /b
)

if not exist ".next\" (
    echo [*] Chưa có bản build tối ưu, đang build dự án (npm run build)...
    call npm run build
)

echo [*] Khởi động Production Server tại http://localhost:3000...
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

call npm run start

pause
