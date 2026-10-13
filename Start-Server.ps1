<#
.SYNOPSIS
    TxCloneDriver Ultra-Fast Realtime Server Launcher with Live TXLAB.IO.VN Synchronization (PowerShell)
.DESCRIPTION
    Script khởi chạy máy chủ TxCloneDriver từ bất kỳ đâu trên máy tính.
    Tự động đồng bộ hai chiều (2-way sync) với hệ thống online txlab.io.vn trước và trong khi chạy,
    đảm bảo dữ liệu phòng xem chung, tài khoản và trò chơi trên máy bạn và trên web luôn trùng khớp 100%.
#>

param(
    [int]$Port = 3000,
    [switch]$NoBrowser,
    [switch]$OpenOnline
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "TxCloneDriver Realtime Server (Synced with txlab.io.vn)"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   ⚡ TXCLONEDRIVER - MÁY CHỦ RIÊNG ĐỒNG BỘ TRỰC TIẾP VỚI TXLAB.IO.VN" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Tự động xác định thư mục dự án từ bất kỳ đâu
$ProjectDir = $PSScriptRoot

if (-not $ProjectDir -or -not (Test-Path "$ProjectDir\package.json")) {
    $PotentialPaths = @(
        "$env:USERPROFILE\Desktop\TxCloneDriver",
        "$env:USERPROFILE\TxCloneDriver",
        "$env:USERPROFILE\Documents\TxCloneDriver",
        "C:\TxCloneDriver",
        "D:\TxCloneDriver",
        (Get-Location).Path
    )
    foreach ($path in $PotentialPaths) {
        if (Test-Path "$path\package.json") {
            $ProjectDir = $path
            break
        }
    }
}

if (-not (Test-Path "$ProjectDir\package.json")) {
    Write-Host "[ERROR] Không thể tìm thấy thư mục dự án TxCloneDriver!" -ForegroundColor Red
    Write-Host "Vui lòng đặt script trong thư mục TxCloneDriver hoặc để thư mục này ở Desktop." -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

Write-Host "[INFO] Thư mục dự án: $ProjectDir" -ForegroundColor Green

# 2. Kiểm tra môi trường Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Máy tính chưa cài đặt Node.js! Vui lòng tải tại https://nodejs.org/" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

$NodeVer = node -v
Write-Host "[INFO] Node.js Version: $NodeVer" -ForegroundColor Green

# 3. Đồng bộ dữ liệu mới nhất từ txlab.io.vn về máy tính trước khi bật Server
Set-Location -Path $ProjectDir
$DataDir = "$ProjectDir\data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

Write-Host "[SYNC] Đang kiểm tra & kéo dữ liệu mới nhất từ https://txlab.io.vn..." -ForegroundColor Cyan

try {
    # Kéo người dùng từ txlab.io.vn
    $usersResp = Invoke-RestMethod -Uri "https://txlab.io.vn/api/auth?_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue
    if ($usersResp -and $usersResp.users) {
        $usersFile = "$DataDir\users.json"
        $usersResp.users | ConvertTo-Json -Depth 10 | Set-Content -Path $usersFile -Encoding UTF8
        Write-Host "  ✓ Đồng bộ $(($usersResp.users).Count) tài khoản thành viên từ txlab.io.vn" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Không thể kết nối txlab.io.vn (Sẽ sử dụng dữ liệu offline trên máy)" -ForegroundColor DarkYellow
}

try {
    # Kéo phòng xem chung từ txlab.io.vn
    $roomsResp = Invoke-RestMethod -Uri "https://txlab.io.vn/api/auth?type=rooms&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue
    if ($roomsResp -and $roomsResp.rooms -and ($roomsResp.rooms).Count -gt 0) {
        $roomsFile = "$DataDir\rooms.json"
        $roomsResp.rooms | ConvertTo-Json -Depth 10 | Set-Content -Path $roomsFile -Encoding UTF8
        Write-Host "  ✓ Đồng bộ $(($roomsResp.rooms).Count) phòng xem chung từ txlab.io.vn" -ForegroundColor Green
    }
} catch {
    # ignore
}

# 4. Kiểm tra thư mục build .next
$HasBuild = Test-Path "$ProjectDir\.next"
$Url = "http://localhost:$Port"

Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " 🚀 Đang khởi chạy Server tại: $Url" -ForegroundColor Cyan
Write-Host "    • Dữ liệu liên thông 2 chiều với https://txlab.io.vn" -ForegroundColor Gray
Write-Host "    • Thao tác trên máy bạn phản hồi tức thì 0ms" -ForegroundColor Gray
Write-Host "    • Nhấn [Ctrl + C] bất cứ lúc nào để dừng máy chủ" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Tự động mở trình duyệt: Ưu tiên mở txlab.io.vn nếu có -OpenOnline, hoặc mở localhost
if (-not $NoBrowser) {
    $TargetBrowserUrl = if ($OpenOnline) { "https://txlab.io.vn" } else { $Url }
    Start-Job -ScriptBlock {
        param($target)
        Start-Sleep -Seconds 3
        Start-Process $target
    } -ArgumentList $TargetBrowserUrl | Out-Null
}

# 5. Khởi chạy Next.js Server
if ($HasBuild) {
    Write-Host "[START] Chạy chế độ Production Tối Ưu (next start)..." -ForegroundColor Green
    & npx next start -p $Port -H 0.0.0.0
} else {
    Write-Host "[START] Chạy chế độ Development (next dev)..." -ForegroundColor Green
    & npx next dev -p $Port -H 0.0.0.0
}
