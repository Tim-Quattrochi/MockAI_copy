"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useRef, useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { uploadAudio } from "@/app/interview/actions";
import { Question } from "@/types";
import { User } from "@supabase/supabase-js";

interface BlobEvent extends Event {
  data: Blob;
}

interface UseVideoRecorderReturn {
  isRecording: boolean;
  isUploading: boolean;
  recordingComplete: boolean;
  audioBlob: Blob | null;
  startRecording: () => void;
  stopRecording: () => void;
  videoUrl: string | null;
  videoBlob: Blob | null;
  handleUploadAudio: (
    user: User,
    questionId: string,
    question: string
  ) => void;
}

export const useVideoRecorder = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  selectedQuestion: Question["question_text"]
): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // For the temporary front-end URL
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null); // The video Blob itself
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // Blob for extracted audio
  const [hasUploaded, setHasUploaded] = useState(false);
  const [readyToUploadVideo, setReadyToUploadVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const id_unique = uuid();

  // For Media Recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function initializeMediaRecorder() {
    videoChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
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

        setVideoBlob(videoBlob); // Ensure videoBlob is set properly
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl); // Set a front-end URL for preview

        console.log("Video Blob:", videoBlob); // Should output a Blob object
        console.log("Video URL:", videoUrl);

        // Extract audio from video
        const extractedAudioBlob = await handleAudioExtraction(
          videoBlob
        );
        console.log("Extracted audioBlob:", extractedAudioBlob); // Debugging log
        setAudioBlob(extractedAudioBlob); // Set audio Blob for upload

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

    console.log("Extracted audio:", output);

    return output;
  }

  const handleUploadAudio = async (
    user: User,
    question: string,
    questionId: string
  ) => {
    console.log("FIRED");
    if (!audioBlob) {
      console.error("No audio to upload.");
      return;
    }

    setIsUploading(true);

    try {
      // I am extracting the audio from the video
      const file = await handleAudioExtraction(audioBlob);

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

      formData.append("user", user?.email ?? "");
      formData.append("question", question);
      formData.append("questionId", questionId);

      const response = await uploadAudio(formData);

      if (response.success) {
        setHasUploaded(true);
      } else {
        console.error("Error uploading audio:", response.error);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (videoBlob && !hasUploaded && selectedQuestion.trim() !== "") {
      setReadyToUploadVideo(true);
    }
  }, [videoBlob, selectedQuestion]);

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
    isUploading,
    recordingComplete,
    startRecording,
    stopRecording,
    videoUrl, // Front-end temporary video URL
    audioBlob, // Extracted audio Blob
    handleUploadAudio, // Function to call to upload the audio
    videoBlob,
  };
};
