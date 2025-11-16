import React from "react";

export default function TimerDisplay({ total, remaining, size = 220, stroke = 12 }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  return (
    <svg width={size} height={size}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {/* Background ring */}
        <circle
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="rgba(255,255,255,0.2)"
        />

        {/* Progress ring - clockwise + starting at top */}
        <circle
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="#ff3366"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90)`}  
        />
      </g>
    </svg>
  );
}