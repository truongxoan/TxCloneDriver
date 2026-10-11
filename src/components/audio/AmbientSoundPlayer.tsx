"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Coffee,
  Headphones,
  Sliders,
  Play,
  Pause,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SoundTrack {
  id: "rain" | "ocean" | "cafe" | "lofi";
  name: string;
  icon: React.ElementType;
  volume: number; // 0 to 100
  isPlaying: boolean;
  color: string;
}

export function AmbientSoundPlayer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: "rain", name: "Mưa Rơi Rì Rào", icon: CloudRain, volume: 60, isPlaying: false, color: "text-sky-400" },
    { id: "ocean", name: "Sóng Biển Vỗ Về", icon: Waves, volume: 50, isPlaying: false, color: "text-teal-400" },
    { id: "cafe", name: "Quán Cà Phê Ấm", icon: Coffee, volume: 40, isPlaying: false, color: "text-amber-400" },
    { id: "lofi", name: "Lofi Beats Chill", icon: Headphones, volume: 70, isPlaying: false, color: "text-purple-400" },
  ]);

  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [masterPlaying, setMasterPlaying] = useState<boolean>(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, { gainNode: GainNode; stop: () => void }>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or get AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Noise generators
  const startTrackSound = (trackId: "rain" | "ocean" | "cafe" | "lofi", volume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Stop existing if any
    if (nodesRef.current[trackId]) {
      nodesRef.current[trackId].stop();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume / 100, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (trackId === "rain") {
      // Pink Noise for Rain
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 850;

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      nodesRef.current.rain = {
        gainNode: masterGain,
        stop: () => {
          try {
            whiteNoise.stop();
            whiteNoise.disconnect();
          } catch {}
        },
      };
    } else if (trackId === "ocean") {
      // Ocean wave surge (Pink noise + Slow LFO modulated filter)
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.07;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;

      // LFO for wave surges
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // 1 wave every 8 seconds
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 350;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      nodesRef.current.ocean = {
        gainNode: masterGain,
        stop: () => {
          try {
            noise.stop();
            lfo.stop();
            noise.disconnect();
          } catch {}
        },
      };
    } else if (trackId === "cafe") {
      // Warm gentle cafe noise
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 180;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.04;
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      nodesRef.current.cafe = {
        gainNode: masterGain,
        stop: () => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        },
      };
    } else if (trackId === "lofi") {
      // Gentle chord pad
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = 261.63; // C4
      osc2.frequency.value = 329.63; // E4

      const chordGain = ctx.createGain();
      chordGain.gain.value = 0.06;

      osc1.connect(chordGain);
      osc2.connect(chordGain);
      chordGain.connect(masterGain);
      osc1.start();
      osc2.start();

      nodesRef.current.lofi = {
        gainNode: masterGain,
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
        },
      };
    }
  };

  const stopTrackSound = (trackId: string) => {
    if (nodesRef.current[trackId]) {
      nodesRef.current[trackId].stop();
      delete nodesRef.current[trackId];
    }
  };

  const toggleTrack = (id: "rain" | "ocean" | "cafe" | "lofi") => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextPlaying = !t.isPlaying;
          if (nextPlaying) {
            startTrackSound(t.id, t.volume);
          } else {
            stopTrackSound(t.id);
          }
          return { ...t, isPlaying: nextPlaying };
        }
        return t;
      })
    );
  };

  const handleVolumeChange = (id: "rain" | "ocean" | "cafe" | "lofi", newVol: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (nodesRef.current[id]) {
            nodesRef.current[id].gainNode.gain.setValueAtTime(
              newVol / 100,
              audioCtxRef.current?.currentTime || 0
            );
          }
          return { ...t, volume: newVol };
        }
        return t;
      })
    );
  };

  const toggleAll = () => {
    const shouldPlay = !masterPlaying;
    setMasterPlaying(shouldPlay);
    if (shouldPlay) {
      setTracks((prev) =>
        prev.map((t) => {
          startTrackSound(t.id, t.volume);
          return { ...t, isPlaying: true };
        })
      );
    } else {
      tracks.forEach((t) => stopTrackSound(t.id));
      setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
    }
  };

  // Timer auto shut-off
  const setSleepTimer = (mins: number | null) => {
    setTimerMinutes(mins);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mins) {
      timerRef.current = setTimeout(() => {
        tracks.forEach((t) => stopTrackSound(t.id));
        setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
        setMasterPlaying(false);
        setTimerMinutes(null);
        alert("💤 Hẹn giờ thư giãn kết thúc. Chúc bạn nghỉ ngơi hoặc làm việc hiệu quả!");
      }, mins * 60 * 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/20 shadow-2xl space-y-5 bg-slate-950/90 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                Không Gian Âm Thanh Thư Giãn
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Lofi & White Noise • Tập trung học tập & làm việc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Control Bar */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-bold text-slate-300">
            {masterPlaying ? "🟢 Đang phát toàn bộ âm thanh" : "⚪ Tạm dừng tất cả"}
          </span>
          <button
            onClick={toggleAll}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5",
              masterPlaying
                ? "bg-rose-600 text-white shadow-rose-600/30"
                : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sky-500/30"
            )}
          >
            {masterPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {masterPlaying ? "Dừng Tất Cả" : "Phát Tất Cả"}
          </button>
        </div>

        {/* 4 Tracks Sliders */}
        <div className="space-y-3">
          {tracks.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3",
                  t.isPlaying
                    ? "bg-slate-900/90 border-sky-500/40 shadow-md"
                    : "bg-black/30 border-white/10 opacity-70"
                )}
              >
                <button
                  onClick={() => toggleTrack(t.id)}
                  className={cn(
                    "flex items-center gap-2.5 text-xs font-bold transition-colors text-left",
                    t.isPlaying ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                      t.isPlaying ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block leading-tight">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {t.isPlaying ? `${t.volume}%` : "Tắt"}
                    </span>
                  </div>
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={t.volume}
                    disabled={!t.isPlaying}
                    onChange={(e) => handleVolumeChange(t.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sleep Timer Bar */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Hẹn giờ tắt:
            </span>
            <span className="text-white font-mono">
              {timerMinutes ? `${timerMinutes} phút` : "Vô hạn"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 15, label: "15p" },
              { val: 30, label: "30p" },
              { val: 60, label: "60p" },
              { val: null, label: "Vô Hạn" },
            ].map((timer, idx) => (
              <button
                key={idx}
                onClick={() => setSleepTimer(timer.val)}
                className={cn(
                  "py-1.5 rounded-xl text-xs font-bold transition-all",
                  timerMinutes === timer.val
                    ? "bg-sky-500 text-white shadow-md font-black"
                    : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                )}
              >
                {timer.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
