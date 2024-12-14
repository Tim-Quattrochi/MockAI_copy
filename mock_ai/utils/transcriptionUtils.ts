export interface WordInfo {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  punctuated_word?: string;
  positive_sentiment_score?: number;
  negative_sentiment_score?: number;
  neutral_sentiment_score?: number;
}

export interface FillerWord {
  word: string;
  count: number;
}

export interface LongPause {
  start: number;
  end: number;
  duration: number;
}

export interface TranscriptionResponse {
  transcript: string;
  words: WordInfo[];
  filler_words: FillerWord[];
  long_pauses: LongPause[];
  pause_durations: number[];
  interviewer_question: string;
  positive_sentiment_score: number;
  negative_sentiment_score: number;
  neutral_sentiment_score: number;
  ai_feedback: string;
}

export interface TranscriptionAnalysisResponse {
  message: string;
  transcription: AnalysisResult;
}

export interface AnalysisResult {
  fillerWordCount: { [key: string]: number };
  longPauses: string[];
  transcript: string;
  words: WordInfo[];
  filler_words: FillerWord[];
  long_pauses: LongPause[];
  score: number;
  ai_feedback?: string;
  pause_durations: number[];
  interviewer_question?: string;
}

interface ScoreParameters {
  fillerWordCount: { [key: string]: number };
  longPauseCount: number;
  positive_sentiment_score: number;
  negative_sentiment_score: number;
  neutral_sentiment_score: number;
}

export function calculateScore(
  {
    fillerWordCount,
    longPauseCount,
    positive_sentiment_score,
    negative_sentiment_score,
    neutral_sentiment_score,
  }: ScoreParameters,
  baseScore: number
): number {
  const fillerWordPenalty = Object.values(fillerWordCount).reduce(
    (acc, count) => acc + count,
    0
  );
  const pausePenalty = longPauseCount;
  const sentimentScore =
    positive_sentiment_score -
    negative_sentiment_score +
    neutral_sentiment_score * 0.5;

  const fillerWordWeight = 1;
  const pauseWeight = 1;
  const sentimentWeight = 1;

  return (
    baseScore -
    fillerWordPenalty * fillerWordWeight -
    pausePenalty * pauseWeight +
    sentimentScore * sentimentWeight
  );
}

export async function analyzeAudio(
  response: TranscriptionResponse
): Promise<AnalysisResult> {
  if (!response) {
    throw new Error("Invalid response data");
  }

  const {
    transcript,
    words,
    filler_words,
    pause_durations,
    interviewer_question,
    positive_sentiment_score,
    negative_sentiment_score,
    neutral_sentiment_score,
  } = response;

  const fillerWordCount: { [key: string]: number } = {};
  response?.filler_words.forEach((item) => {
    fillerWordCount[item.word] = item.count;
  });

  const longPauseCount = (pause_durations ?? []).filter(
    (pause) => pause >= 10
  ).length;

  const pauses = (pause_durations || []).map((pause) => {
    if (typeof pause !== "number") {
      throw new Error("Invalid pause data");
    }
    return `${pause.toFixed(2)} seconds`;
  });

  const score = calculateScore(
    {
      fillerWordCount,
      longPauseCount,
      positive_sentiment_score,
      negative_sentiment_score,
      neutral_sentiment_score,
    },
    10
  );

  const result: AnalysisResult = {
    fillerWordCount: fillerWordCount,
    transcript: transcript,
    words: words,
    filler_words: filler_words,
    long_pauses: response.long_pauses,
    longPauses: pauses,
    pause_durations: pause_durations,
    score: score,
    interviewer_question: interviewer_question,
    ai_feedback: response.ai_feedback,
  };

  return result;
}
