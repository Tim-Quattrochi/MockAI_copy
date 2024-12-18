"use client";

import { useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useRef, useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { uploadAudio } from "@/app/interview/actions";
import { User } from "@supabase/supabase-js";
import { InterviewData } from "@/types";

interface BlobEvent extends Event {
  data: Blob;
}

interface UploadStatus {
  status: "idle" | "loading" | "error";
  message: string;
  error: Error | null;
}

interface UseVideoRecorderReturn {
  isRecording: boolean;
  uploadStatus: UploadStatus;
  recordingComplete: boolean;
  audioBlob: Blob | null;
  startRecording: () => void;
  stopRecording: () => void;
  videoUrl: string | null;
  videoBlob: Blob | null;
  handleUploadAudio: (
    interviewData: InterviewData,
    user: User,
    questionId: string,
    question: string
  ) => void;
}

export const useVideoRecorder = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  constraints: MediaStreamConstraints
): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // For the temporary front-end URL
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null); // The video Blob itself
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // Blob for extracted audio
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    message: "",
    error: null,
  });

  const id_unique = useRef(uuid()).current;

  // For Media Recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function initializeMediaRecorder() {
    videoChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const handleDataAvailable = (event: BlobEvent): void => {
        videoChunksRef.current.push(event.data);
      };

      const handleStop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, {
          type: "video/webm",
        });

        setVideoBlob(videoBlob);
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);

        // Extract audio from video
        const extractedAudioBlob = await handleAudioExtraction(
          videoBlob
        );

        setAudioBlob(extractedAudioBlob);

        mediaRecorder.removeEventListener(
          "dataavailable",
          handleDataAvailable
        );
        mediaRecorder.removeEventListener("stop", handleStop);
      };

      mediaRecorder.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorder.addEventListener("stop", handleStop);

      mediaRecorder.start();
    } catch (error) {
      console.error("Failed to initialize media recorder:", error);
    }
  }

  const startRecording = () => {
    setIsRecording(true);
    initializeMediaRecorder();
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setRecordingComplete(true);
  };

  async function handleAudioExtraction(file: Blob) {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    await ffmpeg.writeFile(
      `${id_unique}.webm`,
      await fetchFile(file)
    );
    await ffmpeg.exec([
      "-i",
      `${id_unique}.webm`,
      "-vn", // means no video.
      "-acodec",
      "libmp3lame",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-f",
      "mp3",
      `${id_unique}.mp3`,
    ]);

    const fileData = await ffmpeg.readFile(`${id_unique}.mp3`);

    const output = new File([fileData], `${id_unique}.mp3`, {
      type: "audio/mpeg",
    });

    return output;
  }

  const handleUploadAudio = useCallback(
    async (
      interviewData: InterviewData,
      user: User,
      question: string,
      questionId: string
    ) => {
      if (!audioBlob || !videoBlob) {
        console.error(
          "No audio to upload or video available to upload."
        );

        return;
      }

      const { name, company, position, questionType } = interviewData;

      setUploadStatus((prevState) => ({
        ...prevState,
        status: "loading",
        message: "Uploading...",
        error: null,
      }));

      try {
        const formData = new FormData();
        formData.append(
          "extractedAudioFile",
          audioBlob,
          `${id_unique}.mp3`
        );
        formData.append("fileName", `${id_unique}.mp3`);

        if (videoBlob) {
          formData.append("videoFile", videoBlob);
        }
        formData.append("company", company);
        formData.append("position", position);
        formData.append("questionType", questionType);
        formData.append("name", name);
        formData.append("user", user?.email ?? "");
        formData.append("question", question);
        formData.append("questionId", questionId);

        const res = await uploadAudio(formData);

        if (res.success) {
          setUploadStatus((prevState) => ({
            ...prevState,
            status: "idle",
            message: "Upload successful",
            error: null,
          }));
        } else {
          setUploadStatus((prevState) => ({
            ...prevState,
            status: "error",
            message: "Error uploading audio",
            error: new Error(res.error),
          }));
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        setUploadStatus((prevState) => ({
          ...prevState,
          status: "error",
          message: "Error uploading audio",
          error:
            error instanceof Error
              ? error
              : new Error("Unknown error"),
        }));
      } finally {
        setUploadStatus((prevState) => {
          if (prevState.status === "loading") {
            return { ...prevState, status: "idle" };
          }

          return prevState;
        });
      }
    },
    [audioBlob, videoBlob, id_unique]
  );

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  return {
    isRecording,
    uploadStatus,
    recordingComplete,
    startRecording,
    stopRecording,
    videoUrl, // Front-end temporary video URL
    audioBlob, // Extracted audio Blob
    handleUploadAudio, // Function to call to upload the audio
    videoBlob,
  };
};
