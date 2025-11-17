import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoutine, upsertRoutine, touchRoutineTimestamp } from "../utils/localStorageUtils";
import TimerDisplay from "../components/TimerDisplay";
import { playStart, playBeep, playRest, playFinish } from "../utils/sound";
import { estimateDuration } from "../utils/timerUtils";

function secsToMMSS(s) {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

function sanitizeDigits(v, fallback = 0) {
  const cleaned = String(v).replace(/\D/g, "").slice(0, 4);
  if (cleaned === "") return 0;
  return parseInt(cleaned, 10);
}

export default function Workout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);

  const timelineRef = useRef([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  // manual extra break seconds typed by user (no +/-)
  const [extraBreakSec, setExtraBreakSec] = useState(0);

  useEffect(() => {
    const r = getRoutine(id);
    if (!r) return navigate("/");
    setRoutine(r);
  }, [id]);

  useEffect(() => {
    if (!routine) return;
    const timeline = [];

    routine.rounds.forEach((rd, ri) => {
      for (let s = 1; s <= Number(rd.sets || 0); s++) {
        timeline.push({
          type: "work",
          roundIndex: ri,
          set: s,
          label: rd.name,
          duration: Number(rd.work || 0),
        });
        timeline.push({
          type: "rest",
          roundIndex: ri,
          set: s,
          label: "Break",
          duration: Number(rd.rest || 0),
        });
      }
      if (ri < routine.rounds.length - 1) {
        timeline.push({
          type: "roundRest",
          roundIndex: ri,
          set: null,
          label: "Round Break",
          duration: Number(routine.roundRest || 0),
        });
      }
    });

    timelineRef.current = timeline;
    setIndex(0);
    setRemaining(timeline[0]?.duration || 0);

    if (routine.autoStart !== false) {
      playStart();
      setRunning(true);
      // record start timestamp
      touchRoutineTimestamp(routine.id, "start", new Date().toISOString());
      upsertRoutine({ ...routine, lastStarted: new Date().toISOString() });
    }
  }, [routine]);

  useEffect(() => {
    if (!running) return;

    if (remaining <= 0) {
      const next = index + 1;
      if (index < timelineRef.current.length - 1) {
        // play the appropriate sound for the next item
        const nextItem = timelineRef.current[next];
        if (nextItem?.type === "work") playStart();
        else playRest();

        setIndex(next);
        setRemaining(nextItem.duration);
      } else {
        playFinish();
        setRunning(false);
        // save finish timestamp
        touchRoutineTimestamp(routine.id, "finish", new Date().toISOString());
        upsertRoutine({ ...routine, lastFinished: new Date().toISOString() });
      }
      return;
    }

    // countdown beep last 5s on work
    if (timelineRef.current[index]?.type === "work" && remaining <= 5 && remaining > 0) {
      playBeep();
    }

    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [running, remaining, index]);

  function addManualBreakNow() {
    const sec = sanitizeDigits(extraBreakSec, 0);
    if (sec <= 0) return;
    const newStep = {
      type: "rest",
      roundIndex: timelineRef.current[index]?.roundIndex ?? null,
      set: null,
      label: "Break",
      duration: sec,
    };
    const updated = [...timelineRef.current];
    updated.splice(index + 1, 0, newStep);
    timelineRef.current = updated;
    setIndex(index + 1);
    setRemaining(sec);
    setRunning(true);
    playRest();
  }

  if (!routine) return null;

  const current = timelineRef.current[index];
  const totalSegments = Math.max(1, timelineRef.current.length);
  const pct = Math.round((index / (totalSegments - 1 || 1)) * 100);
  const estTotalSeconds = estimateDuration(routine);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="card flex flex-col md:flex-row items-center gap-6">
        <div className="timer-large">
          <TimerDisplay total={current?.duration || 0} remaining={remaining} size={220} stroke={14} />
          <div className="timer-value">{secsToMMSS(remaining)}</div>
          <div className="timer-label">{current?.label || ""}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-500">Phase</div>
              <div className="text-xl font-semibold">{current?.type}</div>
            </div>

            <div className="text-sm text-slate-500">
              Set {current?.set || "-"} • Round {current?.roundIndex != null ? current.roundIndex + 1 : "-"}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={() => { if (!running) playStart(); setRunning((r) => !r); }} className="btn-primary">
              {running ? "Pause" : "Start"}
            </button>

            <button onClick={() => { setRunning(false); setIndex(0); setRemaining(timelineRef.current[0]?.duration || 0); }} className="btn-ghost">
              Reset
            </button>

            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                className="input-base w-14 text-center"
                value={String(extraBreakSec ?? 0)}
                onChange={(e) => setExtraBreakSec(sanitizeDigits(e.target.value, 0))}
                maxLength={4}
              />
              <button onClick={addManualBreakNow} className="btn-primary">
                Add Break
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-sm text-slate-500 font-medium">{pct}%</div>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded overflow-hidden">
              <div style={{ width: `${pct}%` }} className="h-3 bg-gradient-to-r from-brand to-pink-400"></div>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Estimated total: {Math.ceil(estTotalSeconds / 60)} min
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-slate-500 mb-3">Upcoming</div>
        <div className="grid grid-cols-3 gap-3">
          {timelineRef.current.slice(index + 1, index + 10).map((t, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-slate-500">{t.type} • {t.duration}s</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}