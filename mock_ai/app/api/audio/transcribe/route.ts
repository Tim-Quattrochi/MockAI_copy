import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeAudio } from "@/utils/transcriptionUtils";
import { generateTranscription } from "@/utils/gemini/genAiUtils";

function getMissingFields(fields: Record<string, any>): string[] {
  return Object.keys(fields).filter((key) => !fields[key]);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const {
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

    const missingFields = getMissingFields({
      fileUri,
      mimeType,
      questionId,
      authedUser,
      candidateName,
      company,
      position,
      questionType,
      question,
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

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

    if (process.env.NODE_ENV === "development") {
      console.log("Analysis result:", analysis);
      console.log("---------------------------");
      console.log("---------------------------");
      console.log("JSON response:", jsonResponse);
    }

    // update the Result table using supabase for the user.
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .update({
        transcript: jsonResponse.transcript,
        filler_words: jsonResponse.filler_words,
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
