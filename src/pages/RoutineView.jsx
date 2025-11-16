import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoutine } from '../utils/localStorageUtils'

export default function RoutineView(){
  const { id } = useParams()
  const navigate = useNavigate()
  const r = getRoutine(id)

  if(!r) return <div className="card max-w-3xl mx-auto">Routine not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{r.name}</h2>
            <div className="text-sm text-slate-500 mt-1">{r.rounds?.length ?? 0} rounds • Round rest: {r.roundRest ?? 0}s</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate(`/workout/${r.id}`)} className="btn-primary">Start Workout</button>
            <button onClick={()=>navigate(`/create?id=${r.id}`)} className="btn-ghost">Edit</button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {r.rounds.map((rd, i) => (
            <div key={i} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">{rd.name}</div>
                <div className="text-sm text-slate-500">{rd.sets} sets • {rd.work}s work • {rd.rest}s rest</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}