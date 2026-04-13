'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface SoulVisualizationProps {
  routineStreak: number;
  prayerStreak: number;
  cleanSoulStreak: number;
}

export function SoulVisualization({ routineStreak, prayerStreak, cleanSoulStreak }: SoulVisualizationProps) {
  // Determine Visual Features based on thresholds
  // Routine sets the House Base
  const isUpgradedHouse1 = routineStreak >= 5;
  const isUpgradedHouse2 = routineStreak >= 10;
  const isUpgradedHouse3 = routineStreak >= 20;
  const isMansion = routineStreak >= 30;

  // Prayer sets the Sky / Vibes
  const showLanterns = prayerStreak >= 5;
  const showAura = prayerStreak >= 10;
  const showPureLight = prayerStreak >= 20;
  const showStars = prayerStreak >= 30;

  // CleanSoul sets the Garden / Surrounding
  const showGarden = cleanSoulStreak >= 5;
  const showTrees = cleanSoulStreak >= 10;
  const showWater = cleanSoulStreak >= 15;
  const showLoungeArea = cleanSoulStreak >= 20;
  const showZenGarden = cleanSoulStreak >= 30; // Max domain

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-[2.5rem] bg-gradient-to-b from-[#0a0a16] to-[#121226] border border-white/5 overflow-hidden flex items-center justify-center p-8">
      {/* --- BACKGROUND VIBES (Prayer) --- */}
      <AnimatePresence>
        {showStars && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPureLight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-[60px]"
          />
        )}
      </AnimatePresence>

      {/* --- SURROUNDINGS (Clean Soul) --- */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 flex flex-col justify-end items-center px-4">
        <AnimatePresence>
          {showWater && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-sky-500/20 via-blue-400/40 to-sky-500/20 rounded-full blur-[2px] border-b border-white/10"
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showGarden && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full ${showZenGarden ? 'bg-gradient-to-t from-emerald-900/60' : 'bg-gradient-to-t from-emerald-900/40'} h-16 rounded-[100%] blur-sm relative z-0`}
            >
              {showTrees && (
                <>
                  <div className="absolute left-6 -top-12 text-5xl opacity-80 blur-[1px]">🌴</div>
                  <div className="absolute right-8 -top-10 text-4xl opacity-80 blur-[1px]">🌲</div>
                </>
              )}
              {showLoungeArea && (
                <div className="absolute right-1/4 -top-4 text-3xl opacity-90">🪑</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- HOUSE (Routine) --- */}
      <motion.div 
        layout
        className="relative z-10 flex items-center justify-center -mt-8"
      >
        <AnimatePresence mode="popLayout">
          {isMansion ? (
            <motion.div key="mansion" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl flex flex-col items-center">
              <span className="drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">🏛️</span>
            </motion.div>
          ) : isUpgradedHouse3 ? (
            <motion.div key="villa" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl flex flex-col items-center">
              <span className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">🏡</span>
            </motion.div>
          ) : isUpgradedHouse2 ? (
            <motion.div key="modern" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl flex flex-col items-center">
              <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🏘️</span>
            </motion.div>
          ) : isUpgradedHouse1 ? (
            <motion.div key="house2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl flex flex-col items-center">
              <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">🏠</span>
            </motion.div>
          ) : (
            <motion.div key="house1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl flex flex-col items-center">
              <span className="opacity-70">🛖</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aura around house */}
        <AnimatePresence>
          {showAura && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-amber-400/20 blur-2xl -z-10 rounded-full"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* FOREGROUND DETAILS (Prayers & CleanSoul details) */}
      <AnimatePresence>
        {showLanterns && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute bottom-16 left-12 text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] z-20"
          >
            🏮
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frame overlay */}
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
}
