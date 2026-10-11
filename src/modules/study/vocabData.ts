import { VocabItem, QuizQuestion, LanguageId, DuolingoSentenceExercise, DriveCourseResource } from "./types";

export const CHINESE_DRIVE_RESOURCES: DriveCourseResource[] = [
  {
    id: "res-drive-file",
    title: "Giáo Trình Tiếng Trung Toàn Diện (File PDF / Sách bài tập)",
    type: "file",
    url: "https://drive.google.com/file/d/1wS58hrA9S3IiJlKzMLkRMkp5bVI4x0-o/view",
    description: "Tài liệu học tiếng Trung chuyên sâu, phiên âm chuẩn Pinyin, quy tắc biến điệu, ngữ pháp cơ bản đến nâng cao và từ vựng trọng tâm.",
    tag: "Giáo Trình Chuẩn",
    badge: "Tài liệu chính thức",
  },
  {
    id: "res-drive-folder",
    title: "Kho Học Liệu Tiếng Trung Google Drive (Thư mục Tổng hợp)",
    type: "folder",
    url: "https://drive.google.com/drive/folders/1Uf1dMCA9TFSTqUHXGP7FWzECXg-G5Xoy?usp=sharing",
    description: "Toàn bộ bài giảng video, file nghe audio MP3 bản ngữ, tài liệu luyện thi HSK 1-6 và flashcard bài học được đồng bộ trên Drive.",
    tag: "Thư mục Tài liệu",
    badge: "Audio & Video",
  },
];

export const DUOLINGO_CHINESE_EXERCISES: DuolingoSentenceExercise[] = [
  {
    id: "duo-1",
    vietnamese: "Tôi là người Việt Nam, rất vui được gặp bạn.",
    pinyin: "Wǒ shì Yuènán rén, hěn gāoxìng rènshí nǐ.",
    words: ["我", "是", "越南人", "很高兴", "认识", "你", "不", "美国人", "爱"],
    correctSentence: "我是越南人很高兴认识你",
    audioText: "我是越南人，很高兴认识你。",
    difficulty: "HSK 1",
    explanation: "Cấu trúc: 我 (Tôi) + 是 (là) + 越南人 (người Việt Nam) + 很高兴 (rất vui) + 认识你 (làm quen với bạn).",
  },
  {
    id: "duo-2",
    vietnamese: "Bạn hôm nay muốn đi đâu uống trà?",
    pinyin: "Nǐ jīntiān xiǎng qù nǎlǐ hē chá?",
    words: ["你", "今天", "想", "去", "哪里", "喝茶", "吗", "吃饭", "昨天"],
    correctSentence: "你今天想去哪里喝茶",
    audioText: "你今天想去哪里喝茶？",
    difficulty: "HSK 1",
    explanation: "Trật tự câu: Chủ ngữ (你) + Thời gian (今天) + Động từ nguyện vọng (想) + Động từ (去 + 哪里 + 喝茶).",
  },
  {
    id: "duo-3",
    vietnamese: "Cái áo này bao nhiêu tiền một chiếc?",
    pinyin: "Zhè jiàn yīfu duōshao qián yí jiàn?",
    words: ["这件", "衣服", "多少钱", "一件", "那本书", "太贵了", "便宜"],
    correctSentence: "这件衣服多少钱一件",
    audioText: "这件衣服多少钱一件？",
    difficulty: "HSK 2",
    explanation: "Hỏi giá: Lượng từ 件 đi với quần áo (衣服), 多少钱 nghĩa là bao nhiêu tiền.",
  },
  {
    id: "duo-4",
    vietnamese: "Thời tiết ngày mai rất đẹp, chúng ta đi du lịch nhé.",
    pinyin: "Míngtiān tiānqì hěn hǎo, wǒmen qù lǚyóu ba.",
    words: ["明天", "天气", "很好", "我们", "去", "旅游", "吧", "下雨", "冷"],
    correctSentence: "明天天气很好我们去旅游吧",
    audioText: "明天天气很好，我们去旅游吧。",
    difficulty: "HSK 2",
    explanation: "Trợ từ ngữ khí 吧 ở cuối câu biểu thị lời đề nghị, rủ rê.",
  },
  {
    id: "duo-5",
    vietnamese: "Bảo vệ môi trường tự nhiên là trách nhiệm của mỗi người.",
    pinyin: "Bǎohù zìrán huánjìng shì měi ge rén de zérèn.",
    words: ["保护", "自然", "环境", "是", "每个人的", "责任", "习惯", "成功"],
    correctSentence: "保护自然环境是每个人的责任",
    audioText: "保护自然环境是每个人的责任。",
    difficulty: "HSK 3",
    explanation: "保护 (Bảo vệ) + 自然环境 (Môi trường tự nhiên) + 是 (là) + 每个人的责任 (trách nhiệm của mỗi người).",
  },
  {
    id: "duo-6",
    vietnamese: "Bất kể gặp khó khăn gì, chúng ta đều phải kiên trì.",
    pinyin: "Wúlùn yùdào shénme kùnnán, wǒmen dōu yào jiānchí.",
    words: ["无论", "遇到", "什么", "困难", "我们", "都要", "坚持", "放弃", "拒绝"],
    correctSentence: "无论遇到什么困难我们都要坚持",
    audioText: "无论遇到什么困难，我们都要坚持。",
    difficulty: "HSK 4",
    explanation: "Cấu trúc liên từ: 无论...都... (Bất kể... đều...). 坚持 có nghĩa là kiên trì.",
  },
  {
    id: "duo-7",
    vietnamese: "Nâng cao hiệu quả làm việc có thể tiết kiệm rất nhiều thời gian.",
    pinyin: "Tígāo gōngzuò xiàolǜ kěyǐ jiéyuē hěn duō shíjiān.",
    words: ["提高", "工作", "效率", "可以", "节约", "很多", "时间", "投资", "挑战"],
    correctSentence: "提高工作效率可以节约很多时间",
    audioText: "提高工作效率可以节约很多时间。",
    difficulty: "HSK 5",
    explanation: "效率 nghĩa là hiệu suất, hiệu quả; 节约 nghĩa là tiết kiệm.",
  },
];

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
      vietnameseMeaning: "Bạn bè, người bạn",
      exampleSentence: "我们是一辈子的好朋友。",
      exampleTranslation: "Chúng tôi là bạn tốt cả đời.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-4",
      word: "爱",
      pronunciation: "ài",
      meaning: "Love",
      vietnameseMeaning: "Yêu, thương yêu",
      exampleSentence: "我爱学习汉语 và yêu bạn bè.",
      exampleTranslation: "Tôi thích học tiếng Hán và yêu bạn bè.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-5",
      word: "喝水",
      pronunciation: "hē shuǐ",
      meaning: "Drink water",
      vietnameseMeaning: "Uống nước",
      exampleSentence: "天气很热，请多喝水。",
      exampleTranslation: "Thời tiết rất nóng, xin hãy uống nhiều nước.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-6",
      word: "吃饭",
      pronunciation: "chī fàn",
      meaning: "Eat rice / have a meal",
      vietnameseMeaning: "Ăn cơm, dùng bữa",
      exampleSentence: "你吃午饭了吗？",
      exampleTranslation: "Bạn đã ăn cơm trưa chưa?",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-7",
      word: "看书",
      pronunciation: "kàn shū",
      meaning: "Read books",
      vietnameseMeaning: "Đọc sách, xem sách",
      exampleSentence: "我晚上喜欢在家看书。",
      exampleTranslation: "Buổi tối tôi thích ở nhà đọc sách.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-8",
      word: "老师",
      pronunciation: "lǎoshī",
      meaning: "Teacher",
      vietnameseMeaning: "Thầy giáo, cô giáo",
      exampleSentence: "李老师教我们汉语。",
      exampleTranslation: "Thầy Lý dạy chúng tôi tiếng Hán.",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-9",
      word: "多少",
      pronunciation: "duōshao",
      meaning: "How much, how many",
      vietnameseMeaning: "Bao nhiêu",
      exampleSentence: "这个苹果多少钱？",
      exampleTranslation: "Quả táo này bao nhiêu tiền?",
      difficulty: "HSK 1",
    },
    {
      id: "zh-1-10",
      word: "再见",
      pronunciation: "zàijiàn",
      meaning: "Goodbye",
      vietnameseMeaning: "Tạm biệt, hẹn gặp lại",
      exampleSentence: "明天见，再见！",
      exampleTranslation: "Hẹn ngày mai gặp, tạm biệt!",
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
      vietnameseMeaning: "Hy vọng, mong ước",
      exampleSentence: "我希望明天是个好天气。",
      exampleTranslation: "Tôi hy vọng ngày mai thời tiết sẽ đẹp.",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-3",
      word: "帮助",
      pronunciation: "bāngzhù",
      meaning: "Help, assist",
      vietnameseMeaning: "Giúp đỡ, tương trợ",
      exampleSentence: "互相帮助非常重要。",
      exampleTranslation: "Giúp đỡ lẫn nhau là rất quan trọng.",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-4",
      word: "旅游",
      pronunciation: "lǚyóu",
      meaning: "Travel, tourism",
      vietnameseMeaning: "Du lịch, tham quan",
      exampleSentence: "明年我想去北京旅游。",
      exampleTranslation: "Năm sau tôi muốn đi Bắc Kinh du lịch.",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-5",
      word: "便宜",
      pronunciation: "piányi",
      meaning: "Cheap, inexpensive",
      vietnameseMeaning: "Rẻ, giá rẻ",
      exampleSentence: "这件衣服又漂亮又便宜。",
      exampleTranslation: "Bộ quần áo này vừa đẹp vừa rẻ.",
      difficulty: "HSK 2",
    },
    {
      id: "zh-2-6",
      word: "运动",
      pronunciation: "yùndòng",
      meaning: "Exercise, sports",
      vietnameseMeaning: "Vận động, thể thao",
      exampleSentence: "多运动对身体好。",
      exampleTranslation: "Vận động nhiều rất tốt cho sức khỏe.",
      difficulty: "HSK 2",
    },

    // HSK 3
    {
      id: "zh-3-1",
      word: "环境",
      pronunciation: "huánjìng",
      meaning: "Environment",
      vietnameseMeaning: "Môi trường, hoàn cảnh",
      exampleSentence: "我们要共同保护地球环境。",
      exampleTranslation: "Chúng ta cần chung tay bảo vệ môi trường Trái Đất.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-2",
      word: "习惯",
      pronunciation: "xíguàn",
      meaning: "Habit, get used to",
      vietnameseMeaning: "Thói quen, quen thuộc",
      exampleSentence: "早起是个好习惯。",
      exampleTranslation: "Dậy sớm là một thói quen tốt.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-3",
      word: "成功",
      pronunciation: "chénggōng",
      meaning: "Success, succeed",
      vietnameseMeaning: "Thành công",
      exampleSentence: "坚持到底就能成功。",
      exampleTranslation: "Kiên trì đến cùng ắt sẽ thành công.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-4",
      word: "努力",
      pronunciation: "nǔlì",
      meaning: "Hardworking, strive",
      vietnameseMeaning: "Nỗ lực, chăm chỉ",
      exampleSentence: "只要努力，就会有收获。",
      exampleTranslation: "Chỉ cần nỗ lực thì sẽ gặt hái thành quả.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-5",
      word: "解决",
      pronunciation: "jiějué",
      meaning: "Solve, resolve",
      vietnameseMeaning: "Giải quyết, xử lý",
      exampleSentence: "这个问题我们很快能解决。",
      exampleTranslation: "Vấn đề này chúng tôi có thể giải quyết nhanh chóng.",
      difficulty: "HSK 3",
    },
    {
      id: "zh-3-6",
      word: "热情",
      pronunciation: "rèqíng",
      meaning: "Enthusiastic, warm",
      vietnameseMeaning: "Nhiệt tình, niềm nở",
      exampleSentence: "越南人非常热情好客。",
      exampleTranslation: "Người Việt Nam rất nhiệt tình và hiếu khách.",
      difficulty: "HSK 3",
    },

    // HSK 4
    {
      id: "zh-4-1",
      word: "坚持",
      pronunciation: "jiānchí",
      meaning: "Persist, persevere",
      vietnameseMeaning: "Kiên trì, giữ vững",
      exampleSentence: "无论遇到什么困难都要坚持。",
      exampleTranslation: "Bất kể gặp khó khăn gì cũng phải kiên trì.",
      difficulty: "HSK 4",
    },
    {
      id: "zh-4-2",
      word: "经验",
      pronunciation: "jīngyàn",
      meaning: "Experience",
      vietnameseMeaning: "Kinh nghiệm",
      exampleSentence: "他工作多年，经验很丰富。",
      exampleTranslation: "Anh ấy làm việc nhiều năm, kinh nghiệm rất phong phú.",
      difficulty: "HSK 4",
    },
    {
      id: "zh-4-3",
      word: "交流",
      pronunciation: "jiāoliú",
      meaning: "Communicate, exchange",
      vietnameseMeaning: "Giao lưu, trao đổi",
      exampleSentence: "多与人交流有助于提高语言水平。",
      exampleTranslation: "Giao lưu nhiều với mọi người giúp nâng cao trình độ ngôn ngữ.",
      difficulty: "HSK 4",
    },
    {
      id: "zh-4-4",
      word: "积极",
      pronunciation: "jījí",
      meaning: "Positive, active",
      vietnameseMeaning: "Tích cực, chủ động",
      exampleSentence: "面对困难要保持积极的态度。",
      exampleTranslation: "Đối mặt với khó khăn cần giữ thái độ tích cực.",
      difficulty: "HSK 4",
    },
    {
      id: "zh-4-5",
      word: "精彩",
      pronunciation: "jīngcǎi",
      meaning: "Wonderful, brilliant",
      vietnameseMeaning: "Đặc sắc, tuyệt vời",
      exampleSentence: "昨晚的足球比赛非常精彩。",
      exampleTranslation: "Trận bóng đá tối qua vô cùng đặc sắc.",
      difficulty: "HSK 4",
    },

    // HSK 5
    {
      id: "zh-5-1",
      word: "效率",
      pronunciation: "xiàolǜ",
      meaning: "Efficiency",
      vietnameseMeaning: "Hiệu suất, hiệu quả làm việc",
      exampleSentence: "科学的工作方法能极大提高效率。",
      exampleTranslation: "Phương pháp làm việc khoa học có thể nâng cao hiệu suất vượt bậc.",
      difficulty: "HSK 5",
    },
    {
      id: "zh-5-2",
      word: "掌握",
      pronunciation: "zhǎngwò",
      meaning: "Master, grasp",
      vietnameseMeaning: "Nắm vững, làm chủ",
      exampleSentence: "熟练掌握一门外语很重要。",
      exampleTranslation: "Nắm vững thành thạo một ngoại ngữ là rất quan trọng.",
      difficulty: "HSK 5",
    },
    {
      id: "zh-5-3",
      word: "挑战",
      pronunciation: "tiǎozhàn",
      meaning: "Challenge",
      vietnameseMeaning: "Thử thách, thách thức",
      exampleSentence: "勇敢迎接新的挑战。",
      exampleTranslation: "Dũng cảm đón nhận những thử thách mới.",
      difficulty: "HSK 5",
    },
    {
      id: "zh-5-4",
      word: "珍惜",
      pronunciation: "zhēnxī",
      meaning: "Cherish, treasure",
      vietnameseMeaning: "Trân trọng, quý trọng",
      exampleSentence: "我们要珍惜时间与青春。",
      exampleTranslation: "Chúng ta cần trân trọng thời gian và tuổi trẻ.",
      difficulty: "HSK 5",
    },

    // HSK 6
    {
      id: "zh-6-1",
      word: "卓越",
      pronunciation: "zhuóyuè",
      meaning: "Outstanding, remarkable",
      vietnameseMeaning: "Xuất sắc, vượt trội, trác việt",
      exampleSentence: "他凭借卓越的才能取得了巨大成就。",
      exampleTranslation: "Anh ấy nhờ vào tài năng xuất chúng đã đạt được thành tựu to lớn.",
      difficulty: "HSK 6",
    },
    {
      id: "zh-6-2",
      word: "循序渐进",
      pronunciation: "xún xù jiàn jìn",
      meaning: "Step by step, gradual progress",
      vietnameseMeaning: "Tuần tự từng bước, tiến lên có bài bản",
      exampleSentence: "学语言需要循序渐进，不可操之过急。",
      exampleTranslation: "Học ngoại ngữ cần tuần tự từng bước, không thể nóng vội.",
      difficulty: "HSK 6",
    },
    {
      id: "zh-6-3",
      word: "潜移默化",
      pronunciation: "qián yí mò huà",
      meaning: "Exert a subtle, imperceptible influence",
      vietnameseMeaning: "Ảnh hưởng âm thầm, ngấm dần từng chút một",
      exampleSentence: "好的文化环境对人有潜移默化的影响。",
      exampleTranslation: "Môi trường văn hóa tốt sẽ tác động âm thầm và sâu sắc lên con người.",
      difficulty: "HSK 6",
    },
  ],

  english: [
    {
      id: "en-1",
      word: "Perseverance",
      pronunciation: "/ˌpɜː.sɪˈvɪə.rəns/",
      meaning: "Persistence in doing something despite difficulty",
      vietnameseMeaning: "Sự kiên trì, bền chí",
      exampleSentence: "Through hard work and perseverance, he succeeded.",
      exampleTranslation: "Nhờ làm việc chăm chỉ và sự kiên trì, anh ấy đã thành công.",
      difficulty: "TOEIC 750+",
    },
    {
      id: "en-2",
      word: "Collaborate",
      pronunciation: "/kəˈlæb.ə.reɪt/",
      meaning: "Work jointly on an activity or project",
      vietnameseMeaning: "Cộng tác, hợp tác",
      exampleSentence: "Teams collaborate via online tools seamlessly.",
      exampleTranslation: "Các nhóm hợp tác qua các công cụ trực tuyến một cách liền mạch.",
      difficulty: "IELTS 6.5",
    },
    {
      id: "en-3",
      word: "Resilience",
      pronunciation: "/rɪˈzɪl.jəns/",
      meaning: "The capacity to recover quickly from difficulties",
      vietnameseMeaning: "Khả năng phục hồi, sự kiên cường",
      exampleSentence: "Mental resilience helps us overcome all obstacles.",
      exampleTranslation: "Sự kiên cường tinh thần giúp chúng ta vượt qua mọi trở ngại.",
      difficulty: "IELTS 7.0",
    },
    {
      id: "en-4",
      word: "Innovation",
      pronunciation: "/ˌɪn.əˈveɪ.ʃən/",
      meaning: "The introduction of new ideas or methods",
      vietnameseMeaning: "Sự đổi mới, sáng tạo",
      exampleSentence: "Technological innovation drives human progress.",
      exampleTranslation: "Sự đổi mới công nghệ thúc đẩy sự tiến bộ của nhân loại.",
      difficulty: "TOEIC 800",
    },
  ],

  korean: [
    {
      id: "ko-1",
      word: "안녕하세요",
      pronunciation: "annyeonghaseyo",
      meaning: "Hello / Good day",
      vietnameseMeaning: "Xin chào",
      exampleSentence: "안녕하세요! 만나서 반갑습니다.",
      exampleTranslation: "Xin chào! Rất vui được gặp bạn.",
      difficulty: "TOPIK I",
    },
    {
      id: "ko-2",
      word: "감사합니다",
      pronunciation: "gamsahamnida",
      meaning: "Thank you",
      vietnameseMeaning: "Xin cảm ơn",
      exampleSentence: "도와주셔서 진심으로 감사합니다.",
      exampleTranslation: "Chân thành cảm ơn bạn đã giúp đỡ.",
      difficulty: "TOPIK I",
    },
    {
      id: "ko-3",
      word: "노력",
      pronunciation: "noryeok",
      meaning: "Effort, strive",
      vietnameseMeaning: "Nỗ lực, cố gắng",
      exampleSentence: "꾸준한 노력은 배신하지 않습니다.",
      exampleTranslation: "Sự nỗ lực kiên trì sẽ không bao giờ phản bội bạn.",
      difficulty: "TOPIK II",
    },
  ],

  japanese: [
    {
      id: "ja-1",
      word: "こんにちは",
      pronunciation: "Konnichiwa",
      meaning: "Hello / Good afternoon",
      vietnameseMeaning: "Xin chào",
      exampleSentence: "こんにちは、お元気ですか？",
      exampleTranslation: "Xin chào, bạn có khỏe không?",
      difficulty: "JLPT N5",
    },
    {
      id: "ja-2",
      word: "ありがとう",
      pronunciation: "Arigatou",
      meaning: "Thank you",
      vietnameseMeaning: "Cảm ơn",
      exampleSentence: "いつも手伝ってくれてありがとう。",
      exampleTranslation: "Cảm ơn bạn vì lúc nào cũng giúp đỡ tôi.",
      difficulty: "JLPT N5",
    },
    {
      id: "ja-3",
      word: "頑張る",
      pronunciation: "Ganbaru",
      meaning: "Do one's best, persist",
      vietnameseMeaning: "Cố gắng hết sức",
      exampleSentence: "夢に向かって最後まで頑張ります。",
      exampleTranslation: "Tôi sẽ cố gắng hết mình đến cùng vì ước mơ.",
      difficulty: "JLPT N4",
    },
  ],
};

export function generateRandomQuizQuestion(
  lang: LanguageId = "chinese",
  hsk?: string
): QuizQuestion {
  let pool = VOCAB_DATABASE[lang] || VOCAB_DATABASE.chinese;
  if (lang === "chinese" && hsk) {
    const filtered = pool.filter((v) => v.difficulty.includes(hsk));
    if (filtered.length >= 2) {
      pool = filtered;
    }
  }

  // Pick target
  const target = pool[Math.floor(Math.random() * pool.length)];

  // Choose question type: meaning or pronunciation
  const types: QuizQuestion["questionType"][] = ["meaning", "pronunciation"];
  const qType = types[Math.floor(Math.random() * types.length)];

  const isMeaning = qType === "meaning";
  const correctAnswer = isMeaning ? target.vietnameseMeaning : target.pronunciation;

  // Generate 3 distractors
  const distractors: string[] = [];
  const fullPool = VOCAB_DATABASE[lang] || VOCAB_DATABASE.chinese;
  const shuffled = [...fullPool].sort(() => 0.5 - Math.random());

  for (const item of shuffled) {
    if (item.id === target.id) continue;
    const val = isMeaning ? item.vietnameseMeaning : item.pronunciation;
    if (!distractors.includes(val) && val !== correctAnswer) {
      distractors.push(val);
      if (distractors.length === 3) break;
    }
  }

  // Fallbacks if pool is small
  while (distractors.length < 3) {
    distractors.push(isMeaning ? "Ý nghĩa bổ trợ khác" : "pīnyīn fāng fǎ");
  }

  const options = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());

  const question = isMeaning
    ? `Từ "${target.word}" (${target.pronunciation}) có nghĩa tiếng Việt là gì?`
    : `Phiên âm chuẩn (Pinyin/Phát âm) của từ "${target.word}" là gì?`;

  return {
    id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    question,
    questionType: qType,
    options,
    correctAnswer,
    explanation: `Từ "${target.word}" [${target.pronunciation}] mang nghĩa: "${target.vietnameseMeaning}". Ví dụ: ${target.exampleSentence} (${target.exampleTranslation})`,
    targetVocab: target,
  };
}

export const STUDY_TIPS = [
  {
    title: "Phương pháp Spaced Repetition (Lặp lại ngắt quãng)",
    desc: "Ôn tập lại từ vựng sau 1 ngày, 3 ngày, 7 ngày và 14 ngày để biến trí nhớ ngắn hạn thành trí nhớ dài hạn vĩnh viễn.",
  },
  {
    title: "Luyện phát âm 4 thanh điệu tiếng Trung",
    desc: "Thanh 1 (ngang cao 5-5), Thanh 2 (sắc lên 3-5), Thanh 3 (xuống rồi lên 2-1-4), Thanh 4 (giật mạnh từ cao xuống thấp 5-1).",
  },
  {
    title: "Ghép câu tương tác kiểu Duolingo",
    desc: "Đừng chỉ học từ đơn lẻ! Hãy xếp các chữ thành cụm từ và câu hoàn chỉnh để nắm vững ngữ pháp tự nhiên.",
  },
  {
    title: "Đồng bộ tài liệu giáo trình từ Google Drive",
    desc: "Xem lại các file PDF và video nghe trong kho lưu trữ Drive để đối chiếu ngữ cảnh phát âm chuẩn người bản xứ.",
  },
];
