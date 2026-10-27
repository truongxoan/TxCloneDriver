export type ThemeId =
  | "stark-jarvis"
  | "spring-blossom"
  | "summer-nature"
  | "autumn-leaves"
  | "winter-crystal"
  | "tet-fireworks"
  | "mid-autumn"
  | "christmas-magic"
  | "deep-space"
  | "cyber-3d"
  | "midnight-luxury"
  | "ocean-glass"
  | "minimal-pro"
  | "bento-grid"
  | "vision-os"
  | "cyber-hud"
  | "neo-brutalism"
  | "thunderstorm"
  | "synthwave-80s"
  | "matrix-rain"
  | "aurora-borealis"
  | "sunset-glow"
  | "custom";

export type EffectType =
  | "blossom"
  | "leaves"
  | "autumn"
  | "snow"
  | "fireworks"
  | "lanterns"
  | "sparkles"
  | "cosmic"
  | "cyber"
  | "stars"
  | "bubbles"
  | "hud-grid"
  | "particles"
  | "thunderstorm"
  | "synthwave"
  | "matrix"
  | "aurora"
  | "sunset"
  | "none";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  nameVi: string;
  description: string;
  effectType: EffectType;
  accentColor: string;
  primaryColor: string;
  badge: string;
  previewGradient: string;
  bgImage?: string;
  cssVars: Record<string, string>;
  /** Độ sâu 3D cho Card (translateZ khi hover), chỉ Theme Studio dùng. */
  depth?: number;
}
