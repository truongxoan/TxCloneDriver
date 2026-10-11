"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  Compass,
  ArrowRight,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAmbientMusic?: () => void;
}

const VOICE_PRESETS = [
  { label: "Mở nhạc Drive", desc: "Xem & Nghe nhạc Google Drive" },
  { label: "Kiểm tra chi tiêu hôm nay", desc: "Bảng thu chi & ngân sách" },
  { label: "Chơi ván tài xỉu", desc: "Vào sảnh Game & Đặt cược" },
  { label: "Bật nhạc mưa rơi", desc: "Không gian âm thanh thư giãn" },
  { label: "Học tiếng Trung", desc: "Khoá học HSK 1-6 & Duolingo" },
  { label: "Tải video", desc: "Trình tải TikTok, YouTube về Drive" },
  { label: "Kho kỷ niệm", desc: "Album ảnh 3D khóa FaceID" },
  { label: "Mở két sắt", desc: "Quản lý 2FA & Mật mã" },
];

export function VoiceAssistantModal({
  isOpen,
  onClose,
  onOpenAmbientMusic,
}: VoiceAssistantModalProps) {
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Text-To-Speech function in Vietnamese
  const speakReply = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes("vi"));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Process user command text
  const processVoiceCommand = (command: string) => {
    const lower = command.toLowerCase().trim();

    if (
      lower.includes("nhạc drive") ||
      lower.includes("nghe nhạc") ||
      lower.includes("xem phim") ||
      lower.includes("xem chung")
    ) {
      const reply = "Đang mở phòng nghe nhạc và xem phim Google Drive cho bạn!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/watch-together");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("chi tiêu") ||
      lower.includes("tiền") ||
      lower.includes("ngân sách")
    ) {
      const reply = "Đang kiểm tra chi tiêu và hạn mức ngân sách hôm nay!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/expenses");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("tài xỉu") ||
      lower.includes("xóc đĩa") ||
      lower.includes("baccarat") ||
      lower.includes("chơi game") ||
      lower.includes("game")
    ) {
      const reply = "Đang chuyển bạn vào sảnh Trò Chơi Giải Trí và Đặt Cược!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/games");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("mưa rơi") ||
      lower.includes("sóng biển") ||
      lower.includes("thư giãn") ||
      lower.includes("lofi")
    ) {
      const reply = "Đang kích hoạt không gian âm thanh thư giãn mưa rơi và lofi!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        if (onOpenAmbientMusic) onOpenAmbientMusic();
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("tiếng trung") ||
      lower.includes("ngoại ngữ") ||
      lower.includes("hsk") ||
      lower.includes("học tập")
    ) {
      const reply = "Đang mở khoá học tiếng Trung HSK và Duolingo cho bạn!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/study");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("tải video") ||
      lower.includes("tiktok") ||
      lower.includes("youtube") ||
      lower.includes("facebook")
    ) {
      const reply = "Đang mở Trình Tải Video Đa Nền Tảng không logo về Google Drive!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/downloader");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("kỷ niệm") ||
      lower.includes("kho ảnh") ||
      lower.includes("faceid") ||
      lower.includes("album")
    ) {
      const reply = "Đang mở Kho Ảnh và Video Kỷ Niệm 3D Flipbook khóa FaceID!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/memories");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("két sắt") ||
      lower.includes("mật khẩu") ||
      lower.includes("2fa")
    ) {
      const reply = "Đang mở Két Sắt bảo mật và bộ sinh mã 2FA!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/vault");
        onClose();
      }, 1400);
      return;
    }

    if (
      lower.includes("bằng lái") ||
      lower.includes("gplx") ||
      lower.includes("thi thử")
    ) {
      const reply = "Đang mở trung tâm ôn thi sát hạch GPLX 600 câu hỏi!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/driver-license");
        onClose();
      }, 1400);
      return;
    }

    if (lower.includes("thời tiết")) {
      const reply = "Đang mở thông tin dự báo thời tiết chi tiết!";
      setAiReply(reply);
      speakReply(reply);
      setTimeout(() => {
        router.push("/weather");
        onClose();
      }, 1400);
      return;
    }

    // Default friendly assistant response
    const reply = `Trợ lý TxAI đã nghe: "${command}". Hãy thử nói: "Mở nhạc Drive", "Chơi ván tài xỉu", hoặc "Kiểm tra chi tiêu"!`;
    setAiReply(reply);
    speakReply(reply);
  };

  // Start Voice Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn chưa hỗ trợ Web Speech API. Vui lòng sử dụng Chrome/Edge hoặc nhấp vào các lệnh mẫu bên dưới!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("Đang lắng nghe giọng nói của bạn...");
        setAiReply(null);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        processVoiceCommand(spoken);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setTranscript("Không nghe rõ giọng nói. Vui lòng bấm micro và nói lại!");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Auto start listening on open
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setTranscript("");
      setAiReply(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-card border border-sky-500/30 shadow-2xl space-y-6 bg-slate-950/90 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* AI Voice Mascot Avatar / Wave */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative",
                isListening
                  ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 scale-110 shadow-rose-500/50"
                  : "bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 hover:scale-105 shadow-blue-500/40"
              )}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            {/* Pulsing ring wave animation */}
            {isListening && (
              <>
                <span className="absolute -inset-2 rounded-full border-2 border-rose-400 opacity-60 animate-ping" />
                <span className="absolute -inset-6 rounded-full border border-pink-400 opacity-30 animate-pulse" />
              </>
            )}
          </div>

          <h3 className="text-lg font-black text-white mt-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            {isListening
              ? "TRỢ LÝ ĐANG LẮNG NGHE BẠN..."
              : isSpeaking
              ? "TRỢ LÝ ĐANG TRẢ LỜI..."
              : "NHẤN VÀO MICRO ĐỂ RA LỆNH"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Hỗ trợ giọng nói tiếng Việt chuẩn xác (Web Speech AI)
          </p>
        </div>

        {/* Live Spoken Transcript */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/15 min-h-[64px] flex flex-col items-center justify-center">
          <p className="text-xs sm:text-sm text-slate-200 font-medium italic">
            &ldquo;{transcript || "Hãy nói: 'Mở nhạc Drive', 'Chơi ván tài xỉu'..."}&rdquo;
          </p>
          {aiReply && (
            <p className="text-xs text-sky-300 font-bold mt-2 flex items-center gap-1.5 animate-in fade-in">
              <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              {aiReply}
            </p>
          )}
        </div>

        {/* Quick Voice Command Preset Badges */}
        <div className="space-y-2 text-left">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block px-1">
            Hoặc nhấp để thử lệnh mẫu:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VOICE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(p.label);
                  processVoiceCommand(p.label);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all text-left flex flex-col justify-between"
              >
                <span>{p.label}</span>
                <span className="text-[9px] text-muted-foreground truncate">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
