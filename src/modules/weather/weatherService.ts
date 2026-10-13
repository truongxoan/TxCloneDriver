import { WeatherData, GeoLocation, WeatherApiResponse } from "./types";
import { getWeather as getMockWeather } from "./weatherMockService";

/**
 * Weather Service — Client-side
 * - GPS geolocation detection
 * - Dual API fetching (via server proxy)
 * - Multi-tier cache (sessionStorage 15 phút)
 * - Graceful fallback to mock data
 */

// ─── Client Cache (sessionStorage) ──────────────────────────
const CLIENT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes client-side

function getClientCache(key: string): WeatherData | null {
  try {
    const raw = sessionStorage.getItem(`weather_cache_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CLIENT_CACHE_TTL) {
      sessionStorage.removeItem(`weather_cache_${key}`);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setClientCache(key: string, data: WeatherData) {
  try {
    sessionStorage.setItem(
      `weather_cache_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // sessionStorage might be full or disabled
  }
}

export function clearClientWeatherCache() {
  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith("weather_cache_")) {
        sessionStorage.removeItem(k);
      }
    });
  } catch {
    // ignore
  }
}

// ─── GPS Geolocation ────────────────────────────────────────
export function detectGeoLocation(): Promise<GeoLocation> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      // Fallback: default Hà Nội
      resolve({ lat: 21.0285, lon: 105.8542, city: "Hà Nội", source: "default" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          source: "gps",
        });
      },
      () => {
        // User denied GPS or error → fallback default Hanoi
        resolve({ lat: 21.0285, lon: 105.8542, city: "Hà Nội", source: "default" });
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 300000, // 5 min cached position is fine
      }
    );
  });
}

// ─── Fetch Weather from API ─────────────────────────────────
export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  forceRefresh = false
): Promise<{ data: WeatherData; isLive: boolean; source: string }> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

  if (!forceRefresh) {
    const cached = getClientCache(cacheKey);
    if (cached) {
      return { data: cached, isLive: !cached.isDemo, source: cached.source || "open-meteo" };
    }
  }

  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}${forceRefresh ? "&refresh=1" : ""}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const json: WeatherApiResponse = await res.json();

    if (json.success && json.data) {
      setClientCache(cacheKey, json.data);
      return { data: json.data, isLive: true, source: json.source || "open-meteo" };
    }

    throw new Error(json.error || "Unknown API error");
  } catch (error) {
    console.warn("[WeatherService] API call failed, falling back to mock:", error);
    const mock = getMockWeather("hanoi");
    return { data: mock, isLive: false, source: "mock" };
  }
}

export async function fetchWeatherByCity(
  city: string,
  forceRefresh = false
): Promise<{ data: WeatherData; isLive: boolean; source: string }> {
  const cacheKey = `city:${city.toLowerCase()}`;

  if (!forceRefresh) {
    const cached = getClientCache(cacheKey);
    if (cached) {
      return { data: cached, isLive: !cached.isDemo, source: cached.source || "open-meteo" };
    }
  }

  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}${forceRefresh ? "&refresh=1" : ""}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const json: WeatherApiResponse = await res.json();

    if (json.success && json.data) {
      setClientCache(cacheKey, json.data);
      return { data: json.data, isLive: true, source: json.source || "open-meteo" };
    }

    throw new Error(json.error || "Unknown API error");
  } catch (error) {
    console.warn("[WeatherService] City API call failed, falling back to mock:", error);
    const mockKey = city.toLowerCase().includes("hà nội") || city.toLowerCase().includes("hanoi")
      ? "hanoi"
      : city.toLowerCase().includes("hồ chí") || city.toLowerCase().includes("saigon") || city.toLowerCase().includes("hcm")
      ? "hcm"
      : city.toLowerCase().includes("đà nẵng") || city.toLowerCase().includes("danang")
      ? "danang"
      : "hanoi";
    return { data: getMockWeather(mockKey), isLive: false, source: "mock" };
  }
}

// ─── Smart Weather Fetch (GPS Auto Detect) ─────────────────
export async function fetchSmartWeather(
  forceRefresh = false
): Promise<{
  data: WeatherData;
  isLive: boolean;
  location: GeoLocation;
  source: string;
}> {
  const location = await detectGeoLocation();
  const result = await fetchWeatherByCoords(location.lat, location.lon, forceRefresh);
  return { ...result, location };
}
