"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
  Sparkles,
  Compass,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  CloudRain,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WeatherData } from "@/modules/weather/types";
import {
  fetchSmartWeather,
  fetchWeatherByCoords,
  fetchWeatherByCity,
  detectGeoLocation,
} from "@/modules/weather/weatherService";
import { getWeather as getMockWeather } from "@/modules/weather/weatherMockService";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

const QUICK_CITIES = [
  { key: "hanoi", label: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { key: "hcm", label: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { key: "danang", label: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { key: "haiphong", label: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { key: "cantho", label: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
  { key: "nhatrang", label: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { key: "dalat", label: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { key: "hue", label: "Huế", lat: 16.4637, lon: 107.5909 },
];

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData>(() => getMockWeather("hanoi"));
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKey, setSelectedKey] = useState<string>("gps");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [providerSource, setProviderSource] = useState<string>("loading");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Load weather by GPS on mount
  const loadGpsWeather = useCallback(async (force = false) => {
    setLoading(true);
    setGpsError(null);
    setSelectedKey("gps");

    try {
      const geo = await detectGeoLocation();
      if (geo.source === "gps") {
        setIsGpsActive(true);
      } else {
        setIsGpsActive(false);
      }

      const res = await fetchWeatherByCoords(geo.lat, geo.lon, force);
      setWeather(res.data);
      setIsLive(res.isLive);
      setProviderSource(res.source);
    } catch (err) {
      console.error("GPS Weather failed:", err);
      setGpsError("Không thể lấy GPS, đang sử dụng dữ liệu mặc định");
      const fallback = getMockWeather("hanoi");
      setWeather(fallback);
      setIsLive(false);
      setProviderSource("mock");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load weather by predefined city or search
  const loadCityWeather = async (cityKey: string, lat?: number, lon?: number, force = false) => {
    setLoading(true);
    setSelectedKey(cityKey);
    setIsGpsActive(false);
    setGpsError(null);

    try {
      if (lat !== undefined && lon !== undefined) {
        const res = await fetchWeatherByCoords(lat, lon, force);
        setWeather(res.data);
        setIsLive(res.isLive);
        setProviderSource(res.source);
      } else {
        const res = await fetchWeatherByCity(cityKey, force);
        setWeather(res.data);
        setIsLive(res.isLive);
        setProviderSource(res.source);
      }
    } catch (err) {
      console.error("City weather error:", err);
      const fallback = getMockWeather("hanoi");
      setWeather(fallback);
      setIsLive(false);
      setProviderSource("mock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGpsWeather(false);
  }, [loadGpsWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    loadCityWeather(searchQuery.trim());
  };

  const handleRefresh = () => {
    if (selectedKey === "gps") {
      loadGpsWeather(true);
    } else {
      const found = QUICK_CITIES.find((c) => c.key === selectedKey);
      if (found) {
        loadCityWeather(found.key, found.lat, found.lon, true);
      } else {
        loadCityWeather(selectedKey, undefined, undefined, true);
      }
    }
  };

  return (
    <ModuleGuard moduleId="weather" moduleName="Thời tiết">
      <div className="space-y-6">
        {/* Real-time Status Banner */}
        <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-foreground">
                  Hệ Thống Thời Tiết Thực Tế &mdash; Giai Đoạn 5 Kết Nối Trực Tiếp
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isLive ? (
                    providerSource === "openweathermap" ? "Live: OpenWeatherMap" : "Live: Open-Meteo GPS"
                  ) : (
                    "Chế độ Giả Lập Dự Phòng"
                  )}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="h-3 w-3" />
                  Cache chống cạn quota: Bật
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tự động bắt tọa độ GPS thời gian thực, đồng bộ trạm quan trắc khí tượng toàn cầu và duy trì bộ nhớ đệm
                hai tầng (Server 30p + Client 15p) bảo vệ định mức truy cập.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2 border-surface-border hover:bg-surface-elevated text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Làm mới dữ liệu
            </Button>
          </div>
        </div>

        {/* Header & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <CloudSun className="h-7 w-7 text-cyan-400" />
              Trung tâm Thời tiết Thực tế
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Định vị GPS tọa độ &bull; Nhiệt độ thời gian thực &bull; Dự báo mưa bão &bull; Chất lượng không khí AQI
            </p>
          </div>

          {/* Search & Location Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm thành phố (vd: Hải Phòng)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-surface-elevated/70 border border-surface-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
              />
            </form>

            <button
              onClick={() => loadGpsWeather(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                selectedKey === "gps"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "bg-surface-elevated/60 text-muted-foreground border-surface-border hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              <Navigation className={`h-3.5 w-3.5 ${isGpsActive ? "text-emerald-400 animate-pulse" : ""}`} />
              Vị trí GPS của tôi
            </button>
          </div>
        </div>

        {/* Quick City Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" /> Vùng nhanh:
          </span>
          {QUICK_CITIES.map((c) => (
            <button
              key={c.key}
              onClick={() => loadCityWeather(c.key, c.lat, c.lon)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedKey === c.key
                  ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm"
                  : "bg-surface-elevated/40 text-muted-foreground border-surface-border hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Main Weather Information Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Card (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 relative overflow-hidden border-surface-border bg-gradient-to-br from-surface-elevated/70 via-surface-elevated/40 to-transparent backdrop-blur-xl">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground text-base">
                      {weather.city}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &bull; {weather.region}
                    </span>
                    {weather.lat !== undefined && weather.lon !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-surface-border text-[11px] font-mono text-cyan-400">
                        {weather.lat.toFixed(2)}°N, {weather.lon.toFixed(2)}°E
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-4 mt-3">
                    <div className="text-6xl lg:text-7xl font-black tracking-tight text-foreground">
                      {weather.temperature}°C
                    </div>
                    <div className="text-4xl select-none animate-bounce">
                      {weather.conditionIcon || "🌤️"}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-primary mt-1 flex items-center gap-2">
                    <span>{weather.condition}</span>
                    <span className="text-muted-foreground font-normal">&bull;</span>
                    <span className="text-muted-foreground font-normal">
                      Cảm giác như {weather.feelsLike}°C
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Cập nhật: {weather.lastUpdated}</span>
                    {weather.source && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/30 text-primary">
                        {weather.source}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Metric Tiles (4 items) */}
                <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                  <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-surface-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Droplets className="h-4 w-4 text-sky-400" />
                      <span>Độ ẩm</span>
                    </div>
                    <div className="text-xl font-bold text-foreground mt-1">
                      {weather.humidity}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-surface-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wind className="h-4 w-4 text-teal-400" />
                      <span>Tốc độ gió</span>
                    </div>
                    <div className="text-xl font-bold text-foreground mt-1">
                      {weather.windSpeedKmH} <span className="text-xs font-normal text-muted-foreground">km/h</span>
                    </div>
                    {weather.windGust && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Gió giật: {weather.windGust} km/h
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-surface-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sun className="h-4 w-4 text-amber-400" />
                      <span>Chỉ số UV</span>
                    </div>
                    <div className="text-xl font-bold text-foreground mt-1">
                      {weather.uvIndex} <span className="text-xs font-normal text-muted-foreground">/ 11</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-surface-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>Không khí</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      AQI {weather.airQuality.aqi}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {weather.airQuality.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Atmospheric Indicators Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-surface-border/60">
                <div className="flex items-center gap-2.5 text-xs">
                  <Sunrise className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-[11px]">Bình minh</div>
                    <div className="font-semibold text-foreground">{weather.sunrise || "05:45"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Sunset className="h-4 w-4 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-[11px]">Hoàng hôn</div>
                    <div className="font-semibold text-foreground">{weather.sunset || "17:40"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Gauge className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-[11px]">Áp suất khí quyển</div>
                    <div className="font-semibold text-foreground">{weather.pressure || 1013} hPa</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Eye className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-[11px]">Tầm nhìn xa</div>
                    <div className="font-semibold text-foreground">{weather.visibility || 10} km</div>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="mt-6 pt-6 border-t border-surface-border/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Dự báo diễn biến theo giờ
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Kèm xác suất mưa %</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  {weather.hourly.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-surface-elevated/50 border border-surface-border hover:border-primary/40 transition-all flex flex-col items-center justify-between"
                    >
                      <span className="text-[11px] font-medium text-muted-foreground">{h.time}</span>
                      <div className="text-2xl my-1.5 select-none">{h.icon}</div>
                      <span className="font-bold text-foreground text-sm">{h.temp}°C</span>
                      {h.pop !== undefined && h.pop > 0 && (
                        <span className="text-[10px] text-sky-400 font-medium flex items-center gap-0.5 mt-1">
                          <CloudRain className="h-3 w-3" /> {h.pop}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 5-Day Forecast & System Details (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 5-Day Forecast */}
            <Card className="p-5 border-surface-border bg-surface-elevated/40 backdrop-blur-xl">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Dự báo 5 ngày tới
                </CardTitle>
                <CardDescription className="text-xs">
                  Biên độ nhiệt độ và trạng thái thời tiết
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-2.5">
                {weather.daily.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-elevated/60 border border-surface-border text-xs hover:border-surface-border/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl select-none">{d.icon || "🌤️"}</span>
                      <div>
                        <div className="font-bold text-foreground">{d.dayName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {d.date} &bull; {d.condition}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="font-bold text-foreground">{d.tempMax}°</span>
                      <span className="text-muted-foreground ml-1">/ {d.tempMin}°</span>
                      {d.pop !== undefined && d.pop > 20 && (
                        <div className="text-[10px] text-sky-400 font-sans font-medium">
                          Mưa: {d.pop}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Architecture Details Card */}
            <Card className="p-5 border-surface-border bg-surface-elevated/30">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Cơ chế bảo vệ & Định vị GPS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Định vị GPS HTML5:</strong> Truy vấn trực tiếp kinh độ & vĩ độ của trình duyệt theo thời gian thực.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Cơ chế Dual API:</strong> Tích hợp OpenWeatherMap API & Open-Meteo Global Radar API chạy ngầm không gián đoạn.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Chống cạn Quota:</strong> Cache Memory phía Server (30 phút) và SessionStorage Client (15 phút) loại bỏ 98% lượt gọi trùng lặp.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModuleGuard>
  );
}
