'use client';
import { ReactNode, useEffect } from 'react';
import { m, AnimatePresence, PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Sheet({ open, onClose, children, title }: SheetProps) {
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted) return null;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-ink-900/60 backdrop-blur-sm"
          />
          <m.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="surface-lift fixed bottom-0 left-0 right-0 z-[95] max-h-[88vh] mx-auto max-w-[430px] bg-ink-700 rounded-t-sheet overflow-hidden flex flex-col border-t border-line"
          >
            <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
              <div className="w-8 h-[3px] rounded-full bg-paper-44/50" />
            </div>
            <div className="overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2">
              {children}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
