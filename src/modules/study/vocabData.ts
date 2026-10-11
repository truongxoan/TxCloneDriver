import { VocabItem, QuizQuestion, LanguageId } from "./types";

export const VOCAB_DATABASE: Record<LanguageId, VocabItem[]> = {
  chinese: [
    // HSK 1
    {
      id: "zh-1-1",
      word: "你好",
      pronunciation: "nǐ hǎo",
      meaning: "Hello",
      vietnameseMeaning: "Xin chào",
      exampleSentence: "你好，很高兴认识你。",
      exampleTranslation: "Xin chào, rất vui được làm quen với bạn.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-2",
      word: "谢谢",
      pronunciation: "xièxie",
      meaning: "Thank you",
      vietnameseMeaning: "Cảm ơn",
      exampleSentence: "谢谢你的帮助！",
      exampleTranslation: "Cảm ơn sự giúp đỡ của bạn!",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-3",
      word: "朋友",
      pronunciation: "péngyou",
      meaning: "Friend",
      vietnameseMeaning: "Bạn bè, bạn",
      exampleSentence: "我们是好朋友。",
      exampleTranslation: "Chúng tôi là những người bạn tốt.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-4",
      word: "爱",
      pronunciation: "ài",
      meaning: "Love",
      vietnameseMeaning: "Yêu, thích",
      exampleSentence: "我爱学习汉语。",
      exampleTranslation: "Tôi thích học tiếng Hán.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-5",
      word: "喝水",
      pronunciation: "hē shuǐ",
      meaning: "Drink water",
      vietnameseMeaning: "Uống nước",
      exampleSentence: "天气很热，多喝水。",
      exampleTranslation: "Thời tiết rất nóng, hãy uống nhiều nước.",
      difficulty: "HSK 1",
    },
    // HSK 2
    {
      id: "zh-2-1",
      word: "准备",
      pronunciation: "zhǔnbèi",
      meaning: "Prepare, get ready",
      vietnameseMeaning: "Chuẩn bị",
      exampleSentence: "你准备好考试了吗？",
      exampleTranslation: "Bạn đã chuẩn bị cho kỳ thi chưa?",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-2",
      word: "希望",
      pronunciation: "xīwàng",
      meaning: "Hope, wish",
      vietnameseMeaning: "Hy vọng",
      exampleSentence: "我希望明天是个好天气。",
      exampleTranslation: "Tôi hy vọng ngày mai thời tiết sẽ đẹp.",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-3",
      word: "帮助",
      pronunciation: "bāngzhù",
      meaning: "Help, assist",
      vietnameseMeaning: "Giúp đỡ",
      exampleSentence: "互相帮助非常重要。",
      exampleTranslation: "Giúp đỡ lẫn nhau là rất quan trọng.",
      difficulty: "HSK 2",
    },
    // HSK 3
    {
      id: "zh-3-1",
      word: "环境",
      pronunciation: "huánjìng",
      meaning: "Environment, surroundings",
      vietnameseMeaning: "Môi trường, hoàn cảnh",
      exampleSentence: "我们要保护自然环境。",
      exampleTranslation: "Chúng ta cần bảo vệ môi trường tự nhiên.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-2",
      word: "习惯",
      pronunciation: "xíguàn",
      meaning: "Habit, get used to",
      vietnameseMeaning: "Thói quen, tập quán",
      exampleSentence: "我已经习惯早起了。",
      exampleTranslation: "Tôi đã quen với việc dậy sớm rồi.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-3",
      word: "解决",
      pronunciation: "jiějué",
      meaning: "Solve, resolve",
      vietnameseMeaning: "Giải quyết",
      exampleSentence: "这个问题很容易解决。",
      exampleTranslation: "Vấn đề này rất dễ giải quyết.",
      difficulty: "HSK 3",
    },
    // HSK 4
    {
      id: "zh-4-1",
      word: "坚持",
      pronunciation: "jiānchí",
      meaning: "Persist, persevere",
      vietnameseMeaning: "Kiên trì",
      exampleSentence: "坚持就是胜利。",
      exampleTranslation: "Kiên trì chính là thắng lợi.",
      difficulty: "HSK 4",
    },
    {
      id: "zh-4-2",
      word: "经验",
      pronunciation: "jīngyàn",
      meaning: "Experience",
      vietnameseMeaning: "Kinh nghiệm",
      exampleSentence: "他在这个领域很有经验。",
      exampleTranslation: "Anh ấy có rất nhiều kinh nghiệm trong lĩnh vực này.",
      difficulty: "HSK 4",
    },
    // HSK 5
    {
      id: "zh-5-1",
      word: "珍惜",
      pronunciation: "zhēnxī",
      meaning: "Treasure, cherish",
      vietnameseMeaning: "Trân trọng, quý trọng",
      exampleSentence: "我们要珍惜时间与友谊。",
      exampleTranslation: "Chúng ta phải trân trọng thời gian và tình bạn.",
      difficulty: "HSK 5",
    },
    {
      id: "zh-5-2",
      word: "挑战",
      pronunciation: "tiǎozhàn",
      meaning: "Challenge",
      vietnameseMeaning: "Thách thức, thử thách",
      exampleSentence: "勇敢面对生活中的挑战。",
      exampleTranslation: "Dũng cảm đối mặt với những thử thách trong cuộc sống.",
      difficulty: "HSK 5",
    },
    // HSK 6
    {
      id: "zh-6-1",
      word: "渊博",
      pronunciation: "yuānbó",
      meaning: "Erudite, profound knowledge",
      vietnameseMeaning: "Uyên bác, sâu rộng",
      exampleSentence: "这位老教授学识非常渊博。",
      exampleTranslation: "Vị giáo sư già này học thức vô cùng uyên bác.",
      difficulty: "HSK 6",
    },
    {
      id: "zh-6-2",
      word: "络绎不绝",
      pronunciation: "luòyì bù jué",
      meaning: "Endless stream",
      vietnameseMeaning: "Nườm nượp không dứt",
      exampleSentence: "街上的行人络绎不绝。",
      exampleTranslation: "Người đi bộ trên phố nườm nượp không ngớt.",
      difficulty: "HSK 6",
    },
  ],

  english: [
    {
      id: "en-1",
      word: "Resilience",
      pronunciation: "/rɪˈzɪliəns/",
      meaning: "Ability to recover quickly from difficulties",
      vietnameseMeaning: "Khả năng phục hồi, kiên cường",
      exampleSentence: "Her resilience helped her overcome severe challenges.",
      exampleTranslation: "Sự kiên cường giúp cô ấy vượt qua các thử thách gian nan.",
      difficulty: "IELTS 7.0+",
    },
    {
      id: "en-2",
      word: "Ubiquitous",
      pronunciation: "/juːˈbɪkwɪtəs/",
      meaning: "Present, appearing, or found everywhere",
      vietnameseMeaning: "Phổ biến khắp nơi",
      exampleSentence: "Smartphones have become ubiquitous in daily life.",
      exampleTranslation: "Điện thoại thông minh đã trở nên phổ biến khắp mọi nơi.",
      difficulty: "IELTS 7.5+",
    },
    {
      id: "en-3",
      word: "Implement",
      pronunciation: "/ˈɪmplɪment/",
      meaning: "Put a plan or system into action",
      vietnameseMeaning: "Triển khai, thực hiện",
      exampleSentence: "The company implemented new security policies.",
      exampleTranslation: "Công ty đã triển khai các chính sách bảo mật mới.",
      difficulty: "TOEIC 750+",
    },
    {
      id: "en-4",
      word: "Collaborate",
      pronunciation: "/kəˈlæbəreɪt/",
      meaning: "Work together with someone",
      vietnameseMeaning: "Hợp tác, cộng tác",
      exampleSentence: "We need to collaborate closely with the team.",
      exampleTranslation: "Chúng ta cần hợp tác chặt chẽ với toàn đội ngũ.",
      difficulty: "TOEIC 650+",
    },
    {
      id: "en-5",
      word: "Perseverance",
      pronunciation: "/ˌpɜːsɪˈvɪərəns/",
      meaning: "Continued effort to achieve something",
      vietnameseMeaning: "Sự bền bỉ, kiên trì nhẫn nại",
      exampleSentence: "Perseverance is the key to mastering any skill.",
      exampleTranslation: "Sự kiên trì là chìa khóa để tinh thông bất kỳ kỹ năng nào.",
      difficulty: "IELTS 7.0+",
    },
  ],

  korean: [
    {
      id: "kr-1",
      word: "안녕하세요",
      pronunciation: "An-nyeong-ha-se-yo",
      meaning: "Hello / Good day",
      vietnameseMeaning: "Xin chào",
      exampleSentence: "안녕하세요! 만나서 반갑습니다.",
      exampleTranslation: "Xin chào! Rất vui được gặp bạn.",
      difficulty: "TOPIK I (Cơ bản)",
    },
    {
      id: "kr-2",
      word: "감사합니다",
      pronunciation: "Gam-sa-ham-ni-da",
      meaning: "Thank you",
      vietnameseMeaning: "Cảm ơn bạn",
      exampleSentence: "도와주셔서 대단히 감사합니다.",
      exampleTranslation: "Vô cùng cảm ơn sự giúp đỡ của bạn.",
      difficulty: "TOPIK I (Cơ bản)",
    },
    {
      id: "kr-3",
      word: "열심히",
      pronunciation: "Yeol-sim-hi",
      meaning: "Hard, enthusiastically",
      vietnameseMeaning: "Chăm chỉ, hết mình",
      exampleSentence: "한국어를 열심히 공부하고 있어요.",
      exampleTranslation: "Tôi đang chăm chỉ học tiếng Hàn.",
      difficulty: "TOPIK I",
    },
    {
      id: "kr-4",
      word: "성공하다",
      pronunciation: "Seong-gong-ha-da",
      meaning: "Succeed",
      vietnameseMeaning: "Thành công",
      exampleSentence: "노력하면 반드시 성공할 수 있습니다.",
      exampleTranslation: "Nếu nỗ lực bạn nhất định sẽ thành công.",
      difficulty: "TOPIK II",
    },
  ],

  japanese: [
    {
      id: "jp-1",
      word: "こんにちは",
      pronunciation: "Konnichiwa",
      meaning: "Hello",
      vietnameseMeaning: "Xin chào buổi trưa/chiều",
      exampleSentence: "皆さん、こんにちは！",
      exampleTranslation: "Chào mọi người!",
      difficulty: "JLPT N5",
    },
    {
      id: "jp-2",
      word: "ありがとう",
      pronunciation: "Arigatou",
      meaning: "Thank you",
      vietnameseMeaning: "Cảm ơn",
      exampleSentence: "いつも手伝ってくれてありがとう。",
      exampleTranslation: "Cảm ơn bạn luôn giúp đỡ tôi.",
      difficulty: "JLPT N5",
    },
    {
      id: "jp-3",
      word: "一生懸命",
      pronunciation: "Isshokenmei",
      meaning: "With all one's might, utmost effort",
      vietnameseMeaning: "Hết sức mình, chăm chỉ",
      exampleSentence: "日本語を一生懸命勉強しています。",
      exampleTranslation: "Tôi đang hết sức chăm chỉ học tiếng Nhật.",
      difficulty: "JLPT N4",
    },
    {
      id: "jp-4",
      word: "改善",
      pronunciation: "Kaizen",
      meaning: "Continuous improvement",
      vietnameseMeaning: "Cải tiến liên tục",
      exampleSentence: "プロセスの改善に取り組みます。",
      exampleTranslation: "Nỗ lực cải tiến quy trình công việc.",
      difficulty: "JLPT N3",
    },
  ],
};

/**
 * Dynamically generates infinite randomized quiz questions from vocabulary bank
 */
export function generateRandomQuizQuestion(lang: LanguageId, targetHsk?: string): QuizQuestion {
  let pool = VOCAB_DATABASE[lang] || VOCAB_DATABASE.chinese;
  if (targetHsk) {
    const filtered = pool.filter((v) => v.difficulty.includes(targetHsk));
    if (filtered.length >= 2) pool = filtered;
  }

  const target = pool[Math.floor(Math.random() * pool.length)];

  // Question styles:
  // 1: Word -> Vietnamese Meaning
  // 2: Vietnamese Meaning -> Word
  // 3: Word -> Pronunciation
  const qType = Math.random() < 0.4 ? "meaning" : Math.random() < 0.7 ? "character" : "pronunciation";

  let questionText = "";
  let correctAnswer = "";
  let wrongAnswers: string[] = [];

  if (qType === "meaning") {
    questionText = `Từ "${target.word}" (${target.pronunciation}) có nghĩa tiếng Việt là gì?`;
    correctAnswer = target.vietnameseMeaning;
    wrongAnswers = pool
      .filter((v) => v.id !== target.id)
      .map((v) => v.vietnameseMeaning)
      .filter((m) => m !== correctAnswer);
  } else if (qType === "character") {
    questionText = `Nghĩa "${target.vietnameseMeaning}" tương ứng với từ nào sau đây?`;
    correctAnswer = target.word;
    wrongAnswers = pool
      .filter((v) => v.id !== target.id)
      .map((v) => v.word)
      .filter((w) => w !== correctAnswer);
  } else {
    questionText = `Phiên âm chuẩn của từ "${target.word}" là gì?`;
    correctAnswer = target.pronunciation;
    wrongAnswers = pool
      .filter((v) => v.id !== target.id)
      .map((v) => v.pronunciation)
      .filter((p) => p !== correctAnswer);
  }

  // Shuffle wrong answers and pick 3
  const shuffledWrong = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
  // Add placeholder if not enough wrong options
  while (shuffledWrong.length < 3) {
    shuffledWrong.push(`Lựa chọn phụ ${shuffledWrong.length + 1}`);
  }

  const allOptions = [correctAnswer, ...shuffledWrong].sort(() => 0.5 - Math.random());

  return {
    id: `q-${Date.now()}-${Math.random()}`,
    question: questionText,
    questionType: qType,
    options: allOptions,
    correctAnswer,
    explanation: `Ví dụ: "${target.exampleSentence}" (${target.exampleTranslation})`,
    targetVocab: target,
  };
}

export const STUDY_TIPS = [
  {
    title: "Kỹ thuật Pomodoro 25/5",
    desc: "Tập trung cao độ 25 phút, sau đó nghỉ ngắn 5 phút. Sau 4 chu kỳ thì nghỉ dài 20 phút để não bộ phục hồi năng lượng.",
    tag: "Tập Trung",
  },
  {
    title: "Phương pháp Spaced Repetition (Lặp lại ngắt quãng)",
    desc: "Ôn lại từ vựng vào ngày 1, ngày 3, ngày 7 và ngày 30. Cách này giúp chuyển trí nhớ ngắn hạn thành trí nhớ vĩnh viễn.",
    tag: "Ghi Nhớ",
  },
  {
    title: "Phương pháp Feynman (Dạy lại cho người khác)",
    desc: "Giải thích lại kiến thức vừa học bằng từ ngữ đơn giản nhất như đang dạy cho một đứa trẻ 10 tuổi. Nếu bị vấp ở đâu, đó là lỗ hổng cần học lại.",
    tag: "Hiểu Sâu",
  },
  {
    title: "Active Recall (Chủ động truy xuất thông tin)",
    desc: "Thay vì chỉ đọc lại sách, hãy tự che đáp án và kiểm tra bản thân bằng Flashcard hoặc Trắc nghiệm ngẫu nhiên.",
    tag: "Hiệu Quả",
  },
  {
    title: "Học chữ Hán qua 214 Bộ Thủ",
    desc: "Chữ Hán là chữ tượng hình kết hợp từ các bộ thủ (như bộ Thủy 氵 liên quan đến nước, bộ Mộc 木 liên quan đến cây cối). Nhớ bộ thủ giúp đoán 80% ý nghĩa của chữ lạ!",
    tag: "Tiếng Trung HSK",
  },
];
