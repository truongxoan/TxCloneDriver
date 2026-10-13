export interface WeatherHourlyItem {
  time: string;
  temp: number;
  icon: string;
  condition?: string;
  pop?: number; // probability of precipitation (%)
}

export interface WeatherDailyItem {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon?: string;
  pop?: number;
}

export interface WeatherData {
  city: string;
  region: string;
  country?: string;
  lat?: number;
  lon?: number;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: "sunny" | "cloudy" | "rain" | "thunder" | "fog" | "snow" | "drizzle" | "mist" | "clear";
  conditionIcon?: string;
  humidity: number;
  windSpeedKmH: number;
  windDeg?: number;
  windGust?: number;
  pressure?: number;
  visibility?: number;
  uvIndex: number;
  clouds?: number;
  sunrise?: string;
  sunset?: string;
  airQuality: {
    aqi: number;
    status: "Tốt" | "Trung bình" | "Kém" | "Rất kém" | "Nguy hiểm";
  };
  lastUpdated: string;
  isDemo: boolean;
  source?: "openweathermap" | "open-meteo" | "mock";
  hourly: WeatherHourlyItem[];
  daily: WeatherDailyItem[];
}

export interface GeoLocation {
  lat: number;
  lon: number;
  city?: string;
  source: "gps" | "ip" | "manual" | "default";
}

export interface WeatherCacheEntry {
  data: WeatherData;
  timestamp: number;
  key: string;
}

export interface WeatherApiResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
  cached?: boolean;
  source: "openweathermap" | "open-meteo" | "mock";
}
