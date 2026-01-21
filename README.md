# Workout Timer

A modern browser-based workout timer built with **React + Vite + Tailwind CSS**.  
Create custom workout routines, configure sets and breaks, and run guided workout sessions with visual progress and sound cues.

---

## Features

- Create custom workout routines
- Add multiple rounds with:
  - Round name
  - Number of sets
  - Work duration (seconds)
  - Rest duration (seconds)
- Rest time between rounds
- Auto-start next set/round toggle
- Workout execution with:
  - Countdown timer
  - Circular progress indicator
  - Progress bar with percentage
  - Start / Pause / Reset controls
- Sound alerts:
  - Start cue
  - Near-end beep
  - Rest cue
  - Finish cue
- Light / Dark mode
- Responsive layout
- Persistent storage using browser LocalStorage
- No backend required

---

## Data Storage Behavior

Routines are stored in **LocalStorage** inside your browser.

- Data persists after closing the tab or browser
- Each device/browser has its own data
- Other users do not see your routines
- Clearing browser storage removes saved routines

---

## Tech Stack

- React (Vite)
- React Router
- Tailwind CSS
- Howler.js (Audio engine)
- UUID (Unique routine IDs)
- LocalStorage (Persistence)

---

## Installation

Clone repository:

```bash
git clone <your-repo-url>
cd workout-timer
