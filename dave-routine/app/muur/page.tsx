'use client';
import { useMemo, useState } from 'react';
import { useApp } from '@/components/AppStateProvider';
import { Stone } from '@/components/ui/Stone';
import { LoadingState } from '@/components/ui/LoadingState';
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

const COURSE_LENGTH = 7;

function toCourses(records: DayRecord[]): DayRecord[][] {
  const rows: DayRecord[][] = [];
  for (let i = 0; i < records.length; i += COURSE_LENGTH) rows.push(records.slice(i, i + COURSE_LENGTH));
  return rows;
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
    return <LoadingState />;
  }

  return (
    <div className="pb-8">
      <p className="eyebrow mb-1">De Muur</p>
      <p className="font-display text-[24px] text-paper mb-7">Elke dag telt mee.</p>

      <div className="flex items-end justify-between mb-8 pb-6 border-b border-line">
        <div>
          <p className="numeral-hero text-paper text-[52px]">{streak.current}</p>
          <p className="text-[13px] text-paper-56 mt-0.5">
            {streak.current === 1 ? 'dag op rij' : 'dagen op rij'}
          </p>
        </div>
        <div className="flex gap-5 pb-1.5">
          <MiniStat label="Langste" value={String(streak.longest)} />
          <MiniStat label="Ritme" value={`${streak.ritme30}%`} />
          <MiniStat label="Clean" value={String(purityStreak)} />
        </div>
      </div>

      {groups.length === 0 && (
        <EmptyState line="De muur is nog leeg." explanation="Elke dag die je afsluit, legt een steen." />
      )}

      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.key}>
            <p className="eyebrow mb-2.5">{group.label}</p>
            <div className="space-y-1.5">
              {toCourses(group.records).map((course, rowIndex) => (
                <div key={rowIndex} className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                  {rowIndex % 2 === 1 && <div aria-hidden="true" />}
                  {course.map(record => (
                    <div key={record.date} style={{ gridColumn: 'span 2 / span 2' }}>
                      <Stone record={record} onTap={setSelected} />
                    </div>
                  ))}
                </div>
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
              <Row label="Clean Soul" value={selected.purityHeld === null ? '—' : selected.purityHeld ? 'Vastgehouden' : 'Niet vastgehouden'} />
            </div>
            {selected.dayPlan && (
              <div className="pt-2 border-t border-line">
                <p className="eyebrow mb-1.5">Dagplan</p>
                <p className="text-[15px] text-paper-72 leading-relaxed whitespace-pre-line">{selected.dayPlan}</p>
              </div>
            )}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="tnum text-[17px] text-paper font-medium leading-none mb-1">{value}</p>
      <p className="text-[10px] text-paper-44 uppercase tracking-wide">{label}</p>
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
