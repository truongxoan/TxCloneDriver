export interface WeatherData {
  city: string;
  region: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: "sunny" | "cloudy" | "rain" | "thunder" | "fog";
  humidity: number;
  windSpeedKmH: number;
  uvIndex: number;
  airQuality: {
    aqi: number;
    status: "Tốt" | "Trung bình" | "Kém" | "Rất kém";
  };
  lastUpdated: string;
  isDemo: boolean;
  hourly: {
    time: string;
    temp: number;
    icon: string;
  }[];
  daily: {
    date: string;
    dayName: string;
    tempMin: number;
    tempMax: number;
    condition: string;
  }[];
}
