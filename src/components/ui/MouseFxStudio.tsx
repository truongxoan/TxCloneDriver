"use client";

import React, { useState, useEffect } from "react";
import { MousePointer2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { DEFAULT_MOUSE_FX, loadMouseFxSettings, MouseFxSettings } from "@/modules/interactions/MouseEffectsProvider";

export default function MouseFxStudio() {
  const [settings, setSettings] = useState<MouseFxSettings>(DEFAULT_MOUSE_FX);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadMouseFxSettings());
  }, []);

  const update = (patch: Partial<MouseFxSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try { localStorage.setItem("txclonedriver_mouse_fx", JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent("tx_mouse_fx_change", { detail: { settings: next } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectCls = "w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900";

  return (
    <Card className="p-5 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MousePointer2 className="h-4 w-4 text-pink-400" />
          Studio Hiệu Ứng Chuột & Nghỉ Ngơi
        </CardTitle>
        <CardDescription>
          Tùy chỉnh vệt chuột, hiệu ứng khi bấm và hiệu ứng nhẹ khi web đứng yên. Mọi thay đổi áp dụng ngay trên toàn web và tôn trọng chế độ giảm chuyển động.
          {saved && <span className="text-emerald-400 font-bold"> • Đã lưu</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Vệt chuột khi di chuyển</label>
          <select value={settings.trail} onChange={(e) => update({ trail: e.target.value as MouseFxSettings["trail"] })} className={selectCls}>
            <option value="stardust">Bụi sao (mặc định)</option>
            <option value="sparkle">Lấp lánh hình thoi</option>
            <option value="bubble">Bong bóng bay lên</option>
            <option value="none">Tắt vệt chuột</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Hiệu ứng khi bấm chuột</label>
          <select value={settings.clickFx} onChange={(e) => update({ clickFx: e.target.value as MouseFxSettings["clickFx"] })} className={selectCls}>
            <option value="burst">Nổ hạt</option>
            <option value="ripple">Vòng lan tỏa</option>
            <option value="ring">Vòng tròn mở rộng</option>
            <option value="none">Tắt hiệu ứng bấm</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Hiệu ứng khi web đứng yên</label>
          <select value={settings.idleFx} onChange={(e) => update({ idleFx: e.target.value as MouseFxSettings["idleFx"] })} className={selectCls}>
            <option value="glow">Ánh sáng thở nhẹ</option>
            <option value="orbs">Quả cầu trôi chậm</option>
            <option value="drift">Hạt bay lên từ dưới</option>
            <option value="none">Tắt hiệu ứng nghỉ</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Đứng yên bao lâu thì hiệu ứng nghỉ bật ({settings.idleDelaySec} giây)</label>
          <input type="range" min={15} max={120} step={15} value={settings.idleDelaySec} onChange={(e) => update({ idleDelaySec: Number(e.target.value) })} className="w-full" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Mật độ vệt chuột ({Math.round(settings.trailDensity * 100)}%)
          </label>
          <input type="range" min={0} max={0.9} step={0.1} value={settings.trailDensity} onChange={(e) => update({ trailDensity: Number(e.target.value) })} className="w-full" />
          <p className="text-[11px] text-slate-400">Di chuột thử ngay trên trang này để xem vệt mới, và để yên trang {settings.idleDelaySec} giây để xem hiệu ứng nghỉ. Chạm chuột hoặc phím bất kỳ là hiệu ứng nghỉ tắt ngay.</p>
        </div>
      </CardContent>
    </Card>
  );
}
