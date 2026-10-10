export type ThemeId =
  | "spring-blossom"
  | "summer-nature"
  | "autumn-leaves"
  | "winter-crystal"
  | "cyber-3d"
  | "midnight-luxury"
  | "ocean-glass"
  | "minimal-pro";

export type EffectType =
  | "blossom"
  | "leaves"
  | "autumn"
  | "snow"
  | "cyber"
  | "stars"
  | "bubbles"
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
}
