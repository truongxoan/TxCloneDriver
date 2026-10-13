"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "../theme-engine/themeContext";
import { playThunderSound } from "@/lib/soundEffects";

/**
 * Photorealistic Procedural Lightning & Storm Atmosphere Engine
 * - Midpoint Displacement Fractal Branching (Recursive Tree)
 * - Multi-pass Ionization Plasma Glow & Blinding White Arc Core
 * - Physically-accurate Stepped Leader & Return Stroke Re-strikes (Multi-pulsing)
 * - Cloud Sheet Lightning (Intra-cloud illumination) vs Ground Strikes
 * - Dynamic Ground Impact Burst & Spark Embers
 * - Atmospheric Shockwave Screen Shake
 */

interface Point {
  x: number;
  y: number;
}

interface LightningBranch {
  points: Point[];
  thickness: number;
  alpha: number;
  isMain: boolean;
}

interface LightningStrike {
  branches: LightningBranch[];
  origin: Point;
  target: Point;
  age: number; // in ms
  maxAge: number;
  intensity: number;
  isSheetOnly: boolean;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function StormOverlay() {
  const { currentTheme, effectsEnabled, intensity } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashOverlayRef = useRef<HTMLDivElement | null>(null);
  const cloudGlowRef = useRef<HTMLDivElement | null>(null);

  const [shakeClass, setShakeClass] = useState("");
  const animFrameRef = useRef<number | null>(null);
  const activeStrikesRef = useRef<LightningStrike[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const nextStrikeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isStorm = currentTheme.effectType === "thunderstorm" && effectsEnabled;

  // ─── Procedural Fractal Bolt Generator ────────────────────────
  const generateFractalSegment = useCallback(
    (
      start: Point,
      end: Point,
      displace: number,
      minSegmentLength: number,
      roughness: number
    ): Point[] => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minSegmentLength) {
        return [start, end];
      }

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      // Normal vector
      const nx = -dy / dist;
      const ny = dx / dist;

      // Random displacement along normal
      const offset = (Math.random() - 0.5) * 2 * displace;
      const mid: Point = {
        x: midX + nx * offset,
        y: midY + ny * offset,
      };

      const left = generateFractalSegment(
        start,
        mid,
        displace * roughness,
        minSegmentLength,
        roughness
      );
      const right = generateFractalSegment(
        mid,
        end,
        displace * roughness,
        minSegmentLength,
        roughness
      );

      return left.slice(0, -1).concat(right);
    },
    []
  );

  // Generate a complete multi-branched lightning strike
  const createLightningStrike = useCallback(
    (w: number, h: number): LightningStrike => {
      const isSheetOnly = Math.random() < 0.35; // 35% chance of cloud-to-cloud flash
      const startX = w * (0.15 + Math.random() * 0.7);
      const startY = Math.random() * (h * 0.15);

      const endX = isSheetOnly
        ? startX + (Math.random() - 0.5) * w * 0.6
        : w * (0.1 + Math.random() * 0.8);
      const endY = isSheetOnly
        ? startY + h * (0.2 + Math.random() * 0.3)
        : h * (0.75 + Math.random() * 0.25);

      const start: Point = { x: startX, y: startY };
      const end: Point = { x: endX, y: endY };

      const branches: LightningBranch[] = [];

      // Main trunk
      const mainPoints = generateFractalSegment(start, end, w * 0.12, 14, 0.58);
      branches.push({
        points: mainPoints,
        thickness: 3.2,
        alpha: 1.0,
        isMain: true,
      });

      // Generate realistic secondary & tertiary branches
      const numBranches = isSheetOnly
        ? 3 + Math.floor(Math.random() * 4)
        : 5 + Math.floor(Math.random() * 6);

      for (let i = 0; i < numBranches; i++) {
        // Pick random point along main trunk (favor upper & middle sections)
        const pointIdx = Math.floor(
          (0.15 + Math.random() * 0.7) * (mainPoints.length - 1)
        );
        const forkOrigin = mainPoints[pointIdx];
        if (!forkOrigin) continue;

        // Angle outward from main trajectory
        const branchLength = (h * (0.15 + Math.random() * 0.3)) * (isSheetOnly ? 0.7 : 1);
        const side = Math.random() < 0.5 ? -1 : 1;
        const angle = (Math.PI / 2) + side * (0.3 + Math.random() * 0.65);

        const forkTarget: Point = {
          x: forkOrigin.x + Math.cos(angle) * branchLength,
          y: forkOrigin.y + Math.sin(angle) * branchLength,
        };

        const branchPoints = generateFractalSegment(
          forkOrigin,
          forkTarget,
          w * 0.06,
          10,
          0.55
        );

        branches.push({
          points: branchPoints,
          thickness: 1.6,
          alpha: 0.85,
          isMain: false,
        });

        // Sub-branch (tertiary tendril)
        if (Math.random() < 0.45 && branchPoints.length > 4) {
          const subIdx = Math.floor(branchPoints.length * 0.5);
          const subOrigin = branchPoints[subIdx];
          const subLength = branchLength * 0.4;
          const subAngle = angle + (Math.random() - 0.5) * 0.8;
          const subTarget: Point = {
            x: subOrigin.x + Math.cos(subAngle) * subLength,
            y: subOrigin.y + Math.sin(subAngle) * subLength,
          };
          const subPoints = generateFractalSegment(
            subOrigin,
            subTarget,
            w * 0.03,
            8,
            0.5
          );
          branches.push({
            points: subPoints,
            thickness: 0.8,
            alpha: 0.6,
            isMain: false,
          });
        }
      }

      // If ground strike, create impact sparks at target
      if (!isSheetOnly) {
        const sparkCount = 18 + Math.floor(Math.random() * 20);
        for (let s = 0; s < sparkCount; s++) {
          const spAngle = -Math.PI * (0.1 + Math.random() * 0.8);
          const spSpeed = 3 + Math.random() * 9;
          sparksRef.current.push({
            x: end.x,
            y: end.y,
            vx: Math.cos(spAngle) * spSpeed,
            vy: Math.sin(spAngle) * spSpeed,
            life: 0,
            maxLife: 200 + Math.random() * 300,
            size: 1 + Math.random() * 2,
            color: Math.random() < 0.5 ? "#ffffff" : "#c084fc",
          });
        }
      }

      return {
        branches,
        origin: start,
        target: end,
        age: 0,
        maxAge: isSheetOnly ? 360 : 480,
        intensity: 1.0,
        isSheetOnly,
        color: Math.random() < 0.25 ? "#a855f7" : "#c084fc",
      };
    },
    [generateFractalSegment]
  );

  // Trigger lightning strike with multi-stroke stepped leader cycle
  const triggerLightningStrike = useCallback(() => {
    if (!isStorm) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const strike = createLightningStrike(canvas.width, canvas.height);
    activeStrikesRef.current.push(strike);

    const flash = flashOverlayRef.current;
    const cloudGlow = cloudGlowRef.current;

    // Physically-accurate Return Stroke Timing:
    // Stroke 1: Instant return stroke surge (100%)
    if (flash) {
      flash.style.opacity = strike.isSheetOnly ? "0.45" : "0.95";
      flash.style.transform = "scale(1.01)";
    }
    if (cloudGlow) {
      cloudGlow.style.opacity = "0.85";
      cloudGlow.style.background = `radial-gradient(ellipse 90% 60% at ${strike.origin.x}px 0px, rgba(230, 215, 255, 0.7) 0%, rgba(147, 51, 234, 0.35) 45%, transparent 75%)`;
    }

    if (!strike.isSheetOnly) {
      setShakeClass("storm-shake-intense");
    }

    // Realistic Web Audio Thunder Acoustic Shockwave
    playThunderSound(!strike.isSheetOnly);

    // Dip at 45ms
    setTimeout(() => {
      if (flash) flash.style.opacity = "0.2";
      if (cloudGlow) cloudGlow.style.opacity = "0.4";
    }, 45);

    // Stroke 2: Re-strike along same ionized path at 85ms
    setTimeout(() => {
      if (flash) flash.style.opacity = strike.isSheetOnly ? "0.3" : "0.75";
      if (cloudGlow) cloudGlow.style.opacity = "0.7";
    }, 85);

    // Dip at 130ms
    setTimeout(() => {
      if (flash) flash.style.opacity = "0.1";
      if (cloudGlow) cloudGlow.style.opacity = "0.3";
    }, 130);

    // Stroke 3: Final minor discharge pulse at 165ms
    setTimeout(() => {
      if (flash) flash.style.opacity = strike.isSheetOnly ? "0.15" : "0.4";
      if (cloudGlow) cloudGlow.style.opacity = "0.45";
    }, 165);

    // Smooth decay after 220ms
    setTimeout(() => {
      if (flash) flash.style.opacity = "0";
      if (cloudGlow) cloudGlow.style.opacity = "0";
      setShakeClass("");
    }, 320);
  }, [isStorm, createLightningStrike]);

  // Main Render Loop
  useEffect(() => {
    if (!isStorm) {
      document.documentElement.classList.remove("storm-wind-active");
      return;
    }

    document.documentElement.classList.add("storm-wind-active");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── 1. Render Active Lightning Strikes ────────────────────
      const strikes = activeStrikesRef.current;
      for (let i = strikes.length - 1; i >= 0; i--) {
        const s = strikes[i];
        s.age += dt;

        // Exponential decay of brightness
        const progress = s.age / s.maxAge;
        if (progress >= 1.0) {
          strikes.splice(i, 1);
          continue;
        }

        // Multi-pulsing flicker curve
        let pulseFactor = 1.0 - progress;
        if (s.age < 50) pulseFactor = 1.0;
        else if (s.age < 85) pulseFactor = 0.35 + (s.age - 50) / 35 * 0.65;
        else if (s.age < 140) pulseFactor = 0.85 - (s.age - 85) / 55 * 0.5;
        else if (s.age < 180) pulseFactor = 0.45 + (180 - s.age) / 40 * 0.3;
        else pulseFactor = Math.pow(1.0 - (s.age - 180) / (s.maxAge - 180), 2.2);

        pulseFactor = Math.max(0, Math.min(1, pulseFactor));

        // Draw each branch in multiple passes for realistic plasma aura
        for (const b of s.branches) {
          if (b.points.length < 2) continue;

          const branchAlpha = b.alpha * pulseFactor;
          if (branchAlpha <= 0.01) continue;

          // Pass A: Wide diffuse atmospheric plasma glow
          ctx.save();
          ctx.strokeStyle = "rgba(147, 51, 234, 0.35)";
          ctx.lineWidth = (b.thickness * 7) * pulseFactor;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 24;
          ctx.globalAlpha = branchAlpha * 0.6;
          ctx.beginPath();
          ctx.moveTo(b.points[0].x, b.points[0].y);
          for (let p = 1; p < b.points.length; p++) {
            ctx.lineTo(b.points[p].x, b.points[p].y);
          }
          ctx.stroke();
          ctx.restore();

          // Pass B: Intense Ionization Cyan/Violet Beam
          ctx.save();
          ctx.strokeStyle = "rgba(192, 132, 252, 0.85)";
          ctx.lineWidth = (b.thickness * 2.8) * pulseFactor;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "#e9d5ff";
          ctx.shadowBlur = 10;
          ctx.globalAlpha = branchAlpha * 0.9;
          ctx.beginPath();
          ctx.moveTo(b.points[0].x, b.points[0].y);
          for (let p = 1; p < b.points.length; p++) {
            ctx.lineTo(b.points[p].x, b.points[p].y);
          }
          ctx.stroke();
          ctx.restore();

          // Pass C: Razor-sharp Pure White Electric Core (Incandescent)
          ctx.save();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, (b.thickness * 0.9) * pulseFactor);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = branchAlpha;
          ctx.beginPath();
          ctx.moveTo(b.points[0].x, b.points[0].y);
          for (let p = 1; p < b.points.length; p++) {
            ctx.lineTo(b.points[p].x, b.points[p].y);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Draw ground impact burst flare
        if (!s.isSheetOnly && s.age < 180) {
          const flareAlpha = (1.0 - s.age / 180) * pulseFactor;
          const flareGrad = ctx.createRadialGradient(
            s.target.x,
            s.target.y,
            0,
            s.target.x,
            s.target.y,
            90
          );
          flareGrad.addColorStop(0, `rgba(255, 255, 255, ${flareAlpha * 0.9})`);
          flareGrad.addColorStop(0.3, `rgba(192, 132, 252, ${flareAlpha * 0.6})`);
          flareGrad.addColorStop(1, "rgba(124, 58, 237, 0)");

          ctx.save();
          ctx.fillStyle = flareGrad;
          ctx.beginPath();
          ctx.arc(s.target.x, s.target.y, 90, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── 2. Render Ground Impact Sparks ────────────────────────
      const sparks = sparksRef.current;
      for (let sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
        const sp = sparks[sIdx];
        sp.life += dt;
        if (sp.life >= sp.maxLife) {
          sparks.splice(sIdx, 1);
          continue;
        }

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.25; // gravity

        const spProgress = sp.life / sp.maxLife;
        const spAlpha = 1.0 - spProgress;

        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = spAlpha;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    // Schedule natural thunderstorm cadence:
    // Mix of close rapid strikes and distant rumbles
    const scheduleNext = () => {
      const minInterval = intensity === "high" ? 2200 : intensity === "low" ? 6000 : 3800;
      const maxRandom = intensity === "high" ? 4000 : intensity === "low" ? 9000 : 5500;
      const delay = minInterval + Math.random() * maxRandom;

      nextStrikeTimerRef.current = setTimeout(() => {
        triggerLightningStrike();
        // Sometimes a double thunder strike in quick succession (cluster strike)
        if (Math.random() < 0.35) {
          setTimeout(() => {
            triggerLightningStrike();
          }, 350 + Math.random() * 300);
        }
        scheduleNext();
      }, delay);
    };

    // First strike soon after load
    nextStrikeTimerRef.current = setTimeout(() => {
      triggerLightningStrike();
      scheduleNext();
    }, 1500 + Math.random() * 1500);

    return () => {
      document.documentElement.classList.remove("storm-wind-active");
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (nextStrikeTimerRef.current) clearTimeout(nextStrikeTimerRef.current);
    };
  }, [isStorm, intensity, triggerLightningStrike]);

  // Hook shake class to layout
  useEffect(() => {
    const shell = document.querySelector("[data-storm-target]");
    if (shell) {
      if (shakeClass) {
        shell.classList.add(shakeClass);
      } else {
        shell.classList.remove("storm-shake-intense");
      }
    }
  }, [shakeClass]);

  if (!isStorm) return null;

  return (
    <>
      {/* 1. Atmospheric Cloud Sheet Glow (Diffuse sky illumination) */}
      <div
        ref={cloudGlowRef}
        className="fixed inset-0 z-[88] pointer-events-none transition-opacity duration-150 opacity-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 2. Full-Screen Atmospheric Lightning Flash Overlay (Return Stroke) */}
      <div
        ref={flashOverlayRef}
        className="fixed inset-0 z-[89] pointer-events-none transition-opacity duration-75 opacity-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 75% at 50% 15%, rgba(255, 255, 255, 0.85) 0%, rgba(224, 231, 255, 0.5) 40%, rgba(147, 51, 234, 0.2) 75%, transparent 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* 3. High-Performance Procedural Lightning Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[90] pointer-events-none w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 4. Natural Dark Storm Cloud Gradient Atmosphere */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 70% at 50% -10%, rgba(59, 7, 100, 0.3) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)",
        }}
      />
    </>
  );
}
