'use client';
import { DayRecord } from '@/types';
import { dateLabel } from '@/lib/date';

interface StoneProps {
  record: DayRecord;
  onTap?: (record: DayRecord) => void;
}

// Eén steen = één dag, voor altijd op de Muur. Nooit rood voor falen: een gemiste dag is
// een holle steen, geen waarschuwing. Licht (gebed) en groei (zuiverheid) zijn aparte lagen
// bovenop de steen — drie onafhankelijke signalen op één vorm. Zie §18/§13.5.
export function Stone({ record, onTap }: StoneProps) {
  const state = record.ankersMade ? 'gemaakt' : record.recoveryUsed ? 'hersteld' : 'leeg';

  const fill =
    state === 'gemaakt'
      ? 'var(--color-ember-500)'
      : state === 'hersteld'
      ? 'rgba(232,147,74,0.18)'
      : 'transparent';

  const border =
    state === 'leeg' ? '1px solid rgba(245,241,232,0.14)' : '1px solid transparent';

  return (
    <button
      onClick={() => onTap?.(record)}
      aria-label={`${dateLabel(record.date)}: ${state === 'gemaakt' ? 'ankers gemaakt' : state === 'hersteld' ? 'hersteld' : 'gemist'}`}
      className="tap relative aspect-square w-full rounded-[6px] flex items-end justify-center overflow-hidden"
      style={{ background: fill, border }}
    >
      {record.prayersMade > 0 && (
        <span
          className="absolute top-[3px] right-[3px] rounded-full"
          style={{
            width: 4, height: 4,
            background: record.prayersMade >= 5 ? '#A6A7E4' : 'rgba(166,167,228,0.4)',
          }}
        />
      )}
      {record.purityHeld === true && (
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 2, background: 'var(--color-grove-400)' }}
        />
      )}
    </button>
  );
}
