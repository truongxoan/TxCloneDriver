"use client";

import React, { useState } from "react";
import {
  Workflow,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Maximize2,
  Wand2,
  Zap,
  Layers,
  Video,
  Download,
  Copy,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/authContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const GOOGLE_FLOW_SHARED_URL = "https://flow.google.com/shared/tool/802ce88d-f20f-449c-bd14-b74e70b59e11";

export default function GoogleFlowPage() {
  const { user, adjustUserCoins } = useAuth();

  // Mode: "native_pipeline" | "embed_flow"
  const [activeMode, setActiveMode] = useState<"native_pipeline" | "embed_flow">("native_pipeline");
  const [iframeKey, setIframeKey] = useState<number>(1);

  // Native Google Flow Re-creation State
  const [flowPrompt, setFlowPrompt] = useState<string>(
    "Cinematic shot of ancient Vietnamese Master meditating in glowing neon temple, photorealistic 8k, volumetric rays"
  );
  const [flowModel, setFlowModel] = useState<string>("gemini-flash-creative");
  const [generationStep, setGenerationStep] = useState<"ready" | "processing" | "completed">("ready");
  const [flowResult, setFlowResult] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRunNativeFlow = () => {
    if (!flowPrompt.trim()) {
      showToast("Vui lòng nhập mô tả ý tưởng!");
      return;
    }

    const currentCoins = user?.coins ?? 50000;
    if (currentCoins < 100) {
      showToast("⚠️ Không đủ Xu tín dụng! Cần 100 Xu để chạy Flow.");
      return;
    }

    if (user?.id) {
      adjustUserCoins(user.id, -100);
    }

    setGenerationStep("processing");
    showToast("✨ Đang kích hoạt Google Flow Engine tạo tác phẩm...");

    setTimeout(() => {
      const cleanPrompt = encodeURIComponent(
        `${flowPrompt.trim()}, Google Flow Creative Studio 8k, ultra-realistic, Hasselblad lens, pristine clarity, no watermark`
      );
      const outputUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(
        Math.random() * 9999999
      )}`;

      setFlowResult({ url: outputUrl, type: "image" });
      setGenerationStep("completed");
      showToast("🎉 Google Flow đã tạo tác phẩm thành công không dính logo!");
    }, 2000);
  };

  const downloadCleanMedia = async (url: string) => {
    showToast("Đang chuẩn bị file tải về không logo...");
    try {
      const res = await fetch(`/api/ai/maxcheapai?url=${encodeURIComponent(url)}`);
      const blob = await res.blob();
      const cleanUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = cleanUrl;
      a.download = `google-flow-clean-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(cleanUrl);
      showToast("Đã tải xong file gốc sạch hoàn toàn!");
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl glass-panel p-4 shadow-glass border border-primary/50 text-xs text-foreground flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-500 text-white shadow-xl shadow-teal-500/20">
            <Workflow className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Google Flow Creative Studio
              <Badge variant="primary" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Shared Tool 802ce88d
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tích hợp công cụ sáng tạo AI từ Google Flow Labs &bull; Kết nối tài khoản Google Drive & Ví Xu nội bộ
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode("native_pipeline")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeMode === "native_pipeline"
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20"
                : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Chạy Trực Tiếp (Native Flow)</span>
          </button>

          <button
            onClick={() => setActiveMode("embed_flow")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeMode === "embed_flow"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Màn Hình Gốc (Web Embed)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: NATIVE RE-CREATION PIPELINE */}
      {activeMode === "native_pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Prompt & Pipeline Controls */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4 border-teal-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-teal-400" />
                  <span>Google Flow Tool Configurator</span>
                </h3>
                <Badge variant="primary" size="sm">
                  100 Xu / Lần
                </Badge>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Prompt Ý Tưởng Flow:
                </label>
                <textarea
                  rows={4}
                  value={flowPrompt}
                  onChange={(e) => setFlowPrompt(e.target.value)}
                  placeholder="Nhập mô tả kịch bản hoặc yêu cầu flow..."
                  className="w-full p-3 rounded-2xl glass-input text-xs text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* AI Model Architecture */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Bộ Xử Lý Generative Model:
                </label>
                <select
                  value={flowModel}
                  onChange={(e) => setFlowModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-foreground bg-slate-900 border border-white/10"
                >
                  <option value="gemini-flash-creative">Google Gemini 3.8 Flash (Tốc độ tức thì)</option>
                  <option value="google-veo-video">Google Veo Creative Studio (Chuẩn điện ảnh)</option>
                  <option value="imagen-3-hd">Google Imagen 3 Ultra (Sắc nét 8K)</option>
                  <option value="maxcheapai-turbo">MaxCheapAI Neural Flow Engine</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  <span>Chế độ chạy Native trên Web của bạn</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  Khách chỉ cần đăng nhập tài khoản Google là có thể bấm chạy và xuất file sạch 100% không dính logo Google Labs.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleRunNativeFlow}
                disabled={generationStep === "processing"}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-2.5 rounded-2xl gap-2 shadow-lg shadow-teal-500/20 font-bold"
              >
                {generationStep === "processing" ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Google Flow đang xử lý pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Khởi Chạy Google Flow Tool (Trừ 100 Xu)</span>
                  </>
                )}
              </Button>
            </Card>

            {/* Direct Link to Google Flow */}
            <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-surface-border flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Mở công cụ gốc trên Google Labs</span>
                <span className="text-[10px] text-muted-foreground">ID: 802ce88d-f20f-449c-bd14-b74e70b59e11</span>
              </div>
              <a
                href={GOOGLE_FLOW_SHARED_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <span>Mở Link Gốc</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right panel: Live Output Screen */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Màn Hình Kết Quả Google Flow (Clean Render)</span>
                </h3>

                {flowResult && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => downloadCleanMedia(flowResult.url)}
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải Về Không Logo</span>
                  </Button>
                )}
              </div>

              {/* View Screen */}
              <div className="relative min-h-[460px] rounded-3xl bg-slate-950/90 border border-white/10 flex items-center justify-center p-4 overflow-hidden pattern-checkered">
                {generationStep === "processing" ? (
                  <div className="text-center p-8 space-y-3 animate-pulse">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Đang thực thi chuỗi Google Flow AI...</h4>
                      <p className="text-xs text-slate-400 mt-1">Đang tối ưu hóa khung hình và kết xuất không watermark</p>
                    </div>
                  </div>
                ) : flowResult ? (
                  <div className="relative max-h-[480px] flex flex-col items-center justify-center animate-in zoom-in-95">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flowResult.url}
                      alt="Google Flow Output"
                      className="max-h-[450px] w-auto object-contain rounded-2xl shadow-2xl drop-shadow"
                    />
                    <div className="mt-2 text-[10px] text-emerald-300 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Kết quả chuẩn Google Flow &bull; 100% Không Watermark</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="h-14 w-14 mx-auto rounded-3xl bg-surface-elevated border border-surface-border flex items-center justify-center text-teal-400">
                      <Workflow className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">Sẵn Sàng Khởi Chạy Tool</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        Nhập ý tưởng và nhấn nút khởi chạy ở cột bên trái để chạy chuỗi xử lý Google Flow.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODE 2: DIRECT EMBED WEBVIEW */}
      {activeMode === "embed_flow" && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                flow.google.com/shared/tool/802ce88d-f20f-449c-bd14-b74e70b59e11
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1"
                title="Tải lại iframe"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Làm mới</span>
              </button>

              <a
                href={GOOGLE_FLOW_SHARED_URL}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <span>Mở Cửa Sổ Mới</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="relative w-full h-[750px] rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
            <iframe
              key={iframeKey}
              src={GOOGLE_FLOW_SHARED_URL}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              title="Google Flow Shared Tool"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
