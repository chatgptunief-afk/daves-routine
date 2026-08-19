'use client';
import { m } from 'framer-motion';
import { Wind } from 'lucide-react';
import { Button } from './Button';

interface HerstelProps {
  missedDays: number;
  onContinue: () => void;
}

// Herstel-scherm: verschijnt na 2+ gemiste dagen. Nooit een schuldgevoel, nooit een streak
// die "kapot" is — de Muur onthoudt gewoon wat er gebeurde. Dit scherm erkent het simpelweg
// en opent de dag opnieuw. Zie §17.
export function Herstel({ missedDays, onContinue }: HerstelProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-card bg-ink-700 border border-line p-6 mb-6 text-center space-y-4"
    >
      <div className="w-11 h-11 mx-auto rounded-full bg-dusk-soft flex items-center justify-center">
        <Wind size={20} strokeWidth={1.75} className="text-dusk-400" />
      </div>
      <div>
        <p className="font-display text-[21px] text-paper leading-tight mb-1.5">
          {missedDays} dagen zonder ritme.
        </p>
        <p className="text-[14px] text-paper-56 leading-relaxed max-w-[280px] mx-auto">
          Dat gebeurt. De Muur staat er nog — elke steen die je eerder legde blijft liggen.
          Vandaag is gewoon de volgende dag.
        </p>
      </div>
      <Button variant="secondary" onClick={onContinue} className="mx-auto">
        Verder
      </Button>
    </m.div>
  );
}
