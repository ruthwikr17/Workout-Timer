import React from "react";

export default function TimerDisplay({ total, remaining, size = 220, stroke = 12 }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;
  // color
  const color = remaining > total * 0.5 ? "#10b981" : remaining > total * 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" strokeWidth={stroke} stroke="rgba(15,23,42,0.08)" />
        <circle
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90)"
        />
      </g>
    </svg>
  );
}