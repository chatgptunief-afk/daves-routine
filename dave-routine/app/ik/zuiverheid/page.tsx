'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, ShieldCheck, Flower2, Leaf, Heart, Brain, Mountain } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { getIcon } from '@/lib/icons';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Task } from '@/types';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const MAX_CLEAN_SOUL = 3;
const ICON_CHOICES = ['shield-check', 'flower-2', 'leaf', 'heart', 'brain', 'mountain'] as const;
const ICON_COMPONENTS: Record<(typeof ICON_CHOICES)[number], typeof ShieldCheck> = {
  'shield-check': ShieldCheck, 'flower-2': Flower2, leaf: Leaf, heart: Heart, brain: Brain, mountain: Mountain,
};
const GROVE_GRADIENT = 'linear-gradient(180deg, var(--color-grove-400) 0%, var(--color-grove-500) 100%)';

// Clean Soul — voor gewoontes die je achter je wil laten (roken, uitstellen, jezelf afkraken).
// Max 3: dit is voor de paar dingen waar je bewust aan werkt, geen tweede takenlijst. Elke
// gewoonte heeft haar eigen doorlopende streak (lib/storage.ts computeTaskStreak) — onafhankelijk
// van de andere, en van de Ankers-streak. Zie CleanSoulGroup.tsx voor het dagelijkse aanvinken.
export default function ZuiverheidBeheerPage() {
  const router = useRouter();
  const { state, isLoaded, zuiverheidTasks, zuiverheidStreaks, addTask, updateTask, archiveTask } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<(typeof ICON_CHOICES)[number]>('shield-check');

  const [editing, setEditing] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  const habits = zuiverheidTasks;

  const handleCreate = () => {
    if (!title.trim() || habits.length >= MAX_CLEAN_SOUL) return;
    addTask({
      id: `zuiverheid-${Date.now()}`,
      title: title.trim(),
      domain: 'zuiverheid',
      phase: 'doorlopend',
      tier: 'anker',
      icon,
      days: ALL_DAYS,
      order: habits.length + 1,
    });
    setTitle('');
    setIcon('shield-check');
    setAddOpen(false);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setEditTitle(task.title);
  };

  const handleRename = () => {
    if (!editing || !editTitle.trim()) return;
    updateTask(editing.id, { title: editTitle.trim() });
    setEditing(null);
  };

  const handleStop = () => {
    if (!editing) return;
    archiveTask(editing.id);
    setEditing(null);
  };

  return (
    <div className="pb-8">
      <button onClick={() => router.push('/ik')} className="tap flex items-center gap-1 text-paper-56 text-[14px] mb-4">
        <ChevronLeft size={16} /> Ik
      </button>

      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="eyebrow mb-1">Clean Soul</p>
          <p className="font-display text-[24px] text-paper">Wat je achter je laat.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          disabled={habits.length >= MAX_CLEAN_SOUL}
          className="tap w-10 h-10 rounded-full bg-ink-700 border border-line flex items-center justify-center disabled:opacity-30 flex-shrink-0"
          aria-label="Nieuwe Clean Soul"
        >
          <Plus size={18} className="text-paper" />
        </button>
      </div>
      <p className="text-[14px] text-paper-56 mb-6 leading-relaxed max-w-[300px]">
        Voor de gewoontes die je achter je wil laten — roken, uitstellen, jezelf afkraken. Elke
        dag dat het lukt, telt mee. Geen oordeel over de dagen dat het niet lukt.
      </p>

      {habits.length === 0 && (
        <EmptyState
          line="Nog geen Clean Soul."
          explanation="Kies één gewoonte waar je vanaf wil. Je kan er later meer toevoegen."
          action={<Button onClick={() => setAddOpen(true)} style={{ background: GROVE_GRADIENT, color: '#0A0A0F' }}>Toevoegen</Button>}
        />
      )}

      {habits.length > 0 && (
        <>
          <p className="tnum text-[13px] text-paper-56 mb-3">{habits.length} / {MAX_CLEAN_SOUL} gekozen</p>
          <div className="rounded-card bg-ink-700 divide-y divide-line overflow-hidden">
            {habits.map(task => {
              const Icon = getIcon(task.icon);
              const streak = (zuiverheidStreaks[task.id] ?? 0) + (task.completed ? 1 : 0);
              return (
                <button
                  key={task.id}
                  onClick={() => openEdit(task)}
                  className="tap w-full flex items-center gap-3 px-5 py-3.5 text-left"
                >
                  <Icon size={16} strokeWidth={1.5} className="text-grove-400" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] text-paper font-medium truncate">{task.title}</span>
                    <span className="block text-[12.5px] text-paper-56 tnum">
                      {streak > 0 ? `Dag ${streak}` : 'Vandaag begint het'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Nieuwe Clean Soul">
        <div className="space-y-4 pb-2">
          <Input
            label="Waar wil je vanaf?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Bijv. Niet roken"
            autoFocus
          />
          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Icoon</label>
            <div className="flex gap-2.5">
              {ICON_CHOICES.map(name => {
                const IconComp = ICON_COMPONENTS[name];
                const isSelected = icon === name;
                return (
                  <button
                    key={name}
                    onClick={() => setIcon(name)}
                    className="tap w-10 h-10 rounded-full flex items-center justify-center bg-ink-600"
                    style={{ outline: isSelected ? '2px solid var(--color-grove-400)' : 'none', outlineOffset: 2 }}
                    aria-label={name}
                  >
                    <IconComp size={17} strokeWidth={1.5} className={isSelected ? 'text-grove-400' : 'text-paper-56'} />
                  </button>
                );
              })}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!title.trim()} style={{ background: GROVE_GRADIENT, color: '#0A0A0F' }}>
            Toevoegen
          </Button>
        </div>
      </Sheet>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.title}>
        {editing && (
          <div className="space-y-4 pb-2">
            <Input label="Naam" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <Button
              onClick={handleRename}
              disabled={!editTitle.trim() || editTitle.trim() === editing.title}
              style={{ background: GROVE_GRADIENT, color: '#0A0A0F' }}
            >
              Naam opslaan
            </Button>
            <Button variant="destructive" onClick={handleStop}>Stoppen met bijhouden</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
