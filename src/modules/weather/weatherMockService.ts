import { WeatherData } from "./types";

export const MOCK_CITIES_WEATHER: Record<string, WeatherData> = {
  hanoi: {
    city: "Hà Nội",
    region: "Việt Nam",
    temperature: 28,
    feelsLike: 30,
    condition: "Nắng nhẹ & mây rải rác",
    conditionCode: "cloudy",
    humidity: 68,
    windSpeedKmH: 14,
    uvIndex: 5,
    airQuality: {
      aqi: 65,
      status: "Trung bình",
    },
    lastUpdated: "16:45 (Cập nhật tự động)",
    isDemo: true,
    hourly: [
      { time: "16:00", temp: 28, icon: "🌤️" },
      { time: "17:00", temp: 27, icon: "🌤️" },
      { time: "18:00", temp: 26, icon: "⛅" },
      { time: "19:00", temp: 25, icon: "🌙" },
      { time: "20:00", temp: 24, icon: "🌙" },
      { time: "21:00", temp: 24, icon: "✨" },
    ],
    daily: [
      { date: "10/10", dayName: "Hôm nay", tempMin: 23, tempMax: 29, condition: "Mây nhẹ" },
      { date: "11/10", dayName: "Chủ Nhật", tempMin: 22, tempMax: 28, condition: "Nắng ráo" },
      { date: "12/10", dayName: "Thứ Hai", tempMin: 22, tempMax: 29, condition: "Có mưa rào" },
      { date: "13/10", dayName: "Thứ Ba", tempMin: 21, tempMax: 27, condition: "Nắng nhẹ" },
      { date: "14/10", dayName: "Thứ Tư", tempMin: 21, tempMax: 28, condition: "Trời quang" },
    ],
  },
  hcm: {
    city: "TP. Hồ Chí Minh",
    region: "Việt Nam",
    temperature: 31,
    feelsLike: 35,
    condition: "Nắng nhiệt đới, chiều tối dông",
    conditionCode: "thunder",
    humidity: 78,
    windSpeedKmH: 12,
    uvIndex: 8,
    airQuality: {
      aqi: 54,
      status: "Trung bình",
    },
    lastUpdated: "16:45 (Cập nhật tự động)",
    isDemo: true,
    hourly: [
      { time: "16:00", temp: 31, icon: "🌦️" },
      { time: "17:00", temp: 29, icon: "⛈️" },
      { time: "18:00", temp: 27, icon: "🌧️" },
      { time: "19:00", temp: 26, icon: "☁️" },
      { time: "20:00", temp: 26, icon: "🌙" },
      { time: "21:00", temp: 25, icon: "🌙" },
    ],
    daily: [
      { date: "10/10", dayName: "Hôm nay", tempMin: 25, tempMax: 32, condition: "Dông chiều" },
      { date: "11/10", dayName: "Chủ Nhật", tempMin: 25, tempMax: 33, condition: "Mưa rải rác" },
      { date: "12/10", dayName: "Thứ Hai", tempMin: 24, tempMax: 32, condition: "Nhiều mây" },
      { date: "13/10", dayName: "Thứ Ba", tempMin: 25, tempMax: 33, condition: "Nắng gắt" },
      { date: "14/10", dayName: "Thứ Tư", tempMin: 24, tempMax: 31, condition: "Mưa dông" },
    ],
  },
  danang: {
    city: "Đà Nẵng",
    region: "Việt Nam",
    temperature: 29,
    feelsLike: 32,
    condition: "Gió biển mát mẻ, trời trong",
    conditionCode: "sunny",
    humidity: 70,
    windSpeedKmH: 18,
    uvIndex: 6,
    airQuality: {
      aqi: 32,
      status: "Tốt",
    },
    lastUpdated: "16:45 (Cập nhật tự động)",
    isDemo: true,
    hourly: [
      { time: "16:00", temp: 29, icon: "☀️" },
      { time: "17:00", temp: 28, icon: "🌤️" },
      { time: "18:00", temp: 27, icon: "🌅" },
      { time: "19:00", temp: 26, icon: "🌙" },
      { time: "20:00", temp: 25, icon: "🌙" },
      { time: "21:00", temp: 25, icon: "✨" },
    ],
    daily: [
      { date: "10/10", dayName: "Hôm nay", tempMin: 24, tempMax: 30, condition: "Trời quang" },
      { date: "11/10", dayName: "Chủ Nhật", tempMin: 24, tempMax: 30, condition: "Nắng nhẹ" },
      { date: "12/10", dayName: "Thứ Hai", tempMin: 23, tempMax: 29, condition: "Gió lộng" },
      { date: "13/10", dayName: "Thứ Ba", tempMin: 24, tempMax: 31, condition: "Nắng ráo" },
      { date: "14/10", dayName: "Thứ Tư", tempMin: 23, tempMax: 29, condition: "Mây ít" },
    ],
  },
};

export function getWeather(cityKey = "hanoi"): WeatherData {
  return MOCK_CITIES_WEATHER[cityKey] || MOCK_CITIES_WEATHER.hanoi;
}
