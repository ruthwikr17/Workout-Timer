import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadRoutines, deleteRoutine } from "../utils/localStorageUtils";
import { estimateDuration } from "../utils/timerUtils";
import RoutineModal from "../components/RoutineModal";
import { motion } from "framer-motion";

export default function Home() {
  const [routines, setRoutines] = useState([]);
  const [viewRoutine, setViewRoutine] = useState(null);

  useEffect(() => {
    setRoutines(loadRoutines());
  }, []);

  function handleDelete(id) {
    if (!confirm("Delete this routine?")) return;
    deleteRoutine(id);
    setRoutines(loadRoutines());
  }

  return (
    <>
      {/* Hero */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-extrabold text-brand mb-4">
          Build. Track. Conquer.
        </h1>
        <p className="max-w-xl text-slate-600 dark:text-slate-300 mx-auto mb-8">
          Create custom workouts with dynamic sets, rounds, timers, and audio
          cues — all in a beautiful interface.
        </p>

        <Link to="/create" className="btn-primary text-lg px-8 py-3">
          Create a Routine
        </Link>
      </div>

      {/* Saved Routines */}
      <div className="container-centered mt-16">
        <h2 className="text-2xl font-semibold mb-4">Saved Routines</h2>

        {routines.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-slate-500">No routines yet.</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((r) => (
            <motion.div
              key={r.id}
              className="card cursor-pointer hover:scale-[1.02] transition"
              onClick={() => setViewRoutine(r)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-xl font-semibold">{r.name}</div>
                  <div className="text-sm text-slate-500">
                    {r.rounds.length} rounds • {r.rounds[0]?.sets} sets
                  </div>
                  <div className="text-sm text-slate-500">
                    Est: {Math.ceil(estimateDuration(r) / 60)} min
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Link
                    to={`/workout/${r.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 rounded-full bg-brand text-white"
                  >
                    Start
                  </Link>

                  <Link
                    to={`/create?id=${r.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700"
                  >
                    Edit
                  </Link>

                  <button
                    className="text-sm text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {viewRoutine && (
        <RoutineModal routine={viewRoutine} onClose={() => setViewRoutine(null)} />
      )}
    </>
  );
}