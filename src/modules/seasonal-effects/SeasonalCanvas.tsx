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
}

export function SeasonalCanvas() {
  const { currentTheme, effectsEnabled, intensity } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!effectsEnabled || currentTheme.effectType === "none") {
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
    let maxParticles = 40;
    if (intensity === "low") maxParticles = 20;
    if (intensity === "high") maxParticles = 70;

    const effect = currentTheme.effectType;

    const colorPalettes: Record<string, string[]> = {
      blossom: ["#fbcfe8", "#f472b6", "#fda4af", "#ffe4e6"],
      leaves: ["#34d399", "#10b981", "#6ee7b7", "#fbbf24"],
      autumn: ["#ea580c", "#f97316", "#eab308", "#c2410c", "#b45309"],
      snow: ["#ffffff", "#e0f2fe", "#bae6fd", "#f8fafc"],
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
      const isRise = effect === "bubbles" || effect === "cyber";
      const isThunderstorm = effect === "thunderstorm";

      return {
        x: p?.x ?? Math.random() * width,
        y: p?.y ?? (isRise ? height + Math.random() * 50 : Math.random() * -50),
        size: isThunderstorm
          ? Math.random() * 1.5 + 0.5  // thin rain drops
          : Math.random() * (effect === "snow" ? 3.5 : effect === "cyber" ? 2.5 : 8) + 2,
        speedX: isThunderstorm
          ? 3 + Math.random() * 4  // wind pushes rain sideways
          : (Math.random() - 0.5) * (effect === "autumn" ? 1.5 : 1),
        speedY: isThunderstorm
          ? 12 + Math.random() * 10  // fast falling rain
          : isRise
            ? -(Math.random() * 1.2 + 0.6)
            : Math.random() * (effect === "snow" ? 1.2 : 1.8) + 0.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2,
        opacity: isThunderstorm
          ? Math.random() * 0.35 + 0.15
          : Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
      };
    };

    // Initialize initial pool
    // Thunderstorm needs more particles for dense rain
    const stormMaxParticles = effect === "thunderstorm" ? maxParticles * 3 : maxParticles;
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
          // Petal shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size, 0, 0, -p.size);
          ctx.fill();
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
        } else if (effect === "thunderstorm") {
          // Diagonal rain streaks
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.globalAlpha = p.opacity * 0.7;
          ctx.beginPath();
          // Rain streak: angled line ~20deg
          const len = 12 + p.size * 6;
          ctx.moveTo(0, 0);
          ctx.lineTo(len * 0.3, len);
          ctx.stroke();
        }

        ctx.restore();

        // Boundary recycle
        if (effect === "thunderstorm") {
          if (p.y > height + 30 || p.x > width + 50) {
            particles[i] = initParticle({ x: Math.random() * width - 50, y: -20 - Math.random() * 50 });
          }
        } else if (effect === "bubbles" || effect === "cyber") {
          if (p.y < -30 || p.x < -30 || p.x > width + 30) {
            particles[i] = initParticle();
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

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentTheme.effectType, effectsEnabled, intensity]);

  if (!effectsEnabled || currentTheme.effectType === "none") {
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
