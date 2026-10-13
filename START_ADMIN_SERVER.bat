@echo off
chcp 65001 > nul
title TxCloneDriver Ultra-Fast Realtime Server

echo ======================================================================
echo    TXCLONEDRIVER - MÁY CHỦ QUẢN TRỊ VIÊN SIÊU TỐC & PHẢN HỒI 0MS
echo ======================================================================
echo.

REM 1. Tự động chuyển về thư mục chứa file BAT này (chạy được từ bất kỳ đâu)
cd /d "%~dp0"

REM 2. Nếu không tìm thấy package.json ở thư mục hiện tại, thử tìm ở Desktop
if not exist "package.json" (
    if exist "%USERPROFILE%\Desktop\TxCloneDriver\package.json" (
        cd /d "%USERPROFILE%\Desktop\TxCloneDriver"
    )
)

if not exist "package.json" (
    echo [ERROR] Không tìm thấy thư mục dự án TxCloneDriver!
    echo Vui lòng đảm bảo file BAT nằm trong thư mục TxCloneDriver.
    echo.
    pause
    exit /b 1
)

echo [INFO] Thư mục dự án: %CD%

REM 3. Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Không tìm thấy Node.js! Vui lòng cài đặt Node.js từ https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [INFO] Node.js Version: %NODE_VER%

echo.
echo ----------------------------------------------------------------------
echo  🚀 Đang khởi động Server tại: http://localhost:3000
echo     • Thao tác phòng xem chung & chat sẽ ghi thẳng vào ổ cứng máy
echo     • Phản hồi tức thì 0ms, không còn độ trễ mạng hay mất phòng!
echo     • Nhấn Ctrl + C để dừng máy chủ bất cứ lúc nào.
echo ----------------------------------------------------------------------
echo.

REM Mở trình duyệt sau 3 giây
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

REM Khởi chạy Next.js: Nếu có thư mục .next đã build thì chạy 'npm run start', nếu không thì 'npm run dev'
if exist ".next" (
    echo [START] Khởi chạy chế độ Production (npm run start)...
    call npm run start -- -p 3000 -H 0.0.0.0
) else (
    echo [START] Khởi chạy chế độ Development (npm run dev)...
    call npm run dev -- -p 3000 -H 0.0.0.0
)

if %errorlevel% neq 0 (
    echo.
    echo [CẢNH BÁO] Thử khởi động lại bằng npx...
    call npx next start -p 3000 -H 0.0.0.0 || call npx next dev -p 3000 -H 0.0.0.0
)

pause
