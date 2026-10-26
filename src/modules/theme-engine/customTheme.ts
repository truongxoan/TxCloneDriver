import { EffectType, ThemeDefinition } from "./types";
import { THEMES } from "./themesData";

export const CUSTOM_THEME_KEY = "datavault_custom_theme";

export const CUSTOM_BG_IMAGES = [
  "/images/spring-blossom.jpg",
  "/images/summer-nature.jpg",
  "/images/autumn-leaves.jpg",
  "/images/winter-crystal.jpg",
  "/images/tet-fireworks.jpg",
  "/images/mid-autumn.jpg",
  "/images/christmas-magic.jpg",
  "/images/deep-space.jpg",
  "/images/cyber-3d.jpg",
  "/images/cyber-hud.jpg",
  "/images/midnight-luxury.jpg",
  "/images/ocean-glass.jpg",
  "/images/vision-os.jpg",
  "/images/thunderstorm.jpg",
  "/images/cat-mascot.jpg",
] as const;

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function loadCustomTheme(): ThemeDefinition | null {
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThemeDefinition;
    if (!parsed || parsed.id !== "custom" || typeof parsed.nameVi !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCustomTheme(theme: ThemeDefinition): void {
  try {
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(theme));
  } catch {
    // localStorage may fail in private mode
  }
}

export function removeCustomTheme(): void {
  try {
    localStorage.removeItem(CUSTOM_THEME_KEY);
  } catch {
    // ignore
  }
}

export interface BuildCustomThemeInput {
  nameVi: string;
  baseId: string;
  bgImage: string;
  primaryColor: string;
  accentColor: string;
  effectType: EffectType;
  depth: number;
}

/**
 * Tạo theme tùy chỉnh từ một theme có sẵn làm nền.
 * Chỉ đổi những biến thực sự thuộc về màu sắc / glow / nền / hiệu ứng,
 * giữ nguyên cấu trúc surface / foreground của theme gốc để không vỡ
 * độ tương phản và không phải viết lại toàn bộ cssVars.
 */
export function buildCustomTheme(input: BuildCustomThemeInput): ThemeDefinition {
  const base =
    THEMES.find((t) => t.id === input.baseId) || THEMES[0];
  const nameVi = input.nameVi.trim() || "Theme Của Tôi";
  return {
    id: "custom",
    name: "Custom Theme",
    nameVi,
    description: `Theme tự tạo từ ${base.nameVi}: nền, màu chính, màu accent, hiệu ứng và độ sâu 3D do bạn chọn.`,
    effectType: input.effectType,
    accentColor: input.accentColor,
    primaryColor: input.primaryColor,
    badge: "🎨 Tự Tạo",
    previewGradient: base.previewGradient,
    bgImage: input.bgImage,
    depth: input.depth,
    cssVars: {
      ...base.cssVars,
      "--primary": input.primaryColor,
      "--primary-glow": hexToRgba(input.primaryColor, 0.4),
      "--ring": input.primaryColor,
      "--accent": input.accentColor,
      "--accent-glow": hexToRgba(input.accentColor, 0.4),
      "--surface-border": hexToRgba(input.accentColor, 0.2),
    },
  };
}
