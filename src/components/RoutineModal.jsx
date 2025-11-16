import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { deleteRoutine } from "../utils/localStorageUtils";

export default function RoutineModal({ routine, onClose }) {
  const navigate = useNavigate();
  if (!routine) return null;

  function handleDelete() {
    if (!confirm("Delete this routine?")) return;
    deleteRoutine(routine.id);
    onClose && onClose();
  }

  function handleStart() {
    onClose && onClose();
    navigate(`/workout/${routine.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose && onClose()}
      />
      <div className="relative max-w-2xl w-full card">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{routine.name}</h3>
          <button onClick={() => onClose && onClose()} className="text-slate-500">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {routine.rounds.map((rd, i) => (
            <div key={i} className="p-3 rounded border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <div className="font-medium">{rd.name || `Round ${i + 1}`}</div>
                <div className="text-sm text-slate-500">
                  Sets: {rd.sets} • Work: {rd.work}s • Rest: {rd.rest}s
                </div>
              </div>
              {rd.extraBreak ? (
                <div className="text-xs text-slate-400 mt-1">
                  Extra break between sets: {rd.extraBreak}s
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={handleStart} className="btn-primary">
            Start
          </button>
          <Link to={`/create?id=${routine.id}`} onClick={() => onClose && onClose()} className="btn-ghost">
            Edit
          </Link>
          <button onClick={handleDelete} className="text-red-500">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}