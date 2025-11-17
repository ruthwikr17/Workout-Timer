// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadRoutines, deleteRoutine } from "../utils/localStorageUtils";
import { estimateDuration } from "../utils/timerUtils";

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
    <div className="space-y-12">
      <section className="text-center py-20">
        <h1 className="text-5xl font-extrabold text-brand">Build. Track. Conquer.</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto">
          Create custom workouts, track your sets, and stay consistent.
        </p>

        <div className="mt-8">
          <Link to="/create" className="btn-primary text-lg px-6 py-3">
            Create Routine
          </Link>
        </div>
      </section>

      <section className="container-centered space-y-4">
        <h2 className="text-2xl font-semibold">Saved Routines</h2>

        {routines.length === 0 && <div className="card text-center py-8">No routines yet.</div>}

        <div className="space-y-4">
          {routines.map((r) => (
            <div key={r.id} className="card p-6 flex items-center justify-between" style={{ cursor: "pointer" }}>
              <div onClick={() => navigate(`/routine/${r.id}`)} className="flex-1">
                <div className="text-xl font-semibold">{r.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {r.rounds.length} rounds • Est. {Math.ceil(estimateDuration(r) / 60)} min
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Last started: {fmtLocal(r.lastStarted)} • Last finished: {fmtLocal(r.lastFinished)}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button onClick={() => handleStart(r.id)} className="px-3 py-1 rounded-full bg-brand text-white">Start</button>
                <Link to={`/create?id=${r.id}`} className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700">Edit</Link>
                <button onClick={() => handleDelete(r.id)} className="text-sm text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}