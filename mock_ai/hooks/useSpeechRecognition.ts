import { useRef, useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export function useSpeechRecognition(maxChars: number = 300) {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] =
    useState<string>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechRecognitionSupported = () => {
    return (
      "webkitSpeechRecognition" in window ||
      "speechRecognition" in window
    );
  };

  const truncateTranscript = useCallback(
    (text: string) => {
      if (text.length > maxChars) {
        return text.slice(-maxChars) + "...";
      }
      return text;
    },
    [maxChars]
  );

  const startRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      console.error("Speech recognition not supported in browser.");
      setError(
        new Error("Speech recognition not supported in browser.")
      );
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (
        event: SpeechRecognitionEvent
      ) => {
        let currentInterim = "";
        let current = "";

        const result = event.results[event.results.length - 1];

        if (result.isFinal) {
          current = result[0].transcript;
          setFinalTranscript((prev) => {
            const newTranscript = `${prev} ${current}`.trim();
            return truncateTranscript(newTranscript);
          });
          setInterimTranscript("");
        } else {
          currentInterim = result[0].transcript;
          setInterimTranscript(currentInterim);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(
          new Error(`Speech recognition error: ${event.error}`)
        );
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);

        if (isListening) {
          recognitionRef.current?.start();
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error(
        "Speech recognition initialization error:",
        error
      );
      setError(new Error("Failed to initialize speech recognition"));
    }
  }, [isListening, truncateTranscript]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const getDisplayTranscript = useCallback(() => {
    return `${finalTranscript} ${interimTranscript}`.trim();
  }, [finalTranscript, interimTranscript]);

  return {
    startRecognition,
    stopRecognition,
    transcript: getDisplayTranscript(),
    resetTranscript,
    error,
    isSpeechRecognitionSupported: isSpeechRecognitionSupported(),
  };
}
