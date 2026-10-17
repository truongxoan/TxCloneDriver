"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../theme-engine/themeContext";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
  rotX?: number;
  rotSpeedX?: number;
  rotY?: number;
  rotSpeedY?: number;
}

export function SeasonalCanvas() {
  const { currentTheme, effectsEnabled, intensity, customEffectType, flowerType } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeEffect =
    customEffectType && customEffectType !== "theme-default"
      ? customEffectType
      : currentTheme.effectType;

  const currentFlower = flowerType || "sakura";

  useEffect(() => {
    if (!effectsEnabled || activeEffect === "none") {
      return;
    }

    // Check prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle count by intensity
    let maxParticles = 45;
    if (activeEffect === "blossom") {
      maxParticles = intensity === "low" ? 30 : intensity === "high" ? 100 : 58;
    } else {
      if (intensity === "low") maxParticles = 20;
      if (intensity === "high") maxParticles = 70;
    }

    const effect = activeEffect;

    const flowerPalettes: Record<string, string[]> = {
      sakura: ["#fbcfe8", "#f472b6", "#fda4af", "#ffe4e6", "#f9a8d4", "#fecdd3"],
      apricot: ["#fde047", "#facc15", "#eab308", "#fef08a", "#fef9c3", "#ca8a04"],
      rose: ["#f43f5e", "#e11d48", "#be123c", "#fda4af", "#fb7185", "#881337"],
      maple: ["#ea580c", "#f97316", "#eab308", "#c2410c", "#b45309", "#9a3412"],
    };

    const colorPalettes: Record<string, string[]> = {
      blossom: flowerPalettes[currentFlower] || flowerPalettes.sakura,
      leaves: ["#34d399", "#10b981", "#6ee7b7", "#fbbf24"],
      autumn: ["#ea580c", "#f97316", "#eab308", "#c2410c", "#b45309"],
      snow: ["#ffffff", "#e0f2fe", "#bae6fd", "#f8fafc"],
      fireworks: ["#ef4444", "#f59e0b", "#fbbf24", "#38bdf8", "#ec4899", "#a855f7", "#10b981"],
      lanterns: ["#f59e0b", "#f97316", "#fbbf24", "#ef4444", "#fed7aa"],
      sparkles: ["#10b981", "#ef4444", "#fbbf24", "#ffffff", "#86efac", "#fca5a5"],
      cosmic: ["#818cf8", "#38bdf8", "#c084fc", "#e0e7ff", "#22d3ee", "#a78bfa"],
      cyber: ["#06b6d4", "#ec4899", "#a855f7", "#3b82f6"],
      stars: ["#fef08a", "#fef9c3", "#e0e7ff", "#ffffff"],
      bubbles: ["#2dd4bf", "#38bdf8", "#99f6e4", "#7dd3fc"],
      "hud-grid": ["#00ffcc", "#06b6d4", "#38bdf8", "#3b82f6"],
      particles: ["#a855f7", "#ec4899", "#8b5cf6", "#f472b6"],
      thunderstorm: ["#c4b5fd", "#a78bfa", "#7c3aed", "#ddd6fe", "#94a3b8"],
    };

    const colors = colorPalettes[effect] || ["#ffffff"];

    const particles: Particle[] = [];

    const initParticle = (p?: Partial<Particle>): Particle => {
      const isSnowOrFall = effect === "snow" || effect === "autumn" || effect === "blossom" || effect === "leaves";
      const isRise = effect === "bubbles" || effect === "cyber" || effect === "lanterns" || effect === "fireworks";
      const isThunderstorm = effect === "thunderstorm";
      const isCosmic = effect === "cosmic";
      const isHudOrParticles = effect === "hud-grid" || effect === "particles";

      return {
        x: p?.x ?? Math.random() * width,
        y: p?.y ?? (isRise ? height + Math.random() * 50 : isHudOrParticles ? Math.random() * height : Math.random() * -50),
        size: effect === "blossom"
          ? Math.random() * 5 + 6.5
          : isThunderstorm
          ? Math.random() * 2.2 + 0.8
          : isCosmic
          ? Math.random() * 3.5 + 1
          : effect === "hud-grid"
          ? Math.random() * 5 + 6
          : effect === "particles"
          ? Math.random() * 4.5 + 2.5
          : effect === "lanterns"
          ? Math.random() * 6 + 7
          : effect === "fireworks"
          ? Math.random() * 4 + 2.5
          : Math.random() * (effect === "snow" ? 3.5 : effect === "cyber" ? 2.5 : 8) + 2,
        speedX: effect === "blossom"
          ? (Math.random() - 0.5) * 1.6 + 0.7
          : isThunderstorm
          ? 5 + Math.random() * 6
          : effect === "fireworks"
          ? (Math.random() - 0.5) * 3
          : isHudOrParticles
          ? (Math.random() - 0.5) * 0.9
          : (Math.random() - 0.5) * (effect === "autumn" || effect === "lanterns" ? 1.5 : 1),
        speedY: effect === "blossom"
          ? Math.random() * 1.3 + (intensity === "high" ? 1.5 : intensity === "low" ? 0.8 : 1.1)
          : isThunderstorm
          ? 22 + Math.random() * 16
          : effect === "lanterns"
          ? -(Math.random() * 1.0 + 0.4)
          : effect === "fireworks"
          ? -(Math.random() * 2.5 + 1.2)
          : isRise
          ? -(Math.random() * 1.2 + 0.6)
          : isHudOrParticles
          ? (Math.random() - 0.5) * 0.8
          : Math.random() * (effect === "snow" ? 1.2 : 1.8) + 0.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2,
        opacity: isThunderstorm
          ? Math.random() * 0.45 + 0.2
          : isHudOrParticles
          ? Math.random() * 0.55 + 0.35
          : Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        rotX: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.045,
        rotY: Math.random() * Math.PI * 2,
        rotSpeedY: (Math.random() - 0.5) * 0.035,
      };
    };

    // Initialize initial pool
    // Thunderstorm and fireworks benefit from lively particles
    const stormMaxParticles = effect === "thunderstorm" ? maxParticles * 4 : effect === "fireworks" ? maxParticles * 1.5 : maxParticles;
    for (let i = 0; i < stormMaxParticles; i++) {
      particles.push(initParticle({ y: Math.random() * height }));
    }

    let lastTime = performance.now();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isTabVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      // FPS drop protection: if frame time > 45ms (<22fps), reduce particles dynamically
      if (delta > 45 && particles.length > 15) {
        particles.pop();
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;

        const wobbleOffset = effect === "thunderstorm" ? 0 : Math.sin(p.wobble) * 1.2;
        p.x += p.speedX + wobbleOffset;
        p.y += p.speedY;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (effect === "snow") {
          // Soft circular snowflakes
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (effect === "autumn" || effect === "leaves") {
          // Leaf shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === "blossom") {
          // Dynamic 3D fluttering & realistic flower petal styling
          p.rotX = (p.rotX || 0) + (p.rotSpeedX || 0.025);
          p.rotY = (p.rotY || 0) + (p.rotSpeedY || 0.02);
          const scX = Math.cos(p.rotX);
          const scY = Math.sin(p.rotY);
          ctx.scale(Math.abs(scX) < 0.18 ? 0.18 : scX, Math.abs(scY) < 0.18 ? 0.18 : scY);

          const s = p.size;
          if (currentFlower === "sakura") {
            // Realistic cherry blossom petal with notched apex & stem
            ctx.beginPath();
            ctx.moveTo(0, s);
            ctx.bezierCurveTo(s * 1.1, s * 0.3, s * 1.0, -s * 0.7, s * 0.22, -s);
            ctx.lineTo(0, -s * 0.72);
            ctx.bezierCurveTo(-s * 0.22, -s, -s * 1.0, -s * 0.7, -s * 1.1, s * 0.3);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 3;
            ctx.fill();
          } else if (currentFlower === "apricot") {
            // Golden yellow apricot blossom petal with rich glow
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.88, s * 1.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 5;
            ctx.fill();
            // Golden center dot
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = "#ca8a04";
            ctx.fill();
          } else if (currentFlower === "rose") {
            // Deep romantic velvet rose petal
            ctx.beginPath();
            ctx.moveTo(0, s * 1.1);
            ctx.bezierCurveTo(s * 1.3, s * 0.2, s * 1.2, -s * 0.8, 0, -s * 1.1);
            ctx.bezierCurveTo(-s * 1.2, -s * 0.8, -s * 1.3, s * 0.2, 0, s * 1.1);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 4;
            ctx.fill();
          } else if (currentFlower === "maple") {
            // Autumn maple leaf
            ctx.beginPath();
            ctx.moveTo(0, -s * 1.3);
            ctx.lineTo(s * 0.35, -s * 0.6);
            ctx.lineTo(s * 1.1, -s * 0.4);
            ctx.lineTo(s * 0.5, s * 0.1);
            ctx.lineTo(s * 0.75, s * 0.9);
            ctx.lineTo(0, s * 0.5);
            ctx.lineTo(-s * 0.75, s * 0.9);
            ctx.lineTo(-s * 0.5, s * 0.1);
            ctx.lineTo(-s * 1.1, -s * 0.4);
            ctx.lineTo(-s * 0.35, -s * 0.6);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 3;
            ctx.fill();
          } else {
            // Default petal shape
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(s, 0, 0, s);
            ctx.quadraticCurveTo(-s, 0, 0, -s);
            ctx.fill();
          }
        } else if (effect === "cyber") {
          // Cyber square particle with glow
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (effect === "stars") {
          // Twinkling 4-point star
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.25, -s * 0.25);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.25, s * 0.25);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.25, s * 0.25);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.25, -s * 0.25);
          ctx.closePath();
          ctx.fill();
        } else if (effect === "bubbles") {
          // Bubble with shine
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          // Small highlight
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === "fireworks") {
          // Colorful firework spark burst with trail glow
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Spark tail
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-p.speedX * 2, -p.speedY * 2);
          ctx.stroke();
        } else if (effect === "lanterns") {
          // Vietnamese Mid-Autumn glowing lantern
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          // Lantern body
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.8, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          // Lantern cap & tassel
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(-p.size * 0.35, -p.size - 2, p.size * 0.7, 3);
          ctx.fillRect(-p.size * 0.15, p.size, p.size * 0.3, p.size * 0.6);
        } else if (effect === "sparkles") {
          // Christmas diamond sparkle
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s * 1.3);
          ctx.lineTo(s * 0.4, 0);
          ctx.lineTo(0, s * 1.3);
          ctx.lineTo(-s * 0.4, 0);
          ctx.closePath();
          ctx.fill();
        } else if (effect === "cosmic") {
          // Deep cosmic nebula star with double corona
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Subtle outer ring
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (effect === "thunderstorm") {
          // Photorealistic torrential rain streak with velocity-scaled tail
          const streakLen = 18 + p.speedY * 1.2;
          const slantAngle = Math.atan2(p.speedY, p.speedX);
          const endStreakX = Math.cos(slantAngle) * streakLen;
          const endStreakY = Math.sin(slantAngle) * streakLen;

          const grad = ctx.createLinearGradient(0, 0, endStreakX, endStreakY);
          grad.addColorStop(0, "rgba(224, 231, 255, 0.95)");
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, "rgba(147, 51, 234, 0)");

          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.7, p.size * 0.75);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(endStreakX, endStreakY);
          ctx.stroke();
        } else if (effect === "particles") {
          // VisionOS 3D Floating Spatial Frosted Glass Orbs & Prisms
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Refraction inner ring
          ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        } else if (effect === "hud-grid") {
          // Sci-Fi Cyber HUD Telemetry Node & Reticle
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.2;

          const s = p.size * 1.4;
          // Center dot
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Crosshairs
          ctx.beginPath();
          ctx.moveTo(-s, 0); ctx.lineTo(-s * 0.35, 0);
          ctx.moveTo(s * 0.35, 0); ctx.lineTo(s, 0);
          ctx.moveTo(0, -s); ctx.lineTo(0, -s * 0.35);
          ctx.moveTo(0, s * 0.35); ctx.lineTo(0, s);
          ctx.stroke();

          // Outer targeting ring
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // Boundary recycle
        if (effect === "thunderstorm") {
          if (p.y > height + 30 || p.x > width + 50) {
            particles[i] = initParticle({ x: Math.random() * width - 50, y: -20 - Math.random() * 50 });
          }
        } else if (effect === "hud-grid" || effect === "particles") {
          if (p.y < -30 || p.y > height + 30 || p.x < -30 || p.x > width + 30) {
            particles[i] = initParticle();
          }
        } else if (effect === "bubbles" || effect === "cyber" || effect === "lanterns" || effect === "fireworks") {
          if (p.y < -30 || p.x < -30 || p.x > width + 30) {
            particles[i] = initParticle();
          }
        } else if (effect === "blossom") {
          if (p.y > height + 30 || p.x > width + 50 || p.x < -60) {
            particles[i] = initParticle({
              x: Math.random() * (width + 120) - 60,
              y: -25 - Math.random() * 45,
            });
          }
        } else {
          if (p.y > height + 30 || p.x < -30 || p.x > width + 30) {
            particles[i] = initParticle();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Support manual firework burst
    const handleFireworkTrigger = () => {
      const colors = ["#ef4444", "#f59e0b", "#fbbf24", "#38bdf8", "#ec4899", "#a855f7", "#10b981"];
      const burstX = width * (0.2 + Math.random() * 0.6);
      const burstY = height * (0.2 + Math.random() * 0.4);
      for (let f = 0; f < 35; f++) {
        const angle = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 5;
        particles.push({
          x: burstX,
          y: burstY,
          size: Math.random() * 4 + 2,
          speedX: Math.cos(angle) * sp,
          speedY: Math.sin(angle) * sp,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 4,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          wobble: 0,
          wobbleSpeed: 0.05,
        });
      }
    };
    window.addEventListener("tx_trigger_firework", handleFireworkTrigger);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("tx_trigger_firework", handleFireworkTrigger);
    };
  }, [activeEffect, effectsEnabled, intensity, currentFlower]);

  if (!effectsEnabled || activeEffect === "none") {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
