"use client";

import React, { useState, useEffect, useRef } from "react";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import {
  QrCode,
  Download,
  Copy,
  Wifi,
  Link as LinkIcon,
  FileText,
  CreditCard,
  Phone,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Palette,
  Eye,
} from "lucide-react";
import { createQRMatrix } from "@/lib/qrCodeGenerator";

export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState<"text" | "wifi" | "bank" | "phone">("text");

  // Input states
  const [textInput, setTextInput] = useState("https://txlab.io.vn");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiAuth, setWifiAuth] = useState("WPA");
  const [bankCode, setBankCode] = useState("MB");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [bankDesc, setBankDesc] = useState("Chuyen tien");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Styling
  const [fgColor, setFgColor] = useState("#38bdf8"); // Sky blue
  const [bgColor, setBgColor] = useState("#090d16"); // Deep slate
  const [qrSize, setQrSize] = useState<number>(300);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final payload
  const getPayload = (): string => {
    if (activeTab === "text") {
      return textInput.trim() || "https://txlab.io.vn";
    }
    if (activeTab === "wifi") {
      return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};;`;
    }
    if (activeTab === "bank") {
      // VietQR standard syntax
      return `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${bankAmount}&addInfo=${encodeURIComponent(
        bankDesc
      )}`;
    }
    if (activeTab === "phone") {
      return `tel:${phoneNumber.trim()}`;
    }
    return textInput;
  };

  const payload = getPayload();

  // Render QR matrix on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = qrSize;
    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Matrix calculation
    const matrix = createQRMatrix(payload);
    const N = matrix.length;
    const margin = Math.floor(size * 0.08);
    const cellSize = (size - margin * 2) / N;

    ctx.fillStyle = fgColor;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c]) {
          const x = margin + c * cellSize;
          const y = margin + r * cellSize;
          // Smooth rounded cells
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [payload, fgColor, bgColor, qrSize]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast("Đã tải ảnh mã QR về máy thành công!");
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Đã sao chép ảnh QR vào bộ nhớ đệm (Clipboard)!");
      });
    } catch {
      showToast("Trình duyệt không hỗ trợ sao chép ảnh trực tiếp.");
    }
  };

  return (
    <ModuleGuard moduleId="qr" moduleName="Tạo Mã QR">
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-600/20 via-blue-600/20 to-indigo-600/20 glass-panel border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <QrCode className="h-4 w-4" />
              <span>Công Cụ Tiện Ích Đám Mây</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tạo Mã QR Từ Văn Bản & Liên Kết
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Tạo mã QR thời gian thực cho mọi loại nội dung: Văn bản, Website, Mạng WiFi, Chuyển khoản và Số điện thoại.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl glass-card p-6 border border-white/10 space-y-5">
            {/* Type selector tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "text", label: "Văn bản / Link", icon: LinkIcon },
                { id: "wifi", label: "Mạng WiFi", icon: Wifi },
                { id: "bank", label: "Chuyển khoản", icon: CreditCard },
                { id: "phone", label: "Số điện thoại", icon: Phone },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-102"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Text / URL */}
            {activeTab === "text" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Nhập văn bản thuần hoặc đường dẫn URL:
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Nhập bất kỳ đoạn văn bản, ghi chú hoặc link web..."
                  className="w-full p-3.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500 resize-none font-mono"
                />
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="text-slate-400 font-semibold">Mẫu nhanh:</span>
                  {[
                    { label: "🌐 txlab.io.vn", val: "https://txlab.io.vn" },
                    { label: "📁 Google Drive", val: "https://txlab.io.vn/storage" },
                    { label: "🎮 Kho Game Hub", val: "https://txlab.io.vn/games" },
                    { label: "💬 TxCloneDriver Secret", val: "TxCloneDriver:080497" },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setTextInput(preset.val)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: WiFi */}
            {activeTab === "wifi" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Tên WiFi (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="VD: TxHome_5G"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Mật khẩu WiFi</label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Nhập mật khẩu WiFi..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 block">Bảo mật</label>
                  <select
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="WPA">WPA / WPA2 (Phổ biến)</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Không có mật khẩu</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 3: Banking / VietQR */}
            {activeTab === "bank" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Ngân hàng</label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                    >
                      <option value="MB">MB Bank (Quân Đội)</option>
                      <option value="VCB">Vietcombank</option>
                      <option value="TCB">Techcombank</option>
                      <option value="ICB">Vietinbank</option>
                      <option value="ACB">ACB</option>
                      <option value="TPB">TPBank</option>
                      <option value="VPB">VPBank</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Số tài khoản</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Số tài khoản ngân hàng..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Số tiền (VND, tùy chọn)</label>
                    <input
                      type="number"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(e.target.value)}
                      placeholder="VD: 50000"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Nội dung chuyển khoản</label>
                    <input
                      type="text"
                      value={bankDesc}
                      onChange={(e) => setBankDesc(e.target.value)}
                      placeholder="VD: Ung ho du an..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Phone */}
            {activeTab === "phone" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-200 block">Số điện thoại liên hệ:</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="VD: 0987654321..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>
            )}

            {/* Custom Styling Controls */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-sky-400" />
                <span>Tùy Chỉnh Màu Sắc & Kích Thước</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Màu mã QR:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{fgColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Màu nền:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{bgColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Kích thước:</span>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value={240}>240 x 240 px</option>
                    <option value={300}>300 x 300 px</option>
                    <option value={400}>400 x 400 px</option>
                    <option value={500}>500 x 500 px</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live QR Preview & Actions (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl glass-card p-6 border border-white/10 flex flex-col items-center justify-between space-y-6 text-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-400" />
                <span>Xem Trước Mã QR Thời Gian Thực</span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                Dữ liệu: {payload}
              </p>
            </div>

            {/* Canvas Box */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/15 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="rounded-2xl max-w-[260px] sm:max-w-[280px] h-auto shadow-lg"
              />
            </div>

            {/* Actions Buttons */}
            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
              >
                <Download className="h-4 w-4" />
                <span>Tải Ảnh Mã QR (PNG)</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="h-4 w-4" />
                <span>Sao Chép Ảnh QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
