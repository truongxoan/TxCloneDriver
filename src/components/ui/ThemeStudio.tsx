"use client";

import { useEffect, useState } from "react";
import { DepthCard } from "@/components/ui/DepthCard";
import { useTheme } from "@/modules/theme-engine/themeContext";
import { THEMES } from "@/modules/theme-engine/themesData";
import { EffectType } from "@/modules/theme-engine/types";
import {
  CUSTOM_BG_IMAGES,
  buildCustomTheme,
} from "@/modules/theme-engine/customTheme";
import { cn } from "@/lib/utils";

const EFFECTS: Array<{ id: EffectType; label: string }> = [
  { id: "none", label: "Không hiệu ứng hạt" },
  { id: "blossom", label: "Hoa anh đào" },
  { id: "leaves", label: "Lá rơi" },
  { id: "autumn", label: "Lá phong" },
  { id: "snow", label: "Tuyết" },
  { id: "fireworks", label: "Pháo hoa" },
  { id: "lanterns", label: "Đèn lồng" },
  { id: "sparkles", label: "Ánh sao" },
  { id: "cosmic", label: "Vũ trụ" },
  { id: "cyber", label: "Hạt Cyber" },
  { id: "stars", label: "Sao lấp lánh" },
  { id: "bubbles", label: "Bong bóng" },
  { id: "hud-grid", label: "Lưới HUD" },
  { id: "particles", label: "Hạt VisionOS" },
  { id: "thunderstorm", label: "Mưa bão" },
  { id: "synthwave", label: "Neon Retro" },
  { id: "matrix", label: "Mưa Matrix" },
  { id: "aurora", label: "Cực quang" },
  { id: "sunset", label: "Hoàng hôn" },
];

/**
 * ThemeStudio — tự tạo theme, giai đoạn 3.
 * - Bắt đầu từ một theme có sẵn để giữ độ tương phản an toàn.
 * - Chọn ảnh nền (chỉ ảnh đã có trong public/images), màu chính,
 *   màu accent, hiệu ứng hạt và độ sâu 3D.
 * - Xem trước trực tiếp bằng DepthCard với đúng màu / nền / độ sâu
 *   đã chọn, chưa áp dụng lên toàn trang cho tới khi bấm Lưu.
 * - Lưu & Áp dụng: ghi theme tùy chỉnh vào localStorage
 *   (datavault_custom_theme) qua ThemeProvider và chuyển themeId
 *   thành "custom", nên theme vẫn còn sau khi tải lại trang.
 * - Xóa theme tùy chỉnh: quay về Autumn Leaves và xóa bản lưu.
 */
export function ThemeStudio() {
  const { currentTheme, customTheme, setCustomTheme, clearCustomTheme } =
    useTheme();

  const [baseId, setBaseId] = useState<string>(currentTheme.id);
  const [nameVi, setNameVi] = useState<string>(
    customTheme?.nameVi || "Theme Của Tôi"
  );
  const [bgImage, setBgImage] = useState<string>(
    customTheme?.bgImage || currentTheme.bgImage || "/images/cyber-3d.jpg"
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    customTheme?.primaryColor || currentTheme.primaryColor
  );
  const [accentColor, setAccentColor] = useState<string>(
    customTheme?.accentColor || currentTheme.accentColor
  );
  const [effectType, setEffectType] = useState<EffectType>(
    customTheme?.effectType || currentTheme.effectType
  );
  const [depth, setDepth] = useState<number>(customTheme?.depth ?? 8);
  const [saved, setSaved] = useState<boolean>(false);
  // Backgrounds that failed to load (e.g. a missing /images/*.jpg on the
  // deployed site) are swapped for a gradient tile instead of rendering
  // as a dark empty tile (audit fix #3). All 15 entries in
  // CUSTOM_BG_IMAGES were verified to exist in public/images at fix time;
  // this is the safety net for any future missing file.
  const [failedBgImages, setFailedBgImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (customTheme) {
      setBaseId("custom");
      setNameVi(customTheme.nameVi);
      if (customTheme.bgImage) setBgImage(customTheme.bgImage);
      setPrimaryColor(customTheme.primaryColor);
      setAccentColor(customTheme.accentColor);
      setEffectType(customTheme.effectType);
      setDepth(customTheme.depth ?? 8);
    }
  }, [customTheme]);

  const handleBaseChange = (id: string) => {
    setBaseId(id);
    if (id === "custom" && customTheme) return;
    const base = THEMES.find((t) => t.id === id);
    if (!base) return;
    if (base.bgImage) setBgImage(base.bgImage);
    setPrimaryColor(base.primaryColor);
    setAccentColor(base.accentColor);
    setEffectType(base.effectType);
  };

  const handleSave = () => {
    const theme = buildCustomTheme({
      nameVi,
      baseId: baseId === "custom" ? "autumn-leaves" : baseId,
      bgImage,
      primaryColor,
      accentColor,
      effectType,
      depth,
    });
    setCustomTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section aria-label="Theme Studio tự tạo theme" className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">
          🎨 Theme Studio — Tự tạo theme của bạn
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Chọn nền, màu và hiệu ứng, xem trước trực tiếp, rồi bấm Lưu & Áp
          dụng để dùng ngay trên toàn trang. Theme tùy chỉnh được lưu trên
          trình duyệt của bạn và vẫn còn sau khi tải lại trang.
        </p>
        {customTheme && (
          <p className="mt-2 text-xs font-bold text-emerald-300">
            Đang dùng theme tùy chỉnh: {customTheme.nameVi}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-foreground">Tên theme</span>
            <input
              value={nameVi}
              onChange={(e) => setNameVi(e.target.value)}
              placeholder="Ví dụ: Neon Của Tôi"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-foreground">
              Bắt đầu từ theme có sẵn
            </span>
            <select
              value={baseId}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameVi} ({t.name})
                </option>
              ))}
              {customTheme && <option value="custom">Theme tùy chỉnh hiện tại</option>}
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">Ảnh nền</span>
            <div className="grid grid-cols-5 gap-2">
              {CUSTOM_BG_IMAGES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setBgImage(src)}
                  aria-label={`Chọn nền ${src}`}
                  className={cn(
                    "h-12 overflow-hidden rounded-xl border-2 transition",
                    bgImage === src
                      ? "border-sky-400 ring-2 ring-sky-400/40"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  {failedBgImages.has(src) ? (
                    <span className="block h-full w-full bg-gradient-to-br from-sky-500/60 via-indigo-500/40 to-slate-900" aria-hidden="true" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={src}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                      onError={() =>
                        setFailedBgImages((prev) => {
                          if (prev.has(src)) return prev;
                          const next = new Set(prev);
                          next.add(src);
                          return next;
                        })
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-foreground">Màu chính</span>
              <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-white">{primaryColor}</span>
              </span>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-foreground">Màu accent</span>
              <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-white">{accentColor}</span>
              </span>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-foreground">Hiệu ứng hạt</span>
            <select
              value={effectType}
              onChange={(e) => setEffectType(e.target.value as EffectType)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              {EFFECTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-foreground">
              Độ sâu 3D: {depth}px
            </span>
            <input
              type="range"
              min={2}
              max={16}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full accent-sky-400"
            />
            <span className="text-[11px] text-muted-foreground">
              Độ sâu này áp dụng cho Card khi hover sau khi bạn lưu theme.
            </span>
          </label>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95"
            >
              Lưu & Áp dụng theme của tôi
            </button>
            {customTheme && (
              <button
                type="button"
                onClick={clearCustomTheme}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 active:scale-95"
              >
                Xóa theme tùy chỉnh
              </button>
            )}
          </div>
          {saved && (
            <p className="text-xs font-bold text-emerald-300">
              Đã lưu và áp dụng theme tùy chỉnh của bạn!
            </p>
          )}
        </div>

        {/* Live preview */}
        <DepthCard tilt={depth} className="h-fit">
          <div className="relative h-44 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgImage} alt="" aria-hidden="true" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Xem trước trực tiếp
              </p>
              <h3 className="text-xl font-extrabold text-white">
                {nameVi || "Theme Của Tôi"}
              </h3>
            </div>
          </div>
          <div className="tx-depth-child space-y-3 p-4">
            <p className="text-sm text-slate-300">
              Hiệu ứng hạt: {EFFECTS.find((e) => e.id === effectType)?.label} •
              Độ sâu 3D: {depth}px
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Nút chính
              </span>
              <span
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                Nút accent
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Di chuột qua thẻ này để xem độ nghiêng 3D đúng bằng độ sâu bạn
              đã chọn.
            </p>
          </div>
        </DepthCard>
      </div>
    </section>
  );
}
