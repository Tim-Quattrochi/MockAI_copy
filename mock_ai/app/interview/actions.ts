"use server";

import { createClient } from "@/supabase/server";
import { TranscriptionAnalysisResponse } from "@/utils/transcriptionUtils";
import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";
import { writeFileSync } from "fs";

async function uploadAndProcessFile(
  fileManager: GoogleAIFileManager,
  videoFilePath: string,
  mimeType: string
) {
  const uploadResult = await fileManager.uploadFile(videoFilePath, {
    mimeType,
    displayName: videoFilePath.split("/").pop(),
  });

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

export async function uploadAudio(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      throw new Error("User not authenticated");
    }

    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const questionId = formData.get("questionId") as string;
    const userEmail = formData.get("user") as string;
    const question = formData.get("question") as string;
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const position = formData.get("position") as string;
    const questionType = formData.get("questionType") as string;

    const audioPath = `${authedUser.id}/${fileName}`;
    const { error: audioError } = await supabase.storage
      .from("audio-interviews")
      .upload(audioPath, file, {
        contentType: "audio/webm",
        upsert: false,
      });

    if (audioError) throw audioError;

    const { data: audioUrlData } = await supabase.storage
      .from("audio-interviews")
      .createSignedUrl(audioPath, 120 * 120);

    const signedUrl = audioUrlData?.signedUrl;
    if (!signedUrl) throw new Error("Failed to generate signed URL");

    const response = await fetch(signedUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.webm`;
    const tmpPath = `/tmp/${uniqueFileName}`;

    writeFileSync(tmpPath, buffer);

    const fileManager = new GoogleAIFileManager(
      process.env.GEMINI_API_KEY!
    );
    const genaiUploadedFile = await uploadAndProcessFile(
      fileManager,
      tmpPath,
      "audio/webm"
    );

    const transcriptionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/audio/transcribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: genaiUploadedFile.file.mimeType,
          fileUri: genaiUploadedFile.file.uri,
          user: authedUser,
          questionId,
          question_text: question,
          userEmail,
          company,
          position,
          questionType,
          name,
        }),
      }
    );

    const transcriptionData: TranscriptionAnalysisResponse =
      await transcriptionResponse.json();

    await supabase
      .from("results")
      .update({ audio_url: signedUrl })
      .eq("question_id", questionId);

    return {
      success: true,
      signedUrl,
      transcription: transcriptionData.transcription,
    };
  } catch (error) {
    console.error("Error in uploadAudio:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred",
    };
  }
}
