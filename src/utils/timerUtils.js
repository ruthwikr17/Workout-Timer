// utility to compute total duration
export function estimateDuration(routine){
  // routine structure:
  // { rounds: [{name, sets, work, rest}], roundRest }
  let total = 0
  routine.rounds.forEach(r=>{
    total += r.sets * (r.work + r.rest)
  })
  // add round rests between rounds
  total += (routine.rounds.length - 1) * (routine.roundRest || 60)
  return total
}