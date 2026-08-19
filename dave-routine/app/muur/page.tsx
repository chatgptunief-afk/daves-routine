'use client';
import { useMemo, useState } from 'react';
import { useApp } from '@/components/AppStateProvider';
import { Stone } from '@/components/ui/Stone';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { DayRecord } from '@/types';
import { dateLabel } from '@/lib/date';

const MONTH_LABELS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function monthKey(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_LABELS_NL[m - 1]} ${y}`;
}

export default function MuurPage() {
  const { state, isLoaded, streak, purityStreak } = useApp();
  const [selected, setSelected] = useState<DayRecord | null>(null);

  const groups = useMemo(() => {
    if (!state) return [];
    const sorted = [...state.history].sort((a, b) => (a.date < b.date ? 1 : -1)); // nieuwste eerst
    const map = new Map<string, DayRecord[]>();
    for (const r of sorted) {
      const key = monthKey(r.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([key, records]) => ({
      key,
      label: monthLabel(key),
      records: records.sort((a, b) => (a.date < b.date ? -1 : 1)), // binnen de maand chronologisch
    }));
  }, [state]);

  if (!isLoaded || !state) {
    return <div className="pt-16 text-center"><p className="text-paper-56 text-[14px]">Laden...</p></div>;
  }

  return (
    <div className="pb-8">
      <p className="eyebrow mb-1">De Muur</p>
      <p className="font-display text-[24px] text-paper mb-6">Elke dag telt mee.</p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatBlock label="Reeks" value={String(streak.current)} />
        <StatBlock label="Langste" value={String(streak.longest)} />
        <StatBlock label="Ritme 30d" value={`${streak.ritme30}%`} />
        <StatBlock label="Zuiverheid" value={String(purityStreak)} />
      </div>

      {groups.length === 0 && (
        <EmptyState line="De muur is nog leeg." explanation="Elke dag die je afsluit, legt een steen." />
      )}

      <div className="space-y-7">
        {groups.map(group => (
          <div key={group.key}>
            <p className="eyebrow mb-2.5">{group.label}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {group.records.map(record => (
                <Stone key={record.date} record={record} onTap={setSelected} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected ? dateLabel(selected.date) : undefined}>
        {selected && (
          <div className="space-y-4 pb-4">
            <p className="font-display text-[20px] text-paper">{dateLabel(selected.date)}</p>
            <div className="space-y-2 text-[14px]">
              <Row label="Ankers" value={selected.ankersMade ? 'Gemaakt' : selected.recoveryUsed ? 'Hersteld' : 'Gemist'} />
              <Row label="Gebeden" value={`${selected.prayersMade}/5`} />
              <Row label="Zuiverheid" value={selected.purityHeld === null ? '—' : selected.purityHeld ? 'Vastgehouden' : 'Niet vastgehouden'} />
            </div>
            {selected.reflection && (
              <div className="pt-2 border-t border-line">
                <p className="eyebrow mb-1.5">Reflectie</p>
                <p className="text-[15px] text-paper-72 leading-relaxed italic">&ldquo;{selected.reflection}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="tnum font-display text-[22px] text-paper leading-none mb-1">{value}</p>
      <p className="text-[10px] text-paper-56 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-paper-56">{label}</span>
      <span className="text-paper font-medium">{value}</span>
    </div>
  );
}
