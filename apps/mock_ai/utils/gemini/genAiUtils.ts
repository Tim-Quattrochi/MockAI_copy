import { GoogleGenerativeAI } from "@google/generative-ai";
import { schema as genAiResultsSchema } from "@/utils/gemini/transcriptionSchema";

export async function generateTranscription(
  genAI: GoogleGenerativeAI,
  fileUri: string,
  candidateName: string,
  position: string,
  company: string,
  questionType: string,
  question: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: genAiResultsSchema,
    },
    systemInstruction:
      "You are an advanced transcription and analysis AI. Your task is to analyze audio input and return results in the specified JSON schema.",
  });

  const result = await model.generateContent([
    `Please transcribe the provided audio input and return the following:
    1. The full transcript of the interviewee's response as a string.
    2. An array of words with their metadata, including start and end times.
    3. A list of filler words ('um', 'uh', 'like', 'you know', 'so'), including their counts.
    4. A count of pauses longer than 10 seconds, expressed as a string.
    5. Feedback on the technical response to the provided interview question.
    6. An unbiased score  based on the technical quality of the response.

      You are assisting ${candidateName}, who is applying for the ${position} position at ${company}. Your goal is to provide constructive feedback to improve their ${questionType} skills based on their response to the question: "${question}."

    Be concise but helpful, focusing on areas for improvement. Conclude with the following:
      - The technical score in the format: 'Here is your score based on our assessment: [score].'
      - Thank ${candidateName} for their response and encourage them to return to MockAI for further practice.
    DO NOT include any markdown in your response.`,
    {
      fileData: {
        fileUri: fileUri,
        mimeType: "audio/wav",
      },
    },
  ]);

  const responseText = await result.response.text();
  return JSON.parse(responseText);
}
