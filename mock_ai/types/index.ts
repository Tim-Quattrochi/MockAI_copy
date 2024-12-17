import { InterviewResult } from "@/components/UserAccount";
import { FillerWord } from "@/utils/transcriptionUtils";

export type Feedback = {
  filler_word_count: {
    like: number;
    so: number;
    uh: number;
    um: number;
    "you know": number;
  };
  long_pause_count: number;
  pause_durations: number[];
};

export type Question = {
  id: string;
  question_text: string;
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
    question_text: string;
    name: string;
    company: string;
    position: string;
    interview_type: "technical" | "behavioral";
    createdAt: string;
    updatedAt: string;
  };
};

export type Result = {
  user_id?: string;
  question_id: number;
  transcript: string;
  filler_words: FillerWord[];
  pause_durations: number[];
  interview_date: string;
  ai_feedback?: string;
  audio_url?: string;
  video_url?: string;
  score?: number;
  long_pause_count?: number;
};

export type InterviewData = {
  name: string;
  company: string;
  position: string;
  questionType: "technical" | "behavioral";
  recordingType?: "audio";
};

export type FilterType = "all" | "video" | "voice";

export type JoinedInterviewResult = InterviewResult & Question;
