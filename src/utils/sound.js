// src/utils/sound.js

let muted = false;

// Load all sounds using native HTMLAudioElement
const startAudio = new Audio("/sounds/start.wav");
const beepAudio = new Audio("/sounds/beep.wav");
const restAudio = new Audio("/sounds/rest.wav");
const finishAudio = new Audio("/sounds/finish.wav");

// Allow fast repeat beeps (clones)
function cloneAudio(audio) {
  const a = audio.cloneNode();
  a.volume = audio.volume;
  return a;
}

// Public API

export function playStart() {
  if (!muted) cloneAudio(startAudio).play().catch(()=>{});
}

export function playBeep() {
  if (!muted) cloneAudio(beepAudio).play().catch(()=>{});
}

export function playRest() {
  if (!muted) cloneAudio(restAudio).play().catch(()=>{});
}

export function playFinish() {
  if (!muted) cloneAudio(finishAudio).play().catch(()=>{});
}

export function setMuted(val) {
  muted = val;
}

export function isMuted() {
  return muted;
}