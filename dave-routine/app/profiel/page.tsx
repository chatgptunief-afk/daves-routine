'use client';
import { useAppState } from '@/hooks/useAppState';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target } from 'lucide-react';
import { useState } from 'react';
import { Task, TaskCategory } from '@/types';
import { SoulShop } from '@/components/ui/SoulShop';
import { CategoryXPBars } from '@/components/ui/CategoryXPBars';

export default function ProfilePage() {
  const { state, isLoaded, setUserName, addTask, deleteTask, buyFreeze, setFrogTask } = useAppState();

  const [editName, setEditName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('✨');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('daily');
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSaveName = () => {
    if (editName.trim()) {
      setUserName(editName.trim());
      setIsEditingName(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      category: newTaskCategory,
      icon: newTaskEmoji || '✨',
      completed: false,
      order: state.taskBlueprint.filter(t => t.category === newTaskCategory).length + 1,
    };

    addTask(newTask);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskEmoji('✨');
    setIsAddingTask(false);
  };

  const categories: { key: TaskCategory; label: string }[] = [
    { key: 'prayer', label: 'Gebeden' },
    { key: 'morning', label: 'Ochtendroutine' },
    { key: 'daily', label: 'Dagelijks' },
    { key: 'evening', label: 'Avondroutine' },
    { key: 'cleansoul', label: 'Clean Soul' },
  ];

  return (
    <div className="space-y-6 pb-6">
      <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-[26px] font-semibold text-text tracking-tight">Profiel</h1>
        <p className="text-text-tertiary text-sm mt-0.5">Beheer je routine en instellingen</p>
      </m.div>

      {/* Name */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface border border-border rounded-card p-5"
      >
        {isEditingName ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Jouw naam..."
              className="flex-1 bg-surface-2 border border-border rounded-control px-4 py-2.5 text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="tap bg-accent text-accent-ink px-4 rounded-control text-sm font-semibold"
            >
              Opslaan
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-text-tertiary mb-1">Je wordt aangesproken als</div>
              <div className="font-display text-xl font-semibold text-text">{state.userName}</div>
            </div>
            <button
              onClick={() => { setEditName(state.userName); setIsEditingName(true); }}
              className="tap text-accent-strong text-sm font-medium bg-accent-soft px-3 py-1.5 rounded-control"
            >
              Wijzig
            </button>
          </div>
        )}
      </m.div>

      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
        <SoulShop soulCoins={state.soulCoins ?? 0} freezes={state.freezes ?? 0} onBuyFreeze={buyFreeze} />
      </m.div>

      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
        <CategoryXPBars categoryXP={state.categoryXP ?? {}} />
      </m.div>

      {/* Frog of the Day */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface border border-border rounded-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-accent" />
          <h2 className="font-display text-text font-semibold text-[15px]">Belangrijkste taak 🐸</h2>
        </div>
        <p className="text-text-tertiary text-xs mb-3.5 leading-relaxed">
          Kies de ene taak die vandaag het meest telt. Die krijgt een eigen plek bovenaan Vandaag.
        </p>
        <select
          value={state.frogTaskId ?? ''}
          onChange={e => setFrogTask(e.target.value || null)}
          className="w-full bg-surface-2 border border-border rounded-control px-3 py-2.5 text-text text-sm focus:outline-none focus:border-accent/50 appearance-none"
        >
          <option value="">Geen prioriteitstaak</option>
          {state.taskBlueprint.map(t => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.title}
            </option>
          ))}
        </select>
      </m.div>

      {/* Task management */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-3"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display text-text font-semibold text-[15px]">Jouw routines</h2>
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="tap text-accent-strong bg-accent-soft px-3 py-1.5 rounded-control text-xs font-semibold flex items-center gap-1"
          >
            <Plus size={13} /> Nieuwe taak
          </button>
        </div>

        <AnimatePresence>
          {isAddingTask && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-surface border border-accent/20 rounded-card p-4 mb-1 space-y-3">
                <div className="flex gap-2">
                  <div className="w-16 flex-shrink-0">
                    <label className="text-[10px] text-text-tertiary mb-1 block">Emoji</label>
                    <input
                      type="text"
                      value={newTaskEmoji}
                      onChange={e => setNewTaskEmoji(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-control px-2 py-2 text-center text-lg focus:outline-none focus:border-accent/50"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-text-tertiary mb-1 block">Titel</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="Bijv. Boek lezen"
                      className="w-full bg-surface-2 border border-border rounded-control px-3 py-2 text-text text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Korte uitleg (optioneel)</label>
                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    placeholder="Minimaal 10 bladzijden"
                    className="w-full bg-surface-2 border border-border rounded-control px-3 py-2 text-text text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Wanneer</label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full bg-surface-2 border border-border rounded-control px-3 py-2 text-text text-sm focus:outline-none focus:border-accent/50 appearance-none"
                  >
                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="tap flex-1 bg-surface-2 text-text-secondary rounded-control py-2.5 text-sm font-medium"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="tap flex-1 bg-accent text-accent-ink rounded-control py-2.5 text-sm font-semibold"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          {categories.map(cat => {
            const catTasks = state.taskBlueprint.filter(t => t.category === cat.key);
            if (catTasks.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="text-text-tertiary text-[11px] font-semibold mb-1 pl-1">
                  {cat.label} ({catTasks.length})
                </h3>
                <div>
                  {catTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg flex-shrink-0">{task.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text leading-tight flex items-center gap-1.5">
                            <span className="truncate">{task.title}</span>
                            {state.frogTaskId === task.id && <span className="text-xs flex-shrink-0">🐸</span>}
                          </div>
                          {task.description && <div className="text-[11px] text-text-tertiary truncate max-w-[200px]">{task.description}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Wil je "${task.title}" definitief wissen?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="tap flex-shrink-0 text-text-tertiary p-2 rounded-control"
                        aria-label={`Verwijder ${task.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </m.div>
    </div>
  );
}
