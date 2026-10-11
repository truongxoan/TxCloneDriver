export type LanguageId = "chinese" | "english" | "korean" | "japanese";

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface VocabItem {
  id: string;
  word: string;
  pronunciation: string; // Pinyin / Romaja / Hiragana / IPA
  meaning: string;
  vietnameseMeaning: string;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: string; // "HSK 1", "HSK 2", ... or "JLPT N5", "TOPIK I", "TOEIC"
  category?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: "meaning" | "pronunciation" | "fill_in" | "character";
  options: string[];
  correctAnswer: string;
  explanation: string;
  targetVocab: VocabItem;
}

export interface DuolingoSentenceExercise {
  id: string;
  vietnamese: string;
  pinyin: string;
  words: string[]; // Các khối chữ rời rạc để bấm sắp xếp
  correctSentence: string;
  audioText: string;
  difficulty: string;
  explanation: string;
}

export interface DriveCourseResource {
  id: string;
  title: string;
  type: "file" | "folder";
  url: string;
  description: string;
  tag: string;
  badge: string;
}

export interface StudyStats {
  wordsLearned: number;
  streakDays: number;
  totalQuizzesTaken: number;
  correctAnswersCount: number;
  pomodoroSessionsCompleted: number;
}
