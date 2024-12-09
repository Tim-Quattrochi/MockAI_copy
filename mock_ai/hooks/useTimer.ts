"use client";
import { useEffect, useState, useRef } from "react";

interface UseTimerProps {
  onTimeWarning?: () => void;
  onTimeUp?: () => void;
  maxSeconds?: number;
  warningSeconds?: number;
}

export function useTimer({
  onTimeWarning,
  onTimeUp,
  maxSeconds = 180,
  warningSeconds = 150,
}: UseTimerProps = {}) {
  const [time, setTime] = useState("00:00");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startTimer = () => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const diff = Date.now() - startTime;
      const currentSeconds = Math.floor(diff / 1000);
      setSeconds(currentSeconds);

      const minutes = Math.floor(currentSeconds / 60);
      const secs = currentSeconds % 60;
      setTime(
        `${minutes.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      );

      if (currentSeconds === warningSeconds) {
        onTimeWarning?.();
      }

      if (currentSeconds >= maxSeconds) {
        onTimeUp?.();
        stopTimer();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setTime("00:00");
    setSeconds(0);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  return { time, seconds, startTimer, stopTimer, resetTimer };
}
