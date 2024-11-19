import React from "react";

interface VideoPlayerProps {
  src: string;
  controls?: boolean;
  width?: string;
  height?: string;
}

const VideoPlayer = ({
  src,
  controls = true,
  width = "100%",
  height = "auto",
}: VideoPlayerProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-black">
      <video
        className="w-full h-auto"
        src={src}
        controls={controls}
        width={width}
        height={height}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
