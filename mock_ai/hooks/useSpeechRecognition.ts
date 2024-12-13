import { useRef } from "react";

type SpeechRecognition = typeof window.webkitSpeechRecognition;

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
}

export function useSpeechRecognition({
  onResult,
}: UseSpeechRecognitionProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) return;

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (
      event: SpeechRecognitionEvent
    ) => {
      const { transcript } =
        event.results[event.results.length - 1][0];
      onResult(transcript);
    };

    recognitionRef.current.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
  };

  return { startRecognition, stopRecognition };
}
