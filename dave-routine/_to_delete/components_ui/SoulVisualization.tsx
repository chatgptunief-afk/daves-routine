'use client';
import { m, AnimatePresence } from 'framer-motion';

interface SoulVisualizationProps {
  routineStreak: number;
  prayerStreak: number;
  cleanSoulStreak: number;
}

export function SoulVisualization({ routineStreak, prayerStreak, cleanSoulStreak }: SoulVisualizationProps) {
  const isHouse1 = routineStreak >= 5;
  const isHouse2 = routineStreak >= 10;
  const isHouse3 = routineStreak >= 15;
  const isVilla = routineStreak >= 20;
  const isMansion = routineStreak >= 30;
  const isCastle = routineStreak >= 40;
  const isPalace = routineStreak >= 50;

  const showLanterns = prayerStreak >= 5;
  const showAura = prayerStreak >= 10;
  const showStars = prayerStreak >= 30;
  const showGodLight = prayerStreak >= 50;

  const showSprouts = cleanSoulStreak >= 5;
  const showTrees = cleanSoulStreak >= 10;
  const showFlowers = cleanSoulStreak >= 20;
  const showTropical = cleanSoulStreak >= 30;

  const houseEmoji = isPalace ? '🏯' : isCastle ? '🏰' : isMansion ? '🏛️' : isVilla ? '🏢' : isHouse3 ? '🏡' : isHouse2 ? '🏘️' : isHouse1 ? '🏠' : '🛖';
  const glowColor = isPalace ? 'rgba(226,145,74,0.55)' : isCastle ? 'rgba(226,145,74,0.4)' : isMansion ? 'rgba(242,237,228,0.3)' : 'rgba(242,237,228,0.15)';
  const houseSize = isPalace || isCastle || isMansion || isVilla || isHouse2 || isHouse3 ? 'text-7xl' : isHouse1 ? 'text-6xl' : 'text-5xl';

  return (
    <div
      className="relative w-full aspect-[4/3] max-w-sm mx-auto rounded-card overflow-hidden flex items-center justify-center p-8 border border-border"
      style={{
        background: showGodLight
          ? 'linear-gradient(to bottom, #1e1608, #12100c)'
          : 'linear-gradient(to bottom, #171410, #12100c)',
      }}
    >
      <AnimatePresence>
        {showStars && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGodLight && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-64 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(226,145,74,0.35), transparent)', filter: 'blur(24px)' }}
          />
        )}
      </AnimatePresence>

      {/* Garden base */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 flex flex-col justify-end items-center px-4">
        <AnimatePresence>
          {showSprouts && (
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-14 rounded-[100%] blur-sm relative z-0"
              style={{ background: 'linear-gradient(to top, rgba(127,158,115,0.4), transparent)' }}
            >
              {showTrees && (
                <>
                  <div className="absolute left-5 -top-11 text-3xl opacity-80">{showTropical ? '🌴' : '🌲'}</div>
                  <div className="absolute right-7 -top-9 text-2xl opacity-80">{showTropical ? '🌴' : '🌲'}</div>
                </>
              )}
              {showFlowers && (
                <div className="absolute left-1/2 -top-7 -translate-x-1/2 text-xl opacity-80">🌺</div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* House */}
      <m.div layout className="relative z-10 flex items-center justify-center -mt-6">
        <AnimatePresence mode="popLayout">
          <m.div
            key={houseEmoji}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className={houseSize}
          >
            <span style={{ filter: `drop-shadow(0 0 ${isPalace ? 28 : isCastle ? 18 : 10}px ${glowColor})` }}>
              {houseEmoji}
            </span>
          </m.div>
        </AnimatePresence>

        <AnimatePresence>
          {showAura && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full -z-10"
              style={{ background: 'rgba(226,145,74,0.14)', filter: 'blur(20px)' }}
            />
          )}
        </AnimatePresence>
      </m.div>

      {showLanterns && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-14 left-9 text-xl z-20"
        >
          🏮
        </m.div>
      )}

      {isPalace && (
        <m.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-1/2 -translate-x-1/2 text-3xl z-20"
        >
          👑
        </m.div>
      )}
    </div>
  );
}
