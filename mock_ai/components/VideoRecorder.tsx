"use client";
import { useEffect, useRef } from "react";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Button } from "./ui/Button";
import CircularProgress from "./ui/CircularProgress";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Mic, Pause, Video, Rocket, CircleStop } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/useToast";
import { Question } from "@/types";
import { User } from "@supabase/supabase-js";

interface VideoRecorderProps {
  selectedQuestion: Question["question_text"];
  questionId: Question["id"];
  user: User;
  onUploadStatusChange: (status: boolean) => void;
}

export default function VideoRecorder({
  selectedQuestion,
  questionId,
  user,
  onUploadStatusChange,
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    isRecording,
    uploadStatus,
    startRecording,
    stopRecording,
    videoUrl,
    handleUploadAudio,
    videoBlob,
    audioBlob,
  } = useVideoRecorder(videoRef);

  const { status, error: uploadError, message } = uploadStatus;

  const isUploading = status === "loading";

  const {
    startRecognition,
    stopRecognition,
    transcript,
    error: speechError,
    resetTranscript,
    isSpeechRecognitionSupported,
  } = useSpeechRecognition();

  const { toast, dismiss } = useToast();

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStopRecording();

      videoRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      handleStartRecording();
      videoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { time, startTimer, stopTimer, resetTimer } = useTimer({
    onTimeWarning: () => showToast(),
    onTimeUp: () => {
      handleToggleRecording();
    },
  });

  const handleStopRecording = () => {
    stopRecognition();

    setTimeout(() => {
      stopRecording();
      stopTimer();
    }, 500);
  };

  const handleStartRecording = async () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: "Browser Not Supported",
        description:
          "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    try {
      resetTranscript();
      startRecording();

      setTimeout(() => {
        startRecognition();
        startTimer();
      }, 500);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

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

  useEffect(() => {
    const uploadBlobs = async () => {
      if (videoBlob && audioBlob) {
        try {
          await handleUploadAudio(user, selectedQuestion, questionId); // Upload extracted audio
          onUploadStatusChange(true);
          videoRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
          console.error("Error uploading blobs:", error);
          onUploadStatusChange(false);
        }
      }
    };

    if (videoBlob && audioBlob) {
      uploadBlobs();
    }
  }, [
    videoBlob,
    audioBlob,
    handleUploadAudio,
    user,
    selectedQuestion,
    questionId,
    onUploadStatusChange,
  ]);

  useEffect(() => {
    if (speechError) {
      toast({
        title: "Speech Recognition Error",
        description: speechError.message,
        variant: "destructive",
      });
    }
    if (uploadError) {
      toast({
        title: "Upload Error",
        description: uploadError.message,
        variant: "destructive",
      });
    }
  }, [speechError, uploadError, toast]);

  return (
    <div className="bg-[#050614] text-white p-6 flex items-center justify-center flex-grow min-h-[25vh] max-w-2xl mx-auto">
      <div className="w-full max-w-3xl flex-grow">
        {(isRecording || transcript) && (
          <Card className="bg-[#1E!F3B] border-[#2e2f61] mb-8">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-[#7ECEFE]">
                  {isRecording ? "Recording" : "Recorded"}
                </span>
                {isRecording && (
                  <div className="flex justify-end items-center space-x-4">
                    <span className="flex items-center">
                      <span className="animate-pulse mx-2 h-3 w-3 inline-block rounded-full bg-[#C32047]"></span>
                      Live
                    </span>

                    <CircularProgress
                      radius={35}
                      stroke={5}
                      progress={Number(time)}
                      maxTime={180}
                      formattedTime={time}
                    />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#f0f0f0] mb-4">
                {isRecording
                  ? "What are your thoughts on this question?"
                  : "Thank you for your interview."}
              </p>

              {transcript && (
                <div className="bg-[#131538] rounded-md p-4 mb-4 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <p className="text-[#f0f0f0] whitespace-pre-wrap">
                    {transcript}
                    {isRecording && (
                      <span className="inline-block w-1 h-4 ml-1 bg-[#FE7E7E] animate-pulse" />
                    )}
                  </p>
                </div>
              )}
              <div className="aspect-w-16 aspect-h-9 bg-[#131538] rounded-lg overflow-hidden max-w-full">
                <video
                  ref={videoRef}
                  key={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  crossOrigin="anonymous"
                >
                  <source src={videoUrl ?? ""} type="video/webm" />
                  Your browser does not support the video tag.
                </video>

                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-16 w-16 text-[#7fceff] opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col items-center mb-8">
          <Button
            onClick={handleToggleRecording}
            disabled={isUploading}
            className={`rounded-full p-8 transition-all duration-300 ${
              isUploading
                ? "bg-[#ff6db3] text-[#050614] cursor-not-allowed"
                : isRecording
                ? "bg-[#ff6db3] hover:bg-[#ff6db3]/90"
                : "bg-[#7fceff] hover:bg-[#7fceff]/90"
            }`}
            aria-label={
              isUploading
                ? "Uploading..."
                : isRecording
                ? "Stop Recording"
                : "Start Recording"
            }
          >
            {isUploading ? (
              <>
                <Rocket className="h-8 w-8 text-[#FE7ECE] animate-bounce" />
                <span className="ml-2">Uploading...</span>
              </>
            ) : isRecording ? (
              <CircleStop className="h-8 w-8 text-destructive" />
            ) : (
              <Mic className="h-8 w-8 text-[#050614]" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
