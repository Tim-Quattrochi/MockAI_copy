"use server";

import { createClient } from "@/supabase/server";
import { TranscriptionAnalysisResponse } from "@/utils/transcriptionUtils";
import { AnalysisResult } from "@/utils/transcriptionUtils";
import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";
import { writeFileSync } from "fs";

type UploadAudioSuccess = {
  success: true;
  signedUrl: string;
  transcription: AnalysisResult;
};

type UploadAudioError = {
  success: false;
  error: string;
};

type UploadAudioResponse = UploadAudioSuccess | UploadAudioError;

async function uploadAndProcessFile(
  fileManager: GoogleAIFileManager,
  videoFilePath: string,
  mimeType: string
) {
  const uploadResult = await fileManager.uploadFile(videoFilePath, {
    mimeType,
    displayName: videoFilePath.split("/").pop(),
  });

  console.log("file path: ", videoFilePath);

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

export async function uploadAudio(
  formData: FormData
): Promise<UploadAudioResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      throw new Error("User not authenticated");
    }

    const file = formData.get("extractedAudioFile") as File;
    const videoFile = formData.get("videoFile") as File;
    const fileName = formData.get("fileName") as string;
    const questionId = formData.get("questionId") as string;
    const userEmail = formData.get("user") as string;
    const question = formData.get("question") as string;
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const position = formData.get("position") as string;
    const questionType = formData.get("questionType") as string;

    if (!file) {
      throw new Error("No extracted audio to upload.");
    }

    const videoPath = `${authedUser.id}/video_${Date.now()}.webm`;

    const { data: _, error: videoError } = await supabase.storage
      .from("video-interviews")
      .upload(videoPath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (videoError) throw videoError;

    const { data: videoUrlData } = await supabase.storage
      .from("video-interviews")
      .createSignedUrl(videoPath, 120 * 120);

    const signedUrl = videoUrlData?.signedUrl;
    if (!signedUrl) throw new Error("Failed to generate signed URL");
    console.log("FILE from actions: ", file);

    const arrayBuffer = await file.arrayBuffer();
    console.log("Array buffer: ", arrayBuffer);
    const buffer = Buffer.from(arrayBuffer);

    const tmpPath = `/tmp/${fileName}`;

    writeFileSync(tmpPath, buffer);

    const fileManager = new GoogleAIFileManager(
      process.env.GEMINI_API_KEY!
    );
    const genaiUploadedFile = await uploadAndProcessFile(
      fileManager,
      tmpPath,
      "audio/mpeg"
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

    // update the results table with the video url.
    await supabase
      .from("results")
      .update({ video_url: signedUrl })
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
