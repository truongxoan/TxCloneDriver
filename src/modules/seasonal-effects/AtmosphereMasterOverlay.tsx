"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "../theme-engine/themeContext";
import {
  playFireworkSound,
  playShootingStarSound,
  playCrystalChimeSound,
  playWaterBubbleSound,
  playCyberSweepSound,
  playGentleWindSound,
} from "@/lib/soundEffects";
import { StormOverlay } from "./StormOverlay";

/**
 * Universal Dynamic 4D Atmosphere & Effects Engine
 * Delivers full-screen cinematic, living atmospheric phenomena for ALL themes:
 * - tet-fireworks / fireworks: Procedural rocket launches, chrysanthemum starbursts, radial flash, sound!
 * - deep-space / cosmic: Blazing shooting stars (sao băng) with plasma tails & celestial chimes!
 * - mid-autumn / lanterns: Moon godrays, floating candlelit lanterns & glowing fireflies!
 * - spring-blossom / blossom: 3D sakura petal wind gusts swirling across the screen!
 * - autumn-leaves / autumn: Autumn vortex of red maple and golden leaves!
 * - christmas-magic / sparkles / winter-crystal: Multi-layer blizzard, frosted ice corners, bell sparkles!
 * - ocean-glass / bubbles: Underwater sunlight caustics & rising iridescent bubbles with pop sounds!
 * - cyber-3d / cyber-hud: Laser scanlines, holographic tactical radar & digital telemetry blips!
 * - midnight-luxury / stars: Cascading royal gold stardust shower & celestial diamond flares!
 * - thunderstorm: Epic fractal lightning strikes, torrential rain, and thunder shockwaves!
 */

// ─── Firework Rocket & Burst Particle ────────────────────────
interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
  trail: { x: number; y: number }[];
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  isAlive: boolean;
}

// ─── Shooting Star (Meteor) ──────────────────────────────────
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}

// ─── Wind Petal / Leaf ───────────────────────────────────────
interface WindPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  size: number;
  color: string;
  type: "sakura" | "maple" | "leaf";
  alpha: number;
}

// ─── Floating Lantern / Firefly ──────────────────────────────
interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  angle: number;
  speed: number;
  radius: number;
  color: string;
  size: number;
  glow: number;
}

// ─── Ocean Caustic & Bubble ──────────────────────────────────
interface OceanBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
}

export function AtmosphereMasterOverlay() {
  const { currentTheme, effectsEnabled, intensity, customEffectType, flowerType } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashOverlayRef = useRef<HTMLDivElement | null>(null);

  const activeEffect =
    customEffectType && customEffectType !== "theme-default"
      ? customEffectType
      : currentTheme.effectType;

  const currentFlower = flowerType || "sakura";

  // Particle Pools
  const fireworksSparksRef = useRef<FireworkSpark[]>([]);
  const fireworksRocketsRef = useRef<FireworkRocket[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const windPetalsRef = useRef<WindPetal[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const oceanBubblesRef = useRef<OceanBubble[]>([]);

  // Flash Screen Helper
  const triggerScreenFlash = useCallback((colorRgba: string, durationMs = 250) => {
    const flash = flashOverlayRef.current;
    if (!flash) return;
    flash.style.backgroundColor = colorRgba;
    flash.style.opacity = "0.45";
    setTimeout(() => {
      if (flash) flash.style.opacity = "0";
    }, durationMs);
  }, []);

  // ─── Firework Launch & Detonation ──────────────────────────
  const launchFirework = useCallback((startX?: number, targetY?: number) => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const colors = [
      "#ef4444", "#f59e0b", "#fbbf24", "#10b981", "#06b6d4",
      "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#ffffff"
    ];
    const pickColor = colors[Math.floor(Math.random() * colors.length)];

    const rocket: FireworkRocket = {
      x: startX ?? w * (0.15 + Math.random() * 0.7),
      y: h + 10,
      targetY: targetY ?? h * (0.15 + Math.random() * 0.35),
      vy: -(12 + Math.random() * 6),
      color: pickColor,
      isAlive: true,
    };
    fireworksRocketsRef.current.push(rocket);
  }, []);

  const detonateFirework = useCallback((x: number, y: number, baseColor: string) => {
    const colors = [baseColor, "#ffffff", "#fbbf24", "#f43f5e", "#38bdf8"];
    const sparkCount = intensity === "high" ? 75 : intensity === "low" ? 35 : 55;

    // Concussive audio & radial sky illumination
    playFireworkSound();
    triggerScreenFlash(baseColor, 180);

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7.5;
      fireworksSparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 50,
        size: Math.random() * 3 + 1.5,
        trail: [],
      });
    }
  }, [intensity, triggerScreenFlash]);

  // ─── Shooting Star Spawn ───────────────────────────────────
  const spawnShootingStar = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const startX = Math.random() * w * 0.8;
    const startY = Math.random() * h * 0.3;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.4; // diagonal down-right
    const speed = 18 + Math.random() * 14;

    playShootingStarSound();

    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 120 + Math.random() * 160,
      thickness: 2 + Math.random() * 1.5,
      alpha: 0,
      maxAlpha: 0.9,
      life: 0,
      maxLife: 35 + Math.random() * 25,
      color: Math.random() > 0.4 ? "#ffffff" : "#67e8f9",
    });
  }, []);

  // ─── Wind Gust for Cherry Blossom & Autumn Leaves ──────────
  const triggerWindGust = useCallback((type: "sakura" | "maple") => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    playGentleWindSound();

    const flowerColors: Record<string, string[]> = {
      sakura: ["#fbcfe8", "#f472b6", "#fda4af", "#ffe4e6", "#f9a8d4"],
      apricot: ["#fde047", "#facc15", "#eab308", "#fef08a", "#ca8a04"],
      rose: ["#f43f5e", "#e11d48", "#be123c", "#fda4af", "#fb7185"],
      maple: ["#ea580c", "#f97316", "#eab308", "#c2410c", "#b45309"],
    };

    const count = intensity === "high" ? 45 : intensity === "low" ? 18 : 28;
    const colors =
      type === "sakura"
        ? (flowerColors[currentFlower] || flowerColors.sakura)
        : flowerColors.maple;

    for (let i = 0; i < count; i++) {
      windPetalsRef.current.push({
        x: -50 - Math.random() * 200,
        y: Math.random() * h * 0.8,
        vx: 8 + Math.random() * 9,
        vy: 2 + Math.random() * 4,
        rotX: Math.random() * 360,
        rotY: Math.random() * 360,
        rotZ: Math.random() * 360,
        rotSpeedX: (Math.random() - 0.5) * 8,
        rotSpeedY: (Math.random() - 0.5) * 6,
        rotSpeedZ: (Math.random() - 0.5) * 4,
        size: type === "sakura" ? Math.random() * 6 + 6 : Math.random() * 8 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type === "sakura" ? "sakura" : "maple",
        alpha: 0.85,
      });
    }
  }, [intensity, currentFlower]);

  // ─── Main Atmospheric Animation & Scheduler Loop ───────────
  useEffect(() => {
    if (!effectsEnabled || activeEffect === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Reset all particle pools immediately on effect change to prevent cross-theme contamination
    fireworksSparksRef.current = [];
    fireworksRocketsRef.current = [];
    shootingStarsRef.current = [];
    windPetalsRef.current = [];
    firefliesRef.current = [];
    oceanBubblesRef.current = [];

    // Initialize Fireflies ONLY for mid-autumn / lanterns
    if (activeEffect === "lanterns") {
      const count = intensity === "high" ? 25 : 15;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        firefliesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          baseX: x,
          baseY: y,
          angle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03,
          radius: 30 + Math.random() * 50,
          color: Math.random() > 0.3 ? "#fef08a" : "#86efac",
          size: Math.random() * 2.5 + 2,
          glow: Math.random(),
        });
      }
    }

    // Initialize Ocean Bubbles ONLY for bubbles
    if (activeEffect === "bubbles") {
      const count = intensity === "high" ? 28 : 16;
      for (let i = 0; i < count; i++) {
        oceanBubblesRef.current.push({
          x: Math.random() * width,
          y: height + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(1.5 + Math.random() * 2),
          size: Math.random() * 8 + 3,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.02,
          alpha: Math.random() * 0.5 + 0.3,
        });
      }
    }

    let animId: number;
    let isTabVisible = true;
    const handleVis = () => {
      isTabVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVis);

    // Timers for automated periodic phenomena (STRICTLY MUTUALLY EXCLUSIVE by activeEffect)
    let effectTimer: NodeJS.Timeout | null = null;

    const schedulePeriodic = () => {
      if (activeEffect === "fireworks") {
        const delay = intensity === "high" ? 1800 : intensity === "low" ? 4000 : 2600;
        effectTimer = setTimeout(() => {
          launchFirework();
          if (Math.random() < 0.4) {
            setTimeout(() => launchFirework(), 350 + Math.random() * 250);
          }
          schedulePeriodic();
        }, delay);
      } else if (activeEffect === "cosmic" || activeEffect === "stars") {
        const delay = intensity === "high" ? 3000 : intensity === "low" ? 7000 : 4500;
        effectTimer = setTimeout(() => {
          spawnShootingStar();
          schedulePeriodic();
        }, delay);
      } else if (activeEffect === "blossom") {
        const delay = intensity === "high" ? 3500 : 5000;
        effectTimer = setTimeout(() => {
          triggerWindGust("sakura");
          schedulePeriodic();
        }, delay);
      } else if (activeEffect === "autumn" || activeEffect === "leaves") {
        const delay = intensity === "high" ? 3500 : 5000;
        effectTimer = setTimeout(() => {
          triggerWindGust("maple");
          schedulePeriodic();
        }, delay);
      } else if (activeEffect === "sparkles") {
        const delay = 4000;
        effectTimer = setTimeout(() => {
          playCrystalChimeSound();
          schedulePeriodic();
        }, delay);
      } else if (activeEffect === "cyber" || activeEffect === "hud-grid") {
        const delay = 5000;
        effectTimer = setTimeout(() => {
          playCyberSweepSound();
          schedulePeriodic();
        }, delay);
      }
    };

    // First trigger immediately on load so user sees and hears the effect at once!
    setTimeout(() => {
      if (activeEffect === "fireworks") {
        launchFirework(width * 0.5, height * 0.3);
      } else if (activeEffect === "cosmic" || activeEffect === "stars") {
        spawnShootingStar();
      } else if (activeEffect === "blossom") {
        triggerWindGust("sakura");
      } else if (activeEffect === "autumn" || activeEffect === "leaves") {
        triggerWindGust("maple");
      } else if (activeEffect === "sparkles") {
        playCrystalChimeSound();
      } else if (activeEffect === "cyber" || activeEffect === "hud-grid") {
        playCyberSweepSound();
      }
      schedulePeriodic();
    }, 300);

    // ─── Manual Event Listeners (Strictly check active effect) ───
    const handleFireworkEvent = () => {
      if (activeEffect === "fireworks") launchFirework();
    };
    const handleShootingStarEvent = () => {
      if (activeEffect === "cosmic" || activeEffect === "stars") spawnShootingStar();
    };
    const handleWindEvent = (e: any) => {
      if (activeEffect === "blossom" || activeEffect === "autumn" || activeEffect === "leaves") {
        triggerWindGust(e.detail?.type || (activeEffect === "blossom" ? "sakura" : "maple"));
      }
    };

    window.addEventListener("tx_trigger_firework", handleFireworkEvent);
    window.addEventListener("tx_trigger_shooting_star", handleShootingStarEvent);
    window.addEventListener("tx_trigger_wind_gust", handleWindEvent);

    // ─── Main Render Loop ───
    const render = () => {
      if (!isTabVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // If activeEffect is thunderstorm, this canvas stays completely clean (StormOverlay handles storm)
      if (activeEffect === "thunderstorm") {
        animId = requestAnimationFrame(render);
        return;
      }

      // ── 1. RENDER FIREWORKS ROCKETS & BURSTS ──────────────────────
      const rockets = fireworksRocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Glowing rocket head
        ctx.save();
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Spark trail
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(r.x + (Math.random() - 0.5) * 2, r.y + 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (r.y <= r.targetY) {
          detonateFirework(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      const sparks = fireworksSparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life++;
        if (sp.life >= sp.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        sp.trail.unshift({ x: sp.x, y: sp.y });
        if (sp.trail.length > 5) sp.trail.pop();

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.12; // gravity
        sp.vx *= 0.97; // air drag
        sp.vy *= 0.97;

        const progress = sp.life / sp.maxLife;
        sp.alpha = Math.max(0, 1 - progress);

        // Draw spark with trail
        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();

        if (sp.trail.length > 1) {
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = sp.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(sp.trail[0].x, sp.trail[0].y);
          for (let t = 1; t < sp.trail.length; t++) {
            ctx.lineTo(sp.trail[t].x, sp.trail[t].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── 2. RENDER SHOOTING STARS / METEORS ─────────────────────────
      const stars = shootingStarsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const st = stars[i];
        st.life++;
        if (st.life >= st.maxLife) {
          stars.splice(i, 1);
          continue;
        }

        st.x += st.vx;
        st.y += st.vy;

        // Fade in then out
        const p = st.life / st.maxLife;
        st.alpha = p < 0.2 ? (p / 0.2) * st.maxAlpha : (1 - (p - 0.2) / 0.8) * st.maxAlpha;

        const tailX = st.x - (st.vx / Math.hypot(st.vx, st.vy)) * st.length;
        const tailY = st.y - (st.vy / Math.hypot(st.vx, st.vy)) * st.length;

        ctx.save();
        ctx.globalAlpha = st.alpha;
        const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, st.color);
        grad.addColorStop(1, "transparent");

        ctx.strokeStyle = grad;
        ctx.lineWidth = st.thickness;
        ctx.lineCap = "round";
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor head bright dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.thickness * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 3. RENDER 3D SAKURA & AUTUMN PETALS VORTEX ─────────────────
      const petals = windPetalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const pt = petals[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.rotX += pt.rotSpeedX;
        pt.rotY += pt.rotSpeedY;
        pt.rotZ += pt.rotSpeedZ;

        if (pt.x > width + 50 || pt.y > height + 50) {
          petals.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate((pt.rotZ * Math.PI) / 180);
        const scaleX = Math.cos((pt.rotX * Math.PI) / 180);
        const scaleY = Math.sin((pt.rotY * Math.PI) / 180);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 4;

        if (pt.type === "sakura") {
          // Petal shape
          ctx.beginPath();
          ctx.moveTo(0, -pt.size);
          ctx.quadraticCurveTo(pt.size * 0.8, -pt.size * 0.2, 0, pt.size);
          ctx.quadraticCurveTo(-pt.size * 0.8, -pt.size * 0.2, 0, -pt.size);
          ctx.fill();
        } else {
          // Maple leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.size, pt.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 4. RENDER MID-AUTUMN FIREFLIES & GODRAYS ───────────────────
      if (activeEffect === "lanterns" || currentTheme.id === "mid-autumn") {
        const fList = firefliesRef.current;
        for (let i = 0; i < fList.length; i++) {
          const f = fList[i];
          f.angle += f.speed;
          f.x = f.baseX + Math.cos(f.angle) * f.radius;
          f.y = f.baseY + Math.sin(f.angle * 1.5) * (f.radius * 0.7);
          f.glow = (Math.sin(f.angle * 3) + 1) / 2; // pulsing brightness

          ctx.save();
          ctx.fillStyle = f.color;
          ctx.globalAlpha = 0.3 + f.glow * 0.7;
          ctx.shadowColor = f.color;
          ctx.shadowBlur = 12 + f.glow * 8;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size * (0.8 + f.glow * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── 5. RENDER OCEAN BUBBLES ────────────────────────────────────
      if (activeEffect === "bubbles" || currentTheme.id === "ocean-glass") {
        const bList = oceanBubblesRef.current;
        for (let i = 0; i < bList.length; i++) {
          const b = bList[i];
          b.wobble += b.wobbleSpeed;
          b.x += b.vx + Math.sin(b.wobble) * 0.8;
          b.y += b.vy;

          if (b.y < -20) {
            b.y = height + 20;
            b.x = Math.random() * width;
            if (Math.random() < 0.25) playWaterBubbleSound();
          }

          ctx.save();
          ctx.strokeStyle = "rgba(125, 211, 252, 0.7)";
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = b.alpha;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.stroke();

          // Bubble highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(b.x - b.size * 0.35, b.y - b.size * 0.35, b.size * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── 6. RENDER CYBER HUD LASER SCANLINE ─────────────────────────
      if (activeEffect === "hud-grid" || currentTheme.id === "cyber-hud" || currentTheme.id === "cyber-3d") {
        const scanY = (Date.now() * 0.12) % height;
        ctx.save();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("tx_trigger_firework", handleFireworkEvent);
      window.removeEventListener("tx_trigger_shooting_star", handleShootingStarEvent);
      window.removeEventListener("tx_trigger_wind_gust", handleWindEvent);
      if (effectTimer) clearTimeout(effectTimer);
    };
  }, [
    activeEffect,
    currentTheme.id,
    effectsEnabled,
    intensity,
    launchFirework,
    detonateFirework,
    spawnShootingStar,
    triggerWindGust,
  ]);

  if (!effectsEnabled || activeEffect === "none") return null;

  return (
    <>
      {/* 1. Global Atmospheric Screen Flash (Illuminates upon fireworks & cosmic bursts) */}
      <div
        ref={flashOverlayRef}
        className="fixed inset-0 z-[78] pointer-events-none transition-opacity duration-150 opacity-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 2. Full-Screen Atmospheric Master Canvas (Foreground Layer for 3D realism) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[79] pointer-events-none w-full h-full overflow-hidden"
        style={{ mixBlendMode: "screen" }}
        aria-hidden="true"
      />

      {/* 3. Specialized Procedural Thunderstorm Engine */}
      <StormOverlay />
    </>
  );
}
