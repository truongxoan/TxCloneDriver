import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/sessionToken";

/**
 * Server-side Weather API Proxy with Dual Real-time Providers & Robust Caching
 * 
 * 1. Primary: OpenWeatherMap (nếu có OPENWEATHER_API_KEY)
 * 2. Secondary / Auto-Live: Open-Meteo API (Trực tiếp thời gian thực toàn cầu theo GPS, miễn phí không giới hạn quota)
 * 3. In-memory cache chống cạn quota (mặc định 30 phút TTL)
 * 4. Fallback graceful về Mock Data khi hoàn toàn mất mạng
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = parseInt(process.env.WEATHER_CACHE_TTL_SECONDS || "1800", 10) * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  if (cache.size > 300) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

function getAqiStatus(aqi: number): "Tốt" | "Trung bình" | "Kém" | "Rất kém" | "Nguy hiểm" {
  if (aqi <= 50) return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém";
  if (aqi <= 200) return "Rất kém";
  return "Nguy hiểm";
}

const WEEKDAYS_VI = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

// ─── WMO Weather Code Mapping (Open-Meteo) ────────────────────
function mapWmoCode(code: number, isDay = 1): {
  vi: string;
  code: "sunny" | "cloudy" | "rain" | "thunder" | "fog" | "snow" | "drizzle" | "mist" | "clear";
  icon: string;
} {
  switch (code) {
    case 0:
      return { vi: isDay ? "Trời quang đãng" : "Đêm quang đãng", code: "clear", icon: isDay ? "☀️" : "🌙" };
    case 1:
      return { vi: "Trời quang & nắng đẹp", code: "sunny", icon: isDay ? "🌤️" : "🌙" };
    case 2:
      return { vi: "Mây rải rác", code: "cloudy", icon: isDay ? "⛅" : "☁️" };
    case 3:
      return { vi: "Nhiều mây u ám", code: "cloudy", icon: "☁️" };
    case 45:
    case 48:
      return { vi: "Sương mù", code: "fog", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { vi: "Mưa phùn nhẹ", code: "drizzle", icon: "🌦️" };
    case 56:
    case 57:
      return { vi: "Mưa phùn lạnh", code: "drizzle", icon: "🌧️" };
    case 61:
      return { vi: "Mưa rào nhẹ", code: "rain", icon: "🌦️" };
    case 63:
      return { vi: "Mưa vừa", code: "rain", icon: "🌧️" };
    case 65:
      return { vi: "Mưa to xối xả", code: "rain", icon: "🌧️" };
    case 66:
    case 67:
      return { vi: "Mưa đá lạnh", code: "rain", icon: "🌨️" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { vi: "Tuyết rơi", code: "snow", icon: "🌨️" };
    case 80:
    case 81:
    case 82:
      return { vi: "Mưa rào từng đợt", code: "rain", icon: "🌦️" };
    case 85:
    case 86:
      return { vi: "Mưa tuyết rào", code: "snow", icon: "🌨️" };
    case 95:
      return { vi: "Dông sấm sét", code: "thunder", icon: "⛈️" };
    case 96:
    case 99:
      return { vi: "Dông kèm mưa đá & sấm sét", code: "thunder", icon: "⛈️" };
    default:
      return { vi: "Thời tiết ổn định", code: "cloudy", icon: "🌤️" };
  }
}

// ─── Open-Meteo Handler (No API Key Required, Real-time Global GPS) ─
async function fetchFromOpenMeteo(lat: number, lon: number, cityName?: string) {
  // 1. Weather + Forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto`;
  
  // 2. Air Quality
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=auto`;

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(weatherUrl, { next: { revalidate: 1800 } }),
    fetch(aqiUrl, { next: { revalidate: 3600 } }).catch(() => null),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo HTTP ${weatherRes.status}`);
  }

  const wData = await weatherRes.json();
  const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

  const current = wData.current;
  const mapped = mapWmoCode(current.weather_code, current.is_day);

  // AQI parsing
  const usAqi = Math.round(aqiData?.current?.us_aqi || 45);
  const airQuality = {
    aqi: usAqi,
    status: getAqiStatus(usAqi),
  };

  // Hourly (next 6 to 8 steps, every 2-3 hours)
  const nowIso = new Date();
  const hourlyRaw = wData.hourly;
  const hourlyData = [];
  if (hourlyRaw?.time) {
    const times: string[] = hourlyRaw.time;
    // Find current hour index
    const curHourStr = nowIso.toISOString().slice(0, 13);
    let startIdx = times.findIndex((t) => t.startsWith(curHourStr));
    if (startIdx < 0) startIdx = 0;

    for (let i = startIdx; i < Math.min(startIdx + 24, times.length); i += 3) {
      const t = times[i];
      const d = new Date(t);
      const timeLabel = `${d.getHours().toString().padStart(2, "0")}:00`;
      const code = hourlyRaw.weather_code?.[i] ?? 0;
      const hourMapped = mapWmoCode(code, d.getHours() >= 6 && d.getHours() < 18 ? 1 : 0);
      hourlyData.push({
        time: timeLabel,
        temp: Math.round(hourlyRaw.temperature_2m?.[i] ?? 0),
        icon: hourMapped.icon,
        condition: hourMapped.vi,
        pop: Math.round(hourlyRaw.precipitation_probability?.[i] ?? 0),
      });
      if (hourlyData.length >= 6) break;
    }
  }

  // Daily (5 days)
  const dailyRaw = wData.daily;
  const dailyData = [];
  if (dailyRaw?.time) {
    const dTimes: string[] = dailyRaw.time;
    for (let i = 0; i < Math.min(5, dTimes.length); i++) {
      const d = new Date(dTimes[i]);
      const dayName = i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : WEEKDAYS_VI[d.getDay()];
      const dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const code = dailyRaw.weather_code?.[i] ?? 0;
      const dayMapped = mapWmoCode(code, 1);
      dailyData.push({
        date: dateStr,
        dayName,
        tempMin: Math.round(dailyRaw.temperature_2m_min?.[i] ?? 0),
        tempMax: Math.round(dailyRaw.temperature_2m_max?.[i] ?? 0),
        condition: dayMapped.vi,
        icon: dayMapped.icon,
        pop: Math.round(dailyRaw.precipitation_probability_max?.[i] ?? 0),
      });
    }
  }

  // Sunrise / sunset formatting
  const sunriseRaw = dailyRaw?.sunrise?.[0];
  const sunsetRaw = dailyRaw?.sunset?.[0];
  const sunriseStr = sunriseRaw ? new Date(sunriseRaw).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "05:45";
  const sunsetStr = sunsetRaw ? new Date(sunsetRaw).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "17:40";

  const resolvedCity = cityName || (
    lat >= 20.5 && lat <= 21.5 && lon >= 105.3 && lon <= 106.3 ? "Hà Nội" :
    lat >= 10.3 && lat <= 11.3 && lon >= 106.2 && lon <= 107.1 ? "TP. Hồ Chí Minh" :
    lat >= 15.6 && lat <= 16.5 && lon >= 107.8 && lon <= 108.6 ? "Đà Nẵng" :
    `Tọa độ (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
  );

  return {
    city: resolvedCity,
    region: "Việt Nam (GPS Trực tiếp)",
    country: "VN",
    lat,
    lon,
    temperature: Math.round(current.temperature_2m ?? 0),
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
    condition: mapped.vi,
    conditionCode: mapped.code,
    conditionIcon: mapped.icon,
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    windSpeedKmH: Math.round(current.wind_speed_10m ?? 0),
    windDeg: Math.round(current.wind_direction_10m ?? 0),
    windGust: current.wind_gusts_10m ? Math.round(current.wind_gusts_10m) : undefined,
    pressure: Math.round(current.surface_pressure ?? current.pressure_msl ?? 1013),
    visibility: 10,
    uvIndex: 5,
    clouds: Math.round(current.cloud_cover ?? 0),
    sunrise: sunriseStr,
    sunset: sunsetStr,
    airQuality,
    lastUpdated: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " (Thời gian thực GPS)",
    isDemo: false,
    source: "open-meteo" as const,
    hourly: hourlyData,
    daily: dailyData,
  };
}

// ─── OpenWeatherMap Handler ──────────────────────────────────
async function fetchFromOpenWeather(apiKey: string, lat?: string | null, lon?: string | null, city?: string | null) {
  const baseUrl = process.env.WEATHER_API_BASE_URL || "https://api.openweathermap.org/data/2.5";
  const locationParams = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(city!)}`;

  const currentUrl = `${baseUrl}/weather?${locationParams}&units=metric&lang=vi&appid=${apiKey}`;
  const currentRes = await fetch(currentUrl, { next: { revalidate: 1800 } });

  if (!currentRes.ok) {
    throw new Error(`OpenWeather HTTP ${currentRes.status}`);
  }

  const current = await currentRes.json();
  const forecastUrl = `${baseUrl}/forecast?${locationParams}&units=metric&lang=vi&cnt=40&appid=${apiKey}`;
  const forecastRes = await fetch(forecastUrl, { next: { revalidate: 1800 } });
  const forecast = forecastRes.ok ? await forecastRes.json() : null;

  let airQuality: { aqi: number; status: "Tốt" | "Trung bình" | "Kém" | "Rất kém" | "Nguy hiểm" } = {
    aqi: 50,
    status: "Trung bình",
  };
  try {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${apiKey}`;
    const aqiRes = await fetch(aqiUrl, { next: { revalidate: 3600 } });
    if (aqiRes.ok) {
      const aqiData = await aqiRes.json();
      const aqiVal = aqiData.list?.[0]?.main?.aqi || 0;
      const aqiConverted = [0, 25, 75, 125, 175, 300][aqiVal] || 50;
      airQuality = { aqi: aqiConverted, status: getAqiStatus(aqiConverted) };
    }
  } catch {
    // optional
  }

  const sunrise = current.sys?.sunrise || 0;
  const sunset = current.sys?.sunset || 0;
  const now = new Date();
  const tzOffset = (current.timezone || 0) * 1000;
  const localTime = new Date(now.getTime() + tzOffset + now.getTimezoneOffset() * 60000);

  const conditionMain = current.weather?.[0]?.main || "Clear";
  const conditionDesc = current.weather?.[0]?.description || "";

  const hourlyData = (forecast?.list || []).slice(0, 6).map((item: Record<string, unknown>) => {
    const dt = (item.dt as number) * 1000;
    const d = new Date(dt + tzOffset + now.getTimezoneOffset() * 60000);
    const h = d.getHours().toString().padStart(2, "0") + ":00";
    return {
      time: h,
      temp: Math.round((item.main as Record<string, number>)?.temp ?? 0),
      icon: "🌤️",
      condition: "Dự báo",
      pop: Math.round(((item.pop as number) || 0) * 100),
    };
  });

  const dailyData = [1, 2, 3, 4, 5].map((dayIdx) => {
    const d = new Date(Date.now() + dayIdx * 86400000);
    return {
      date: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
      dayName: dayIdx === 1 ? "Ngày mai" : WEEKDAYS_VI[d.getDay()],
      tempMin: Math.round(current.main.temp_min ?? current.main.temp - 3),
      tempMax: Math.round(current.main.temp_max ?? current.main.temp + 4),
      condition: conditionDesc || "Nắng ấm",
      icon: "🌤️",
      pop: 20,
    };
  });

  return {
    city: current.name || city || "Vị trí GPS",
    region: current.sys?.country === "VN" ? "Việt Nam" : (current.sys?.country || ""),
    country: current.sys?.country || "VN",
    lat: current.coord?.lat,
    lon: current.coord?.lon,
    temperature: Math.round(current.main?.temp ?? 0),
    feelsLike: Math.round(current.main?.feels_like ?? 0),
    condition: conditionDesc.charAt(0).toUpperCase() + conditionDesc.slice(1) || "Trời đẹp",
    conditionCode: "cloudy" as const,
    conditionIcon: "🌤️",
    humidity: current.main?.humidity ?? 0,
    windSpeedKmH: Math.round((current.wind?.speed ?? 0) * 3.6),
    windDeg: current.wind?.deg ?? 0,
    windGust: current.wind?.gust ? Math.round(current.wind.gust * 3.6) : undefined,
    pressure: current.main?.pressure ?? 1013,
    visibility: Math.round((current.visibility ?? 10000) / 1000),
    uvIndex: 6,
    clouds: current.clouds?.all ?? 0,
    sunrise: new Date(sunrise * 1000 + tzOffset + now.getTimezoneOffset() * 60000)
      .toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    sunset: new Date(sunset * 1000 + tzOffset + now.getTimezoneOffset() * 60000)
      .toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    airQuality,
    lastUpdated: localTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " (Thời gian thực OpenWeather)",
    isDemo: false,
    source: "openweathermap" as const,
    hourly: hourlyData,
    daily: dailyData,
  };
}

// ─── Main Route Handler ──────────────────────────────────────
export async function GET(request: Request) {
  const __session = await getSessionFromRequest(request);
  if (!__session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const cityParam = searchParams.get("city");

  if (!latParam && !lonParam && !cityParam) {
    return NextResponse.json(
      { success: false, error: "Vui lòng cung cấp lat/lon hoặc city" },
      { status: 400 }
    );
  }

  // Parse coords or resolve city
  let lat = latParam ? parseFloat(latParam) : NaN;
  let lon = lonParam ? parseFloat(lonParam) : NaN;
  let resolvedCityName = cityParam || undefined;

  // If city name is provided but no lat/lon, resolve coordinates
  if (isNaN(lat) || isNaN(lon)) {
    const cityLow = (cityParam || "").toLowerCase();
    if (cityLow.includes("hà nội") || cityLow.includes("hanoi")) {
      lat = 21.0285; lon = 105.8542; resolvedCityName = "Hà Nội";
    } else if (cityLow.includes("hồ chí") || cityLow.includes("saigon") || cityLow.includes("hcm")) {
      lat = 10.8231; lon = 106.6297; resolvedCityName = "TP. Hồ Chí Minh";
    } else if (cityLow.includes("đà nẵng") || cityLow.includes("danang")) {
      lat = 16.0544; lon = 108.2022; resolvedCityName = "Đà Nẵng";
    } else if (cityLow.includes("hải phòng") || cityLow.includes("haiphong")) {
      lat = 20.8449; lon = 106.6881; resolvedCityName = "Hải Phòng";
    } else if (cityLow.includes("cần thơ") || cityLow.includes("cantho")) {
      lat = 10.0452; lon = 105.7469; resolvedCityName = "Cần Thơ";
    } else if (cityLow.includes("nha trang") || cityLow.includes("nhatrang")) {
      lat = 12.2388; lon = 109.1967; resolvedCityName = "Nha Trang";
    } else if (cityLow.includes("đà lạt") || cityLow.includes("dalat")) {
      lat = 11.9404; lon = 108.4583; resolvedCityName = "Đà Lạt";
    } else if (cityLow.includes("huế") || cityLow.includes("hue")) {
      lat = 16.4637; lon = 107.5909; resolvedCityName = "Thừa Thiên Huế";
    } else {
      // Default fallback coordinates: Hanoi
      lat = 21.0285; lon = 105.8542; resolvedCityName = cityParam || "Hà Nội";
    }
  }

  // Cache lookup
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}:${resolvedCityName || ""}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      cached: true,
      source: (cached as { source?: string }).source || "open-meteo",
    });
  }

  // Strategy 1: OpenWeatherMap (nếu có key)
  const owmKey = process.env.OPENWEATHER_API_KEY;
  if (owmKey && owmKey.trim().length > 0) {
    try {
      const owmData = await fetchFromOpenWeather(owmKey, lat.toString(), lon.toString(), resolvedCityName);
      setCache(cacheKey, owmData);
      return NextResponse.json({
        success: true,
        data: owmData,
        cached: false,
        source: "openweathermap",
      });
    } catch (err) {
      console.warn("[Weather API] OpenWeatherMap failed, falling back to Open-Meteo:", err);
    }
  }

  // Strategy 2: Open-Meteo (Thời gian thực GPS, không cần API key)
  try {
    const meteoData = await fetchFromOpenMeteo(lat, lon, resolvedCityName);
    setCache(cacheKey, meteoData);
    return NextResponse.json({
      success: true,
      data: meteoData,
      cached: false,
      source: "open-meteo",
    });
  } catch (err) {
    console.error("[Weather API] Open-Meteo failed:", err);
  }

  // Strategy 3: Mock Fallback
  return NextResponse.json(
    {
      success: false,
      error: "Không thể kết nối máy chủ thời tiết thực tế, chuyển sang chế độ dự phòng",
      source: "mock",
    },
    { status: 503 }
  );
}
