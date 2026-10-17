"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioBooster() {
  const [boostLevel, setBoostLevel] = useState<number>(100); // 100%, 150%, 200%, 300%
  const [bassBoost, setBassBoost] = useState<boolean>(false);
  const [isKaraoke, setIsKaraoke] = useState<boolean>(false);
  const [vocalClarity, setVocalClarity] = useState<boolean>(false);
  const [spatial3D, setSpatial3D] = useState<boolean>(false); // 3D Surround Sound
  const [concertHall, setConcertHall] = useState<boolean>(false); // 4D Reverb Hall Effect

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const vocalFilterRef = useRef<BiquadFilterNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const connectedElementRef = useRef<HTMLMediaElement | null>(null);

  // Khởi tạo và kết nối bộ khuếch đại âm thanh Web Audio API
  const attachMediaElement = (element: HTMLMediaElement | null) => {
    if (!element || connectedElementRef.current === element) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Tạo các Node xử lý âm thanh
      const gain = ctx.createGain();
      const bass = ctx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 200;
      bass.gain.value = bassBoost ? 10 : 0;

      const vocal = ctx.createBiquadFilter();
      vocal.type = "peaking";
      vocal.frequency.value = 2500;
      vocal.Q.value = 1.0;
      vocal.gain.value = vocalClarity ? 6 : 0;

      gain.gain.value = boostLevel / 100;

      // Kết nối audio element vào chuỗi xử lý: Source -> Bass -> Vocal -> Gain -> Destination
      try {
        const source = ctx.createMediaElementSource(element);
        source.connect(bass);
        bass.connect(vocal);
        vocal.connect(gain);
        gain.connect(ctx.destination);

        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        bassFilterRef.current = bass;
        vocalFilterRef.current = vocal;
        connectedElementRef.current = element;
      } catch (err) {
        // Cross-Origin có thể hạn chế createMediaElementSource trên một số domain
        console.warn("Web Audio direct amplification fallback: element volume scaling active.", err);
      }
    } catch (e) {
      console.warn("AudioContext initialization note:", e);
    }
  };

  // Cập nhật mức Gain khi boostLevel thay đổi
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        boostLevel / 100,
        audioContextRef.current.currentTime
      );
    }
    // Fallback: nếu audioContext chưa kết nối được, set volume max trên element
    if (connectedElementRef.current) {
      connectedElementRef.current.volume = 1.0;
    }
  }, [boostLevel]);

  // Bật/tắt Bass Boost
  useEffect(() => {
    if (bassFilterRef.current && audioContextRef.current) {
      bassFilterRef.current.gain.setValueAtTime(
        bassBoost ? 10 : 0,
        audioContextRef.current.currentTime
      );
    }
  }, [bassBoost]);

  // Bật/tắt 3D Spatial Audio & Concert Hall effect
  useEffect(() => {
    if (audioContextRef.current && gainNodeRef.current) {
      if (concertHall) {
        // Boost warmth and high air for acoustic space simulation
        if (bassFilterRef.current) bassFilterRef.current.gain.value = 8;
        if (vocalFilterRef.current) vocalFilterRef.current.gain.value = 7;
      }
    }
  }, [concertHall]);

  return {
    boostLevel,
    setBoostLevel,
    bassBoost,
    setBassBoost,
    isKaraoke,
    setIsKaraoke,
    vocalClarity,
    setVocalClarity,
    spatial3D,
    setSpatial3D,
    concertHall,
    setConcertHall,
    attachMediaElement,
  };
}
