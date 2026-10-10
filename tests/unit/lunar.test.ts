import { convertSolar2Lunar, getAuspiciousHours } from "../../src/modules/lunar-calendar/lunarConverter";

function testLunar() {
  console.log("=== Testing Lunar Calendar Conversion ===");
  // Test 1: Tet Giap Thin (10/02/2024) -> 1/1/2024
  const tet2024 = convertSolar2Lunar(10, 2, 2024);
  console.log("2024-02-10 Lunar:", tet2024.day, tet2024.month, tet2024.year, tet2024.canChiYear);
  if (tet2024.day === 1 && tet2024.month === 1 && tet2024.year === 2024 && tet2024.canChiYear === "Giáp Thìn") {
    console.log("PASS: Tet 2024 verified");
  } else {
    console.error("FAIL: Tet 2024 mismatch", tet2024);
  }

  // Test 2: Reference date 2026-10-10
  const date2026 = convertSolar2Lunar(10, 10, 2026);
  console.log("2026-10-10 Lunar:", date2026);

  // Test 3: Auspicious hours
  const hours = getAuspiciousHours(10, 10, 2026, 16);
  const auspiciousCount = hours.filter(h => h.isAuspicious).length;
  console.log(`Auspicious hours count: ${auspiciousCount}/12 (Standard is 6/12)`);
  if (auspiciousCount === 6) {
    console.log("PASS: Exactly 6 auspicious hours per day verified");
  } else {
    console.error("FAIL: Auspicious count is not 6");
  }
}

testLunar();
