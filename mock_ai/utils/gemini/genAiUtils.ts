import { GoogleGenerativeAI } from "@google/generative-ai";
import { schema as genAiResultsSchema } from "@/utils/gemini/transcriptionSchema";
import { createClient } from "@/supabase/server";

export async function generateTranscription(
  genAI: GoogleGenerativeAI,
  fileUri: string,
  mimeType: string,
  candidateName: string,
  position: string,
  company: string,
  questionType: string,
  question: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: genAiResultsSchema,
    },
    systemInstruction: process.env.SYSTEM_INSTRUCTIONS!,
  });

  const promptTemplate = process.env.PROMPT_TEMPLATE!;
  const prompt = promptTemplate
    .replace("${candidateName}", candidateName)
    .replace("${position}", position)
    .replace("${company}", company)
    .replace("${questionType}", questionType)
    .replace("${question}", question);

  const result = await model.generateContent([
    prompt,
    {
      fileData: {
        fileUri: fileUri,
        mimeType: mimeType,
      },
    },
  ]);

  const responseText = await result.response.text();
  return responseText;
}
