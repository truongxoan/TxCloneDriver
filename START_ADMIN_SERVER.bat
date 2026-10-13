@echo off
chcp 65001 > nul
title TxCloneDriver Ultra-Fast Realtime Server

echo ======================================================================
echo    TXCLONEDRIVER - MÁY CHỦ QUẢN TRỊ VIÊN SIÊU TỐC & PHẢN HỒI TỨC THÌ
echo ======================================================================
echo [INFO] Đang khởi động máy chủ cục bộ cho Admin với độ trễ 0ms...
echo [INFO] Thao tác của Admin và các thành viên sẽ được lưu trữ trực tiếp vào ổ cứng
echo [INFO] và phản hồi lập tức không cần chờ đợi mạng bên ngoài.
echo.

REM Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Không tìm thấy Node.js trên hệ thống! Vui lòng cài đặt Node.js trước.
    pause
    exit /b
)

REM Khởi chạy Next.js Server trên cổng 3000
echo [START] Khởi chạy máy chủ Web & API Hub tại: http://localhost:3000
echo [TIP] Để dừng máy chủ, hãy nhấn Ctrl + C trên cửa sổ này.
echo ======================================================================
echo.

set PORT=3000
node server.js 2>nul || npm run dev

pause
