'use client';
import { m } from 'framer-motion';
import { getXPProgress } from '@/lib/storage';

interface CategoryXPBarsProps {
  categoryXP: Record<string, number>;
}

const CATEGORY_META: { key: string; label: string; icon: string }[] = [
  { key: 'morning', label: 'Ochtend', icon: '🌅' },
  { key: 'daily', label: 'Dagelijks', icon: '📅' },
  { key: 'evening', label: 'Avond', icon: '🌙' },
  { key: 'prayer', label: 'Gebeden', icon: '🕌' },
  { key: 'cleansoul', label: 'Clean Soul', icon: '🛡️' },
];

export function CategoryXPBars({ categoryXP }: CategoryXPBarsProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 space-y-4">
      <h2 className="text-text font-semibold text-[15px]">Categorie levels</h2>

      <div className="space-y-3">
        {CATEGORY_META.map(({ key, label, icon }) => {
          const xp = categoryXP[key] ?? 0;
          const { level, current, next, pct } = getXPProgress(xp);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-text-secondary text-xs font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tnum text-text-tertiary text-[10px]">{current}/{next} XP</span>
                  <span className="tnum text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.05] text-text-secondary">
                    Lv.{level}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <m.div
                  className="h-full rounded-full bg-accent"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
