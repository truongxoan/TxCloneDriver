import { LunarDate, HourAuspicious } from "./types";

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export const SOLAR_TERMS = [
  "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
  "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
  "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
  "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
];

const PI = Math.PI;

function INT(d: number): number {
  return Math.floor(d);
}

export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

export function jdToDate(jd: number): [number, number, number] {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000078 + 0.000207 * T + 0.0000414 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitudeDegrees(dayNumber: number, timeZone: number): number {
  const T = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) % 360;
  if (L < 0) L += 360;
  return L;
}

function getSunLongitude(dayNumber: number, timeZone: number): number {
  const L = getSunLongitudeDegrees(dayNumber, timeZone);
  return INT(L / 30);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  // Can Chi calculations
  const canDay = CAN[(dayNumber + 9) % 10];
  const chiDay = CHI[(dayNumber + 1) % 12];
  const canChiDay = `${canDay} ${chiDay}`;

  const canYear = CAN[(lunarYear + 6) % 10];
  const chiYear = CHI[(lunarYear + 8) % 12];
  const canChiYear = `${canYear} ${chiYear}`;

  const canMonth = CAN[(lunarYear * 12 + lunarMonth + 3) % 10];
  const chiMonth = CHI[(lunarMonth + 1) % 12];
  const canChiMonth = `${canMonth} ${chiMonth}`;

  // Solar terms (24 tiết khí, mỗi tiết khí 15 độ)
  const deg = getSunLongitudeDegrees(dayNumber, timeZone);
  const solarTermIndex = INT((deg / 15 + 24) % 24);
  const solarTerm = SOLAR_TERMS[solarTermIndex];

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap: lunarLeap,
    canChiDay,
    canChiMonth,
    canChiYear,
    solarTerm,
  };
}

export function getAuspiciousHours(dd: number, mm: number, yy: number, currentHour = new Date().getHours()): HourAuspicious[] {
  const dayNumber = jdFromDate(dd, mm, yy);
  const chiDayIndex = (dayNumber + 1) % 12;

  // Lục Nhâm / Ngọc Hạp Thông Thư
  const AUSPICIOUS_PATTERNS: Record<number, { indices: number[]; stars: Record<number, string> }> = {
    // Tý (0), Ngọ (6)
    0: { indices: [0, 1, 3, 6, 8, 9], stars: { 0: "Thanh Long", 1: "Minh Đường", 3: "Kim Quỹ", 6: "Kim Đường", 8: "Ngọc Đường", 9: "Tư Mệnh" } },
    6: { indices: [0, 1, 3, 6, 8, 9], stars: { 0: "Thanh Long", 1: "Minh Đường", 3: "Kim Quỹ", 6: "Kim Đường", 8: "Ngọc Đường", 9: "Tư Mệnh" } },
    // Sửu (1), Mùi (7)
    1: { indices: [2, 3, 5, 8, 10, 11], stars: { 2: "Thanh Long", 3: "Minh Đường", 5: "Kim Quỹ", 8: "Kim Đường", 10: "Ngọc Đường", 11: "Tư Mệnh" } },
    7: { indices: [2, 3, 5, 8, 10, 11], stars: { 2: "Thanh Long", 3: "Minh Đường", 5: "Kim Quỹ", 8: "Kim Đường", 10: "Ngọc Đường", 11: "Tư Mệnh" } },
    // Dần (2), Thân (8)
    2: { indices: [0, 1, 4, 5, 7, 10], stars: { 0: "Tư Mệnh", 1: "Kim Quỹ", 4: "Thanh Long", 5: "Minh Đường", 7: "Kim Đường", 10: "Ngọc Đường" } },
    8: { indices: [0, 1, 4, 5, 7, 10], stars: { 0: "Tư Mệnh", 1: "Kim Quỹ", 4: "Thanh Long", 5: "Minh Đường", 7: "Kim Đường", 10: "Ngọc Đường" } },
    // Mão (3), Dậu (9)
    3: { indices: [0, 2, 3, 6, 7, 9], stars: { 0: "Tư Mệnh", 2: "Kim Quỹ", 3: "Kim Đường", 6: "Thanh Long", 7: "Minh Đường", 9: "Ngọc Đường" } },
    9: { indices: [0, 2, 3, 6, 7, 9], stars: { 0: "Tư Mệnh", 2: "Kim Quỹ", 3: "Kim Đường", 6: "Thanh Long", 7: "Minh Đường", 9: "Ngọc Đường" } },
    // Thìn (4), Tuất (10)
    4: { indices: [2, 4, 5, 8, 9, 11], stars: { 2: "Tư Mệnh", 4: "Kim Quỹ", 5: "Kim Đường", 8: "Thanh Long", 9: "Minh Đường", 11: "Ngọc Đường" } },
    10: { indices: [2, 4, 5, 8, 9, 11], stars: { 2: "Tư Mệnh", 4: "Kim Quỹ", 5: "Kim Đường", 8: "Thanh Long", 9: "Minh Đường", 11: "Ngọc Đường" } },
    // Tỵ (5), Hợi (11)
    5: { indices: [1, 4, 6, 7, 10, 11], stars: { 1: "Kim Đường", 4: "Tư Mệnh", 6: "Kim Quỹ", 7: "Ngọc Đường", 10: "Thanh Long", 11: "Minh Đường" } },
    11: { indices: [1, 4, 6, 7, 10, 11], stars: { 1: "Kim Đường", 4: "Tư Mệnh", 6: "Kim Quỹ", 7: "Ngọc Đường", 10: "Thanh Long", 11: "Minh Đường" } },
  };

  const pattern = AUSPICIOUS_PATTERNS[chiDayIndex] || { indices: [], stars: {} };

  const timeRanges = [
    "23:00 - 00:59", "01:00 - 02:59", "03:00 - 04:59", "05:00 - 06:59",
    "07:00 - 08:59", "09:00 - 10:59", "11:00 - 12:59", "13:00 - 14:59",
    "15:00 - 16:59", "17:00 - 18:59", "19:00 - 20:59", "21:00 - 22:59"
  ];

  let currentChiIndex = 0;
  if (currentHour >= 23 || currentHour < 1) currentChiIndex = 0;
  else currentChiIndex = Math.floor((currentHour + 1) / 2);

  return CHI.map((chi, idx) => {
    const isAuspicious = pattern.indices.includes(idx);
    const starName = pattern.stars[idx] || (isAuspicious ? "Hoàng Đạo" : "Hắc Đạo");
    return {
      chi: `Giờ ${chi}`,
      timeRange: timeRanges[idx],
      isAuspicious,
      starName,
      isCurrent: idx === currentChiIndex,
    };
  });
}
