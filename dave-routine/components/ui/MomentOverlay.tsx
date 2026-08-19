'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export interface MomentContent {
  number: string;
  line: string;
}

interface MomentOverlayProps {
  content: MomentContent | null;
  onDone: () => void;
}

export function MomentOverlay({ content, onDone }: MomentOverlayProps) {
  const mounted = useMounted();

  useEffect(() => {
    if (!content) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [content, onDone]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {content && (
        <m.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onDone}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 px-10 text-center"
          style={{ background: 'radial-gradient(120% 90% at 50% 60%, rgba(232,147,74,0.22), #07070C 70%)' }}
        >
          <p className="font-display tnum text-[72px] leading-none text-paper font-normal">{content.number}</p>
          <p className="font-display text-[24px] text-paper-72 leading-snug max-w-[280px]">{content.line}</p>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
