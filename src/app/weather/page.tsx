"use client";

import React, { useState } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  Compass,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getWeather, MOCK_CITIES_WEATHER } from "@/modules/weather/weatherMockService";

export default function WeatherPage() {
  const [selectedCityKey, setSelectedCityKey] = useState<string>("hanoi");
  const weather = getWeather(selectedCityKey);

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="rounded-2xl glass-panel p-4 border border-cyan-500/30 bg-cyan-500/10 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-cyan-300">
            Trung tâm Thời tiết &mdash; Trạng thái Demo Giai đoạn 1
          </div>
          <p className="text-muted-foreground">
            Dữ liệu thời tiết hiện tại đang hoạt động ở chế độ mô phỏng cấu trúc. Tại{" "}
            <span className="text-primary font-medium">Giai đoạn 5</span>, hệ thống sẽ kết nối trực tiếp
            với OpenWeather / WeatherAPI thực tế, hỗ trợ định vị GPS và cơ chế bộ nhớ đệm (Cache) chống cạn quota.
          </p>
        </div>
      </div>

      {/* Header & City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-cyan-400" />
            Trung tâm Thời tiết Thực tế
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi nhiệt độ, độ ẩm, sức gió và chất lượng không khí tại các thành phố
          </p>
        </div>

        {/* City Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl glass-panel p-1 border border-surface-border">
          {[
            { key: "hanoi", label: "Hà Nội" },
            { key: "hcm", label: "TP. Hồ Chí Minh" },
            { key: "danang", label: "Đà Nẵng" },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCityKey(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCityKey === c.key
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">
                    {weather.city}, {weather.region}
                  </span>
                  <span>&bull; {weather.lastUpdated}</span>
                </div>
                <div className="text-5xl lg:text-6xl font-black text-foreground mt-3">
                  {weather.temperature}°C
                </div>
                <div className="text-sm font-medium text-primary mt-1">
                  {weather.condition} &bull; Cảm giác như {weather.feelsLike}°C
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Droplets className="h-4 w-4 text-sky-400" />
                    <span>Độ ẩm</span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {weather.humidity}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wind className="h-4 w-4 text-teal-400" />
                    <span>Tốc độ gió</span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {weather.windSpeedKmH} km/h
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Chỉ số UV</span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {weather.uvIndex} (Vừa phải)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Không khí</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    AQI {weather.airQuality.aqi} ({weather.airQuality.status})
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="mt-6 pt-6 border-t border-surface-border/60">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Dự báo theo giờ
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {weather.hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-elevated/40 border border-surface-border"
                  >
                    <span className="text-[11px] text-muted-foreground">{h.time}</span>
                    <div className="text-2xl my-1.5">{h.icon}</div>
                    <span className="font-bold text-foreground text-sm">{h.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 5-Day Forecast (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Dự báo 5 ngày tới
              </CardTitle>
              <CardDescription>Xu hướng nhiệt độ và thời tiết</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {weather.daily.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-surface-border text-xs"
                >
                  <div>
                    <div className="font-semibold text-foreground">{d.dayName}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {d.date} &bull; {d.condition}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-foreground">{d.tempMax}°</span>
                    <span className="text-muted-foreground ml-1.5">/ {d.tempMin}°</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
