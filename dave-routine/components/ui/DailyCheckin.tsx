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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 backdrop-blur-xl"
          onClick={onDone}
        >
          <div className="flex flex-col items-center gap-8 px-8 select-none">
            <div className="relative flex items-center justify-center">
              {[1, 2].map(i => (
                <m.div
                  key={i}
                  className="absolute rounded-full border border-accent/25"
                  animate={{ scale: [1, 1.4 + i * 0.25], opacity: [0.4, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                  style={{ width: 80, height: 80 }}
                />
              ))}
              <m.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center"
              >
                <span className="text-3xl">🌙</span>
              </m.div>
            </div>

            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="text-center"
            >
              <p className="text-accent-strong/80 text-sm font-medium mb-1">
                Goedemorgen, {userName}
              </p>
              <h2 className="text-text text-2xl font-bold mb-2">
                Adem 3× rustig in
              </h2>
              <p className="text-text-tertiary text-sm leading-relaxed max-w-[260px]">
                Begin de dag bewust, voordat je je taken ziet.
              </p>
            </m.div>

            <m.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => { e.stopPropagation(); onDone(); }}
              className="tap bg-accent text-accent-ink font-semibold px-8 py-3 rounded-control"
            >
              Begin de dag
            </m.button>

            <p className="text-text-tertiary text-xs">Tik overal om door te gaan</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
