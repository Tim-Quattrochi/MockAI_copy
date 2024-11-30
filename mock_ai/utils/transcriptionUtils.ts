export interface WordInfo {
  word: string;
  start: number;
  end: number;
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
  pause_durations: string;
  interviewer_question: string;
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
  pause_durations: string;
  interviewer_question?: string;
}

export function calculateScore(
  response: TranscriptionResponse,
  threshold: number
): number {
  const fillerWords = response.filler_words || [];

  const fillerWordPenalty = fillerWords.reduce((penalty, word) => {
    const wordPenalty = word.count > 0 ? word.count : 0;
    return penalty + wordPenalty;
  }, 0);

  const pausePenalty = response.long_pauses.reduce(
    (penalty, pause) => {
      if (pause.duration > threshold) {
        return penalty + pause.duration;
      }
      return penalty;
    },
    0
  );

  const wordCount = response.words.length;
  const fluencyBonus = wordCount * 0.1;

  // Total score
  const score =
    100 -
    fillerWordPenalty -
    pausePenalty +
    fluencyBonus +
    Math.random() * 10;

  return Math.max(score, 0);
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
    long_pauses,
    interviewer_question,
  } = response;

  const detailedTranscript = words
    .map((wordInfo) => {
      if (!wordInfo.word || typeof wordInfo.start !== "number") {
        throw new Error("Invalid word data");
      }
      const startTime = wordInfo.start.toFixed(2);
      return `[${startTime}] ${wordInfo.word}`;
    })
    .join(" ");

  const fillerWordCount = {};
  filler_words.forEach((item) => {
    fillerWordCount[item.word] = item.count;
  });

  const longPauseCount = (long_pauses || []).filter(
    (pause) => pause.duration >= 10
  ).length;

  const pauses = (long_pauses || []).map((pause) => {
    if (
      typeof pause.start !== "number" ||
      typeof pause.end !== "number" ||
      typeof pause.duration !== "number"
    ) {
      throw new Error("Invalid pause data");
    }
    const start = pause.start.toFixed(2);
    const end = pause.end.toFixed(2);
    return `Between [${start}] and [${end}]: ${pause.duration.toFixed(
      2
    )} seconds`;
  });

  const pauseDurations = (long_pauses || [])
    .filter((pause) => pause.duration >= 10)
    .map((pause) => `${pause.duration.toFixed(0)} seconds`)
    .join(", ");

  const result: AnalysisResult = {
    fillerWordCount: fillerWordCount || {},
    longPauses: pauses || [],
    transcript: transcript || "",
    words: words || [],
    filler_words: filler_words || [],
    long_pauses: long_pauses || [],
    pause_durations: pauseDurations || "",
    score: calculateScore(response, 10),
    interviewer_question: interviewer_question,
  };

  return result;
}
