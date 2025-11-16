// src/pages/Workout.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoutine } from "../utils/localStorageUtils";
import TimerDisplay from "../components/TimerDisplay";

import {
  playStart,
  playBeep,
  playRest,
  playFinish,
} from "../utils/sound";

function secsToMMSS(s) {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export default function Workout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);

  // Load routine
  useEffect(() => {
    const r = getRoutine(id);
    if (!r) return navigate("/");
    setRoutine(r);
  }, [id]);

  // timeline
  const timelineRef = useRef([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  // Build timeline
  useEffect(() => {
    if (!routine) return;

    const timeline = [];
    routine.rounds.forEach((rd, ri) => {
      for (let s = 1; s <= rd.sets; s++) {
        timeline.push({
          type: "work",
          roundIndex: ri,
          set: s,
          label: rd.name,
          duration: rd.work,
        });

        timeline.push({
          type: "rest",
          roundIndex: ri,
          set: s,
          label: "Break",
          duration: rd.rest,
        });
      }

      if (ri < routine.rounds.length - 1) {
        timeline.push({
          type: "roundRest",
          roundIndex: ri,
          set: null,
          label: "Round Rest",
          duration: routine.roundRest ?? 0,
        });
      }
    });

    timelineRef.current = timeline;
    setIndex(0);
    setRemaining(timeline[0]?.duration || 0);

    if (routine.autoStart !== false) setRunning(true);
    playStart(); // Initial start sound
  }, [routine]);

  // Ticking
  useEffect(() => {
    if (!running) return;

    if (remaining <= 0) {
      // Move to next phase
      const next = index + 1;

      if (index < timelineRef.current.length - 1) {
        playFinish(); // End of a segment
        setIndex(next);
        setRemaining(timelineRef.current[next].duration);
        playStart(); // Start next segment
      } else {
        playFinish();
        setRunning(false);
      }
      return;
    }

    // last 5s: beep every second
    if (remaining <= 5) playBeep();

    const t = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [running, remaining, index]);

  if (!routine) return null;
  const current = timelineRef.current[index];
  const total = current?.duration || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="card flex flex-col md:flex-row items-center gap-6">
        {/* Timer */}
        <div className="timer-large">
          <TimerDisplay total={total} remaining={remaining} size={220} stroke={14} />
          <div className="timer-value">{secsToMMSS(remaining)}</div>
          <div className="timer-label">{current?.label || ""}</div>
        </div>

        {/* Controls */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-500">Phase</div>
              <div className="text-xl font-semibold">{current?.type}</div>
            </div>
            <div className="text-sm text-slate-500">
              Set {current?.set || "-"} • Round{" "}
              {current?.roundIndex != null ? current.roundIndex + 1 : "-"}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="btn-primary"
            >
              {running ? "Pause" : "Start"}
            </button>

            <button
              onClick={() => {
                setRunning(false);
                setIndex(0);
                setRemaining(timelineRef.current[0]?.duration || 0);
                playStart();
              }}
              className="btn-ghost"
            >
              Reset
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="text-sm text-slate-500 mb-2">Progress</div>
            <div className="w-full h-3 bg-slate-200 rounded overflow-hidden">
              <div
                style={{
                  width: `${
                    (index / Math.max(1, timelineRef.current.length - 1)) * 100
                  }%`,
                }}
                className="h-3 bg-gradient-to-r from-brand to-pink-400"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Timeline */}
      <div className="card">
        <div className="text-sm text-slate-500 mb-3">Upcoming</div>
        <div className="grid grid-cols-3 gap-3">
          {timelineRef.current.slice(index, index + 9).map((t, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                i === 0
                  ? "border-brand"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-slate-500">
                {t.type} • {t.duration}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}