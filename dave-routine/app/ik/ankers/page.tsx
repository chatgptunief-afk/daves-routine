'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { getIcon } from '@/lib/icons';

export default function AnkersPage() {
  const router = useRouter();
  const { state, isLoaded, setAnkerIds } = useApp();

  if (!isLoaded || !state) {
    return <div className="pt-16 text-center"><p className="text-paper-56 text-[14px]">Laden...</p></div>;
  }

  const ritmeTasks = state.taskBlueprint.filter(t => t.domain === 'ritme' && !t.archivedAt).sort((a, b) => a.order - b.order);
  const selected = state.ankerIds;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setAnkerIds(selected.filter(x => x !== id));
    } else {
      if (selected.length >= 5) return;
      setAnkerIds([...selected, id]);
    }
  };

  return (
    <div className="pb-8">
      <button onClick={() => router.push('/ik')} className="tap flex items-center gap-1 text-paper-56 text-[14px] mb-4">
        <ChevronLeft size={16} /> Ik
      </button>

      <p className="eyebrow mb-1">Ankers</p>
      <p className="font-display text-[24px] text-paper mb-2">Max 5. Niet-onderhandelbaar.</p>
      <p className="text-[14px] text-paper-56 mb-6 leading-relaxed">
        Ankers zijn de taken die je reeks maken of breken. Kies de taken waar alles op staat —
        de rest is Ritme, en Ritme is nooit fataal.
      </p>

      <p className="tnum text-[13px] text-paper-56 mb-3">{selected.length} / 5 gekozen</p>

      <div className="rounded-card bg-ink-700 border border-line overflow-hidden">
        {ritmeTasks.map((task, i) => {
          const Icon = getIcon(task.icon);
          const isSelected = selected.includes(task.id);
          const disabled = !isSelected && selected.length >= 5;
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              disabled={disabled}
              className={`tap w-full flex items-center gap-3 px-5 py-3.5 text-left disabled:opacity-30 ${i !== ritmeTasks.length - 1 ? 'border-b border-line' : ''}`}
            >
              <Icon size={17} strokeWidth={1.75} className={isSelected ? 'text-ember-400' : 'text-paper-56'} />
              <span className={`flex-1 text-[15px] ${isSelected ? 'text-paper font-medium' : 'text-paper-72'}`}>{task.title}</span>
              <span
                className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: isSelected ? 'transparent' : 'rgba(245,241,232,0.44)',
                  background: isSelected ? 'var(--color-ember-500)' : 'transparent',
                }}
              >
                {isSelected && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-ember-ink" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
