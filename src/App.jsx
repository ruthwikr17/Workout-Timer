import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CreateRoutine from './pages/CreateRoutine'
import Workout from './pages/Workout'
import RoutineView from './pages/RoutineView'
import ThemeToggle from './components/ThemeToggle'
import { motion } from 'framer-motion'
import SoundToggle from "./components/SoundToggle";

export default function App(){
  const [dark, setDark] = useState(() => localStorage.getItem('wt-dark') === '1')

  useEffect(()=>{
    const root = document.documentElement
    if(dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('wt-dark', dark? '1':'0')
  }, [dark])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-500">
      <nav className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container-centered flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center text-white font-bold">WT</div>
            <div className="text-lg font-semibold">Workout Timer</div>
          </Link>

          <div className="flex items-center gap-3">
            <SoundToggle />
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        </div>
      </nav>

      <motion.main className="container-centered py-10" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/create" element={<CreateRoutine/>} />
          <Route path="/workout/:id" element={<Workout/>} />
          <Route path="/routine/:id" element={<RoutineView/>} />
        </Routes>
      </motion.main>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
        © {new Date().getFullYear()} Workout Timer • Built to move.
      </footer>
    </div>
  )
}