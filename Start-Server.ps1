<#
.SYNOPSIS
    TxCloneDriver Ultra-Fast Realtime Server Launcher (PowerShell)
.DESCRIPTION
    Script khởi chạy máy chủ TxCloneDriver từ bất kỳ đâu (Desktop, thư mục bất kỳ, hoặc lệnh PowerShell toàn hệ thống).
    Tự động dò tìm thư mục dự án TxCloneDriver, kiểm tra cổng 3000, và mở trình duyệt cho Admin.
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "TxCloneDriver Ultra-Fast Realtime Server"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   ⚡ TXCLONEDRIVER - MÁY CHỦ QUẢN TRỊ VIÊN SIÊU TỐC & PHẢN HỒI 0MS" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Xác định thư mục dự án (Tự động tìm nếu chạy từ bất kỳ đâu)
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
    Write-Host "Vui lòng đặt script trong thư mục dự án hoặc đảm bảo dự án nằm ở Desktop\TxCloneDriver." -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

Write-Host "[INFO] Thư mục dự án: $ProjectDir" -ForegroundColor Green

# 2. Kiểm tra Node.js & npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Máy tính chưa cài đặt Node.js! Vui lòng tải tại https://nodejs.org/" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

$NodeVer = node -v
Write-Host "[INFO] Node.js Version: $NodeVer" -ForegroundColor Green

# 3. Chuyển vào thư mục dự án
Set-Location -Path $ProjectDir

# 4. Kiểm tra thư mục .next đã build chưa (nếu chưa thì build trước hoặc chạy dev)
$HasBuild = Test-Path "$ProjectDir\.next"

$Port = 3000
$Url = "http://localhost:$Port"

Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " 🚀 Đang khởi động Server tại: $Url" -ForegroundColor Cyan
Write-Host "    • Thao tác phòng xem chung & chat sẽ ghi thẳng vào ổ cứng máy" -ForegroundColor Gray
Write-Host "    • Phản hồi tức thì 0ms, không còn độ trễ mạng hay mất phòng!" -ForegroundColor Gray
Write-Host "    • Nhấn [Ctrl + C] trên cửa sổ này bất kỳ lúc nào để dừng máy chủ" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Tự động mở trình duyệt sau 3 giây
Start-Job -ScriptBlock {
    param($targetUrl)
    Start-Sleep -Seconds 3
    Start-Process $targetUrl
} -ArgumentList $Url | Out-Null

# 5. Khởi chạy Next.js Server (Ưu tiên Production Build siêu mượt 'next start', nếu chưa build thì chạy 'npm run dev')
if ($HasBuild) {
    Write-Host "[START] Chạy chế độ Production Tối Ưu (next start)..." -ForegroundColor Green
    & npx next start -p $Port -H 0.0.0.0
} else {
    Write-Host "[START] Chạy chế độ Development (next dev)..." -ForegroundColor Green
    & npx next dev -p $Port -H 0.0.0.0
}
