import React from "react";

interface CircularProgressProp {
  radius?: number;
  stroke?: number;
  progress: number;
  maxTime: number;
  formattedTime: string;
}

const CircularProgress = ({
  radius = 25,
  stroke = 5,
  progress,
  maxTime,
  formattedTime,
}: CircularProgressProp) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progress / maxTime) * circumference;

  const getStrokeColor = () => {
    if (progress >= maxTime * 0.75) {
      return "#FF6DB3";
    }
    return "#7ECEFE";
  };

  const strokeColor = getStrokeColor();
  const textColor =
    progress >= maxTime * 0.75 ? "#FF6DB3" : "#7ECEFE";

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="lightgray"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={strokeColor}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeLinecap="round"
      />

      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontSize="12px"
        fill={progress >= maxTime * 0.75 ? "red" : "white"}
      >
        {formattedTime}
      </text>
    </svg>
  );
};

export default CircularProgress;
