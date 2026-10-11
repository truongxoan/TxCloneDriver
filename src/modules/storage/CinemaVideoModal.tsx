"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  X,
  Sun,
  Moon,
  ExternalLink,
  Radio,
  RotateCcw,
  RotateCw,
  Sparkles,
  Tv,
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
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Fullscreen & Theater Modes
  // By default: Full-window theater edge-to-edge (tràn toàn màn hình trình duyệt, che phủ dock & header)
  const [isFullWindow, setIsFullWindow] = useState(true);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Cinema Ambiance & Display Adjustments
  const [cinemaLightsOff, setCinemaLightsOff] = useState(true);
  const [fitMode, setFitMode] = useState<"contain" | "cover" | "16:9" | "21:9">("contain");
  const [useDriveEmbed, setUseDriveEmbed] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Trigger quick HUD action feedback badge
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 1800);
  };

  // Manage Auto-hide controls when user is inactive
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3200);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isPlaying, resetControlsTimer]);

  // Sync video source on change
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

  // Synchronize native fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsNativeFullscreen(isFs);
      if (isFs) setIsFullWindow(true);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Lock body scroll and set cinema active attribute on body while modal is open
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    document.body.classList.add("cinema-video-open");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("cinema-video-open");
    };
  }, []);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
      showNotice("Tạm dừng");
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          resetControlsTimer();
          showNotice("Đang phát");
        })
        .catch(() => setIsPlaying(false));
    }
  };

  // Seek time
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
    resetControlsTimer();
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration || 9999, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    resetControlsTimer();
    showNotice(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  };

  // Volume & Mute
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      const restoreVol = volume > 0 ? volume : 0.85;
      videoRef.current.volume = restoreVol;
      setIsMuted(false);
      showNotice(`Âm lượng: ${Math.round(restoreVol * 100)}%`);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
      showNotice("Đã tắt âm (Mute)");
    }
    resetControlsTimer();
  };

  // Fullscreen toggles
  const toggleNativeFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsNativeFullscreen(true);
          setIsFullWindow(true);
          showNotice("Toàn màn hình thiết bị (F11)");
        })
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsNativeFullscreen(false);
          showNotice("Thoát toàn màn hình");
        })
        .catch(() => {});
    }
    resetControlsTimer();
  };

  const toggleFullWindow = () => {
    setIsFullWindow((prev) => {
      const next = !prev;
      showNotice(next ? "Toàn màn hình tràn viền" : "Cửa sổ rạp chiếu");
      return next;
    });
    resetControlsTimer();
  };

  // Playback Speed
  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    showNotice(`Tốc độ: ${nextSpeed}x`);
    resetControlsTimer();
  };

  // Aspect ratio cycle
  const cycleFitMode = () => {
    const modes: Array<"contain" | "cover" | "16:9" | "21:9"> = ["contain", "cover", "16:9", "21:9"];
    const nextIdx = (modes.indexOf(fitMode) + 1) % modes.length;
    const next = modes[nextIdx];
    setFitMode(next);
    showNotice(
      next === "contain"
        ? "Khớp vừa khung hình (Fit)"
        : next === "cover"
        ? "Căng tràn toàn màn hình (Fill)"
        : next === "16:9"
        ? "Tỉ lệ 16:9 Chuẩn"
        : "Điện ảnh 21:9 Ultrawide"
    );
    resetControlsTimer();
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullWindow();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipSeconds(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skipSeconds(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, Math.round((v + 0.05) * 100) / 100);
            if (videoRef.current) videoRef.current.volume = next;
            setIsMuted(false);
            showNotice(`Âm lượng: ${Math.round(next * 100)}%`);
            return next;
          });
          resetControlsTimer();
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, Math.round((v - 0.05) * 100) / 100);
            if (videoRef.current) videoRef.current.volume = next;
            if (next === 0) setIsMuted(true);
            showNotice(`Âm lượng: ${Math.round(next * 100)}%`);
            return next;
          });
          resetControlsTimer();
          break;
        case "Escape":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            if (videoRef.current) videoRef.current.pause();
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, volume, duration]);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return "00:00";
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!mounted || !currentVideo) return null;

  const drivePreviewUrl = `https://drive.google.com/file/d/${currentVideo.id}/preview`;
  const driveViewUrl = `https://drive.google.com/file/d/${currentVideo.id}/view`;

  return createPortal(
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className={cn(
        "fixed inset-0 z-[200] transition-all duration-300 select-none flex flex-col justify-between overflow-hidden",
        cinemaLightsOff ? "bg-black" : "bg-slate-950/98 backdrop-blur-3xl",
        isFullWindow
          ? "w-screen h-screen p-0 m-0 rounded-none border-0"
          : "p-3 sm:p-6 sm:px-10 flex items-center justify-center bg-black/85 backdrop-blur-2xl"
      )}
      style={{
        cursor: showControls || !isPlaying ? "default" : "none",
      }}
    >
      {/* Container Box: When in windowed mode, it has card borders. When full-window, it fills 100% */}
      <div
        className={cn(
          "w-full h-full relative flex flex-col justify-between overflow-hidden transition-all duration-300",
          isFullWindow
            ? "w-full h-full rounded-none border-0"
            : "max-w-6xl max-h-[92vh] rounded-3xl border border-white/20 bg-black shadow-2xl"
        )}
      >
        {/* Quick HUD Action Feedback Badge */}
        {actionNotice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-5 py-2.5 rounded-2xl bg-black/85 border border-white/20 text-white font-bold text-sm shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOP HUD HEADER: TITLE & THEATER CONTROLS                 */}
        {/* ======================================================== */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 z-30 p-4 sm:px-8 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-all duration-300",
            showControls || !isPlaying
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          {/* Left: Video Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
              <Film className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 tracking-wide uppercase">
                  TxCloneDriver Cinema
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                  {currentVideo.resolution || "1080p FHD"}
                </span>
                {isFullWindow && (
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Toàn Màn Hình Tràn Viền
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md sm:max-w-xl mt-0.5 drop-shadow">
                {currentVideo.title}
              </h3>
            </div>
          </div>

          {/* Right: Window / Fullscreen Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle Full-Window Edge-to-Edge */}
            <button
              onClick={toggleFullWindow}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              title={isFullWindow ? "Thu nhỏ cửa sổ rạp chiếu" : "Mở rộng tràn toàn màn hình"}
            >
              {isFullWindow ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Thu nhỏ cửa sổ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Tràn toàn màn hình</span>
                </>
              )}
            </button>

            {/* Toggle Native Monitor Fullscreen (F11) */}
            <button
              onClick={toggleNativeFullscreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              title="Toàn màn hình thiết bị (F11)"
            >
              <Maximize className="h-4 w-4" />
            </button>

            {/* Dim Lights Toggle */}
            <button
              onClick={() => setCinemaLightsOff(!cinemaLightsOff)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer backdrop-blur-md",
                cinemaLightsOff
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                  : "bg-white/10 border-white/15 text-slate-300"
              )}
              title={cinemaLightsOff ? "Bật đèn phòng" : "Tắt đèn rạp chiếu phim"}
            >
              {cinemaLightsOff ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span>{cinemaLightsOff ? "Đã tắt đèn" : "Bật đèn"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                onClose();
              }}
              className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-lg"
              title="Đóng rạp phim (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN VIDEO THEATER SCREEN (FILLS VIEWPORT)               */}
        {/* ======================================================== */}
        <div
          onDoubleClick={toggleFullWindow}
          className="relative bg-black flex-1 w-full h-full flex items-center justify-center overflow-hidden group cursor-pointer"
        >
          {useDriveEmbed ? (
            /* Google Drive Embed Preview Iframe */
            <div className="w-full h-full bg-black flex items-center justify-center">
              <iframe
                src={drivePreviewUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                title={currentVideo.title}
              />
            </div>
          ) : (
            /* Native HTML5 Cinema Video Player */
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onClick={togglePlay}
                className={cn(
                  "w-full h-full transition-all duration-300",
                  fitMode === "cover"
                    ? "object-cover"
                    : fitMode === "16:9"
                    ? "aspect-video object-contain"
                    : fitMode === "21:9"
                    ? "aspect-[21/9] object-contain"
                    : "object-contain"
                )}
                playsInline
              />

              {/* Center Giant Play Button when paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer group/center"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-2xl group-hover/center:scale-110 active:scale-95 transition-transform duration-300 ring-4 ring-white/20">
                    <Play className="h-9 w-9 sm:h-11 sm:w-11 fill-current ml-1.5" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BOTTOM HUD CONTROLS: TIMELINE, AUDIO, SCREEN & SPEED     */}
        {/* ======================================================== */}
        {!useDriveEmbed && (
          <div
            className={cn(
              "absolute bottom-0 inset-x-0 z-30 p-4 sm:px-8 pb-6 sm:pb-8 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-3 transition-all duration-300",
              showControls || !isPlaying
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            {/* High-visibility Neon Seekbar */}
            <div className="space-y-1 group/bar">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #f43f5e ${
                      duration ? (currentTime / duration) * 100 : 0
                    }%, rgba(255,255,255,0.2) ${
                      duration ? (currentTime / duration) * 100 : 0
                    }%)`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-0.5">
                <span className="font-bold text-white">{formatSeconds(currentTime)}</span>
                <span className="text-slate-400">{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Controller Buttons Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Play, Skip ±10s, Volume, Time */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Main Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                  title="Phát / Dừng (Phím cách)"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Skip -10s */}
                <button
                  onClick={() => skipSeconds(-10)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Tua lùi 10 giây (Phím Mũi tên trái)"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Skip +10s */}
                <button
                  onClick={() => skipSeconds(10)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Tua tới 10 giây (Phím Mũi tên phải)"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                {/* Volume Slider & Mute */}
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-2xl border border-white/10">
                  <button
                    onClick={toggleMute}
                    className="p-1 text-slate-300 hover:text-white cursor-pointer"
                    title={isMuted ? "Bật tiếng (M)" : "Tắt tiếng (M)"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-slate-200" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Right: Aspect ratio, Speed, Fullscreen */}
              <div className="flex items-center gap-2 text-xs">
                {/* Speed Selector */}
                <button
                  onClick={changeSpeed}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold border border-white/15 transition-all cursor-pointer"
                  title="Tốc độ phát video"
                >
                  {playbackRate}x
                </button>

                {/* Aspect ratio & Fit Mode toggle */}
                <button
                  onClick={cycleFitMode}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Chuyển chế độ hiển thị khung hình"
                >
                  <Tv className="h-3.5 w-3.5 text-rose-400" />
                  <span>
                    {fitMode === "contain"
                      ? "Khớp (Fit)"
                      : fitMode === "cover"
                      ? "Tràn viền (Fill)"
                      : fitMode === "16:9"
                      ? "16:9"
                      : "21:9"}
                  </span>
                </button>

                {/* Toggle Full-Window */}
                <button
                  onClick={toggleFullWindow}
                  className="p-2 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
                  title={isFullWindow ? "Thu nhỏ cửa sổ" : "Mở rộng tràn toàn màn hình (F)"}
                >
                  {isFullWindow ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Thu nhỏ</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Toàn màn hình</span>
                    </>
                  )}
                </button>

                {/* Toggle Native Fullscreen */}
                <button
                  onClick={toggleNativeFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 cursor-pointer"
                  title="Toàn màn hình thiết bị (F11)"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bottom Sub-bar: Drive Preview Toggle & Drive External Link */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseDriveEmbed(!useDriveEmbed)}
                  className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Radio className="h-3 w-3 text-sky-400" />
                  <span>
                    {useDriveEmbed
                      ? "Đang dùng Drive Preview — Nhấn để về Trình phát Rạp phim"
                      : "Chuyển sang Drive Preview Iframe"}
                  </span>
                </button>
                <span className="hidden md:inline text-slate-500">&bull;</span>
                <span className="hidden md:inline text-slate-400">
                  Phím tắt: Space (Phát/Dừng), F (Toàn màn hình), M (Tắt tiếng), ←/→ (±10s)
                </span>
              </div>

              <a
                href={driveViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Mở trong Drive</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
