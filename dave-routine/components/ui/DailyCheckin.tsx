'use client';
import { m, AnimatePresence } from 'framer-motion';

interface DailyCheckinProps {
  show: boolean;
  userName: string;
  onDone: () => void;
}

export function DailyCheckin({ show, userName, onDone }: DailyCheckinProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08081a]/90 backdrop-blur-xl"
          onClick={onDone}
        >
          <div className="flex flex-col items-center gap-8 px-8 select-none">
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center">
              {[1, 2, 3].map(i => (
                <m.div
                  key={i}
                  className="absolute rounded-full border border-violet-500/30"
                  animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                  style={{ width: 80, height: 80 }}
                />
              ))}
              {/* Core circle */}
              <m.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)]"
              >
                <span className="text-3xl">🌙</span>
              </m.div>
            </div>

            {/* Text */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-violet-300/60 text-sm font-medium mb-1">
                Goedemorgen, {userName}
              </p>
              <h2 className="text-white text-2xl font-bold mb-2">
                Adem 3× rustig in
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
                Begin de dag bewust. Haal diep adem voordat je je taken ziet.
              </p>
            </m.div>

            {/* Continue button */}
            <m.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); onDone(); }}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-2xl transition-colors shadow-lg shadow-violet-900/40"
            >
              Ik ben klaar — Begin de dag 🌅
            </m.button>

            <p className="text-white/20 text-xs">Tik overal om door te gaan</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
