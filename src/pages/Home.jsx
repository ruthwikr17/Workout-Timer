import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loadRoutines,
  deleteRoutine,
  getRoutine,
} from "../utils/localStorageUtils";
import { estimateDuration } from "../utils/timerUtils";
import RoutineModal from "../components/RoutineModal";

function fmtLocal(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return iso;
  }
}

export default function Home() {
  const [routines, setRoutines] = useState([]);
  const [view, setView] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRoutines(loadRoutines());
  }, []);

  function refresh() {
    setRoutines(loadRoutines());
  }

  function handleDelete(id) {
    if (!confirm("Delete this routine?")) return;
    deleteRoutine(id);
    refresh();
  }

  function handleStart(id) {
    navigate(`/workout/${id}`);
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-brand">Your Routines</h1>
        <p className="text-slate-500 mt-2">
          Click a routine to view details, or Start / Edit from the card.
        </p>
      </div>

      <div className="container-centered space-y-4">
        {routines.length === 0 && (
          <div className="card text-center py-8">No routines yet.</div>
        )}

        {routines.map((r) => (
          <div
            key={r.id}
            className="card flex flex-col md:flex-row items-center justify-between gap-4"
            // clicking card opens modal
            onClick={() => setView(r)}
            style={{ cursor: "pointer" }}
          >
            <div className="flex-1">
              <div className="text-xl font-semibold">{r.name}</div>
              <div className="text-sm text-slate-500 mt-1">
                {r.rounds.length} rounds • Est.{" "}
                {Math.ceil(estimateDuration(r) / 60)} min
              </div>

              <div className="text-xs text-slate-500 mt-3">
                Last started: {fmtLocal(r.lastStarted)} <br />
                Last finished: {fmtLocal(r.lastFinished)}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart(r.id);
                }}
                className="px-3 py-1 rounded-full bg-brand text-white"
              >
                Start
              </button>

              <Link
                to={`/create?id=${r.id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700"
              >
                Edit
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(r.id);
                }}
                className="text-sm text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {view && (
        <RoutineModal
          routine={view}
          onClose={() => {
            setView(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}