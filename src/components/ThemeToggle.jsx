import React from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ dark, setDark }){
  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label="Toggle color theme"
      title={dark ? 'Switch to light' : 'Switch to dark'}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent transition"
    >
      {dark ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
    </button>
  )
}