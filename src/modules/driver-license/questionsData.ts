import { LicenseClass, LicenseExamConfig, LicenseQuestion } from "./types";

export const EXAM_CONFIGS: Record<LicenseClass, LicenseExamConfig> = {
  A1: {
    classId: "A1",
    title: "Hạng A1 (Mô tô 2 bánh 50cc - 175cc)",
    vehicleType: "Xe máy",
    totalQuestions: 25,
    durationMinutes: 19,
    passScore: 21,
    maxCriticalFail: 0,
  },
  A2: {
    classId: "A2",
    title: "Hạng A2 (Mô tô phân khối lớn > 175cc)",
    vehicleType: "Mô tô PKL",
    totalQuestions: 25,
    durationMinutes: 19,
    passScore: 23,
    maxCriticalFail: 0,
  },
  B1: {
    classId: "B1",
    title: "Hạng B1 (Ô tô số tự động đến 9 chỗ)",
    vehicleType: "Ô tô số tự động",
    totalQuestions: 30,
    durationMinutes: 20,
    passScore: 27,
    maxCriticalFail: 0,
  },
  B2: {
    classId: "B2",
    title: "Hạng B2 (Ô tô số sàn đến 9 chỗ, xe tải < 3.5T)",
    vehicleType: "Ô tô số sàn & tải nhẹ",
    totalQuestions: 35,
    durationMinutes: 22,
    passScore: 32,
    maxCriticalFail: 0,
  },
  C: {
    classId: "C",
    title: "Hạng C (Ô tô tải > 3.5 tấn)",
    vehicleType: "Xe tải nặng",
    totalQuestions: 40,
    durationMinutes: 24,
    passScore: 36,
    maxCriticalFail: 0,
  },
};

export const GPLX_QUESTIONS: LicenseQuestion[] = [
  // CÂU HỎI ĐIỂM LIỆT 1
  {
    id: "gplx-crit-1",
    questionNumber: 1,
    category: "critical",
    isCritical: true,
    question: "Hành vi điều khiển xe cơ giới chạy quá tốc độ quy định, giành đường, vượt ẩu có bị nghiêm cấm hay không?",
    options: [
      "Bị nghiêm cấm tùy từng trường hợp.",
      "Bị nghiêm cấm.",
      "Không bị nghiêm cấm nếu đường vắng.",
    ],
    correctIndex: 1,
    explanation: "Hành vi đua xe, lạng lách, giành đường vượt ẩu bị pháp luật nghiêm cấm tuyệt đối trong mọi trường hợp.",
    tip: "Mẹo: Thấy cụm từ 'Bị nghiêm cấm' thì chọn ngay là đáp án đúng!",
  },
  // CÂU HỎI ĐIỂM LIỆT 2
  {
    id: "gplx-crit-2",
    questionNumber: 2,
    category: "critical",
    isCritical: true,
    question: "Người điều khiển phương tiện tham gia giao thông đường bộ mà trong cơ thể có chất ma túy có bị nghiêm cấm hay không?",
    options: [
      "Bị nghiêm cấm.",
      "Không bị nghiêm cấm.",
      "Chỉ bị nghiêm cấm khi sử dụng quá liều.",
    ],
    correctIndex: 0,
    explanation: "Tuyệt đối không được điều khiển phương tiện khi trong cơ thể có nồng độ chất ma túy.",
    tip: "Mẹo: Câu hỏi có chữ 'chất ma túy' luôn chọn đáp án 'Bị nghiêm cấm'.",
  },
  // CÂU HỎI ĐIỂM LIỆT 3
  {
    id: "gplx-crit-3",
    questionNumber: 3,
    category: "critical",
    isCritical: true,
    question: "Người điều khiển xe mô tô, ô tô, máy kéo trên đường mà trong máu hoặc hơi thở có nồng độ cồn có bị nghiêm cấm không?",
    options: [
      "Bị nghiêm cấm.",
      "Chỉ bị cấm nếu nồng độ cồn vượt quá 50 miligam/100 mililít máu.",
      "Chỉ bị cấm khi điều khiển trên đường cao tốc.",
    ],
    correctIndex: 0,
    explanation: "Theo Luật Phòng chống tác hại của rượu bia và Nghị định 100/CP: Nghiêm cấm tuyệt đối nồng độ cồn khi lái xe.",
    tip: "Mẹo: 'Đã uống rượu bia, không lái xe' - nồng độ cồn dù ở mức nào cũng Bị nghiêm cấm.",
  },
  // CÂU HỎI ĐIỂM LIỆT 4
  {
    id: "gplx-crit-4",
    questionNumber: 4,
    category: "critical",
    isCritical: true,
    question: "Hành vi đưa xe cơ giới, xe máy chuyên dùng không bảo đảm tiêu chuẩn an toàn kỹ thuật và bảo vệ môi trường vào tham gia giao thông đường bộ có bị nghiêm cấm không?",
    options: [
      "Không bị nghiêm cấm.",
      "Bị nghiêm cấm.",
      "Bị nghiêm cấm tùy theo tuyến đường.",
    ],
    correctIndex: 1,
    explanation: "Đưa xe không đủ điều kiện an toàn kỹ thuật vào lưu thông là hành vi bị nghiêm cấm.",
  },
  // CÂU HỎI ĐIỂM LIỆT 5
  {
    id: "gplx-crit-5",
    questionNumber: 5,
    category: "critical",
    isCritical: true,
    question: "Ở phần đường dành cho người đi bộ qua đường, trên cầu, đầu cầu, đường cao tốc, đường hẹp, đường dốc, tại nơi đường bộ giao nhau cùng mức với đường sắt có được quay đầu xe hay không?",
    options: [
      "Được phép quay đầu xe.",
      "Không được phép.",
      "Tùy vào điều kiện giao thông thực tế.",
    ],
    correctIndex: 1,
    explanation: "Cấm tuyệt đối quay đầu xe trên cầu, gầm cầu vượt, đường cao tốc, đường hẹp, nơi giao cắt với đường sắt.",
    tip: "Mẹo: Thấy cụm từ 'Không được phép' thường là đáp án đúng.",
  },

  // KHÁI NIỆM & QUY TẮC
  {
    id: "gplx-rule-1",
    questionNumber: 6,
    category: "concepts_rules",
    isCritical: false,
    question: "Khái niệm 'Dải phân cách' được hiểu như thế nào là đúng?",
    options: [
      "Là bộ phận của đường để ngăn cách không cho các loại xe vào những nơi không được phép.",
      "Là bộ phận của đường để phân chia mặt đường thành hai chiều xe chạy riêng biệt hoặc để phân chia phần đường của xe cơ giới và xe thô sơ.",
      "Là bộ phận của đường để xác định ranh giới giữa lòng đường và vỉa hè.",
    ],
    correctIndex: 1,
    explanation: "Dải phân cách có tác dụng phân chia mặt đường thành 2 chiều chạy riêng biệt hoặc tách làn xe cơ giới và thô sơ.",
    tip: "Mẹo: Dải phân cách dùng để 'phân chia phần đường thành hai chiều xe chạy riêng biệt'.",
  },
  {
    id: "gplx-rule-2",
    questionNumber: 7,
    category: "concepts_rules",
    isCritical: false,
    question: "Người đủ 16 tuổi được điều khiển các loại xe nào dưới đây?",
    options: [
      "Xe mô tô 2 bánh có dung tích xi-lanh từ 50 cm3 trở lên.",
      "Xe gắn máy có dung tích xi-lanh dưới 50 cm3.",
      "Xe ô tô tải dưới 3,5 tấn.",
    ],
    correctIndex: 1,
    explanation: "Người đủ 16 tuổi được phép điều khiển xe gắn máy có dung tích dưới 50 cm3. Từ 18 tuổi mới được thi bằng lái A1, B1, B2.",
  },
  {
    id: "gplx-rule-3",
    questionNumber: 8,
    category: "concepts_rules",
    isCritical: false,
    question: "Người có giấy phép lái xe hạng B2 được điều khiển loại xe nào dưới đây?",
    options: [
      "Xe ô tô chở người đến 9 chỗ ngồi; ô tô tải có trọng tải thiết kế dưới 3.500 kg.",
      "Xe ô tô chở người từ 10 đến 30 chỗ ngồi.",
      "Xe ô tô tải có trọng tải thiết kế từ 3.500 kg trở lên.",
    ],
    correctIndex: 0,
    explanation: "Bằng B2: Ô tô chở người đến 9 chỗ ngồi, ô tô tải thiết kế dưới 3.500 kg (được kinh doanh vận tải).",
    tip: "Mẹo B2: Chở người ĐẾN 9 chỗ, xe tải DƯỚI 3.500 kg.",
  },

  // HỆ THỐNG BIỂN BÁO
  {
    id: "gplx-sign-1",
    questionNumber: 9,
    category: "traffic_signs",
    isCritical: false,
    question: "Biển nào dưới đây cấm xe mô tô hai bánh đi vào?",
    options: [
      "Biển 1 (Hình xe mô tô trong vòng tròn viền đỏ nền trắng có gạch chéo).",
      "Biển 2 (Hình ô tô con).",
      "Biển 3 (Hình ô tô tải).",
    ],
    correctIndex: 0,
    explanation: "Biển tròn viền đỏ vẽ hình mô tô là Biển số P.104 'Cấm mô tô'.",
    tip: "Mẹo: Cấm nhỏ thì cấm lớn, cấm lớn không cấm nhỏ.",
  },
  {
    id: "gplx-sign-2",
    questionNumber: 10,
    category: "traffic_signs",
    isCritical: false,
    question: "Biển báo hiệu hình tam giác đều, viền đỏ, nền vàng, ở giữa có hình vẽ màu đen là biển gì?",
    options: [
      "Biển báo cấm.",
      "Biển báo nguy hiểm.",
      "Biển báo hiệu lệnh.",
      "Biển chỉ dẫn.",
    ],
    correctIndex: 1,
    explanation: "Tam giác vàng viền đỏ là Biển báo nguy hiểm. Hình tròn viền đỏ là biển Cấm. Hình tròn xanh là Hiệu lệnh. Hình vuông/chữ nhật xanh là Chỉ dẫn.",
    tip: "Mẹo: Tròn đỏ = Cấm; Tam giác vàng = Nguy hiểm; Tròn xanh = Hiệu lệnh; Vuông/chữ nhật xanh = Chỉ dẫn.",
  },
  {
    id: "gplx-sign-3",
    questionNumber: 11,
    category: "traffic_signs",
    isCritical: false,
    question: "Gặp biển báo nào thì người lái xe phải nhường đường cho người đi bộ?",
    options: [
      "Biển hình vuông nền xanh có người đi bộ trên vạch kẻ đường (Biển 1).",
      "Biển tròn viền đỏ có người đi bộ bị gạch chéo (Biển 2).",
      "Biển tam giác vàng có trẻ em dắt tay nhau (Biển 3).",
    ],
    correctIndex: 0,
    explanation: "Biển 1 (Biển W.224 / I.423) báo trước nơi có người đi bộ sang đường, các phương tiện phải giảm tốc độ và nhường đường.",
  },

  // SA HÌNH
  {
    id: "gplx-sahinh-1",
    questionNumber: 12,
    category: "sa_hinh",
    isCritical: false,
    question: "Thứ tự các xe đi như thế nào là đúng quy tắc giao thông tại ngã tư?",
    options: [
      "Xe công an, Xe quân sự, Xe con, Xe cứu thương.",
      "Xe quân sự, Xe công an, Xe cứu thương, Xe con.",
      "Xe cứu thương, Xe quân sự, Xe công an, Xe con.",
    ],
    correctIndex: 1,
    explanation: "Thứ tự xe ưu tiên theo Luật Giao thông: Hỏa (Cứu hỏa) &rarr; Sự (Quân sự) &rarr; An (Công an) &rarr; Thương (Cứu thương).",
    tip: "Mẹo sa hình: 'HỎA - SỰ - AN - THƯƠNG' (Cứu hỏa &rarr; Quân sự &rarr; Công an &rarr; Cứu thương).",
  },
  {
    id: "gplx-sahinh-2",
    questionNumber: 13,
    category: "sa_hinh",
    isCritical: false,
    question: "Tại ngã tư không có biển báo ưu tiên và không có tín hiệu đèn giao thông, xe nào được quyền đi trước?",
    options: [
      "Xe rẽ trái.",
      "Xe đi thẳng.",
      "Xe phía bên phải không vướng (bên phải trống).",
    ],
    correctIndex: 2,
    explanation: "Tại ngã tư đồng cấp không có vòng xuyến: Xe có hướng bên phải không bị vướng được quyền đi trước.",
    tip: "Mẹo: Quy tắc nhường đường đồng cấp: 'Nhất chớm, nhì ưu, tam đường, tứ hướng (Phải &rarr; Thẳng &rarr; Trái)'.",
  },
  {
    id: "gplx-sahinh-3",
    questionNumber: 14,
    category: "sa_hinh",
    isCritical: false,
    question: "Xe nào phải nhường đường khi lên dốc và xuống dốc trên đoạn đường hẹp?",
    options: [
      "Xe đang lên dốc phải nhường đường cho xe xuống dốc.",
      "Xe đang xuống dốc phải nhường đường cho xe đang lên dốc.",
      "Xe nào to hơn thì được đi trước.",
    ],
    correctIndex: 1,
    explanation: "Xe xuống dốc phải nhường đường cho xe lên dốc vì xe lên dốc có quán tính và độ trôi nguy hiểm hơn.",
    tip: "Mẹo: 'Xuống dốc nhường lên dốc'.",
  },
];

/**
 * Generates mock exam set with exact question counts for selected License Class
 */
export function generateMockExam(classId: LicenseClass): LicenseQuestion[] {
  const config = EXAM_CONFIGS[classId];
  const count = config.totalQuestions;

  // Clone and repeat questions if pool is smaller than full test size to fill required count
  let fullList = [...GPLX_QUESTIONS];
  while (fullList.length < count) {
    fullList = fullList.concat(
      GPLX_QUESTIONS.map((q, idx) => ({
        ...q,
        id: `${q.id}-dup-${idx}-${Date.now()}`,
        questionNumber: fullList.length + idx + 1,
      }))
    );
  }

  // Shuffle and pick exact count, ensuring at least 3 critical questions are included
  const criticals = fullList.filter((q) => q.isCritical);
  const others = fullList.filter((q) => !q.isCritical).sort(() => 0.5 - Math.random());

  const selectedCrit = criticals.slice(0, 3);
  const selectedOthers = others.slice(0, count - selectedCrit.length);

  const exam = [...selectedCrit, ...selectedOthers].sort(() => 0.5 - Math.random());
  return exam.map((q, i) => ({ ...q, questionNumber: i + 1 }));
}

export const GPLX_TIPS = [
  {
    title: "Mẹo câu hỏi ĐIỂM LIỆT (60 câu)",
    content: "Các câu có từ khóa: 'Bị nghiêm cấm', 'Không được phép', 'Không được quay đầu', 'Chất ma túy', 'Nồng độ cồn' &rarr; Chọn luôn đáp án có cụm từ đó!",
  },
  {
    title: "Mẹo thứ tự ưu tiên xe SA HÌNH",
    content: "'HỎA - SỰ - AN - THƯƠNG': Xe cứu hỏa đi trước nhất, đến Xe quân sự, Xe công an, và Xe cứu thương.",
  },
  {
    title: "Mẹo nhường đường tại ngã tư",
    content: "'Nhất chớm, Nhì ưu, Tam đường, Tứ hướng': Xe nào đã chớm vào ngã tư trước đi trước; Xe ưu tiên; Đường ưu tiên; Cuối cùng xe Rẽ phải &rarr; Đi thẳng &rarr; Rẽ trái.",
  },
  {
    title: "Mẹo độ tuổi lái xe",
    content: "16 tuổi: Xe dưới 50cc. 18 tuổi: Bằng A1, A2, B1, B2. 21 tuổi: Bằng C. 24 tuổi: Bằng D. 27 tuổi: Bằng E.",
  },
  {
    title: "Mẹo biển báo giao thông",
    content: "Biển Tròn Đỏ: CẤM. Biển Tam Giác Vàng: NGUY HIỂM. Biển Tròn Xanh: HIỆU LỆNH phải theo. Biển Chữ Nhật Xanh: CHỈ DẪN.",
  },
];
