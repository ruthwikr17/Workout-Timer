// src/components/SoundToggle.jsx
import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted } from "../utils/sound";

export default function SoundToggle() {
  const [mute, setMute] = React.useState(isMuted());

  function toggle() {
    const next = !mute;
    setMute(next);
    setMuted(next);
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
      aria-label="Toggle sound"
    >
      {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}