"use client";
import { useState } from "react";
import { Feedback, InterviewData, Question } from "@/types";
import { Button } from "./ui/Button";
import CircularProgress from "./ui/CircularProgress";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useToast } from "@/hooks/useToast";
import { useTimer } from "@/hooks/useTimer";
import { CloudIcon, MicIcon, OctagonX } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAudio } from "@app/interview/actions";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { User } from "@supabase/supabase-js";

interface VoiceRecorderProps {
  questionId: Question["id"];
  selectedQuestion: Question["question_text"];
  user: User;
  onRecordingComplete: () => void;
  setIsUploading: (isUploading: boolean) => void;
  isUploading: boolean;
  interviewData: InterviewData;
  setResults: (results: Feedback) => void;
}

export default function VoiceRecorder({
  questionId,
  selectedQuestion,
  user,
  onRecordingComplete,
  setIsUploading,
  isUploading,
  interviewData,
  setResults,
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState("");

  const { toast, dismiss } = useToast();

  const handleAudioStop = async (audioBlob: Blob) => {
    await handleUpload(audioBlob);
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      handleStartRecording();
    } else {
      handleStopRecording();
    }
  };

  const handleStartRecording = async () => {
    await startRecording();
    startRecognition();
    startTimer();
  };

  const handleStopRecording = () => {
    stopRecording();
    stopRecognition();
    stopTimer();
  };

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onResult: setTranscript,
  });

  const { isRecording, startRecording, stopRecording } =
    useMediaRecorder({
      onStop: handleAudioStop,
      mediaStreamConstraints: { audio: true },
      mimeType: "audio/wav",
    });

  const { time, startTimer, stopTimer, resetTimer } = useTimer({
    onTimeWarning: () => showToast(),
    onTimeUp: () => {
      handleToggleRecording();
      resetTimer();
    },
  });

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

  async function handleUpload(audioBlob: Blob) {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("fileName", `${Date.now()}-${user.email}.wav`);
    formData.append("user", user.email ?? "");
    formData.append("questionId", questionId);
    formData.append("question", JSON.stringify(selectedQuestion));
    formData.append("name", interviewData.name);
    formData.append("company", interviewData.company);
    formData.append("position", interviewData.position);
    formData.append("questionType", interviewData.questionType);

    const result = await uploadAudio(formData);

    if (result.success) {
      const feedback: Feedback = {
        ...result,
        filler_word_count: {
          like: 0,
          so: 0,
          uh: 0,
          um: 0,
          "you know": 0,
        },
        long_pause_count: 0,
        pause_durations: [],
      };
      setResults(feedback);
      onRecordingComplete();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsUploading(false);
  }

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
                {isUploading
                  ? "Uploading..."
                  : isRecording
                  ? "Recording..."
                  : "Ready to record"}
              </span>

              <CircularProgress
                radius={35}
                stroke={5}
                progress={Number(time)}
                maxTime={180}
                formattedTime={time}
              />
            </div>
            <p
              className={cn(
                "text-center transition-colors m-2 p-2",
                isUploading && "text-blue-400",
                isRecording && "text-white",
                !isRecording && "text-gray-400"
              )}
            >
              {isUploading
                ? "Processing your recording..."
                : isRecording
                ? transcript || "Listening..."
                : "Your thoughts will appear here..."}
            </p>
            <div className="w-full flex justify-center gap-5 items-center relative pb-4">
              <Button
                onClick={handleToggleRecording}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center relative"
              >
                <div
                  className={`absolute inset-0 rounded-full ${
                    Number(time) >= 150
                      ? "bg-red-500 animate-pulse"
                      : "bg-blue-500 opacity-50"
                  }`}
                ></div>
                {isUploading ? (
                  <CloudIcon className="w-8 h-8 z-10" />
                ) : isRecording ? (
                  <OctagonX className="w-8 h-8 z-10" />
                ) : (
                  <MicIcon className="w-8 h-8 z-10" />
                )}
              </Button>
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
