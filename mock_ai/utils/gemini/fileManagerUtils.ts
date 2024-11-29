import {
  GoogleAIFileManager,
  FileState,
} from "@google/generative-ai/server";

export async function uploadAndProcessFile(
  fileManager: GoogleAIFileManager,
  videoFilePath: string
) {
  console.log("RESOLVED FILE PATH:", resolvedFilePath);
  const uploadResult = await fileManager.uploadFile(videoFilePath, {
    mimeType: "audio/wav",
    displayName: path.basename(resolvedFilePath),
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
