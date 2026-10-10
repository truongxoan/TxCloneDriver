export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  solarTerm: string;
}

export interface HourAuspicious {
  chi: string;
  timeRange: string;
  isAuspicious: boolean; // Hoàng Đạo
  starName: string; // Tên sao (Thanh Long, Minh Đường, Chu Tước, ...)
  isCurrent: boolean;
}
