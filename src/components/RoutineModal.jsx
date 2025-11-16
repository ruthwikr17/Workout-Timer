import React, { useEffect } from 'react'

export default function RoutineModal({ routine, onClose, onEdit, onStart, onDelete }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!routine) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold">{routine.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {routine.rounds?.length ?? 0} rounds • Rest between rounds: {routine.roundRest ?? 0}s
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStart(routine.id)}
              className="btn-primary"
            >
              Start
            </button>

            <button
              onClick={() => onEdit(routine.id)}
              className="btn-ghost"
            >
              Edit
            </button>

            <button
              onClick={() => {
                if (confirm('Delete this routine?')) {
                  onDelete(routine.id)
                  onClose()
                }
              }}
              className="text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        </div>

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {routine.rounds?.map((rd, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{rd.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {rd.sets} sets • {rd.work}s work • {rd.rest}s rest
                </div>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Round {i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  )
}