const KEY = 'wt-routines-v1'

export function loadRoutines(){
  try{
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){ return [] }
}

export function saveRoutines(list){
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getRoutine(id){
  const list = loadRoutines()
  return list.find(r=>r.id===id)
}

export function upsertRoutine(routine){
  const list = loadRoutines()
  const idx = list.findIndex(r=>r.id===routine.id)
  if(idx>=0) list[idx]=routine
  else list.push(routine)
  saveRoutines(list)
}

export function deleteRoutine(id){
  const list = loadRoutines().filter(r=>r.id!==id)
  saveRoutines(list)
}