import { SchemaType } from "@google/generative-ai";

export const schema = {
  type: SchemaType.OBJECT,
  properties: {
    transcript: {
      type: SchemaType.STRING,
      description: "The full transcribed text from the audio prompt.",
      nullable: false,
    },
    interviewer_question: {
      type: SchemaType.STRING,
      description:
        "The question exactly as it was passed to the prompt.",
      nullable: false,
    },
    words: {
      type: SchemaType.ARRAY,
      description:
        "Array of words with their start and end timestamps.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          word: {
            type: SchemaType.STRING,
            description: "A word from the transcript.",
            nullable: false,
          },
          start: {
            type: SchemaType.NUMBER,
            description: "Start time of the word in seconds.",
            nullable: false,
          },
          end: {
            type: SchemaType.NUMBER,
            description: "End time of the word in seconds.",
            nullable: false,
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: "Confidence score of the word recognition.",
            nullable: false,
          },
          punctuated_word: {
            type: SchemaType.STRING,
            description: "The word with punctuation.",
            nullable: false,
          },
        },
        required: [
          "word",
          "start",
          "end",
          "confidence",
          "punctuated_word",
        ],
      },
      nullable: false,
    },
    filler_words: {
      type: SchemaType.ARRAY,
      description: "List of filler words and their counts.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          word: {
            type: SchemaType.STRING,
            description: "The filler word.",
            nullable: false,
          },
          count: {
            type: SchemaType.NUMBER,
            description: "Number of occurrences.",
            nullable: false,
          },
        },
        required: ["word", "count"],
      },
      nullable: false,
    },
    pause_durations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.NUMBER,
      },
      description:
        "Array of pause durations in seconds. (only gaps >= 5 seconds).",
      nullable: false,
    },
    ai_feedback: {
      type: SchemaType.STRING,
      description:
        "Feedback provided by the AI acting as an interviewer on the interviewee's response.",
      nullable: false,
    },
    score: {
      type: SchemaType.NUMBER,
      description:
        "The score assigned to the interviewee's response.",
      nullable: false,
    },
    positive_sentiment_score: {
      type: SchemaType.NUMBER,
      description: "The positive sentiment score of the response.",
      nullable: false,
    },
    negative_sentiment_score: {
      type: SchemaType.NUMBER,
      description: "The negative sentiment score of the response.",
      nullable: false,
    },
    neutral_sentiment_score: {
      type: SchemaType.NUMBER,
      description: "The neutral sentiment score of the response.",
      nullable: false,
    },
  },
  required: [
    "transcript",
    "interviewer_question",
    "words",
    "filler_words",
    "pause_durations",
    "ai_feedback",
    "score",
    "positive_sentiment_score",
    "negative_sentiment_score",
    "neutral_sentiment_score",
  ],
};
