"use client";
import { useEffect, useRef, useState } from "react";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Button } from "./ui/Button";
import CircularProgress from "./ui/CircularProgress";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Mic,
  Pause,
  Video,
  Rocket,
  CircleStop,
  User,
} from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/useToast";
import { InterviewData, Question } from "@/types";
// import { User } from "@supabase/supabase-js";

interface VideoRecorderProps {
  selectedQuestion: Question["question_text"];
  questionId: Question["id"];
  user: User;
  onUploadStatusChange: (status: boolean) => void;
  interviewData: InterviewData;
  isInterviewCanceled: boolean;
}

export default function VideoRecorder({
  selectedQuestion,
  questionId,
  user,
  onUploadStatusChange,
  interviewData,
  isInterviewCanceled,
}: VideoRecorderProps) {
  const [isDeviceDesktop, setIsDeviceDesktop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const constraints = {
    audio: true,
    video: isDeviceDesktop
      ? { width: 1280, height: 720, facingMode: "user" }
      : {
          width: 480,
          height: 640,
          facingMode: "user",
        },
  };

  useEffect(() => {
    const updateMedia = () => {
      setIsDeviceDesktop(window.innerWidth >= 768);
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const {
    isRecording,
    uploadStatus,
    startRecording,
    stopRecording,
    videoUrl,
    handleUploadAudio,
    videoBlob,
    audioBlob,
  } = useVideoRecorder(videoRef, constraints);

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
      if (isInterviewCanceled) {
        return;
      }
      try {
        await handleUploadAudio(
          interviewData,
          user,
          selectedQuestion,
          questionId
        ); // Upload extracted audio
        onUploadStatusChange(true);
        videoRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Error uploading blobs:", error);
        onUploadStatusChange(false);
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
    interviewData,
    isInterviewCanceled,
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
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-headingColor flex justify-between items-center">
          <span>Interview Recording</span>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></span>
              <span className="text-sm font-normal">Live</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
                webkit-playsinline="true"
                disablePictureInPicture={true}
                controlsList="nodownload nofullscreen noremoteplayback"
                muted
                crossOrigin="anonymous"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-20 w-20 text-gray-400" />
              </div>
            )}
          </div>

          {transcript && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {transcript}
                {isRecording && (
                  <span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse" />
                )}
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleToggleRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="w-40"
            >
              {isRecording ? (
                <>
                  <CircleStop className="mr-2 h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Start Recording
                </>
              )}
            </Button>
            {isRecording && (
              <div className="flex items-center">
                <CircularProgress
                  radius={30}
                  stroke={4}
                  progress={Number(time)}
                  maxTime={180}
                  formattedTime={time}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
