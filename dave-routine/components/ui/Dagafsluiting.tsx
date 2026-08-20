'use client';
import { useState } from 'react';
import { Task } from '@/types';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { getIcon } from '@/lib/icons';

interface DagafsluitingProps {
  open: boolean;
  onClose: () => void;
  tomorrowTasks: Task[];
  currentFirstStoneId: string | null;
  onComplete: (reflection: string, firstStoneId: string | null) => void;
}

// De avondritueel: terugblikken (optioneel) + de Eerste Steen van morgen kiezen.
// Nooit blokkerend, nooit verplicht — een gebruiker kan de sheet ook gewoon sluiten. Zie §14.
export function Dagafsluiting({ open, onClose, tomorrowTasks, currentFirstStoneId, onComplete }: DagafsluitingProps) {
  const [reflection, setReflection] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(currentFirstStoneId);

  // Elke keer dat de sheet opent, de keuze terugzetten op de huidige Eerste Steen — render-time
  // afgeleide state op de open-overgang i.p.v. een effect (react.dev "Resetting state...").
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSelectedId(currentFirstStoneId);
  }

  const handleSubmit = () => {
    onComplete(reflection.trim(), selectedId);
    setReflection('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Dag afsluiten">
      <div className="space-y-6 pb-2">
        <div>
          <p className="font-display text-[20px] text-paper mb-1">Hoe was vandaag?</p>
          <p className="text-[13px] text-paper-56 mb-3">Optioneel. Eén zin is genoeg.</p>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="Wat viel je op vandaag..."
            rows={3}
            className="w-full bg-ink-600 rounded-control border border-line px-4 py-3 text-paper text-[15px] placeholder:text-paper-44 focus:outline-none focus:border-ember-500/50 resize-none"
          />
        </div>

        <div>
          <p className="eyebrow mb-2">Eerste Steen van morgen</p>
          <div className="space-y-1">
            {tomorrowTasks.map(task => {
              const Icon = getIcon(task.icon);
              const isSelected = selectedId === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedId(isSelected ? null : task.id)}
                  className={`tap w-full flex items-center gap-3 py-2.5 px-3 -mx-1 rounded-field ${isSelected ? 'bg-ember-soft' : ''}`}
                >
                  <Icon size={17} strokeWidth={1.75} className={isSelected ? 'text-ember-400' : 'text-paper-56'} />
                  <span className={`flex-1 text-left text-[15px] ${isSelected ? 'text-paper font-medium' : 'text-paper-72'}`}>
                    {task.title}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-ember-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
            {tomorrowTasks.length === 0 && (
              <p className="text-[13px] text-paper-56 py-2">Geen taken gepland voor morgen.</p>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit}>Dag afsluiten</Button>
      </div>
    </Sheet>
  );
}
