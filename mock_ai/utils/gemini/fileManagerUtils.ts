import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";

export async function uploadAndProcessFile(
  fileManager: GoogleAIFileManager,
  videoFilePath: string,
  mimeType: string
) {
  const uploadResult = await fileManager.uploadFile(videoFilePath, {
    mimeType,
    displayName: videoFilePath.split("/").pop(),
  });

  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Audio processing failed.");
  }

  return uploadResult.file.uri;
}
