'use client';
import { useAppState } from '@/hooks/useAppState';
import { motion } from 'framer-motion';
import { User, Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { Task, TaskCategory } from '@/types';

export default function ProfilePage() {
  const { state, isLoaded, setUserName, addTask, deleteTask } = useAppState();

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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
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
      order: state.taskBlueprint.filter(t => t.category === newTaskCategory).length + 1
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
    { key: 'cleansoul', label: 'Clean Soul' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="text-violet-400" /> Profiel & Instellingen
        </h1>
        <p className="text-white/40 text-sm mt-1">Pas je app helemaal naar wens aan</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/10 rounded-3xl p-6"
      >
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Roepnaam</h2>
        
        {isEditingName ? (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={editName} 
              onChange={e => setEditName(e.target.value)} 
              placeholder="Jouw naam..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
              autoFocus
            />
            <button 
              onClick={handleSaveName}
              className="bg-violet-600 hover:bg-violet-500 text-white p-2 px-4 rounded-xl flex items-center gap-2 transition-colors font-medium"
            >
              <Save size={18} /> Opslaan
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <div className="text-xs text-white/40 mb-1">Je wordt aangesproken als:</div>
              <div className="text-xl font-bold text-white">{state.userName}</div>
            </div>
            <button 
              onClick={() => { setEditName(state.userName); setIsEditingName(true); }}
              className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors bg-violet-500/10 px-3 py-1.5 rounded-lg"
            >
              Wijzig
            </button>
          </div>
        )}
      </motion.div>

      {/* Task Defaults Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Jouw Eigen Routines</h2>
          <button 
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Nieuwe Taak
          </button>
        </div>

        {/* Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-violet-900/20 border border-violet-500/30 rounded-3xl p-5 mb-4 space-y-3">
                <div className="flex gap-2">
                  <div className="w-16 flex-shrink-0">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest pl-1 mb-1 block">Emoji</label>
                    <input 
                      type="text" 
                      value={newTaskEmoji} 
                      onChange={e => setNewTaskEmoji(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-xl focus:outline-none focus:border-violet-500"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest pl-1 mb-1 block">Wat (Titel)</label>
                    <input 
                      type="text" 
                      value={newTaskTitle} 
                      onChange={e => setNewTaskTitle(e.target.value)} 
                      placeholder="Bijv. Boek lezen"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest pl-1 mb-1 block">Korte Uitleg (Optioneel)</label>
                  <input 
                    type="text" 
                    value={newTaskDesc} 
                    onChange={e => setNewTaskDesc(e.target.value)} 
                    placeholder="Minimaal 10 bladzijden"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest pl-1 mb-1 block">Wanneer?</label>
                  <select 
                    value={newTaskCategory} 
                    onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full bg-[#1c1c36] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 appearance-none"
                  >
                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                  <button 
                    onClick={handleAddTask}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Tasks List */}
        <div className="space-y-6">
          {categories.map(cat => {
            const catTasks = state.taskBlueprint.filter(t => t.category === cat.key);
            if (catTasks.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 pl-2">
                  {cat.label} ({catTasks.length})
                </h3>
                <div className="space-y-1.5">
                  {catTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-3 px-4 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{task.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white/90 leading-tight">{task.title}</div>
                          {task.description && <div className="text-[10px] text-white/30 truncate max-w-[200px]">{task.description}</div>}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm(`Wil je "${task.title}" definitief wissen?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="opacity-50 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
