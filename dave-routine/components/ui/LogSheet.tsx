'use client';
import { useState } from 'react';
import { Goal } from '@/types';
import { Sheet } from './Sheet';
import { NumberPad } from './NumberPad';
import { Button } from './Button';

interface LogSheetProps {
  goal: Goal | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export function LogSheet({ goal, onClose, onSubmit }: LogSheetProps) {
  const [value, setValue] = useState('');

  if (!goal) return null;

  const amount = parseFloat(value.replace(',', '.')) || 0;

  const handleSubmit = () => {
    if (amount <= 0) return;
    onSubmit(amount);
    setValue('');
  };

  return (
    <Sheet open={!!goal} onClose={onClose} title={`Log voor ${goal.title}`}>
      <div className="space-y-6 pb-2">
        <div className="text-center">
          <p className="text-[13px] text-paper-56 mb-1">{goal.title}</p>
          <p className="font-display tnum text-[48px] leading-none text-paper">
            {value || '0'} <span className="text-[20px] text-paper-56">{goal.unit}</span>
          </p>
        </div>
        <NumberPad value={value} onChange={setValue} />
        <Button onClick={handleSubmit} disabled={amount <= 0}>Toevoegen</Button>
      </div>
    </Sheet>
  );
}
