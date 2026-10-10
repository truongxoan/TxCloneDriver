"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeId, ThemeDefinition } from "./types";
import { THEMES } from "./themesData";

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
  const [themeId, setThemeIdState] = useState<ThemeId>("autumn-leaves"); // Defaulting to current season (Oct)
  const [effectsEnabled, setEffectsEnabledState] = useState<boolean>(true);
  const [isAutoSeason, setIsAutoSeasonState] = useState<boolean>(false);
  const [intensity, setIntensityState] = useState<"low" | "medium" | "high">("medium");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("datavault_theme") as ThemeId;
      const savedEffects = localStorage.getItem("datavault_effects");
      const savedAuto = localStorage.getItem("datavault_auto_season");
      const savedIntensity = localStorage.getItem("datavault_intensity") as "low" | "medium" | "high";

      if (savedAuto === "true") {
        setIsAutoSeasonState(true);
        setThemeIdState(getSeasonTheme());
      } else if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setThemeIdState(savedTheme);
      }

      if (savedEffects !== null) {
        setEffectsEnabledState(savedEffects === "true");
      }

      if (savedIntensity) {
        setIntensityState(savedIntensity);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    setIsAutoSeasonState(false);
    try {
      localStorage.setItem("datavault_theme", id);
      localStorage.setItem("datavault_auto_season", "false");
    } catch {
      // ignore
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

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Apply CSS variables to root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", currentTheme.id);

    Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
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
