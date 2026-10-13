"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "../theme-engine/themeContext";

/**
 * StormOverlay — Full-screen lightning flash, crack SVG overlays,
 * wind-tilt effects on sidebar/header, and screen-shake animations.
 * Only active when the "thunderstorm" theme is selected.
 */
export function StormOverlay() {
  const { currentTheme, effectsEnabled } = useTheme();
  const [flashActive, setFlashActive] = useState(false);
  const [crackVisible, setCrackVisible] = useState(false);
  const [crackPath, setCrackPath] = useState("");
  const [crackOrigin, setCrackOrigin] = useState({ x: 50, y: 0 });
  const [shakeClass, setShakeClass] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isStorm = currentTheme.effectType === "thunderstorm" && effectsEnabled;

  // Generate a random lightning crack SVG path
  const generateCrackPath = useCallback(() => {
    const startX = 20 + Math.random() * 60; // 20-80% viewport width
    const startY = 0;
    let path = `M ${startX} ${startY}`;
    let cx = startX;
    let cy = startY;
    const segments = 6 + Math.floor(Math.random() * 6);

    for (let i = 0; i < segments; i++) {
      const dx = (Math.random() - 0.5) * 18;
      const dy = 8 + Math.random() * 14;
      cx += dx;
      cy += dy;
      path += ` L ${cx} ${cy}`;

      // Branch with 30% probability
      if (Math.random() < 0.3) {
        const bx = cx + (Math.random() - 0.5) * 20;
        const by = cy + 5 + Math.random() * 10;
        path += ` M ${cx} ${cy} L ${bx} ${by} M ${cx} ${cy}`;
      }
    }
    return { path, originX: startX, originY: startY };
  }, []);

  // Trigger a single lightning strike
  const triggerLightning = useCallback(() => {
    if (!isStorm) return;

    const { path, originX } = generateCrackPath();
    setCrackPath(path);
    setCrackOrigin({ x: originX, y: 0 });

    // Phase 1: Quick flash
    setFlashActive(true);
    setShakeClass("storm-shake");

    setTimeout(() => {
      setFlashActive(false);
    }, 80);

    // Phase 2: Second flash (double-strike effect)
    setTimeout(() => {
      setFlashActive(true);
      setCrackVisible(true);
      setTimeout(() => setFlashActive(false), 120);
    }, 200);

    // Phase 3: Remove shake & crack
    setTimeout(() => {
      setShakeClass("");
    }, 600);

    setTimeout(() => {
      setCrackVisible(false);
    }, 1800 + Math.random() * 1200);
  }, [isStorm, generateCrackPath]);

  // Schedule random lightning strikes
  useEffect(() => {
    if (!isStorm) {
      // Remove wind-tilt classes when storm is disabled
      document.documentElement.classList.remove("storm-wind-active");
      return;
    }

    // Add global wind-tilt class
    document.documentElement.classList.add("storm-wind-active");

    // Initial strike after 2-4 seconds
    timeoutRef.current = setTimeout(() => {
      triggerLightning();
    }, 2000 + Math.random() * 2000);

    // Recurring strikes every 4-10 seconds
    intervalRef.current = setInterval(() => {
      triggerLightning();
    }, 4000 + Math.random() * 6000);

    return () => {
      document.documentElement.classList.remove("storm-wind-active");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStorm, triggerLightning]);

  // Apply shake class to main layout
  useEffect(() => {
    const shell = document.querySelector("[data-storm-target]");
    if (shell) {
      if (shakeClass) {
        shell.classList.add(shakeClass);
      } else {
        shell.classList.remove("storm-shake");
      }
    }
  }, [shakeClass]);

  if (!isStorm) return null;

  return (
    <>
      {/* Full-screen lightning flash overlay */}
      <div
        className={`fixed inset-0 z-[90] pointer-events-none transition-opacity duration-75 ${
          flashActive ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(192,132,252,0.35), rgba(124,58,237,0.15), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* White flash for intensity */}
      <div
        className={`fixed inset-0 z-[91] pointer-events-none transition-opacity duration-50 ${
          flashActive ? "opacity-30" : "opacity-0"
        }`}
        style={{ background: "white" }}
      />

      {/* SVG crack overlay */}
      {crackVisible && (
        <svg
          className="fixed inset-0 z-[92] pointer-events-none w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(192,132,252,0.8))" }}
        >
          <defs>
            <linearGradient id="crack-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
            </linearGradient>
            <filter id="crack-glow">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={crackPath}
            stroke="url(#crack-gradient)"
            strokeWidth="0.35"
            fill="none"
            filter="url(#crack-glow)"
            className="storm-crack-animate"
          />
          {/* Thicker glow layer */}
          <path
            d={crackPath}
            stroke="rgba(192,132,252,0.3)"
            strokeWidth="1.2"
            fill="none"
            className="storm-crack-animate"
          />
        </svg>
      )}

      {/* Ambient rain streaks overlay (CSS-only) */}
      <div className="fixed inset-0 z-[1] pointer-events-none storm-rain-overlay" />

      {/* Wind-blown debris particles */}
      <div className="fixed inset-0 z-[2] pointer-events-none storm-wind-particles" />
    </>
  );
}
