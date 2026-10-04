export type AcademicYear = "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "5th Year";

export const ACADEMIC_YEARS: AcademicYear[] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year"
];

export type QuizStatus = "draft" | "published" | "scheduled" | "closed";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type CorrectOption = "A" | "B" | "C" | "D";

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  explanation: string | null;
  clinical_pearl?: string | null;
  image_url?: string | null;
  marks?: number;
  difficulty?: DifficultyLevel;
  order_index?: number;
  is_published?: boolean;
  created_at?: string;
}

export interface Quiz {
  id: string;
  title: string;
  academic_year: AcademicYear;
  subject: string;
  topic?: string | null;
  description?: string | null;
  difficulty: DifficultyLevel;
  quiz_date: string; // YYYY-MM-DD
  start_time?: string | null;
  end_time?: string | null;
  time_limit_mins: number;
  passing_percentage: number;
  status: QuizStatus;
  is_daily: boolean;
  is_leaderboard_enabled: boolean;
  allow_multiple_attempts: boolean;
  author: string;
  created_at: string;
  updated_at: string;
  questions_count?: number;
  questions?: QuizQuestion[];
}

export interface QuestionResponse {
  questionId: string;
  selectedOption: CorrectOption;
  isCorrect: boolean;
  correctOption?: CorrectOption;
  marksAwarded: number;
  explanation?: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id?: string | null;
  student_name: string;
  academic_year: AcademicYear;
  quiz_date: string;
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
  score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  total_questions: number;
  status: "completed" | "timed_out";
  responses: QuestionResponse[];
  created_at: string;
  quiz?: Partial<Quiz>;
}

export interface LeaderboardEntry {
  rank: number;
  student_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
}

export interface QuizAnalyticsSummary {
  totalQuizzes: number;
  totalAttempts: number;
  totalParticipants: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passPercentage: number;
  yearWiseParticipation: { year: AcademicYear; count: number; attempts: number }[];
  subjectWisePerformance: { subject: string; averagePercentage: number; attempts: number }[];
  dayWiseParticipation: { date: string; attempts: number }[];
  quizWisePerformance: {
    quizId: string;
    title: string;
    academicYear: AcademicYear;
    subject: string;
    attempts: number;
    averageScore: number;
    passPercentage: number;
  }[];
}
