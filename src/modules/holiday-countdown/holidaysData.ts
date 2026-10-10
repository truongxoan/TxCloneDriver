import { HolidayEvent, CountdownItem } from "./types";
import { convertSolar2Lunar } from "../lunar-calendar/lunarConverter";

export const VIETNAMESE_HOLIDAYS: HolidayEvent[] = [
  {
    id: "tet-duong-lich",
    name: "Tết Dương Lịch",
    type: "official",
    isLunar: false,
    solarMonth: 1,
    solarDay: 1,
    description: "Năm mới dương lịch toàn cầu, ngày nghỉ chính thức theo luật lao động.",
    badge: "🎉 Lễ chính thức",
  },
  {
    id: "tet-nguyen-dan",
    name: "Tết Nguyên Đán (Mùng 1 Tết)",
    type: "official",
    isLunar: true,
    solarMonth: 0,
    solarDay: 0,
    lunarMonth: 1,
    lunarDay: 1,
    description: "Tết cổ truyền dân tộc Việt Nam, sum họp gia đình, đón chào năm mới.",
    badge: "🧧 Quốc lễ truyền thống",
  },
  {
    id: "gio-to-hung-vuong",
    name: "Giỗ Tổ Hùng Vương",
    type: "official",
    isLunar: true,
    solarMonth: 0,
    solarDay: 0,
    lunarMonth: 3,
    lunarDay: 10,
    description: "Tưởng nhớ công ơn các vua Hùng dựng nước (Mùng 10 tháng 3 âm lịch).",
    badge: "🏛️ Quốc giỗ",
  },
  {
    id: "giai-phong-mien-nam",
    name: "Ngày Thống nhất Đất nước (30/4)",
    type: "official",
    isLunar: false,
    solarMonth: 4,
    solarDay: 30,
    description: "Kỷ niệm ngày Giải phóng miền Nam, thống nhất đất nước.",
    badge: "⭐ Ngày lễ lớn",
  },
  {
    id: "quoc-te-lao-dong",
    name: "Quốc tế Lao động (1/5)",
    type: "official",
    isLunar: false,
    solarMonth: 5,
    solarDay: 1,
    description: "Ngày hội tôn vinh giai cấp công nhân và người lao động toàn thế giới.",
    badge: "⚒️ Lễ chính thức",
  },
  {
    id: "quoc-khanh",
    name: "Quốc khánh Nước CHXHCN Việt Nam (2/9)",
    type: "official",
    isLunar: false,
    solarMonth: 9,
    solarDay: 2,
    description: "Kỷ niệm Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình.",
    badge: "🇻🇳 Quốc khánh",
  },
  {
    id: "trung-thu",
    name: "Tết Trung Thu (Rằm tháng 8)",
    type: "traditional",
    isLunar: true,
    solarMonth: 0,
    solarDay: 0,
    lunarMonth: 8,
    lunarDay: 15,
    description: "Tết trông trăng, rước đèn, tết thiếu nhi và sum vầy ấm cúng.",
    badge: "🌕 Lễ truyền thống",
  },
];

// Find solar date of a lunar holiday for a given solar year
function findSolarDateForLunar(lunarDay: number, lunarMonth: number, baseYear: number): Date {
  // Lunar date for lunarMonth usually falls in baseYear between Jan and Dec, or Jan/Feb of baseYear+1
  const start = new Date(baseYear, 0, 15);
  for (let offset = 0; offset < 420; offset++) {
    const d = new Date(start.getTime() + offset * 86400000);
    const lunar = convertSolar2Lunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
    if (lunar.month === lunarMonth && lunar.day === lunarDay) {
      return d;
    }
  }
  return new Date(baseYear, 0, 1);
}

export function getUpcomingHolidayCountdowns(now = new Date()): CountdownItem[] {
  const currentYear = now.getFullYear();

  return VIETNAMESE_HOLIDAYS.map((h) => {
    let targetDate: Date;

    if (!h.isLunar) {
      targetDate = new Date(currentYear, h.solarMonth - 1, h.solarDay, 0, 0, 0);
      if (targetDate.getTime() < now.getTime() - 86400000) {
        // Passed this year, check next year
        targetDate = new Date(currentYear + 1, h.solarMonth - 1, h.solarDay, 0, 0, 0);
      }
    } else {
      // Find for current year
      let solarD = findSolarDateForLunar(h.lunarDay!, h.lunarMonth!, currentYear);
      if (solarD.getTime() < now.getTime() - 86400000) {
        solarD = findSolarDateForLunar(h.lunarDay!, h.lunarMonth!, currentYear + 1);
      }
      targetDate = solarD;
    }

    const diffMs = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const isToday = daysRemaining === 0;

    const dd = String(targetDate.getDate()).padStart(2, "0");
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const yyyy = targetDate.getFullYear();

    return {
      ...h,
      targetDateStr: `${dd}/${mm}/${yyyy}`,
      daysRemaining,
      hoursRemaining,
      isToday,
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);
}
