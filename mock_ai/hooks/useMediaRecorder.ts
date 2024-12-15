import { useState, useRef } from "react";

interface UseMediaRecorderOptions {
  onStop: (blob: Blob) => void;
  mediaStreamConstraints?: MediaStreamConstraints;
  mimeType?: string;
}

export function useMediaRecorder({
  onStop,
  mediaStreamConstraints = { audio: true },
  mimeType = "audio/webm",
}: UseMediaRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    mediaChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints
      );
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        mediaChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, {
          type: mimeType,
        });
        onStop(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to initialize media recorder:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    stream: streamRef.current,
  };
}
