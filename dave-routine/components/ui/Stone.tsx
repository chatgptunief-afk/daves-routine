'use client';
import { DayRecord } from '@/types';
import { dateLabel } from '@/lib/date';

interface StoneProps {
  record: DayRecord;
  onTap?: (record: DayRecord) => void;
}

// Deterministische "verwering" — elke steen ligt er net iets anders bij, zoals echt
// gestapeld gesteente. Puur op de datumstring gebaseerd, dus stabiel bij elke render.
function weathering(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) % 97;
  return 0.86 + (h / 97) * 0.14; // 0.86–1.0
}

// Eén steen = één dag, voor altijd op de Muur. Nooit rood voor falen: een gemiste dag is
// een holle steen, geen waarschuwing. Licht (gebed) en groei (zuiverheid) zijn aparte lagen
// bovenop de steen — drie onafhankelijke signalen op één vorm. Gemetseld in coursen met een
// halve-steen-verspringing (zie de Muur-pagina), niet in een strak raster. Zie §18/§13.5.
export function Stone({ record, onTap }: StoneProps) {
  const state = record.ankersMade ? 'gemaakt' : record.recoveryUsed ? 'hersteld' : 'leeg';
  const w = weathering(record.date);

  const fill =
    state === 'gemaakt'
      ? `rgba(232,147,74,${0.9 * w})`
      : state === 'hersteld'
      ? `rgba(232,147,74,${0.16 * w})`
      : 'transparent';

  const border = state === 'leeg' ? '1px solid rgba(245,241,232,0.12)' : '1px solid transparent';

  return (
    <button
      onClick={() => onTap?.(record)}
      aria-label={`${dateLabel(record.date)}: ${state === 'gemaakt' ? 'ankers gemaakt' : state === 'hersteld' ? 'hersteld' : 'gemist'}`}
      className="tap relative w-full h-8 rounded-[3px] flex items-end justify-center overflow-hidden"
      style={{ background: fill, border }}
    >
      {record.prayersMade > 0 && (
        <span
          className="absolute top-[3px] right-[3px] rounded-full"
          style={{
            width: 3.5, height: 3.5,
            background: record.prayersMade >= 5 ? '#A6A7E4' : 'rgba(166,167,228,0.45)',
          }}
        />
      )}
      {record.purityHeld === true && (
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 2, background: 'var(--color-grove-400)', opacity: 0.85 }}
        />
      )}
    </button>
  );
}
