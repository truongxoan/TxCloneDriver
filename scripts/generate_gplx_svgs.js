const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'images', 'gplx');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Biển P.104 Cấm Mô Tô
const svgP104 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#ffffff" stroke="#dc2626" stroke-width="26" />
  <!-- Motorbike silhouette -->
  <g transform="translate(115, 125) scale(0.95)" fill="#1e293b">
    <!-- Back wheel -->
    <circle cx="35" cy="85" r="24" stroke="#1e293b" stroke-width="8" fill="none" />
    <circle cx="35" cy="85" r="8" fill="#1e293b" />
    <!-- Front wheel -->
    <circle cx="145" cy="85" r="24" stroke="#1e293b" stroke-width="8" fill="none" />
    <circle cx="145" cy="85" r="8" fill="#1e293b" />
    <!-- Frame -->
    <path d="M 35 85 L 75 55 L 120 55 L 145 85" stroke="#1e293b" stroke-width="7" fill="none" stroke-linecap="round" />
    <path d="M 75 55 L 90 85 L 145 85" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round" />
    <!-- Seat & Tank -->
    <path d="M 60 52 C 75 42 105 42 120 52 Z" fill="#1e293b" />
    <!-- Handlebars -->
    <path d="M 120 55 L 132 30 L 145 28" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round" />
    <!-- Headlight -->
    <circle cx="148" cy="35" r="5" fill="#f59e0b" />
    <!-- Rider silhouette -->
    <circle cx="95" cy="22" r="10" fill="#1e293b" />
    <path d="M 90 32 L 80 55 L 105 55 L 125 40 Z" fill="#1e293b" />
  </g>
  <!-- Red slash bar -->
  <line x1="95" y1="85" x2="295" y2="285" stroke="#dc2626" stroke-width="22" stroke-linecap="round" />
  <!-- Label badge -->
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="15" font-weight="bold">Biển P.104: Cấm xe mô tô hai bánh</text>
</svg>`;

// 2. Biển W.207 Giao nhau với đường không ưu tiên
const svgW207 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <!-- Yellow Warning Triangle with thick red border -->
  <polygon points="200,45 345,305 55,305" fill="#facc15" stroke="#dc2626" stroke-width="24" stroke-linejoin="round" />
  <!-- Crossroad arrow symbol -->
  <g fill="#1e293b">
    <!-- Main thick vertical arrow -->
    <path d="M 184 270 L 184 170 L 160 170 L 200 115 L 240 170 L 216 170 L 216 270 Z" />
    <!-- Thinner horizontal bar crossing -->
    <rect x="145" y="215" width="110" height="18" rx="2" />
  </g>
  <rect x="40" y="340" width="320" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển W.207: Giao nhau với đường không ưu tiên</text>
</svg>`;

// 3. Biển W.208 Giao nhau với đường ưu tiên (Tam giác ngược)
const svgW208 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <!-- Inverted triangle (apex pointing down) -->
  <polygon points="55,65 345,65 200,320" fill="#facc15" stroke="#dc2626" stroke-width="24" stroke-linejoin="round" />
  <!-- Center symbol: exclamation point / warning note -->
  <text x="200" y="195" text-anchor="middle" fill="#1e293b" font-family="system-ui, sans-serif" font-size="70" font-weight="900">!</text>
  <rect x="40" y="342" width="320" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="367" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển W.208: Giao nhau với đường ưu tiên (Phải nhường)</text>
</svg>`;

// 4. Biển W.224 Người đi bộ cắt ngang
const svgW224 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <polygon points="200,45 345,305 55,305" fill="#facc15" stroke="#dc2626" stroke-width="24" stroke-linejoin="round" />
  <!-- Pedestrian crosswalk lines -->
  <g fill="#1e293b">
    <rect x="130" y="260" width="140" height="7" rx="3" />
    <rect x="140" y="248" width="120" height="6" rx="3" />
    <rect x="150" y="236" width="100" height="6" rx="3" />
    <!-- Walking person -->
    <circle cx="195" cy="145" r="14" />
    <path d="M 195 162 L 182 205 L 165 235" stroke="#1e293b" stroke-width="11" stroke-linecap="round" fill="none" />
    <path d="M 185 195 L 210 238" stroke="#1e293b" stroke-width="11" stroke-linecap="round" fill="none" />
    <path d="M 195 165 L 170 190" stroke="#1e293b" stroke-width="10" stroke-linecap="round" fill="none" />
    <path d="M 195 165 L 218 190" stroke="#1e293b" stroke-width="10" stroke-linecap="round" fill="none" />
  </g>
  <rect x="40" y="340" width="320" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển W.224: Đường người đi bộ cắt ngang</text>
</svg>`;

// 5. Biển P.106b Cấm xe tải
const svgP106b = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#ffffff" stroke="#dc2626" stroke-width="26" />
  <!-- Truck shape -->
  <g transform="translate(100, 120)" fill="#1e293b">
    <!-- Cabin -->
    <path d="M 130 30 L 170 30 L 190 65 L 190 95 L 130 95 Z" />
    <!-- Window -->
    <path d="M 140 38 L 165 38 L 180 65 L 140 65 Z" fill="#ffffff" />
    <!-- Cargo Box -->
    <rect x="15" y="15" width="110" height="80" rx="4" />
    <!-- Wheels -->
    <circle cx="45" cy="98" r="18" fill="#1e293b" stroke="#ffffff" stroke-width="5" />
    <circle cx="160" cy="98" r="18" fill="#1e293b" stroke="#ffffff" stroke-width="5" />
    <!-- Weight text -->
    <text x="70" y="60" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="bold">2.5t</text>
  </g>
  <!-- Red slash -->
  <line x1="95" y1="85" x2="295" y2="285" stroke="#dc2626" stroke-width="22" stroke-linecap="round" />
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển P.106b: Cấm xe ô tô tải &gt; 2.5T</text>
</svg>`;

// 6. Biển P.101 Cấm mọi loại phương tiện (Đường cấm)
const svgP101 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#ffffff" stroke="#dc2626" stroke-width="32" />
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển P.101: Đường cấm mọi loại xe</text>
</svg>`;

// 7. Biển P.102 Cấm đi ngược chiều
const svgP102 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#dc2626" />
  <rect x="100" y="160" width="200" height="42" rx="6" fill="#ffffff" />
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="15" font-weight="bold">Biển P.102: Cấm đi ngược chiều</text>
</svg>`;

// 8. Biển P.124a Cấm quay đầu xe
const svgP124 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#ffffff" stroke="#dc2626" stroke-width="26" />
  <!-- U turn arrow -->
  <g fill="#1e293b">
    <path d="M 235 240 L 235 155 C 235 110 165 110 165 155 L 165 180 L 140 180 L 175 235 L 210 180 L 185 180 L 185 155 C 185 130 215 130 215 155 L 215 240 Z" />
  </g>
  <line x1="95" y1="85" x2="295" y2="285" stroke="#dc2626" stroke-width="22" stroke-linecap="round" />
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="15" font-weight="bold">Biển P.124a: Cấm quay đầu xe</text>
</svg>`;

// 9. Biển P.127 Tốc độ tối đa cho phép 50km/h
const svgP127 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#ffffff" stroke="#dc2626" stroke-width="26" />
  <text x="200" y="215" text-anchor="middle" fill="#1e293b" font-family="system-ui, sans-serif" font-size="95" font-weight="900" letter-spacing="-2">50</text>
  <rect x="40" y="340" width="320" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển P.127: Tốc độ tối đa cho phép (50 km/h)</text>
</svg>`;

// 10. Biển R.303 Vòng xuyến
const svgR303 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <circle cx="200" cy="180" r="140" fill="#2563eb" stroke="#ffffff" stroke-width="6" />
  <!-- 3 curved circular arrows -->
  <g fill="#ffffff" transform="translate(200, 180)">
    <!-- Arrow 1 -->
    <path d="M 0 -80 A 80 80 0 0 1 69 -40 L 78 -55 L 75 -20 L 42 -30 L 53 -43 A 65 65 0 0 0 0 -65 Z" />
    <!-- Arrow 2 (rotated 120) -->
    <g transform="rotate(120)">
      <path d="M 0 -80 A 80 80 0 0 1 69 -40 L 78 -55 L 75 -20 L 42 -30 L 53 -43 A 65 65 0 0 0 0 -65 Z" />
    </g>
    <!-- Arrow 3 (rotated 240) -->
    <g transform="rotate(240)">
      <path d="M 0 -80 A 80 80 0 0 1 69 -40 L 78 -55 L 75 -20 L 42 -30 L 53 -43 A 65 65 0 0 0 0 -65 Z" />
    </g>
  </g>
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển R.303: Nơi giao nhau theo vòng xuyến</text>
</svg>`;

// 11. Biển I.423 Chỉ dẫn vị trí người đi bộ sang đường
const svgI423 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <!-- Blue square -->
  <rect x="65" y="45" width="270" height="270" rx="18" fill="#2563eb" stroke="#ffffff" stroke-width="6" />
  <!-- White inner triangle -->
  <polygon points="200,65 315,290 85,290" fill="#ffffff" />
  <!-- Black person on zebra crossing -->
  <g fill="#1e293b">
    <rect x="135" y="270" width="130" height="6" rx="2" />
    <rect x="145" y="258" width="110" height="5" rx="2" />
    <rect x="155" y="247" width="90" height="5" rx="2" />
    <circle cx="195" cy="165" r="13" />
    <path d="M 195 180 L 180 220 L 165 245" stroke="#1e293b" stroke-width="10" stroke-linecap="round" fill="none" />
    <path d="M 185 210 L 210 248" stroke="#1e293b" stroke-width="10" stroke-linecap="round" fill="none" />
    <path d="M 195 182 L 170 205" stroke="#1e293b" stroke-width="9" stroke-linecap="round" fill="none" />
    <path d="M 195 182 L 218 205" stroke="#1e293b" stroke-width="9" stroke-linecap="round" fill="none" />
  </g>
  <rect x="40" y="340" width="320" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Biển I.423: Vị trí người đi bộ sang đường</text>
</svg>`;

// 12. Biển I.401 Bắt đầu đường ưu tiên
const svgI401 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0f172a" />
  <!-- Rhombus / Diamond -->
  <g transform="translate(200, 180) rotate(45)">
    <rect x="-90" y="-90" width="180" height="180" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" />
    <rect x="-65" y="-65" width="130" height="130" rx="6" fill="#facc15" stroke="#000000" stroke-width="2" />
  </g>
  <rect x="50" y="340" width="300" height="40" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="365" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="15" font-weight="bold">Biển I.401: Bắt đầu đoạn đường ưu tiên</text>
</svg>`;

// 13. Sa hình 1: Thứ tự xe ưu tiên (Hỏa - Sự - An - Thương)
const svgSaHinh1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Intersection Roads -->
  <rect x="0" y="160" width="600" height="130" fill="#1e293b" />
  <rect x="235" y="0" width="130" height="450" fill="#1e293b" />
  <!-- Road borders -->
  <line x1="0" y1="160" x2="235" y2="160" stroke="#475569" stroke-width="4" />
  <line x1="365" y1="160" x2="600" y2="160" stroke="#475569" stroke-width="4" />
  <line x1="0" y1="290" x2="235" y2="290" stroke="#475569" stroke-width="4" />
  <line x1="365" y1="290" x2="600" y2="290" stroke="#475569" stroke-width="4" />
  <line x1="235" y1="0" x2="235" y2="160" stroke="#475569" stroke-width="4" />
  <line x1="365" y1="0" x2="365" y2="160" stroke="#475569" stroke-width="4" />
  <line x1="235" y1="290" x2="235" y2="450" stroke="#475569" stroke-width="4" />
  <line x1="365" y1="290" x2="365" y2="450" stroke="#475569" stroke-width="4" />
  <!-- Center dashed line -->
  <line x1="0" y1="225" x2="235" y2="225" stroke="#facc15" stroke-dasharray="12,12" stroke-width="3" />
  <line x1="365" y1="225" x2="600" y2="225" stroke="#facc15" stroke-dasharray="12,12" stroke-width="3" />
  <line x1="300" y1="0" x2="300" y2="160" stroke="#facc15" stroke-dasharray="12,12" stroke-width="3" />
  <line x1="300" y1="290" x2="300" y2="450" stroke="#facc15" stroke-dasharray="12,12" stroke-width="3" />

  <!-- VEHICLE 1: Xe Cứu Hỏa (Phía dưới đi lên) -->
  <g transform="translate(310, 310)">
    <rect x="0" y="0" width="42" height="75" rx="8" fill="#dc2626" stroke="#fecaca" stroke-width="2" />
    <rect x="6" y="6" width="30" height="20" rx="3" fill="#991b1b" />
    <circle cx="21" cy="4" r="5" fill="#fef08a" />
    <!-- Ladder -->
    <line x1="15" y1="35" x2="27" y2="35" stroke="#ffffff" stroke-width="3" />
    <line x1="15" y1="45" x2="27" y2="45" stroke="#ffffff" stroke-width="3" />
    <line x1="15" y1="55" x2="27" y2="55" stroke="#ffffff" stroke-width="3" />
    <path d="M 21 -10 L 21 -25 M 15 -18 L 21 -28 L 27 -18" stroke="#ef4444" stroke-width="3" fill="none" />
  </g>
  <rect x="365" y="325" width="130" height="26" rx="6" fill="#dc2626" />
  <text x="430" y="342" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">1. Xe Cứu Hỏa</text>

  <!-- VEHICLE 2: Xe Quân Sự (Bên trái đi sang) -->
  <g transform="translate(140, 235)">
    <rect x="0" y="0" width="70" height="38" rx="6" fill="#15803d" stroke="#bbf7d0" stroke-width="2" />
    <polygon points="35,10 40,24 25,15 45,15 30,24" fill="#facc15" />
    <path d="M 80 19 L 98 19 M 90 13 L 100 19 L 90 25" stroke="#22c55e" stroke-width="3" fill="none" />
  </g>
  <rect x="60" y="280" width="125" height="26" rx="6" fill="#15803d" />
  <text x="122" y="297" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">2. Xe Quân Sự</text>

  <!-- VEHICLE 3: Xe Công An (Bên phải đi sang) -->
  <g transform="translate(400, 175)">
    <rect x="0" y="0" width="65" height="36" rx="6" fill="#1d4ed8" stroke="#bfdbfe" stroke-width="2" />
    <circle cx="32" cy="18" r="6" fill="#ef4444" />
    <text x="18" y="24" fill="#ffffff" font-size="10" font-weight="bold">POLICE</text>
    <path d="M -10 18 L -28 18 M -20 12 L -30 18 L -20 24" stroke="#3b82f6" stroke-width="3" fill="none" />
  </g>
  <rect x="420" y="140" width="120" height="26" rx="6" fill="#1d4ed8" />
  <text x="480" y="157" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">3. Xe Công An</text>

  <!-- VEHICLE 4: Xe Cứu Thương (Phía trên đi xuống) -->
  <g transform="translate(250, 60)">
    <rect x="0" y="0" width="38" height="65" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
    <rect x="15" y="25" width="8" height="20" fill="#dc2626" />
    <rect x="9" y="31" width="20" height="8" fill="#dc2626" />
    <path d="M 19 75 L 19 90 M 13 82 L 19 92 L 25 82" stroke="#ffffff" stroke-width="3" fill="none" />
  </g>
  <rect x="110" y="75" width="130" height="26" rx="6" fill="#334155" />
  <text x="175" y="92" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">4. Xe Cứu Thương</text>

  <!-- Summary banner -->
  <rect x="60" y="405" width="480" height="34" rx="8" fill="#1e293b" stroke="#475569" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">Mẹo thứ tự ưu tiên: HỎA (1) &rarr; SỰ (2) &rarr; AN (3) &rarr; THƯƠNG (4)</text>
</svg>`;

// 14. Sa hình 2: Ngã tư đồng cấp - Bên phải trống
const svgSaHinh2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Roads -->
  <rect x="0" y="160" width="600" height="130" fill="#1e293b" />
  <rect x="235" y="0" width="130" height="450" fill="#1e293b" />
  <!-- Lanes -->
  <line x1="0" y1="225" x2="235" y2="225" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="2" />
  <line x1="365" y1="225" x2="600" y2="225" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="2" />
  <line x1="300" y1="0" x2="300" y2="160" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="2" />
  <line x1="300" y1="290" x2="300" y2="450" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="2" />

  <!-- West: Không có xe (Bên phải trống) -->
  <rect x="70" y="175" width="120" height="80" rx="8" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-dasharray="6,6" stroke-width="2" />
  <text x="130" y="210" text-anchor="middle" fill="#34d399" font-size="12" font-weight="bold">HƯỚNG TÂY TRỐNG</text>
  <text x="130" y="230" text-anchor="middle" fill="#6ee7b7" font-size="11">(Không có xe)</text>

  <!-- South: Xe Mô tô (Đi thẳng) - Bên phải là hướng Tây trống! -->
  <g transform="translate(310, 320)">
    <rect x="0" y="0" width="30" height="60" rx="6" fill="#3b82f6" stroke="#93c5fd" stroke-width="2" />
    <circle cx="15" cy="15" r="5" fill="#f8fafc" />
    <path d="M 15 -10 L 15 -35 M 8 -25 L 15 -38 L 22 -25" stroke="#3b82f6" stroke-width="3" fill="none" />
  </g>
  <rect x="360" y="340" width="150" height="30" rx="6" fill="#2563eb" />
  <text x="435" y="360" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Mô tô (Đi trước 1)</text>

  <!-- East: Xe Con (Đi thẳng) -->
  <g transform="translate(420, 180)">
    <rect x="0" y="0" width="65" height="35" rx="6" fill="#eab308" stroke="#fef08a" stroke-width="2" />
    <path d="M -10 17 L -35 17 M -25 10 L -38 17 L -25 24" stroke="#eab308" stroke-width="3" fill="none" />
  </g>
  <rect x="420" y="140" width="130" height="28" rx="6" fill="#ca8a04" />
  <text x="485" y="158" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Con (Đi sau 2)</text>

  <!-- North: Xe Tải (Rẽ trái) -->
  <g transform="translate(250, 70)">
    <rect x="0" y="0" width="38" height="65" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <path d="M 19 75 Q 19 110 60 110" stroke="#ef4444" stroke-width="3" fill="none" stroke-dasharray="4,4" />
  </g>
  <rect x="110" y="80" width="130" height="28" rx="6" fill="#dc2626" />
  <text x="175" y="98" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Tải (Đi sau cùng 3)</text>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Quy tắc ngã tư: Xe nào có bên phải trống (không vướng) được đi trước!</text>
</svg>`;

// 15. Sa hình 3: Ngã tư có đường ưu tiên (Biển W.208 & I.401)
const svgSaHinh3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <rect x="0" y="160" width="600" height="130" fill="#1e293b" />
  <rect x="235" y="0" width="130" height="450" fill="#1e293b" />

  <!-- Road I.401 on Vertical axis: Đường ưu tiên -->
  <g transform="translate(380, 240)">
    <!-- Small inverted triangle sign on Horizontal road -->
    <polygon points="0,0 24,0 12,24" fill="#facc15" stroke="#dc2626" stroke-width="2" />
    <text x="12" y="38" text-anchor="middle" fill="#f87171" font-size="10" font-weight="bold">Biển W.208</text>
  </g>
  <g transform="translate(200, 310)">
    <!-- Small diamond sign on Vertical road -->
    <rect x="-8" y="-8" width="16" height="16" transform="rotate(45)" fill="#facc15" stroke="#ffffff" stroke-width="2" />
    <text x="-8" y="24" text-anchor="middle" fill="#fde047" font-size="10" font-weight="bold">Biển I.401 (Ưu tiên)</text>
  </g>

  <!-- Car on Priority road (South -> North) -->
  <g transform="translate(305, 330)">
    <rect x="0" y="0" width="36" height="60" rx="6" fill="#10b981" stroke="#a7f3d0" stroke-width="2" />
    <path d="M 18 -10 L 18 -40 M 10 -30 L 18 -45 L 26 -30" stroke="#10b981" stroke-width="3" fill="none" />
  </g>
  <rect x="360" y="360" width="160" height="30" rx="6" fill="#059669" />
  <text x="440" y="380" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Con (Đường ưu tiên - Đi 1)</text>

  <!-- Truck on secondary road (East -> West) -->
  <g transform="translate(430, 180)">
    <rect x="0" y="0" width="65" height="35" rx="6" fill="#f97316" stroke="#fed7aa" stroke-width="2" />
    <path d="M -10 17 L -35 17 M -25 10 L -38 17 L -25 24" stroke="#f97316" stroke-width="3" fill="none" />
  </g>
  <rect x="420" y="140" width="140" height="28" rx="6" fill="#c2410c" />
  <text x="490" y="158" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Tải (Đường phụ - Nhường)</text>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Xe trên đường có biển I.401 được quyền ưu tiên qua nơi giao nhau!</text>
</svg>`;

// 16. Sa hình 4: Vòng xuyến
const svgSaHinh4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Roundabout island -->
  <circle cx="300" cy="225" r="140" fill="#1e293b" stroke="#475569" stroke-width="4" />
  <circle cx="300" cy="225" r="60" fill="#065f46" stroke="#34d399" stroke-width="3" />
  <!-- Sign R.303 in island -->
  <circle cx="300" cy="225" r="24" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
  <text x="300" y="230" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">↻</text>

  <!-- Car A already inside roundabout -->
  <g transform="translate(240, 110) rotate(-40)">
    <rect x="0" y="0" width="50" height="28" rx="5" fill="#3b82f6" stroke="#bfdbfe" stroke-width="2" />
  </g>
  <rect x="110" y="80" width="160" height="28" rx="6" fill="#1d4ed8" />
  <text x="190" y="98" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe A (Đã trong vòng xuyến)</text>

  <!-- Car B entering from south -->
  <g transform="translate(285, 340)">
    <rect x="0" y="0" width="30" height="55" rx="5" fill="#ef4444" stroke="#fecaca" stroke-width="2" />
    <path d="M 15 -10 L 15 -30 M 8 -20 L 15 -35 L 22 -20" stroke="#ef4444" stroke-width="3" fill="none" />
  </g>
  <rect x="340" y="360" width="150" height="28" rx="6" fill="#b91c1c" />
  <text x="415" y="378" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe B (Đang đi vào)</text>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Tại nơi có báo hiệu vòng xuyến: Phải nhường đường cho xe đi từ bên TRÁI!</text>
</svg>`;

// 17. Sa hình 5: Xe dốc hẹp
const svgSaHinh5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Mountain incline road -->
  <polygon points="50,380 550,150 550,230 50,440" fill="#1e293b" stroke="#475569" stroke-width="3" />
  <!-- Incline arrow -->
  <line x1="80" y1="360" x2="520" y2="160" stroke="#facc15" stroke-dasharray="10,10" stroke-width="2" />

  <!-- Car A ascending (going up) -->
  <g transform="translate(140, 310) rotate(-24)">
    <rect x="0" y="0" width="60" height="30" rx="6" fill="#10b981" stroke="#a7f3d0" stroke-width="2" />
    <text x="30" y="20" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">Xe A (Lên)</text>
    <path d="M 70 15 L 100 15 M 90 8 L 105 15 L 90 22" stroke="#10b981" stroke-width="3" fill="none" />
  </g>
  <rect x="50" y="240" width="160" height="28" rx="6" fill="#059669" />
  <text x="130" y="258" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe A (Đang lên dốc - Đi trước)</text>

  <!-- Car B descending (going down) with obstacle ahead -->
  <g transform="translate(420, 180) rotate(-24)">
    <rect x="0" y="0" width="60" height="30" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="30" y="20" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">Xe B (Xuống)</text>
    <!-- Barrier ahead -->
    <rect x="-35" y="-5" width="14" height="40" fill="#eab308" stroke="#1e293b" stroke-width="2" />
  </g>
  <rect x="360" y="90" width="180" height="28" rx="6" fill="#dc2626" />
  <text x="450" y="108" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe B (Xuống dốc - Phải nhường)</text>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Quy tắc dốc hẹp: Xe xuống dốc phải nhường đường cho xe đang lên dốc!</text>
</svg>`;

// 18. Sa hình 6: Vượt xe vạch liền
const svgSaHinh6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Straight 2-lane road -->
  <rect x="80" y="0" width="440" height="400" fill="#1e293b" stroke="#475569" stroke-width="4" />
  <!-- Center continuous solid yellow line -->
  <line x1="300" y1="0" x2="300" y2="400" stroke="#facc15" stroke-width="6" />

  <!-- Truck going in right lane -->
  <g transform="translate(340, 100)">
    <rect x="0" y="0" width="60" height="110" rx="8" fill="#f97316" stroke="#fed7aa" stroke-width="2" />
    <text x="30" y="60" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">Xe Tải</text>
  </g>

  <!-- Car crossing solid line to overtake -->
  <g transform="translate(240, 260)">
    <rect x="0" y="0" width="45" height="75" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="22" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">Xe Con</text>
    <!-- S curved arrow crossing solid line -->
    <path d="M 22 -10 Q 22 -60 -20 -90 Q -20 -130 50 -160" stroke="#ef4444" stroke-width="4" fill="none" stroke-dasharray="6,4" />
  </g>

  <!-- Big Red X forbidden stamp -->
  <circle cx="270" cy="190" r="32" fill="#ef4444" fill-opacity="0.9" stroke="#ffffff" stroke-width="3" />
  <text x="270" y="202" text-anchor="middle" fill="#ffffff" font-size="34" font-weight="bold">✕</text>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#f87171" font-size="13" font-weight="bold">CẤM VƯỢT: Không được đè vạch nét liền màu vàng sang làn đường ngược chiều!</text>
</svg>`;

// 19. Minh họa Điểm liệt: Nồng độ cồn & ma túy
const svgDiemLietCon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <!-- Red glowing badge -->
  <rect x="40" y="30" width="520" height="65" rx="14" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="2" />
  <text x="300" y="70" text-anchor="middle" fill="#f87171" font-size="18" font-weight="900">⚠️ CÂU ĐIỂM LIỆT: ĐÃ UỐNG RƯỢU BIA - KHÔNG LÁI XE</text>

  <!-- Big prohibition circle -->
  <circle cx="300" cy="240" r="115" fill="#ffffff" stroke="#dc2626" stroke-width="22" />
  <!-- Beer glass and bottle -->
  <g transform="translate(235, 175)" fill="#1e293b">
    <!-- Bottle -->
    <path d="M 30 115 L 30 55 Q 30 40 42 35 L 42 10 L 58 10 L 58 35 Q 70 40 70 55 L 70 115 Z" fill="#059669" />
    <!-- Glass mug -->
    <path d="M 85 115 L 80 45 L 125 45 L 120 115 Z" fill="#d97706" />
    <path d="M 125 55 L 140 55 C 145 55 145 95 122 95" stroke="#d97706" stroke-width="8" fill="none" />
    <rect x="75" y="40" width="55" height="12" rx="4" fill="#ffffff" />
  </g>
  <!-- Diagonal prohibition line -->
  <line x1="215" y1="155" x2="385" y2="325" stroke="#dc2626" stroke-width="20" stroke-linecap="round" />

  <!-- Speedometer gauge showing 0.00 mg/L -->
  <rect x="180" y="380" width="240" height="45" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
  <text x="300" y="408" text-anchor="middle" fill="#38bdf8" font-size="15" font-weight="bold">Quy định: Nồng độ = 0.00</text>
</svg>`;

// 20. Minh họa Điểm liệt: Cấm lùi xe cao tốc
const svgDiemLietCaoToc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <rect x="40" y="25" width="520" height="60" rx="14" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="2" />
  <text x="300" y="62" text-anchor="middle" fill="#f87171" font-size="18" font-weight="900">⚠️ ĐIỂM LIỆT: CẤM LÙI XE / QUAY ĐẦU TRÊN CAO TỐC</text>

  <!-- Highway sign CT01 -->
  <rect x="220" y="105" width="160" height="70" rx="8" fill="#15803d" stroke="#ffffff" stroke-width="3" />
  <text x="300" y="140" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold">ĐƯỜNG CAO TỐC</text>
  <text x="300" y="162" text-anchor="middle" fill="#fde047" font-size="14" font-weight="bold">MAX 120 - MIN 60</text>

  <!-- Road -->
  <rect x="120" y="190" width="360" height="190" fill="#1e293b" stroke="#475569" stroke-width="3" />
  <line x1="240" y1="190" x2="240" y2="380" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="3" />
  <line x1="360" y1="190" x2="360" y2="380" stroke="#ffffff" stroke-dasharray="10,10" stroke-width="3" />

  <!-- Car reversing backward with red ban -->
  <g transform="translate(270, 240)">
    <rect x="0" y="0" width="40" height="70" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="20" y="40" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">LÙI XE</text>
    <path d="M 20 80 L 20 110 M 12 100 L 20 112 L 28 100" stroke="#ef4444" stroke-width="4" fill="none" />
  </g>
  <!-- Ban circle -->
  <circle cx="290" cy="285" r="45" fill="none" stroke="#dc2626" stroke-width="8" />
  <line x1="258" y1="253" x2="322" y2="317" stroke="#dc2626" stroke-width="8" />

  <rect x="40" y="400" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="422" text-anchor="middle" fill="#f87171" font-size="13" font-weight="bold">Tuyệt đối không được lùi xe, quay đầu hoặc đi ngược chiều trên cao tốc!</text>
</svg>`;

// 21. Minh họa Điểm liệt: Đường sắt
const svgDiemLietDuongSat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <rect x="40" y="25" width="520" height="60" rx="14" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="2" />
  <text x="300" y="62" text-anchor="middle" fill="#f87171" font-size="17" font-weight="900">⚠️ ĐIỂM LIỆT: DỪNG XE CÁCH ĐƯỜNG SẮT TỐI THIỂU 5 MÉT</text>

  <!-- Railroad track -->
  <rect x="0" y="210" width="600" height="50" fill="#78350f" fill-opacity="0.3" />
  <line x1="0" y1="220" x2="600" y2="220" stroke="#94a3b8" stroke-width="6" />
  <line x1="0" y1="250" x2="600" y2="250" stroke="#94a3b8" stroke-width="6" />
  <!-- Ties -->
  ${Array.from({ length: 15 }).map((_, i) => `<line x1="${i * 42 + 10}" y1="210" x2="${i * 42 + 10}" y2="260" stroke="#451a03" stroke-width="5" />`).join('\n')}

  <!-- Car stopped before track -->
  <g transform="translate(270, 310)">
    <rect x="0" y="0" width="45" height="75" rx="6" fill="#3b82f6" stroke="#93c5fd" stroke-width="2" />
    <text x="22" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">Ô Tô Dừng</text>
  </g>

  <!-- Safe distance indicator 5 METERS -->
  <line x1="292" y1="260" x2="292" y2="310" stroke="#facc15" stroke-width="3" stroke-dasharray="4,4" />
  <rect x="305" y="275" width="120" height="26" rx="6" fill="#facc15" />
  <text x="365" y="293" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="bold">≥ 5 MÉT (An toàn)</text>

  <!-- Red warning signal lights -->
  <g transform="translate(140, 110)">
    <polygon points="0,0 60,40 60,0 0,40" fill="#ffffff" stroke="#dc2626" stroke-width="6" />
    <circle cx="30" cy="65" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="3" />
  </g>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Khi có tín hiệu đèn đỏ hoặc chuông: Phải dừng cách ray ngoài cùng ít nhất 5m!</text>
</svg>`;

// 22. Minh họa cự ly an toàn
const svgKhoangCachAnToan = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <text x="300" y="45" text-anchor="middle" fill="#38bdf8" font-size="18" font-weight="bold">QUY ĐỊNH KHOẢNG CÁCH AN TOÀN TỐI THIỂU</text>

  <!-- Table grid -->
  <g transform="translate(50, 75)" font-family="sans-serif">
    <!-- Header -->
    <rect x="0" y="0" width="500" height="40" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
    <text x="130" y="25" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="bold">Tốc độ lưu hành (v)</text>
    <text x="370" y="25" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="bold">Cự ly an toàn tối thiểu</text>

    <!-- Row 1: v = 60 -->
    <rect x="0" y="50" width="500" height="45" rx="6" fill="#0f172a" stroke="#334155" />
    <text x="130" y="78" text-anchor="middle" fill="#ffffff" font-size="15">v = 60 km/h</text>
    <text x="370" y="78" text-anchor="middle" fill="#38bdf8" font-size="17" font-weight="bold">35 mét</text>

    <!-- Row 2: 60 < v <= 80 -->
    <rect x="0" y="105" width="500" height="45" rx="6" fill="#0f172a" stroke="#334155" />
    <text x="130" y="133" text-anchor="middle" fill="#ffffff" font-size="15">60 &lt; v &le; 80 km/h</text>
    <text x="370" y="133" text-anchor="middle" fill="#34d399" font-size="17" font-weight="bold">55 mét</text>

    <!-- Row 3: 80 < v <= 100 -->
    <rect x="0" y="160" width="500" height="45" rx="6" fill="#0f172a" stroke="#334155" />
    <text x="130" y="188" text-anchor="middle" fill="#ffffff" font-size="15">80 &lt; v &le; 100 km/h</text>
    <text x="370" y="188" text-anchor="middle" fill="#facc15" font-size="17" font-weight="bold">70 mét</text>

    <!-- Row 4: 100 < v <= 120 -->
    <rect x="0" y="215" width="500" height="45" rx="6" fill="#0f172a" stroke="#334155" />
    <text x="130" y="243" text-anchor="middle" fill="#ffffff" font-size="15">100 &lt; v &le; 120 km/h</text>
    <text x="370" y="243" text-anchor="middle" fill="#f87171" font-size="17" font-weight="bold">100 mét</text>
  </g>

  <!-- Visual cars illustration -->
  <g transform="translate(80, 345)">
    <rect x="0" y="0" width="70" height="32" rx="6" fill="#3b82f6" />
    <text x="35" y="20" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Xe Sau</text>
    <line x1="85" y1="16" x2="350" y2="16" stroke="#facc15" stroke-dasharray="6,4" stroke-width="3" />
    <text x="215" y="10" text-anchor="middle" fill="#facc15" font-size="12" font-weight="bold">&larr; Cự ly an toàn (d) &rarr;</text>
    <rect x="365" y="0" width="70" height="32" rx="6" fill="#10b981" />
    <text x="400" y="20" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Xe Trước</text>
  </g>

  <rect x="40" y="405" width="520" height="34" rx="8" fill="#1e293b" stroke="#334155" />
  <text x="300" y="427" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">Mẹo nhớ nhanh cự ly an toàn: 35m &rarr; 55m &rarr; 70m &rarr; 100m</text>
</svg>`;

// 23. Minh họa vạch kẻ đường (vạch vàng nét đứt vs nét liền)
const svgVachKeDuong = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <rect width="600" height="450" rx="20" fill="#0b1329" />
  <text x="300" y="45" text-anchor="middle" fill="#38bdf8" font-size="18" font-weight="bold">PHÂN BIỆT VẠCH KẺ ĐƯỜNG VÀNG &amp; TRẮNG</text>

  <!-- Case 1: Vạch vàng nét đứt -->
  <g transform="translate(60, 80)">
    <rect x="0" y="0" width="220" height="240" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <line x1="110" y1="15" x2="110" y2="225" stroke="#facc15" stroke-dasharray="16,16" stroke-width="8" />
    <rect x="20" y="190" width="180" height="36" rx="8" fill="#059669" />
    <text x="110" y="213" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">ĐƯỢC PHÉP ĐÈ VẠCH / VƯỢT</text>
    <text x="110" y="40" text-anchor="middle" fill="#facc15" font-size="13" font-weight="bold">Vạch Vàng Nét Đứt</text>
  </g>

  <!-- Case 2: Vạch vàng nét liền -->
  <g transform="translate(320, 80)">
    <rect x="0" y="0" width="220" height="240" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <line x1="110" y1="15" x2="110" y2="225" stroke="#facc15" stroke-width="8" />
    <rect x="20" y="190" width="180" height="36" rx="8" fill="#dc2626" />
    <text x="110" y="213" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">CẤM ĐÈ VẠCH / CẤM VƯỢT</text>
    <text x="110" y="40" text-anchor="middle" fill="#facc15" font-size="13" font-weight="bold">Vạch Vàng Nét Liền</text>
  </g>

  <rect x="40" y="340" width="520" height="45" rx="8" fill="#1e293b" stroke="#475569" />
  <text x="300" y="362" text-anchor="middle" fill="#facc15" font-size="13" font-weight="bold">Vạch MÀU VÀNG: Phân chia 2 chiều xe chạy ngược chiều nhau (Tim đường)</text>
  <text x="300" y="378" text-anchor="middle" fill="#cbd5e1" font-size="12">Vạch MÀU TRẮNG: Phân chia các làn xe chạy cùng chiều</text>
</svg>`;

// Write all SVGs to files
const files = {
  'bien-p104-cam-moto.svg': svgP104,
  'bien-w207-giao-khong-uu-tien.svg': svgW207,
  'bien-w208-giao-uu-tien.svg': svgW208,
  'bien-w224-nguoi-di-bo.svg': svgW224,
  'bien-p106b-cam-xe-tai.svg': svgP106b,
  'bien-p101-cam-duong.svg': svgP101,
  'bien-p102-nguoc-chieu.svg': svgP102,
  'bien-p124-cam-quay-dau.svg': svgP124,
  'bien-p127-toc-do-50.svg': svgP127,
  'bien-r303-vong-xuyen.svg': svgR303,
  'bien-i423-nguoi-di-bo.svg': svgI423,
  'bien-i401-bat-dau-uu-tien.svg': svgI401,
  'sahinh-uu-tien-nga-tu.svg': svgSaHinh1,
  'sahinh-nga-tu-ben-phai-trong.svg': svgSaHinh2,
  'sahinh-duong-uu-tien.svg': svgSaHinh3,
  'sahinh-vong-xuyen.svg': svgSaHinh4,
  'sahinh-doc-hep.svg': svgSaHinh5,
  'sahinh-vuot-xe-vach-lien.svg': svgSaHinh6,
  'minh-hoa-diem-liet-nong-do-con.svg': svgDiemLietCon,
  'minh-hoa-diem-liet-cao-toc-lui-xe.svg': svgDiemLietCaoToc,
  'minh-hoa-diem-liet-duong-sat.svg': svgDiemLietDuongSat,
  'minh-hoa-khoang-cach-an-toan.svg': svgKhoangCachAnToan,
  'minh-hoa-vach-ke-duong.svg': svgVachKeDuong,
};

for (const [filename, content] of Object.entries(files)) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log('Created: ' + filename);
}
console.log('Successfully generated all ' + Object.keys(files).length + ' SVG illustration files!');
