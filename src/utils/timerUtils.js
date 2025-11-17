// src/utils/timerUtils.js

/**
 * Estimate total duration (seconds) for a routine object:
 * routine = {
 *  rounds: [
 *    { name, sets, work, rest, extraBreak }
 *  ],
 *  roundRest
 * }
 *
 * Behavior:
 * - For each round:
 *    for each set:
 *      add work
 *      add rest (after each set)
 *      if extraBreak > 0 and set < sets: add extraBreak
 * - After each round except last: add roundRest
 */

export function estimateDuration(routine) {
  if (!routine || !Array.isArray(routine.rounds)) return 0;
  let total = 0;

  for (let ri = 0; ri < routine.rounds.length; ri++) {
    const rd = routine.rounds[ri];
    const sets = Number(rd.sets || 0);

    for (let s = 1; s <= sets; s++) {
      total += Number(rd.work || 0);
      // add rest after set
      total += Number(rd.rest || 0);
      // optional extraBreak between sets (not after final set)
      if (s < sets && Number(rd.extraBreak || 0) > 0) {
        total += Number(rd.extraBreak || 0);
      }
    }

    // round rest between rounds (not after last)
    if (ri < routine.rounds.length - 1) {
      total += Number(routine.roundRest || 0);
    }
  }

  return total; // seconds
}

/** Helper: format seconds to 'X min' (you can change in UI) */
export function formatSecondsToMinutes(seconds) {
  if (!seconds || seconds <= 0) return "0 min";
  const mins = Math.ceil(seconds / 60);
  return `${mins} min`;
}