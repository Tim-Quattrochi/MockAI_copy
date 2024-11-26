import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import path from "path";
import fs from "fs/promises";
import { access } from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    const fileName = formData.get("fileName") as string;

    const user = formData.get("user") as string;
    const question = formData.get("question") as string;
    const name = formData.get("name") as string;

    const filePath = `${authedUser.id}/${fileName}`;

    if (!file || !filePath) {
      return NextResponse.json(
        { error: "File and filePath are required." },
        { status: 400 }
      );
    }

    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileName.split(".").pop()}`;
    const uniqueFilePath = `${authedUser.id}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        {
          error: "Failed to upload the file.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("audio")
        .createSignedUrl(filePath, 120 * 120, { download: true });

    if (signedUrlError) {
      console.error("Failed to generate signed URL:", signedUrlError);
      return NextResponse.json(
        {
          error: "Failed to generate signed URL",
          details: signedUrlError.message,
        },
        { status: 500 }
      );
    }

    const signedUrl = signedUrlData?.signedUrl;

    console.log("SIGNED URL: ", signedUrl);

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Failed to retrieve the signed URL." },
        { status: 500 }
      );
    }

    const response = await fetch(signedUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tmpDir = path.join(process.cwd(), "tmp");
    try {
      await access(tmpDir);
    } catch (err) {
      fs.mkdir(tmpDir);
    }

    const tmpFilePath = path.join(tmpDir, uniqueFileName);

    fs.writeFile(tmpFilePath, buffer);

    const transcriptionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/audio/transcribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoFilePath: tmpFilePath,
        }),
      }
    );

    const transcriptionData = await transcriptionResponse.json();

    const { data: questionData, error: questionError } =
      await supabase
        .from("question")
        .select("id")
        .eq("question", question)
        .eq("userId", authedUser.id)
        .single();

    if (!questionData) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    if (transcriptionResponse.status !== 200) {
      return NextResponse.json(
        {
          error:
            transcriptionData.error || "Failed to transcribe audio",
        },
        { status: 500 }
      );
    }

    const questionId = questionData.id;

    const { data: userRecord, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", authedUser.id)
      .single();

    if (!userRecord) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .insert([
        {
          questionId: questionId,
          userId: authedUser.id,
          transcript: transcriptionData.transcription.transcript,
          fillerWords:
            transcriptionData.transcription.fillerWordCount,
          longPauses: transcriptionData.transcription.longPauses,
          pauseDurations:
            transcriptionData.transcription.longPauses.join(", "),
          audioUrl: signedUrl,
        },
      ]);

    return NextResponse.json({
      message: "File uploaded successfully.",
      signedUrl: signedUrl,
      transcription: transcriptionData.transcription,
    });
  } catch (error) {
    console.error("Error in POST /api/audio/upload:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "An unexpected error occurred.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
