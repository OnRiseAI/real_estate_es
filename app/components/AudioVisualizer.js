"use client";

import { useState, useEffect } from "react";

const BAR_COUNT = 7;
const STATIC_HEIGHTS = Array(BAR_COUNT).fill(4);

export default function AudioVisualizer({ isAgentTalking }) {
  const [heights, setHeights] = useState(STATIC_HEIGHTS);

  useEffect(() => {
    if (!isAgentTalking) return;
    const interval = setInterval(() => {
      setHeights(Array.from({ length: BAR_COUNT }, () => 4 + Math.random() * 32));
    }, 100);
    return () => clearInterval(interval);
  }, [isAgentTalking]);

  return (
    <div className="flex items-center justify-center gap-[5px] h-10">
      {(isAgentTalking ? heights : STATIC_HEIGHTS).map((h, i) => (
        <div
          key={i}
          className="w-[3.5px] rounded-full transition-all duration-[80ms]"
          style={{
            height: `${h}px`,
            backgroundColor: isAgentTalking ? "#2DD4BF" : "#333338",
            boxShadow: isAgentTalking ? "0 0 8px rgba(45, 212, 191, 0.3)" : "none",
          }}
        />
      ))}
    </div>
  );
}
