'use client';
import { useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';

interface DagPlanProps {
  open: boolean;
  onClose: () => void;
  value: string | null;
  onSave: (text: string) => void;
}

// Het ochtendritueel bij "Dag plannen" — het tegenhanger van Dagafsluiting, maar dan aan het
// begin van de dag: schrijf kort op wat je vandaag wilt doen, en kom er de rest van de dag op
// terug om te zien wat je had gepland. Nooit blokkerend, nooit verplicht — precies zoals de
// avondreflectie, alleen dan meteen zichtbaar i.p.v. pas na de rollover. Zie DAVES-ROUTINE-
// REDESIGN.md §14 voor het patroon waarop dit voortbouwt.
export function DagPlan({ open, onClose, value, onSave }: DagPlanProps) {
  const [text, setText] = useState(value ?? '');

  // Bij elke keer openen opnieuw synchroniseren met wat er al staat — zo werkt "terugkomen en
  // kijken wat ik had gepland" ook echt: de sheet toont steeds de laatst opgeslagen tekst, niet
  // een leeg veld. Render-time afgeleide state op de open-overgang i.p.v. een effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setText(value ?? '');
  }

  const handleSubmit = () => {
    onSave(text);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Dag plannen">
      <div className="space-y-4 pb-2">
        <div>
          <p className="font-display text-[20px] text-paper mb-1">Wat wil je vandaag doen?</p>
          <p className="text-[13px] text-paper-56 mb-3">
            Optioneel. Een paar woorden zijn genoeg — je kunt dit de hele dag terugvinden.
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Bijv. Rapport afronden, sporten om 18:00, boodschappen..."
            rows={4}
            autoFocus
            className="w-full bg-ink-600 rounded-control border border-line px-4 py-3 text-paper text-[16px] placeholder:text-paper-44 focus:outline-none focus:border-ember-500/50 resize-none"
          />
        </div>

        <Button onClick={handleSubmit}>Plan opslaan</Button>
      </div>
    </Sheet>
  );
}
