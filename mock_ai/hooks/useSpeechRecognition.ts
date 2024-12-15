import { useRef, useState } from "react";

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

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState<string | null>(null);
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
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
  };

  return { startRecognition, stopRecognition, transcript };
}
