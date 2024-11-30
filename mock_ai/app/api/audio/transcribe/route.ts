import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { schema as genAiResultsSchema } from "@/utils/gemini/transcriptionSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";
import { analyzeAudio } from "@/utils/transcriptionUtils";
import { generateTranscription } from "@/utils/gemini/genAiUtils";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const {
      //Note to self: req data from api/audio/upload/route.ts
      fileUri,
      mimeType,
      questionId,
      userEmail: authedUser,
      name: candidateName,
      company,
      position,
      questionType,
      question_text: question,
    } = await request.json();

    const supabase = await createClient();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const jsonResponse = await generateTranscription(
      genAI,
      fileUri,
      mimeType,
      candidateName,
      position,
      company,
      questionType,
      question
    );

    const analysis = await analyzeAudio(jsonResponse);

    console.log("Analysis result:", analysis);
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("JSON response:", jsonResponse);

    // update the Result table using supabase for the user.
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .update({
        transcript: analysis.transcript,
        filler_words: JSON.stringify(analysis.filler_words),
        long_pauses: JSON.stringify(analysis.long_pauses),
        pause_durations: jsonResponse.pause_durations,
        ai_feedback: jsonResponse.ai_feedback,
        score: analysis.score,
      })
      .eq("question_id", questionId)
      .select();

    if (resultError) {
      console.error("Error saving result:", resultError);
      return NextResponse.json(
        { error: "Failed to save result." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Transcription successful.",
      transcription: analysis,
    });
  } catch (error) {
    console.error("Error during transcription:", error);
    return NextResponse.json(
      { error: "Failed to process transcription." },
      { status: 500 }
    );
  }
}
