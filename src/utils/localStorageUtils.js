const KEY = "wt-routines-v1";

export function loadRoutines() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveRoutines(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRoutine(id) {
  const list = loadRoutines();
  return list.find((r) => r.id === id);
}

export function upsertRoutine(routine) {
  const list = loadRoutines();
  const idx = list.findIndex((r) => r.id === routine.id);
  if (idx >= 0) list[idx] = routine;
  else list.push(routine);
  saveRoutines(list);
}

/**
 * set lastStarted or lastFinished timestamp on a routine
 * type: 'start' | 'finish'
 * timeStr: optional ISO or formatted string; if not provided current Date is used
 */
export function touchRoutineTimestamp(id, type, timeStr) {
  const list = loadRoutines();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  const now = timeStr || new Date().toISOString();
  if (type === "start") list[idx].lastStarted = now;
  if (type === "finish") list[idx].lastFinished = now;
  saveRoutines(list);
  return true;
}

export function deleteRoutine(id) {
  const list = loadRoutines().filter((r) => r.id !== id);
  saveRoutines(list);
}