import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemIntroProps {
  onComplete: () => void;
  playerName: string;
}

export function SystemIntro({ onComplete, playerName }: SystemIntroProps) {
  const [phase, setPhase] = useState(0);
  
  // Detect launch type and motion preference
  const isFirstLaunch = useMemo(() => {
    const hasLaunched = sessionStorage.getItem('system_launched');
    if (!hasLaunched) {
      sessionStorage.setItem('system_launched', 'true');
      return true;
    }
    return false;
  }, []);

  const prefersReducedMotion = useMemo(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches, 
  []);

  useEffect(() => {
    // Cinematic Timings (Total ~12s for first launch, ~4s for repeat)
    const timings = isFirstLaunch 
      ? [600, 1500, 3000, 5000, 6500, 7500] 
      : [100, 400, 800, 1400, 2000, 2500];

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), timings[0]),  // Energy Stir / Fragments
      setTimeout(() => setPhase(2), timings[1]),  // Character Revelation
      setTimeout(() => setPhase(3), timings[2]),  // System Awakening / Glyph
      setTimeout(() => setPhase(4), timings[3]),  // Title Reveal
      setTimeout(() => setPhase(5), timings[4]),  // Final Pulse
      setTimeout(() => onComplete(), timings[5])  // Transition to App
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete, isFirstLaunch, prefersReducedMotion]);

  return (
    <motion.div 
      exit={{ 
        opacity: [1, 0.8, 1, 0.5, 0],
        x: [0, -15, 15, -10, 0],
        filter: [
          "hue-rotate(0deg) brightness(1)", 
          "hue-rotate(90deg) brightness(1.5)", 
          "hue-rotate(-90deg) brightness(1.2)", 
          "hue-rotate(0deg) brightness(2)", 
          "brightness(0)"
        ],
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* 1. VOID & AMBIENT LAYERS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--system-accent-dim),0.05)_0%,transparent_70%)]" />
      
      {/* Shadow Smoke Layer */}
      <motion.div
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-20%] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.8)_0%,transparent_60%)] opacity-40 blur-3xl"
      />

      {/* Volumetric Haze */}
      <motion.div
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 mix-blend-overlay"
      />

      {/* 2. ENERGY STIR - MASKED FRAGMENTS */}
      <AnimatePresence>
        {phase >= 1 && phase < 5 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0.5, 1.5],
                  x: (Math.random() - 0.5) * window.innerWidth,
                  y: (Math.random() - 0.5) * window.innerHeight,
                }}
                transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                className="absolute w-32 h-1 bg-cyan-500/20 blur-md"
                style={{ transform: `rotate(${Math.random() * 360}deg)` }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 3. SYSTEM AWAKENING - RUNE FORMATION (CENTERPIECE) */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {/* Circle Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ 
              opacity: phase >= 2 ? 1 : 0,
              rotate: phase >= 2 ? 0 : -45,
              scale: phase >= 2 ? (phase >= 5 ? 1.5 : 1) : 0.8,
            }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              scale: { duration: 6, ease: "linear" } // Slightly faster cinematic zoom
            }}
            className="w-full h-full pointer-events-none"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(var(--system-accent),0.4)]">
              {/* Complex Arcane Glyph */}
              <motion.circle
                cx="50" cy="50" r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-cyan-500/40"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M50 5 L95 50 L50 95 L50 50 Z" // Adjusted path to be more "centered"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.1"
                className="text-cyan-400/20"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              />
              {/* Rotating Rune Ring */}
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="1 8"
                className="text-cyan-300/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </motion.div>

          {/* Shadow Pulse Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: phase === 2 ? [0, 0.5, 0] : 0,
              scale: phase === 2 ? [0.8, 1.5] : 0.8,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
          />
        </div>

        {/* 4. TITLE MOMENT - Absolute centered overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <div className="text-center">
            <div className="overflow-hidden h-16 md:h-24 mb-2">
              <motion.h1
                initial={{ y: 100, opacity: 0, letterSpacing: "1.5em", paddingLeft: "1.5em" }}
                animate={phase >= 4 ? { 
                  y: 0,
                  opacity: 1,
                  letterSpacing: "0.8em",
                  paddingLeft: "0.8em",
                  x: [0, -20, 20, -10, 0],
                  filter: [
                    "hue-rotate(0deg) brightness(1)", 
                    "hue-rotate(90deg) brightness(2)", 
                    "hue-rotate(-90deg) brightness(1.5)", 
                    "hue-rotate(0deg) brightness(1)"
                  ],
                } : {
                  y: 100,
                  opacity: 0,
                  letterSpacing: "1.5em",
                  paddingLeft: "1.5em"
                }}
                transition={{ 
                  duration: 2, 
                  ease: [0.16, 1, 0.3, 1],
                  x: { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] },
                  filter: { duration: 0.6, times: [0, 0.2, 0.4, 1] }
                }}
                className="text-5xl md:text-8xl font-black text-white uppercase text-sharp hologram-glow-cyan magical-shimmer"
              >
                ARISE
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 md:w-12 h-[1px] bg-cyan-500/30" />
                <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[8px] md:text-xs font-mono text-cyan-400 tracking-[0.5em] uppercase pl-[0.5em]"
                >
                  {phase >= 4 ? "AWAKENING PROTOCOL COMPLETE" : "SYNCHRONIZING..."}
                </motion.span>
                <div className="w-8 md:w-12 h-[1px] bg-cyan-500/30" />
              </div>
              
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 4 ? 0.4 : 0 }}
                className="text-[7px] md:text-[10px] font-mono text-white uppercase tracking-widest pl-[0.1em]"
              >
                PLAYER: {playerName} // TRACE STABLE
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 6. FINAL TRANSITION PULSE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: phase === 5 ? [0, 1, 0] : 0,
          scale: phase === 5 ? [0.8, 4] : 0.8,
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay z-50"
      />
      
      {/* Cinematic Black Bars */}
      <motion.div 
        initial={{ height: "20%" }}
        animate={{ height: phase >= 5 ? "0%" : "15%" }}
        className="absolute top-0 left-0 w-full bg-black z-[60]"
      />
      <motion.div 
        initial={{ height: "20%" }}
        animate={{ height: phase >= 5 ? "0%" : "15%" }}
        className="absolute bottom-0 left-0 w-full bg-black z-[60]"
      />
    </motion.div>
  );
}
