'use client';
import { m, AnimatePresence } from 'framer-motion';

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="fixed left-1/2 -translate-x-1/2 bottom-[92px] z-[60] max-w-[calc(100%-40px)] bg-ink-700 border border-line rounded-control px-4 py-3 text-[14px] text-paper shadow-none"
        >
          {message}
        </m.div>
      )}
    </AnimatePresence>
  );
}
