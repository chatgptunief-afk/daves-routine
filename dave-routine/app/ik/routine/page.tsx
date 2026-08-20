'use client';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getIcon, ICON_PICKER_LIST } from '@/lib/icons';
import { LoadingState } from '@/components/ui/LoadingState';
import { Phase, Task } from '@/types';

const DAY_LABELS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const PHASES: { value: Phase; label: string }[] = [
  { value: 'ochtend', label: 'Ochtend' },
  { value: 'doorlopend', label: 'Ritme (doorlopend)' },
  { value: 'avond', label: 'Avond' },
];

function emptyForm() {
  return { title: '', cue: '', phase: 'ochtend' as Phase, icon: 'sparkles', days: [0, 1, 2, 3, 4, 5, 6] };
}

export default function RoutinePage() {
  const router = useRouter();
  const { state, isLoaded, addTask, updateTask, archiveTask } = useApp();
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const ritmeTasks = useMemo(
    () => state
      ? state.taskBlueprint.filter(t => t.domain === 'ritme' && !t.archivedAt).sort((a, b) => a.order - b.order)
      : [],
    [state]
  );

  const close = useCallback(() => { setEditing(null); setCreating(false); }, []);

  const handleSave = useCallback(() => {
    if (!state || !form.title.trim()) return;
    if (editing) {
      updateTask(editing.id, { title: form.title.trim(), cue: form.cue.trim() || undefined, phase: form.phase, icon: form.icon, days: form.days });
    } else {
      const order = Math.max(0, ...ritmeTasks.filter(t => t.phase === form.phase).map(t => t.order)) + 1;
      addTask({
        id: `task-${Date.now()}`, title: form.title.trim(), cue: form.cue.trim() || undefined,
        domain: 'ritme', phase: form.phase, tier: 'ritme', icon: form.icon, days: form.days, order,
      });
    }
    close();
  }, [state, form, editing, updateTask, addTask, ritmeTasks, close]);

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({ title: task.title, cue: task.cue ?? '', phase: task.phase, icon: task.icon, days: [...task.days] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCreating(true);
  };

  const toggleDay = (d: number) => {
    setForm(f => ({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d].sort() }));
  };

  const handleDelete = () => {
    if (editing) archiveTask(editing.id);
    close();
  };

  const sheetOpen = creating || !!editing;

  return (
    <div className="pb-8">
      <button onClick={() => router.push('/ik')} className="tap flex items-center gap-1 text-paper-56 text-[14px] mb-4">
        <ChevronLeft size={16} /> Ik
      </button>

      <div className="flex items-center justify-between mb-6">
        <p className="font-display text-[24px] text-paper">Routine</p>
        <button onClick={openCreate} className="tap w-10 h-10 rounded-full bg-ink-700 border border-line flex items-center justify-center" aria-label="Nieuwe taak">
          <Plus size={18} className="text-paper" />
        </button>
      </div>

      {PHASES.map(phase => {
        const tasks = ritmeTasks.filter(t => t.phase === phase.value);
        if (tasks.length === 0) return null;
        return (
          <div key={phase.value} className="mb-7">
            <p className="eyebrow mb-2.5">{phase.label}</p>
            <div className="rounded-card bg-ink-700 divide-y divide-line overflow-hidden">
              {tasks.map(task => {
                const Icon = getIcon(task.icon);
                const isAnker = state.ankerIds.includes(task.id);
                return (
                  <button
                    key={task.id}
                    onClick={() => openEdit(task)}
                    className="tap w-full flex items-center gap-3 px-5 py-3.5 text-left"
                  >
                    <Icon size={16} strokeWidth={1.5} className="text-paper-44" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-paper font-medium truncate">{task.title}</p>
                      {task.cue && <p className="text-[12px] text-paper-56 truncate">{task.cue}</p>}
                    </div>
                    {isAnker && <span className="w-[3px] h-[3px] rounded-full bg-ember-500 flex-shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <Sheet open={sheetOpen} onClose={close} title={editing ? 'Taak bewerken' : 'Nieuwe taak'}>
        <div className="space-y-4 pb-2">
          <Input label="Titel" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Bijv. Wandelen" />
          <Input label="Context (optioneel)" value={form.cue} onChange={e => setForm(f => ({ ...f, cue: e.target.value }))} placeholder="Bijv. Na het avondeten" />

          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Moment</label>
            <select
              value={form.phase}
              onChange={e => setForm(f => ({ ...f, phase: e.target.value as Phase }))}
              className="w-full h-[52px] bg-ink-600 rounded-control border border-line px-4 text-paper text-[16px] focus:outline-none focus:border-ember-500/50"
            >
              {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Dagen</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="tap flex-1 h-10 rounded-control text-[12px] font-medium"
                  style={{
                    background: form.days.includes(i) ? 'var(--color-ember-500)' : 'var(--color-ink-600)',
                    color: form.days.includes(i) ? 'var(--color-ember-ink)' : 'var(--color-paper-56)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Icoon</label>
            <div className="grid grid-cols-7 gap-2">
              {ICON_PICKER_LIST.slice(0, 21).map(name => {
                const Icon = getIcon(name);
                const isSelected = form.icon === name;
                return (
                  <button
                    key={name}
                    onClick={() => setForm(f => ({ ...f, icon: name }))}
                    className="tap w-full aspect-square rounded-control flex items-center justify-center"
                    style={{ background: isSelected ? 'var(--color-ember-soft)' : 'var(--color-ink-600)' }}
                    aria-label={name}
                  >
                    <Icon size={16} strokeWidth={1.75} className={isSelected ? 'text-ember-400' : 'text-paper-56'} />
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSave} disabled={!form.title.trim()}>{editing ? 'Opslaan' : 'Taak toevoegen'}</Button>
          {editing && (
            <Button variant="destructive" onClick={handleDelete} className="mx-auto flex items-center gap-2">
              <Trash2 size={15} /> Verwijderen
            </Button>
          )}
        </div>
      </Sheet>
    </div>
  );
}
