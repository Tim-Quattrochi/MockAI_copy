import { SchemaType } from "@google/generative-ai";

export const schema = {
  type: SchemaType.OBJECT,
  properties: {
    transcript: {
      type: SchemaType.STRING,
      description: "The full transcribed text.",
      nullable: false,
    },
    interviewer_question: {
      type: SchemaType.STRING,
      description: "The question asked by the interviewer.",
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
        },
        required: ["word", "start", "end"],
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
    long_pauses: {
      type: SchemaType.ARRAY,
      description: "List of pauses longer than 10 seconds.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          start: {
            type: SchemaType.NUMBER,
            description: "Start time of the pause in seconds.",
            nullable: false,
          },
          end: {
            type: SchemaType.NUMBER,
            description: "End time of the pause in seconds.",
            nullable: false,
          },
          duration: {
            type: SchemaType.NUMBER,
            description: "Duration of the pause in seconds.",
            nullable: false,
          },
        },
        required: ["start", "end", "duration"],
      },
      nullable: false,
    },
    pause_durations: {
      type: SchemaType.STRING,
      description:
        "A string representing the count of pauses 10 seconds or greater.",
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
  },
  required: [
    "transcript",
    "interviewer_question",
    "words",
    "filler_words",
    "pause_durations",
    "ai_feedback",
    "long_pauses",
    "score",
  ],
};
