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

export interface TranscriptionResponse {
  transcript: string;
  words: WordInfo[];
  filler_words: FillerWord[];
  long_pauses: number[];
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
  score: number;
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

  const fillerWordWeight = 3;
  const pauseWeight = 2;
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
    filler_words,
    pause_durations,
    positive_sentiment_score,
    negative_sentiment_score,
    neutral_sentiment_score,
  } = response;

  const fillerWordCount: { [key: string]: number } = {};
  filler_words.forEach((item) => {
    fillerWordCount[item.word] = item.count;
  });

  const validPauseDurations = pause_durations.filter(
    (pause) => pause > 5 && Number.isInteger(pause)
  );

  const longPauseCount = validPauseDurations.length;

  const score = calculateScore(
    {
      fillerWordCount,
      longPauseCount,
      positive_sentiment_score,
      negative_sentiment_score,
      neutral_sentiment_score,
    },
    100
  );

  return { score };
}
