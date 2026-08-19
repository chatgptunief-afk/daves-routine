'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!content) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [content, onDone]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {content && (
        <m.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={onDone}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 px-10 text-center"
          style={{ background: 'radial-gradient(120% 90% at 50% 55%, rgba(232,147,74,0.22), #07070C 68%)' }}
        >
          <div className="grain" style={{ opacity: 0.04 }} />
          <m.p
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="numeral-hero text-paper text-[76px] relative"
          >
            {content.number}
          </m.p>
          <m.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[21px] text-paper-72 leading-snug max-w-[270px] relative"
          >
            {content.line}
          </m.p>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
