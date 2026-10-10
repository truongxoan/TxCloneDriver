<#
.SYNOPSIS
  TxCloneDriver — 1-Line Remote Host Launcher
  Chạy 1 dòng duy nhất trên bất kỳ máy tính Windows nào để biến máy đó thành Máy chủ Server trực tuyến toàn cầu!
#>

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   🚀 TXCLONEDRIVER — KÍCH HOẠT MÁY CHỦ TỪ XA 24/7   " -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Kiểm tra Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Máy tính này chưa cài đặt Node.js." -ForegroundColor Red
    Write-Host "[*] Đang tự động cài đặt Node.js qua winget..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 2. Thư mục cài đặt máy chủ
$HostDir = "C:\TxCloneDriver-Host"
if (-not (Test-Path $HostDir)) {
    New-Item -ItemType Directory -Path $HostDir -Force | Out-Null
    Write-Host "[*] Đang tải mã nguồn dự án mới nhất từ GitHub..." -ForegroundColor Cyan
    git clone https://github.com/truongxoan/TxCloneDriver.git $HostDir
} else {
    Write-Host "[*] Đang đồng bộ mã nguồn mới nhất từ GitHub..." -ForegroundColor Cyan
    Set-Location $HostDir
    git pull origin main
}

Set-Location $HostDir

# 3. Cài đặt thư viện & build nếu cần
if (-not (Test-Path "$HostDir\node_modules")) {
    Write-Host "[*] Đang cài đặt gói phụ thuộc (npm install)..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "$HostDir\.next")) {
    Write-Host "[*] Đang biên dịch dự án Next.js (npm run build)..." -ForegroundColor Yellow
    npm run build
}

# 4. Tải Cloudflare Tunnel standalone (miễn phí, không cần đăng ký)
$CloudflaredPath = "$HostDir\cloudflared.exe"
if (-not (Test-Path $CloudflaredPath)) {
    Write-Host "[*] Đang chuẩn bị đường hầm mạng Cloudflare Tunnel..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $CloudflaredPath
}

# 5. Khởi động Web Server ngầm trên Port 3000
Write-Host "[+] Đang khởi động máy chủ TxCloneDriver trên Port 3000..." -ForegroundColor Green
$serverJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory $HostDir -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 3

# 6. Mở đường hầm phát sóng toàn cầu ra Internet
Write-Host "======================================================" -ForegroundColor Green
Write-Host "   🌐 MÁY TÍNH NÀY ĐÃ TRỞ THÀNH MÁY CHỦ HOẠT ĐỘNG!    " -ForegroundColor Green
Write-Host "   Mọi người ở khắp nơi có thể truy cập qua đường dẫn: " -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Green

& $CloudflaredPath tunnel --url http://localhost:3000
