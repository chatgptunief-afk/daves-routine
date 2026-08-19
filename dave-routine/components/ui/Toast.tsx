'use client';
import { m, AnimatePresence } from 'framer-motion';

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <m.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="surface-lift fixed left-1/2 -translate-x-1/2 bottom-[92px] z-[60] max-w-[calc(100%-40px)] bg-ink-700 border border-line rounded-control px-4 py-3 text-[14px] text-paper"
        >
          {message}
        </m.div>
      )}
    </AnimatePresence>
  );
}
