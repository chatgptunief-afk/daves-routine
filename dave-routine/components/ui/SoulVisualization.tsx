'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface SoulVisualizationProps {
  routineStreak: number;
  prayerStreak: number;
  cleanSoulStreak: number;
}

export function SoulVisualization({ routineStreak, prayerStreak, cleanSoulStreak }: SoulVisualizationProps) {
  // ── HOUSE (Routine) ──────────────────────────────────────────────────
  const isHouse1   = routineStreak >= 5;   // Klein huis
  const isHouse2   = routineStreak >= 10;  // Groter huis
  const isHouse3   = routineStreak >= 15;  // Modern huis
  const isVilla    = routineStreak >= 20;  // Luxe villa
  const isMansion  = routineStreak >= 30;  // Mansion
  const isCastle   = routineStreak >= 40;  // Kasteel
  const isPalace   = routineStreak >= 50;  // Gouden Paleis ✨

  // ── SKY (Prayer) ─────────────────────────────────────────────────────
  const showLanterns  = prayerStreak >= 5;
  const showAura      = prayerStreak >= 10;
  const showPureLight = prayerStreak >= 20;
  const showStars     = prayerStreak >= 30;
  const showAurora    = prayerStreak >= 40;
  const showGodLight  = prayerStreak >= 50;

  // ── GARDEN (Clean Soul) ──────────────────────────────────────────────
  const showSprouts    = cleanSoulStreak >= 5;
  const showTrees      = cleanSoulStreak >= 10;
  const showWater      = cleanSoulStreak >= 15;
  const showFlowers    = cleanSoulStreak >= 20;
  const showTropical   = cleanSoulStreak >= 30;
  const showEternal    = cleanSoulStreak >= 40;
  const showHeavenly   = cleanSoulStreak >= 50;

  // House emoji to render
  const houseEmoji = isPalace ? '🏯' : isCastle ? '🏰' : isMansion ? '🏛️' : isVilla ? '🏢' : isHouse3 ? '🏡' : isHouse2 ? '🏘️' : isHouse1 ? '🏠' : '🛖';
  const glowColor = isPalace ? 'rgba(251,191,36,0.7)' : isCastle ? 'rgba(168,85,247,0.5)' : isMansion ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)';
  const houseSize = isPalace || isCastle ? 'text-9xl' : isMansion || isVilla ? 'text-8xl' : isHouse2 || isHouse3 ? 'text-8xl' : isHouse1 ? 'text-7xl' : 'text-6xl';

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8"
      style={{
        background: showGodLight
          ? 'linear-gradient(to bottom, #1a0a2e, #0a0520)'
          : showAurora
          ? 'linear-gradient(to bottom, #070d1f, #0a0a20)'
          : 'linear-gradient(to bottom, #0a0a16, #121226)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ─── BACKGROUND: Stars / Aurora / God Light ─── */}
      <AnimatePresence>
        {showStars && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Aurora for 40+ prayer days */}
      <AnimatePresence>
        {showAurora && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), transparent)' }}
          />
        )}
      </AnimatePresence>

      {/* God Light for 50 prayer days */}
      <AnimatePresence>
        {showGodLight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-96 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(251,191,36,0.4), transparent)', filter: 'blur(20px)' }}
          />
        )}
      </AnimatePresence>

      {/* Ambient light glow (prayer 20+) */}
      <AnimatePresence>
        {showPureLight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'rgba(251,191,36,0.1)', filter: 'blur(60px)' }}
          />
        )}
      </AnimatePresence>

      {/* ─── SURROUNDINGS (Clean Soul) ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 flex flex-col justify-end items-center px-4">

        {/* Water pool */}
        <AnimatePresence>
          {showWater && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: showHeavenly ? 1 : 0.7 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: showEternal ? '85%' : '65%',
                height: showHeavenly ? 16 : showEternal ? 12 : 10,
                background: showHeavenly
                  ? 'linear-gradient(to right, rgba(99,102,241,0.5), rgba(56,189,248,0.7), rgba(99,102,241,0.5))'
                  : 'linear-gradient(to right, rgba(56,189,248,0.2), rgba(96,165,250,0.4), rgba(56,189,248,0.2))',
                filter: 'blur(2px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Garden base */}
        <AnimatePresence>
          {showSprouts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-16 rounded-[100%] blur-sm relative z-0"
              style={{
                background: showHeavenly
                  ? 'linear-gradient(to top, rgba(16,185,129,0.7), transparent)'
                  : showEternal
                  ? 'linear-gradient(to top, rgba(16,185,129,0.6), transparent)'
                  : 'linear-gradient(to top, rgba(6,78,59,0.5), transparent)',
              }}
            >
              {/* Trees */}
              {showTrees && (
                <>
                  <div className="absolute left-4 -top-14 text-5xl opacity-80" style={{ filter: 'blur(0.5px)' }}>
                    {showTropical ? '🌴' : '🌲'}
                  </div>
                  <div className="absolute right-6 -top-12 text-4xl opacity-80" style={{ filter: 'blur(0.5px)' }}>
                    {showEternal ? '🌸' : showTropical ? '🌴' : '🌲'}
                  </div>
                </>
              )}
              {/* Additional flora for high streaks */}
              {showEternal && (
                <>
                  <div className="absolute left-16 -top-10 text-3xl opacity-70">🌺</div>
                  <div className="absolute right-16 -top-8 text-2xl opacity-70">🌸</div>
                </>
              )}
              {showHeavenly && (
                <>
                  <div className="absolute left-1/2 -top-12 -translate-x-1/2 text-4xl opacity-90">🌈</div>
                </>
              )}
              {/* Lounge chair */}
              {showFlowers && !showEternal && (
                <div className="absolute right-1/4 -top-4 text-2xl opacity-90">🪑</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── HOUSE (Routine) ─── */}
      <motion.div layout className="relative z-10 flex items-center justify-center -mt-8">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={houseEmoji}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`${houseSize} flex flex-col items-center`}
          >
            <span style={{ filter: `drop-shadow(0 0 ${isPalace ? 40 : isCastle ? 25 : 15}px ${glowColor})` }}>
              {houseEmoji}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Palace golden sparkles */}
        {isPalace && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-20px] z-[-1]"
          >
            {['✨', '⭐', '✨', '⭐'].map((s, i) => (
              <span
                key={i}
                className="absolute text-lg"
                style={{
                  top: i < 2 ? 0 : 'auto',
                  bottom: i >= 2 ? 0 : 'auto',
                  left: i % 2 === 0 ? 0 : 'auto',
                  right: i % 2 !== 0 ? 0 : 'auto',
                }}
              >{s}</span>
            ))}
          </motion.div>
        )}

        {/* Aura around house (prayer 10+) */}
        <AnimatePresence>
          {showAura && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full -z-10"
              style={{
                background: isPalace ? 'rgba(251,191,36,0.25)' : isCastle ? 'rgba(168,85,247,0.2)' : 'rgba(251,191,36,0.15)',
                filter: 'blur(20px)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── STREET LEVEL DETAILS (Prayer) ─── */}
      <AnimatePresence>
        {showLanterns && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute bottom-16 left-10 text-2xl z-20"
            style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }}
          >
            🏮
          </motion.div>
        )}
        {showAura && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-20 right-10 text-xl z-20"
            style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}
          >
            🕯️
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palace: floating crown */}
      {isPalace && (
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl z-20"
          style={{ filter: 'drop-shadow(0 0 15px rgba(251,191,36,0.8))' }}
        >
          👑
        </motion.div>
      )}

      {/* Inset frame */}
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
}
