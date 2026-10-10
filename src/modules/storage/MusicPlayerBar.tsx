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
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: string;
}

interface MusicPlayerBarProps {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  onClose: () => void;
  onTrackChange?: (track: AudioTrack) => void;
}

export function MusicPlayerBar({
  currentTrack,
  playlist,
  onClose,
  onTrackChange,
}: MusicPlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // When track changes, load and play
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setAudioError(null);
      setCurrentTime(0);
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio autoplay blocked or invalid URL", err);
          setIsPlaying(false);
        });
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAudioError("Không thể phát trực tiếp tệp này. Bạn có thể tải tệp về máy.");
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    if (onTrackChange) {
      onTrackChange(playlist[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    if (onTrackChange) {
      onTrackChange(playlist[prevIndex]);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[500px] z-50 animate-in slide-in-from-bottom-5 duration-300">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          if (isLoop) {
            audioRef.current?.play();
          } else {
            handleNext();
          }
        }}
        onError={() => {
          setAudioError("Tệp âm thanh Google Drive đang chuẩn bị hoặc cần cấp quyền tải trực tiếp.");
          setIsPlaying(false);
        }}
      />

      <div className="rounded-3xl glass-card p-4 border border-white/20 shadow-2xl backdrop-blur-xl bg-slate-950/85 text-white space-y-3">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Animated Vinyl / Artwork */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <Disc3
                className={cn(
                  "h-7 w-7 text-pink-400 transition-all",
                  isPlaying ? "animate-spin text-sky-400 duration-3000" : ""
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Drive Audio
                </span>
                {isPlaying && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-mono">
                    <span className="h-2 w-0.5 bg-emerald-400 animate-pulse" />
                    <span className="h-3 w-0.5 bg-emerald-400 animate-pulse delay-75" />
                    <span className="h-1.5 w-0.5 bg-emerald-400 animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate max-w-[240px] mt-0.5">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentTrack.artist || "Google Drive • DataVault Cloud"}
              </p>
            </div>
          </div>

          {/* Close Player Button */}
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Đóng trình phát"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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
            onClick={() => setIsLoop(!isLoop)}
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

        {/* Error / Notice message if any */}
        {audioError && (
          <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl text-center">
            {audioError}
          </p>
        )}
      </div>
    </div>
  );
}
