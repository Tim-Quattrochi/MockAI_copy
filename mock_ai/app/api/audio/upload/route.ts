import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import path from "path";
import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";
import fs, { access } from "fs/promises";
import { writeFileSync } from "fs";

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

    // form data from VoiceRecorder which is rendered by Interview.tsx
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const questionId = formData.get("questionId") as string;
    const userEmail = formData.get("user") as string;
    const question = formData.get("question") as string;
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const position = formData.get("position") as string;
    const questionType = formData.get("questionType") as string;

    const filePath = `${authedUser.id}/${fileName}`;

    if (!file || !filePath) {
      return NextResponse.json(
        { error: "File and filePath are required." },
        { status: 400 }
      );
    }

    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileName.split(".").pop()}`;
    const uniqueFilePath = `${authedUser.id}/${uniqueFileName}`;
    const mimeType = file.type;

    const { data, error } = await supabase.storage
      .from("audio-interviews")
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
        .from("audio-interviews")
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

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Failed to retrieve the signed URL." },
        { status: 500 }
      );
    }

    const response = await fetch(signedUrl);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tmpPath = `/tmp/${uniqueFileName}`;

    writeFileSync(tmpPath, buffer);

    // upload to Googles AI file manager
    const fileManager = new GoogleAIFileManager(
      process.env.GEMINI_API_KEY!
    );

    // function to upload and process the file
    async function uploadAndProcessFile(
      fileManager: GoogleAIFileManager,
      videoFilePath: string,
      mimeType: string
    ) {
      const uploadResult = await fileManager.uploadFile(
        videoFilePath,
        {
          mimeType,
          displayName: videoFilePath.split("/").pop(),
        }
      );

      console.log(
        "upload result from file manager utils: ",
        uploadResult
      );

      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === FileState.PROCESSING) {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(uploadResult.file.name);
      }

      console.log(
        `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
      );

      if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed.");
      }

      return uploadResult;
    }

    const genaiUploadedFile = await uploadAndProcessFile(
      fileManager,
      tmpPath,
      mimeType
    );

    const transcriptionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/audio/transcribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mimeType: genaiUploadedFile.file.mimeType,
          fileUri: genaiUploadedFile.file.uri,
          user: authedUser,
          questionId: questionId,
          question_text: question,
          userEmail: userEmail,
          company: company,
          position: position,
          questionType: questionType,
          name: name,
        }),
      }
    );

    const transcriptionData = await transcriptionResponse.json();

    // I am getting the question id so I can insert it into the results table as a foreign key.
    const { data: questionData, error: questionError } =
      await supabase
        .from("questions")
        .select("id")
        .eq("id", questionId)
        .single();

    if (questionError) {
      console.error("Error fetching question:", questionError);
      return NextResponse.json(
        {
          error: "Failed to fetch question.",
          details: questionError.message,
        },
        { status: 500 }
      );
    }

    if (!questionData) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    if (transcriptionResponse.status !== 200) {
      console.error(
        "Failed to transcribe audio:",
        transcriptionData.error
      );
      return NextResponse.json(
        {
          error:
            transcriptionData.error || "Failed to transcribe audio",
        },
        { status: 500 }
      );
    }

    // update the results table to include the audio_url.
    // api/generate first inserts question_id and user_id into the results table.
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .update([
        {
          audio_url: signedUrl,
        },
      ])
      .eq("question_id", questionId);

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
