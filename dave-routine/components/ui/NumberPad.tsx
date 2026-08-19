'use client';
import { Delete } from 'lucide-react';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'];

export function NumberPad({ value, onChange }: NumberPadProps) {
  const press = (key: string) => {
    if (key === 'del') { onChange(value.slice(0, -1)); return; }
    if (key === ',' && value.includes(',')) return;
    if (value.replace(',', '').length >= 6) return; // redelijke bovengrens
    onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map(key => (
        <button
          key={key}
          onClick={() => press(key)}
          className="tap h-16 rounded-field bg-ink-600 flex items-center justify-center text-[22px] font-medium text-paper"
          aria-label={key === 'del' ? 'Wis' : key}
        >
          {key === 'del' ? <Delete size={20} /> : key}
        </button>
      ))}
    </div>
  );
}
