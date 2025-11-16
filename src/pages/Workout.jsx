import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoutine, upsertRoutine, touchRoutineTimestamp } from "../utils/localStorageUtils";
import TimerDisplay from "../components/TimerDisplay";
import { playStart, playBeep, playRest, playFinish } from "../utils/sound";

function secsToMMSS(s) {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export default function Workout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);

  const timelineRef = useRef([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  // load routine
  useEffect(() => {
    const r = getRoutine(id);
    if (!r) return navigate("/");
    setRoutine(r);
  }, [id]);

  // build timeline
  useEffect(() => {
    if (!routine) return;

    const timeline = [];
    routine.rounds.forEach((rd, ri) => {
      for (let s = 1; s <= rd.sets; s++) {
        timeline.push({ type: "work", roundIndex: ri, set: s, label: rd.name, duration: rd.work });
        timeline.push({ type: "rest", roundIndex: ri, set: s, label: "Rest", duration: rd.rest });
        if (rd.extraBreak && rd.extraBreak > 0 && s < rd.sets) {
          // optional extra break between sets (if set)
          timeline.push({ type: "extraBreak", roundIndex: ri, set: s, label: "Extra Break", duration: rd.extraBreak });
        }
      }
      if (ri < routine.rounds.length - 1) {
        timeline.push({ type: "roundRest", roundIndex: ri, set: null, label: "Round Rest", duration: routine.roundRest || 0 });
      }
    });

    timelineRef.current = timeline;
    setIndex(0);
    setRemaining(timeline[0]?.duration || 0);

    // auto-start if enabled
    if (routine.autoStart !== false) {
      setRunning(true);
      // record start timestamp
      touchRoutineTimestamp(routine.id, "start", new Date().toISOString());
      // update local routine state too
      const copy = { ...routine, lastStarted: new Date().toISOString() };
      upsertRoutine(copy);
    }
    playStart();
  }, [routine]);

  // ticking + sounds
  useEffect(() => {
    if (!running) return;

    const timeline = timelineRef.current;
    const current = timeline[index];

    if (remaining <= 0) {
      const next = index + 1;
      if (next < timeline.length) {
        const nextItem = timeline[next];
        // play transitions
        if (nextItem.type === "work") playStart();
        else playRest();
        setIndex(next);
        setRemaining(nextItem.duration);
      } else {
        // done
        playFinish();
        setRunning(false);
        // save finish timestamp
        touchRoutineTimestamp(routine.id, "finish", new Date().toISOString());
        const copy = { ...routine, lastFinished: new Date().toISOString() };
        upsertRoutine(copy);
      }
      return;
    }

    // countdown beep for last 5s (work only)
    if (current?.type === "work" && remaining <= 5 && remaining > 0) {
      playBeep();
    }

    const t = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [running, remaining, index]);

  // dynamic insert break now
  function insertBreakNow(seconds = 30) {
    const timeline = timelineRef.current;
    const nextIndex = index + 1;
    const breakItem = { type: "dynamicBreak", roundIndex: timeline[index]?.roundIndex ?? null, set: timeline[index]?.set ?? null, label: "Added Break", duration: seconds };
    timeline.splice(nextIndex, 0, breakItem);
    timelineRef.current = [...timeline];
    // jump to that break immediately
    setIndex(nextIndex);
    setRemaining(seconds);
    setRunning(true);
    playRest();
  }

  if (!routine) return null;

  const current = timelineRef.current[index];
  const totalSegments = Math.max(1, timelineRef.current.length);
  const pct = Math.round(((index) / (totalSegments - 1 || 1)) * 100);

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
            <button onClick={() => setRunning((r) => !r)} className="btn-primary">
              {running ? "Pause" : "Start"}
            </button>

            <button onClick={() => { setRunning(false); setIndex(0); setRemaining(timelineRef.current[0]?.duration || 0); playStart(); }} className="btn-ghost">
              Reset
            </button>

            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-slate-500 mr-2">Add break now (sec)</label>
              <input id="breakNow" defaultValue={30} type="number" className="input-base w-20" />
              <button onClick={() => { const v = Number(document.getElementById("breakNow").value || 30); insertBreakNow(v); }} className="btn-ghost">
                Insert Break (Now)
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
        </div>
      </div>

      {/* upcoming */}
      <div className="card">
        <div className="text-sm text-slate-500 mb-3">Upcoming</div>
        <div className="grid grid-cols-3 gap-3">
          {timelineRef.current.slice(index, index + 9).map((t, i) => (
            <div key={i} className={`p-3 rounded-lg border ${i === 0 ? "border-brand" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-slate-500">{t.type} • {t.duration}s</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}