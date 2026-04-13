'use client';
import { motion } from 'framer-motion';
import { getXPProgress } from '@/lib/storage';
import { Zap } from 'lucide-react';

interface CategoryXPBarsProps {
  categoryXP: Record<string, number>;
}

const CATEGORY_META: { key: string; label: string; icon: string; color: string; bar: string }[] = [
  { key: 'morning', label: 'Ochtend', icon: '🌅', color: 'text-amber-400', bar: 'bg-amber-400' },
  { key: 'daily', label: 'Dagelijks', icon: '📅', color: 'text-sky-400', bar: 'bg-sky-400' },
  { key: 'evening', label: 'Avond', icon: '🌙', color: 'text-purple-400', bar: 'bg-purple-400' },
  { key: 'prayer', label: 'Gebeden', icon: '🕌', color: 'text-yellow-400', bar: 'bg-yellow-400' },
  { key: 'cleansoul', label: 'Clean Soul', icon: '🛡️', color: 'text-green-400', bar: 'bg-green-400' },
];

export function CategoryXPBars({ categoryXP }: CategoryXPBarsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-violet-400" />
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Categorie Levels</h2>
      </div>

      <div className="space-y-3">
        {CATEGORY_META.map(({ key, label, icon, color, bar }) => {
          const xp = categoryXP[key] ?? 0;
          const { level, current, next, pct } = getXPProgress(xp);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-[10px]">{current}/{next} XP</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 ${color}`}>
                    Lv.{level}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-white/20 text-[10px] text-center">
        +10 XP per voltooide taak per categorie
      </p>
    </motion.div>
  );
}
