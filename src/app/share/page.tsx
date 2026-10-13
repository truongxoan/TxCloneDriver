"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Upload,
  Download,
  Share2,
  FileCheck,
  File,
  Film,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Lock,
  Smartphone,
  Laptop,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { generateQRCodeDataUrl } from "@/lib/qrCodeGenerator";

export default function P2PSharePage() {
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [pinCode, setPinCode] = useState<string>("");
  const [receiverPinInput, setReceiverPinInput] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Connection & Transfer States
  const [status, setStatus] = useState<"idle" | "connecting" | "transferring" | "completed" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [transferSpeed, setTransferSpeed] = useState<string>("0 MB/s");
  const [receivedFileUrl, setReceivedFileUrl] = useState<string | null>(null);
  const [receivedFileName, setReceivedFileName] = useState<string>("");
  const [receivedFileSize, setReceivedFileSize] = useState<number>(0);
  const [copiedPin, setCopiedPin] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const bytesTransferredRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Generate 4-digit code on mount
  useEffect(() => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(randomPin);
    const qr = generateQRCodeDataUrl(`https://txlab.io.vn/share?pin=${randomPin}`);
    setQrDataUrl(qr);
  }, []);

  // WebRTC ICE Servers Configuration (Google STUN)
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Connect Signaling Broker for Pin matching
  const connectSignaling = (channelPin: string, isSender: boolean) => {
    const topic = `txclonedriver_p2p_${channelPin}`;
    const ws = new WebSocket(`wss://ntfy.sh/${topic}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isSender) {
        setupSenderPeer(channelPin);
      }
    };

    ws.onmessage = async (event) => {
      try {
        const raw = JSON.parse(event.data);
        if (raw.event !== "message" || !raw.message) return;
        const data = JSON.parse(raw.message);

        // Ignore messages from self
        if (data.senderRole === (isSender ? "sender" : "receiver")) return;

        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (data.type === "offer" && !isSender) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          // Send answer back
          fetch(`https://ntfy.sh/${topic}`, {
            method: "POST",
            body: JSON.stringify({
              senderRole: "receiver",
              type: "answer",
              answer,
            }),
          }).catch(() => {});
        } else if (data.type === "answer" && isSender) {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } else if (data.type === "candidate" && data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {}
        }
      } catch {}
    };
  };

  // Setup Sender WebRTC
  const setupSenderPeer = (channelPin: string) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    const dc = pc.createDataChannel("fileTransfer", { ordered: true });
    dataChannelRef.current = dc;

    dc.binaryType = "arraybuffer";
    dc.onopen = () => {
      setStatus("connecting");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`https://ntfy.sh/txclonedriver_p2p_${channelPin}`, {
          method: "POST",
          body: JSON.stringify({
            senderRole: "sender",
            type: "candidate",
            candidate: event.candidate,
          }),
        }).catch(() => {});
      }
    };

    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
      fetch(`https://ntfy.sh/txclonedriver_p2p_${channelPin}`, {
        method: "POST",
        body: JSON.stringify({
          senderRole: "sender",
          type: "offer",
          offer,
        }),
      }).catch(() => {});
    });
  };

  // Setup Receiver WebRTC
  const setupReceiverPeer = (channelPin: string) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`https://ntfy.sh/txclonedriver_p2p_${channelPin}`, {
          method: "POST",
          body: JSON.stringify({
            senderRole: "receiver",
            type: "candidate",
            candidate: event.candidate,
          }),
        }).catch(() => {});
      }
    };

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dataChannelRef.current = dc;
      dc.binaryType = "arraybuffer";

      dc.onopen = () => {
        setStatus("connecting");
      };

      dc.onmessage = (e) => {
        if (typeof e.data === "string") {
          try {
            const meta = JSON.parse(e.data);
            if (meta.type === "header") {
              setReceivedFileName(meta.name);
              setReceivedFileSize(meta.size);
              receivedChunksRef.current = [];
              bytesTransferredRef.current = 0;
              startTimeRef.current = Date.now();
              setStatus("transferring");
            } else if (meta.type === "done") {
              // Reconstruct Blob and trigger download
              const blob = new Blob(receivedChunksRef.current, { type: meta.mimeType || "application/octet-stream" });
              const url = URL.createObjectURL(blob);
              setReceivedFileUrl(url);
              setStatus("completed");
              setProgress(100);
            }
          } catch {}
        } else if (e.data instanceof ArrayBuffer) {
          receivedChunksRef.current.push(e.data);
          bytesTransferredRef.current += e.data.byteLength;
          const pct = Math.min(99, Math.round((bytesTransferredRef.current / (receivedFileSize || 1)) * 100));
          setProgress(pct);

          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          if (elapsed > 0) {
            const speed = (bytesTransferredRef.current / (1024 * 1024) / elapsed).toFixed(1);
            setTransferSpeed(`${speed} MB/s`);
          }
        }
      };
    };

    connectSignaling(channelPin, false);
  };

  // Start File Streaming (Sender)
  const startFileSend = async () => {
    if (!selectedFile) return;
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== "open") {
      alert("Đang chờ thiết bị nhận kết nối qua mã PIN. Vui lòng thử lại sau vài giây!");
      return;
    }

    setStatus("transferring");
    setProgress(0);
    bytesTransferredRef.current = 0;
    startTimeRef.current = Date.now();

    // Send metadata header
    dc.send(
      JSON.stringify({
        type: "header",
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type,
      })
    );

    const chunkSize = 64 * 1024; // 64KB Chunks
    const fileReader = new FileReader();
    let offset = 0;

    const readSlice = (o: number) => {
      const slice = selectedFile.slice(o, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      if (!e.target?.result) return;
      const buffer = e.target.result as ArrayBuffer;

      // Handle backpressure
      if (dc.bufferedAmount > 8 * 1024 * 1024) {
        setTimeout(() => {
          dc.send(buffer);
          offset += buffer.byteLength;
          updateSenderProgress(offset);
          if (offset < selectedFile.size) readSlice(offset);
          else finishSender();
        }, 50);
      } else {
        dc.send(buffer);
        offset += buffer.byteLength;
        updateSenderProgress(offset);
        if (offset < selectedFile.size) readSlice(offset);
        else finishSender();
      }
    };

    const updateSenderProgress = (sentBytes: number) => {
      const pct = Math.min(99, Math.round((sentBytes / selectedFile.size) * 100));
      setProgress(pct);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 0) {
        const speed = (sentBytes / (1024 * 1024) / elapsed).toFixed(1);
        setTransferSpeed(`${speed} MB/s`);
      }
    };

    const finishSender = () => {
      dc.send(JSON.stringify({ type: "done", mimeType: selectedFile.type }));
      setProgress(100);
      setStatus("completed");
    };

    readSlice(0);
  };

  const handleStartSending = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    connectSignaling(pinCode, true);
  };

  const handleStartReceiving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverPinInput.trim()) return;
    setStatus("connecting");
    setupReceiverPeer(receiverPinInput.trim());
  };

  return (
    <ModuleGuard moduleId="overview" moduleName="P2P Direct Share">
      <div className="space-y-6 pb-20 max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="p-6 rounded-3xl glass-panel border border-white/15 bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-950/90 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              P2P WebRTC Direct Share &bull; 0MB Server Storage
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bắn Tệp Siêu Tốc Không Qua Máy Chủ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Truyền tệp trực tiếp giữa 2 thiết bị (PC & Điện thoại) qua mạng LAN/Internet với tốc độ tối đa, mã hóa đầu cuối 100%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode("send");
                setStatus("idle");
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === "send"
                  ? "bg-emerald-500 text-slate-950 shadow-lg font-black"
                  : "bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Gửi Tệp</span>
            </button>
            <button
              onClick={() => {
                setMode("receive");
                setStatus("idle");
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === "receive"
                  ? "bg-teal-500 text-slate-950 shadow-lg font-black"
                  : "bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Nhận Tệp</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: SENDER MODE */}
        {/* ============================================================== */}
        {mode === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* File Drop Area (7 Cols) */}
            <Card className="md:col-span-7 p-6 bg-slate-950/60 border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>1. Chọn Tệp Tin Muốn Gửi</span>
              </h3>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-3 cursor-pointer transition-all ${
                  selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/15 hover:border-emerald-400/30 hover:bg-white/5"
                }`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files[0]) setSelectedFile(files[0]);
                  };
                  input.click();
                }}
              >
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  {selectedFile ? <FileCheck className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                </div>

                {selectedFile ? (
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-emerald-300 font-mono mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Sẵn sàng bắn tệp
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-white">Kéo thả tệp hoặc bấm vào đây để chọn</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ mọi định dạng: Video 4K, Zip, APK, Ảnh...</p>
                  </div>
                )}
              </div>

              {/* Progress & Speed */}
              {status === "transferring" && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Đang truyền trực tiếp:</span>
                    <span className="font-mono text-emerald-400 font-bold">{transferSpeed}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Tiến độ: {progress}%</span>
                    <span>P2P Encrypted</span>
                  </div>
                </div>
              )}

              {status === "completed" && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đã truyền tệp thành công 100%! Thiết bị nhận đã tải tệp về máy.</span>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full h-10 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                disabled={!selectedFile}
                onClick={startFileSend}
              >
                <Zap className="w-4 h-4" />
                <span>Bắt Đầu Bắn Tệp Cho Máy Nhận &rarr;</span>
              </Button>
            </Card>

            {/* PIN Code & QR Code Box (5 Cols) */}
            <Card className="md:col-span-5 p-6 bg-slate-950/60 border-white/10 space-y-4 text-center">
              <h3 className="font-bold text-white text-sm flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Mã Kết Nối Nhanh</span>
              </h3>

              <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Mã PIN Kết Nối:</span>
                <div className="text-4xl font-mono font-black text-emerald-400 tracking-widest flex items-center justify-center gap-3">
                  <span>{pinCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pinCode);
                      setCopiedPin(true);
                      setTimeout(() => setCopiedPin(false), 2000);
                    }}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
                    title="Sao chép PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-2xl w-40 h-40 mx-auto shadow-xl flex items-center justify-center">
                    <img src={qrDataUrl} alt="Connect QR Code" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[11px] text-slate-400">Quét mã QR trên điện thoại để nhận tệp ngay</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RECEIVER MODE */}
        {/* ============================================================== */}
        {mode === "receive" && (
          <Card className="max-w-md mx-auto p-6 sm:p-8 bg-slate-950/60 border-white/10 space-y-5 text-center">
            <div className="h-14 w-14 rounded-3xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-md">
              <Download className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Nhập Mã PIN Để Nhận Tệp</h3>
              <p className="text-xs text-slate-300 mt-1">
                Nhập 4 chữ số hiển thị trên thiết bị gửi để bắt đầu kết nối P2P
              </p>
            </div>

            <form onSubmit={handleStartReceiving} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                value={receiverPinInput}
                onChange={(e) => setReceiverPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Ví dụ: 5821"
                className="w-full text-center text-3xl font-mono font-black tracking-widest px-4 py-3 rounded-2xl glass-input text-teal-300"
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-10 font-bold bg-gradient-to-r from-teal-600 to-emerald-600 gap-2"
                disabled={receiverPinInput.length < 4 || status === "transferring"}
              >
                <Download className="w-4 h-4" />
                <span>Kết Nối & Nhận Tệp &rarr;</span>
              </Button>
            </form>

            {/* Transfer State on Receiver */}
            {status === "connecting" && (
              <p className="text-xs text-amber-300 animate-pulse font-medium">
                Đang bắt tay kết nối P2P với máy gửi...
              </p>
            )}

            {status === "transferring" && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900 border border-white/10 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold truncate max-w-[180px]">{receivedFileName}</span>
                  <span className="text-teal-400 font-mono font-bold">{transferSpeed}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-mono block text-right">{progress}%</span>
              </div>
            )}

            {status === "completed" && receivedFileUrl && (
              <div className="space-y-3 p-4 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-center animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white truncate">{receivedFileName}</h4>
                  <p className="text-[11px] text-teal-200 mt-0.5">Đã nhận tệp trọn vẹn qua đường truyền trực tiếp!</p>
                </div>
                <a
                  href={receivedFileUrl}
                  download={receivedFileName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Xuống Thiết Bị Ngay</span>
                </a>
              </div>
            )}
          </Card>
        )}
      </div>
    </ModuleGuard>
  );
}
