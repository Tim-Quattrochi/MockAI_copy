export function formatSeconds(durations: number[]): string {
  return durations
    .map((duration) => {
      const totalSeconds = Math.round(duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ${
          seconds > 0
            ? `and ${seconds} second${seconds > 1 ? "s" : ""}`
            : ""
        }`;
      }
      return `${seconds} second${seconds > 1 ? "s" : ""}`;
    })
    .join(", ");
}

export const formatPauseDurations = (
  pauseDurations: string | number | any[]
): string => {
  if (Array.isArray(pauseDurations)) {
    return formatSeconds(pauseDurations);
  } else if (typeof pauseDurations === "string") {
    if (pauseDurations === "0") {
      return "0 seconds";
    }
    try {
      const durations = JSON.parse(pauseDurations);
      if (Array.isArray(durations)) {
        return formatSeconds(durations);
      }

      const parsedNum = parseFloat(pauseDurations);
      if (!isNaN(parsedNum)) {
        return `${parsedNum} seconds`;
      }
      return "Invalid data";
    } catch (error) {
      console.error("Error parsing pause_durations:", error);
      return "Invalid data";
    }
  } else if (typeof pauseDurations === "number") {
    if (pauseDurations === 0) {
      return "0 seconds";
    }
    return formatSeconds([pauseDurations]);
  } else {
    return "No data available";
  }
};
