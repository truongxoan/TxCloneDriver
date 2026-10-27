"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeId, ThemeDefinition, EffectType } from "./types";
import { THEMES } from "./themesData";
import {
  loadCustomTheme,
  removeCustomTheme,
  saveCustomTheme,
} from "./customTheme";

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
  isAutoSeason: boolean;
  setIsAutoSeason: (auto: boolean) => void;
  intensity: "low" | "medium" | "high";
  setIntensity: (intensity: "low" | "medium" | "high") => void;
  customEffectType: EffectType | "theme-default";
  setCustomEffectType: (effect: EffectType | "theme-default") => void;
  customTheme: ThemeDefinition | null;
  setCustomTheme: (theme: ThemeDefinition) => void;
  clearCustomTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSeasonTheme(): ThemeId {
  const month = new Date().getMonth() + 1; // 1 - 12
  if (month >= 2 && month <= 4) return "spring-blossom";
  if (month >= 5 && month <= 7) return "summer-nature";
  if (month >= 8 && month <= 10) return "autumn-leaves";
  return "winter-crystal";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("stark-jarvis"); // Mặc định mới: giao diện STARK // JARVIS HUD
  const [effectsEnabled, setEffectsEnabledState] = useState<boolean>(true);
  const [isAutoSeason, setIsAutoSeasonState] = useState<boolean>(false);
  const [intensity, setIntensityState] = useState<"low" | "medium" | "high">("medium");
  const [customEffectType, setCustomEffectTypeState] = useState<EffectType | "theme-default">("theme-default");
  const [customTheme, setCustomThemeState] = useState<ThemeDefinition | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("datavault_theme") as ThemeId;
      const savedEffects = localStorage.getItem("datavault_effects");
      const savedAuto = localStorage.getItem("datavault_auto_season");
      const savedIntensity = localStorage.getItem("datavault_intensity") as "low" | "medium" | "high";
      const savedCustomEffect = localStorage.getItem("datavault_custom_effect") as EffectType | "theme-default";

      const savedCustom = loadCustomTheme();
      if (savedCustom) setCustomThemeState(savedCustom);

      // Migration 1 lần: toàn bộ máy chuyển sang giao diện Stark HUD mới.
      const hudMigrated = localStorage.getItem("tx_hud_stark_v1");
      if (!hudMigrated) {
        localStorage.setItem("tx_hud_stark_v1", "1");
        localStorage.setItem("datavault_theme", "stark-jarvis");
        localStorage.setItem("datavault_auto_season", "false");
        setThemeIdState("stark-jarvis");
        setIsAutoSeasonState(false);
      } else if (savedAuto === "true") {
        setIsAutoSeasonState(true);
        setThemeIdState(getSeasonTheme());
      } else if (savedTheme === "custom" && savedCustom) {
        setThemeIdState("custom");
      } else if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setThemeIdState(savedTheme);
      }

      if (savedEffects !== null) {
        setEffectsEnabledState(savedEffects === "true");
      }

      if (savedIntensity) {
        setIntensityState(savedIntensity);
      }

      if (savedCustomEffect) {
        setCustomEffectTypeState(savedCustomEffect);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    setIsAutoSeasonState(false);
    // CRITICAL FIX: Reset custom effect so the newly selected theme's unique effects (rain, fireworks, blossom, etc.) activate immediately!
    setCustomEffectTypeState("theme-default");
    try {
      localStorage.setItem("datavault_theme", id);
      localStorage.setItem("datavault_auto_season", "false");
      localStorage.setItem("datavault_custom_effect", "theme-default");
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tx_theme_changed", { detail: { id } }));
    }
  };

  const setEffectsEnabled = (enabled: boolean) => {
    setEffectsEnabledState(enabled);
    try {
      localStorage.setItem("datavault_effects", enabled ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const setIsAutoSeason = (auto: boolean) => {
    setIsAutoSeasonState(auto);
    if (auto) {
      const seasonalTheme = getSeasonTheme();
      setThemeIdState(seasonalTheme);
      try {
        localStorage.setItem("datavault_theme", seasonalTheme);
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem("datavault_auto_season", auto ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const setIntensity = (val: "low" | "medium" | "high") => {
    setIntensityState(val);
    try {
      localStorage.setItem("datavault_intensity", val);
    } catch {
      // ignore
    }
  };

  const setCustomEffectType = (effect: EffectType | "theme-default") => {
    setCustomEffectTypeState(effect);
    try {
      localStorage.setItem("datavault_custom_effect", effect);
    } catch {
      // ignore
    }
  };

  const setCustomTheme = (theme: ThemeDefinition) => {
    setCustomThemeState(theme);
    saveCustomTheme(theme);
    setThemeIdState("custom");
    setIsAutoSeasonState(false);
    setCustomEffectTypeState("theme-default");
    try {
      localStorage.setItem("datavault_theme", "custom");
      localStorage.setItem("datavault_auto_season", "false");
      localStorage.setItem("datavault_custom_effect", "theme-default");
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tx_theme_changed", { detail: { id: "custom" } }));
    }
  };

  const clearCustomTheme = () => {
    setCustomThemeState(null);
    removeCustomTheme();
    setThemeIdState("autumn-leaves");
    try {
      localStorage.setItem("datavault_theme", "autumn-leaves");
    } catch {
      // ignore
    }
  };

  const currentTheme =
    themeId === "custom" && customTheme
      ? customTheme
      : THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Apply CSS variables to root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", currentTheme.id);

    Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    if (typeof currentTheme.depth === "number") {
      root.style.setProperty("--tx-depth", `${currentTheme.depth}px`);
    } else {
      root.style.removeProperty("--tx-depth");
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeId,
        setThemeId,
        effectsEnabled,
        setEffectsEnabled,
        isAutoSeason,
        setIsAutoSeason,
        intensity,
        setIntensity,
        customEffectType,
        setCustomEffectType,
        customTheme,
        setCustomTheme,
        clearCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
