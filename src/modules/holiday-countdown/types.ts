export interface HolidayEvent {
  id: string;
  name: string;
  type: "official" | "traditional" | "custom";
  isLunar: boolean;
  solarMonth: number;
  solarDay: number;
  lunarMonth?: number;
  lunarDay?: number;
  description: string;
  badge: string;
}

export interface CountdownItem extends HolidayEvent {
  targetDateStr: string;
  daysRemaining: number;
  hoursRemaining: number;
  isToday: boolean;
}
