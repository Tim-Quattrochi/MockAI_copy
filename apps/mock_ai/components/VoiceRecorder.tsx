"use client";
import { useState, useEffect } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Feedback, InterviewData, Question } from "@/types";
import { Button } from "./ui/Button";
import CircularProgress from "./ui/CircularProgress";
import { useToast } from "@/hooks/useToast";

import { CloudIcon, MicIcon, OctagonX } from "lucide-react";

interface VoiceRecorderProps {
  questionId: string;
  selectedQuestion: Question["question"];
  user: any;
  onRecordingComplete: () => void;
  setIsUploading: (isUploading: boolean) => void;
  isUploading: boolean;
  interviewData: InterviewData;
}

export default function VoiceRecorder({
  questionId,
  selectedQuestion,
  user,
  onRecordingComplete,
  setIsUploading,
  isUploading,
  interviewData,
}: VoiceRecorderProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const { toast, dismiss } = useToast();

  const showToast = () => {
    const myToast = toast({
      title: "Your time is almost up!",
      description:
        "You have 30 seconds left to record your thoughts.",
      variant: "default",
    });

    setTimeout(() => {
      dismiss(myToast.id);
    }, 5000);
  };

  const {
    isRecording,
    recordingComplete,
    audioUrl,
    transcript,
    startRecording,
    stopRecording,
    audioBlob,
  } = useVoiceRecorder()!;

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;

          if (newTimer === 150) {
            showToast();
          }

          if (newTimer === 179) {
            stopRecording();
            console.log("Recording stopped after 3 minutes");
            clearInterval(interval);
          }

          return newTimer;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleUpload = async (audioBlob: Blob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", audioBlob);
    const fileExtension = audioBlob.type.split("/")[1];
    formData.append(
      "fileName",
      `${Date.now()}-${user.email}.${fileExtension}`
    );
    formData.append("user", user.email);
    formData.append("questionId", questionId);
    formData.append("question", JSON.stringify(selectedQuestion));
    formData.append("name", interviewData.name);
    formData.append("company", interviewData.company);
    formData.append("position", interviewData.position);
    formData.append("questionType", interviewData.questionType);

    const URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/audio/upload`;
    try {
      const response = await fetch(URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setFeedback(data);
      setShowFeedback(true);
      onRecordingComplete();
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading audio file:", error);
      setIsUploading(false);
      setIsUploading(false);
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      setIsLoading(true);
      startRecording();
    } else {
      setIsLoading(false);
      stopRecording();
    }
  };

  useEffect(() => {
    if (recordingComplete && audioBlob) {
      // reset feedback
      setFeedback(null);
      handleUpload(audioBlob);

      if (uploaded) {
        setTimeout(() => {
          setIsUploading(false);
          setUploaded(false);
        }, 2000);
      } else {
        setTimer(0);
      }
    }
  }, [recordingComplete, audioBlob]);

  console.log(selectedQuestion);

  return (
    <div className="flex items-center justify-center h-auto w-full">
      <div className="w-full">
        <div className="flex items-center w-full justify-center mt-6">
          <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-700 text-white flex justify-around items-center">
              <span
                className={`font-semibold ${
                  !isRecording
                    ? "text-white"
                    : "text-red-500 animate-pulse font-extrabold text-xl"
                }`}
              >
                {!isRecording && !isUploading
                  ? "Ready to record."
                  : "Recording"}
              </span>

              <CircularProgress
                radius={35}
                stroke={5}
                progress={timer}
                maxTime={180}
                formattedTime={formatTime(timer)}
              />
            </div>
            <div className="p-4 text-gray-400 text-center">
              {isRecording
                ? transcript
                : "Your thoughts will appear here..."}
            </div>
            <div className="w-full flex justify-center gap-5 items-center relative pb-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center relative"
              >
                <div
                  className={`absolute inset-0 rounded-full ${
                    timer >= 150
                      ? "bg-red-500 animate-pulse"
                      : "bg-blue-500 opacity-50"
                  }`}
                ></div>
                <MicIcon className="w-8 h-8 z-10" />
              </button>
            </div>
          </div>

          {isUploading && (
            <div className="flex items-center mt-6 space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.42 1.42A8 8 0 014 12H0c0 3.314 1.344 6.314 3.512 8.512z"
                ></path>
              </svg>
              <span className="text-gray-600">Uploading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
