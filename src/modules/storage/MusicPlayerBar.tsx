"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  X,
  Music,
  Disc3,
  ExternalLink,
  Radio,
  AlertCircle,
  HelpCircle,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useMusicPlayer, AudioTrack } from "@/modules/audio/musicPlayerContext";
export type { AudioTrack };

interface MusicPlayerBarProps {
  currentTrack?: AudioTrack | null;
  playlist?: AudioTrack[];
  onClose?: () => void;
  onTrackChange?: (track: AudioTrack) => void;
}

export function MusicPlayerBar({
  currentTrack: propTrack,
  playlist: propPlaylist,
  onClose,
  onTrackChange,
}: MusicPlayerBarProps) {
  const global = useMusicPlayer();

  const currentTrack = propTrack !== undefined ? propTrack : global.currentTrack;
  const playlist = propPlaylist && propPlaylist.length > 0 ? propPlaylist : global.playlist;

  const isPlaying = global.isPlaying;
  const currentTime = global.currentTime;
  const duration = global.duration;
  const volume = global.volume;
  const isMuted = global.isMuted;
  const isLoop = global.isLoop;
  const isLoading = global.isLoading;
  const audioError = global.audioError;

  // Playback Mode: "direct" (HTML5 Audio via Global Player) or "drive_embed" (Google Drive Preview Player)
  const [useDriveEmbed, setUseDriveEmbed] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Determine if track is from Google Drive
  const isDriveTrack = Boolean(
    currentTrack &&
      currentTrack.id &&
      !currentTrack.id.startsWith("audio-demo") &&
      (currentTrack.url.includes("drive.google.com") || currentTrack.id.length > 20)
  );

  const togglePlay = () => {
    global.togglePlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    global.seek(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    global.setVolume(val);
  };

  const toggleMute = () => {
    global.toggleMute();
  };

  const toggleLoop = () => {
    global.toggleLoop();
  };

  const handleNext = () => {
    global.nextTrack();
    if (onTrackChange && global.currentTrack) {
      onTrackChange(global.currentTrack);
    }
  };

  const handlePrev = () => {
    global.prevTrack();
    if (onTrackChange && global.currentTrack) {
      onTrackChange(global.currentTrack);
    }
  };

  const handleClose = () => {
    global.closePlayer();
    if (onClose) {
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const drivePreviewUrl = `https://drive.google.com/file/d/${currentTrack.id}/preview`;
  const driveViewUrl = `https://drive.google.com/file/d/${currentTrack.id}/view`;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[540px] z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-3xl glass-card p-4 border border-white/20 shadow-2xl backdrop-blur-2xl bg-slate-950/90 text-white space-y-3">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Animated Vinyl / Artwork */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <Disc3
                className={cn(
                  "h-7 w-7 text-pink-400 transition-all",
                  isPlaying || useDriveEmbed ? "animate-spin text-sky-400 duration-3000" : ""
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {useDriveEmbed ? "Drive Iframe Player" : "Direct Audio"}
                </span>
                {(isPlaying || useDriveEmbed) && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-mono">
                    <span className="h-2 w-0.5 bg-emerald-400 animate-pulse" />
                    <span className="h-3 w-0.5 bg-emerald-400 animate-pulse delay-75" />
                    <span className="h-1.5 w-0.5 bg-emerald-400 animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate max-w-[260px] mt-0.5" title={currentTrack.title}>
                {currentTrack.title}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentTrack.artist || "Google Drive • TxCloneDriver Cloud"}
              </p>
            </div>
          </div>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Hướng dẫn phát nhạc Google Drive"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Đóng trình phát"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MODE 1: Google Drive Preview Player (Iframe Embed) */}
        {useDriveEmbed && isDriveTrack ? (
          <div className="space-y-2 pt-1 animate-in fade-in">
            <div className="rounded-2xl overflow-hidden border border-white/20 bg-black/60 shadow-inner">
              <iframe
                src={drivePreviewUrl}
                className="w-full h-28 border-0"
                allow="autoplay"
                title={currentTrack.title}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Phát qua session Google của bạn
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 text-[10px]"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở trên Drive
                </a>
                <button
                  onClick={() => setUseDriveEmbed(false)}
                  className="text-slate-400 hover:text-white underline text-[10px]"
                >
                  Thử phát trực tiếp
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MODE 2: Direct HTML5 Audio Player */
          <div className="space-y-3">
            {/* Seekbar & Time */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between pt-0.5">
              {/* Loop toggle */}
              <button
                onClick={toggleLoop}
                className={cn(
                  "p-2 rounded-xl transition-colors text-xs",
                  isLoop ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"
                )}
                title={isLoop ? "Đang bật lặp lại" : "Tắt lặp lại"}
              >
                <Repeat className="h-4 w-4" />
              </button>

              {/* Main Controls: Prev, Play/Pause, Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Bài trước"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Bài tiếp"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                  title={isMuted ? "Bật âm lượng" : "Tắt tiếng"}
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
                  className="w-16 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Warning & Fallback Switcher when Direct Stream encounters an error */}
        {audioError && !useDriveEmbed && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-start gap-2 text-amber-300 font-semibold text-[11px]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{audioError}</span>
            </div>

            {isDriveTrack && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setUseDriveEmbed(true)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/30 transition-all"
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>Bật Trình phát Drive Preview (Khuyên dùng)</span>
                </button>
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors"
                  title="Mở file trên tab Google Drive"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Expandable Help & Sharing Guide */}
        {showHelpGuide && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-2 animate-in fade-in">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-blue-400" />
              Tại sao tệp Google Drive không phát trực tiếp được?
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>1. Quyền riêng tư:</strong> Nếu tệp đang để <em>&ldquo;Bị hạn chế&rdquo;</em>, Google bắt buộc đăng nhập và chặn luồng phát audio ẩn danh.
              <br />
              <strong>2. Tệp quá lớn (&gt; 100MB):</strong> Các bản Nonstop từ 200MB - 500MB bị Google chặn quét virus tự động.
            </p>
            <p className="text-emerald-400 font-semibold">
              👉 Cách khắc phục: Trên Google Drive, chuột phải vào thư mục nhạc &rarr; chọn <strong>Chia sẻ (Share)</strong> &rarr; đổi quyền thành <strong>&ldquo;Bất kỳ ai có đường liên kết&rdquo; (Anyone with the link)</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
