"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Tv,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoItem {
  id: string;
  title: string;
  duration?: string;
  resolution?: string;
  url: string;
  thumbnailUrl?: string;
  sizeBytes?: number;
}

interface CinemaVideoModalProps {
  currentVideo: VideoItem | null;
  videoPlaylist: VideoItem[];
  onClose: () => void;
  onVideoSelect?: (video: VideoItem) => void;
}

export default function CinemaVideoModal({
  currentVideo,
  videoPlaylist,
  onClose,
  onVideoSelect,
}: CinemaVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cinema Modes
  const [cinemaLightsOff, setCinemaLightsOff] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "21:9" | "auto">("16:9");
  const [useDriveEmbed, setUseDriveEmbed] = useState(false);

  // When video changes
  useEffect(() => {
    if (currentVideo && videoRef.current && !useDriveEmbed) {
      setCurrentTime(0);
      videoRef.current.src = currentVideo.url;
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentVideo, useDriveEmbed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!currentVideo) return null;

  const drivePreviewUrl = `https://drive.google.com/file/d/${currentVideo.id}/preview`;
  const driveViewUrl = `https://drive.google.com/file/d/${currentVideo.id}/view`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 transition-all duration-500 overflow-y-auto",
        cinemaLightsOff ? "bg-black/95 backdrop-blur-3xl" : "bg-black/80 backdrop-blur-md"
      )}
    >
      <div className="w-full max-w-6xl rounded-3xl border border-white/20 bg-slate-950/95 shadow-2xl overflow-hidden flex flex-col space-y-0 relative animate-in zoom-in-95 duration-300">
        {/* Cinema Ambient Ambilight Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl -z-10 pointer-events-none opacity-50" />

        {/* Top Bar: Title & Theater Controls */}
        <div className="p-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
              <Film className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  TxCloneDriver Cinema
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white">
                  {currentVideo.resolution || "1080p FHD"}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md mt-0.5">
                {currentVideo.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dim Lights Toggle */}
            <button
              onClick={() => setCinemaLightsOff(!cinemaLightsOff)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                cinemaLightsOff
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                  : "bg-white/10 border-white/15 text-slate-300"
              )}
              title={cinemaLightsOff ? "Bật đèn phòng" : "Tắt đèn rạp chiếu phim"}
            >
              {cinemaLightsOff ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span>{cinemaLightsOff ? "Đã tắt đèn rạp" : "Bật đèn"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Đóng rạp phim"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Theater Screen */}
        <div className="relative bg-black flex items-center justify-center overflow-hidden w-full group">
          {useDriveEmbed ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                src={drivePreviewUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                title={currentVideo.title}
              />
            </div>
          ) : (
            <div
              className={cn(
                "relative w-full transition-all duration-300 flex items-center justify-center bg-black",
                aspectRatio === "21:9"
                  ? "aspect-[21/9]"
                  : aspectRatio === "16:9"
                  ? "aspect-video"
                  : "aspect-auto max-h-[70vh]"
              )}
            >
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
              />

              {/* Center Play overlay button when paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                >
                  <div className="h-20 w-20 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Controls Bar (for native video mode) */}
        {!useDriveEmbed && (
          <div className="p-4 sm:px-6 bg-slate-950 border-t border-white/10 space-y-3">
            {/* Seekbar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Controller Buttons */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="h-9 w-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-300 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Theater Mode & Screen Toggles */}
              <div className="flex items-center gap-2 text-xs">
                {/* Speed */}
                <button
                  onClick={changeSpeed}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold"
                  title="Tốc độ phát"
                >
                  {playbackRate}x
                </button>

                {/* Aspect ratio */}
                <button
                  onClick={() =>
                    setAspectRatio(aspectRatio === "16:9" ? "21:9" : "16:9")
                  }
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-semibold"
                  title="Tỉ lệ màn hình rạp chiếu"
                >
                  {aspectRatio === "21:9" ? "Điện ảnh 21:9" : "Chuẩn 16:9"}
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                  title="Toàn màn hình"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dual Mode Switcher Footer */}
        <div className="p-3 px-6 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseDriveEmbed(!useDriveEmbed)}
              className={cn(
                "px-3 py-1 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5",
                useDriveEmbed
                  ? "bg-blue-600 text-white border-blue-400"
                  : "bg-white/5 border-white/15 text-slate-300 hover:text-white"
              )}
            >
              <Radio className="h-3 w-3" />
              <span>
                {useDriveEmbed ? "Đang dùng Trình phát Drive Preview" : "Chuyển sang Drive Preview"}
              </span>
            </button>
            <span className="hidden md:inline text-[11px] text-slate-400">
              Hỗ trợ xem video & phim không giới hạn dung lượng
            </span>
          </div>

          <a
            href={driveViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Mở trong Drive</span>
          </a>
        </div>
      </div>
    </div>
  );
}
