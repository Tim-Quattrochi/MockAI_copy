export type Feedback = {
  filler_word_count: {
    like: number;
    so: number;
    uh: number;
    um: number;
    "you know": number;
  };
  long_pauses: number;
  pause_durations: number[];
};

export type Question = {
  id: string;
  question: string;
  name: string;
  company: string;
  position: string;
  interview_type: "technical" | "behavioral";
  createdAt?: string;
  updatedAt?: string;
};
export type QuestionResponse = {
  question: {
    id: string;
    question: string;
    name: string;
    company: string;
    position: string;
    interview_type: "technical" | "behavioral";
    createdAt: string;
    updatedAt: string;
  };
};

export type Result = {
  question: string;
  question_id: number;
  transcript: string;
  filler_words: string;
  long_pauses: string;
  pause_durations: string;
  interview_date: string;
  ai_feedback?: string;
  audio_url?: string;
  video_url?: string;
  score?: number;
};

export type InterviewData = {
  name: string;
  company: string;
  position: string;
  questionType: "technical" | "behavioral";
  recordingType: "audio" | "video";
};

export type FilterType = "all" | "video" | "voice";
