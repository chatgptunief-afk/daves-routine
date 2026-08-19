'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { getIcon } from '@/lib/icons';
import { Check } from '@/components/ui/Check';
import { LoadingState } from '@/components/ui/LoadingState';

export default function AnkersPage() {
  const router = useRouter();
  const { state, isLoaded, setAnkerIds } = useApp();

  if (!isLoaded || !state) {
    return <LoadingState />;
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
      <p className="text-[14px] text-paper-56 mb-6 leading-relaxed max-w-[300px]">
        Ankers zijn de taken die je reeks maken of breken. Kies de taken waar alles op staat —
        de rest is Ritme, en Ritme is nooit fataal.
      </p>

      <p className="tnum text-[13px] text-paper-56 mb-3">{selected.length} / 5 gekozen</p>

      <div className="rounded-card bg-ink-700 divide-y divide-line overflow-hidden">
        {ritmeTasks.map(task => {
          const Icon = getIcon(task.icon);
          const isSelected = selected.includes(task.id);
          const disabled = !isSelected && selected.length >= 5;
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              disabled={disabled}
              className="tap w-full flex items-center gap-3 px-5 py-3.5 text-left disabled:opacity-30"
            >
              <Icon size={16} strokeWidth={1.5} className={isSelected ? 'text-ember-400' : 'text-paper-44'} />
              <span className={`flex-1 text-[15px] ${isSelected ? 'text-paper font-medium' : 'text-paper-72'}`}>{task.title}</span>
              <Check checked={isSelected} size={21} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
