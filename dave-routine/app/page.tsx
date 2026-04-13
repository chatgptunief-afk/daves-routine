'use client';
import { useAppState } from '@/hooks/useAppState';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Crown, BellRing } from 'lucide-react';
import { TaskCard } from '@/components/ui/TaskCard';

const DAYS_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Goedemorgen', emoji: '☀️' };
  if (h < 17) return { text: 'Goedemiddag', emoji: '🌤️' };
  return { text: 'Goedenavond', emoji: '🌙' };
}

function getDateLabel() {
  const d = new Date();
  return `${DAYS_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`;
}

export default function DashboardPage() {
  const {
    state, isLoaded, toggleTask, toggleNotifications,
    completedCount, totalCount, completionPct, allDone,
    morningTasks, dailyTasks, eveningTasks, prayerTasks, cleanSoulTasks
  } = useAppState();

  const greeting = getGreeting();

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quickTasks = [
    ...prayerTasks.filter(t => !t.completed).slice(0, 1),
    ...morningTasks.filter(t => !t.completed).slice(0, 1),
    ...dailyTasks.filter(t => !t.completed).slice(0, 1),
    ...eveningTasks.filter(t => !t.completed).slice(0, 1),
  ].slice(0, 4);

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          toggleNotifications();
          new Notification("Notificaties geactiveerd!", {
            body: "Je krijgt nu meldingen van Dave's Routine.",
            icon: '/icons/icon-192.png'
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start pt-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/40 text-sm font-medium">{getDateLabel()}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            {greeting.emoji} {greeting.text}, Dave
          </h1>
        </motion.div>
        
        <button 
          onClick={requestNotifications}
          className={`p-2 rounded-full border transition-colors ${state.notificationsEnabled ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' : 'bg-white/5 border-white/10 text-white/40'}`}
        >
          <BellRing size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-between"
      >
        <div className="relative z-10">
          <h2 className="text-orange-200 font-bold uppercase tracking-wider text-xs flex items-center gap-2 mb-1">
            <Crown size={14} /> Ultimate Streak
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black bg-gradient-to-br from-yellow-300 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
              {state.streaks.ultimate.currentStreak}
            </span>
            <span className="text-orange-200/60 font-medium">dagen</span>
          </div>
        </div>
        <motion.div
          animate={state.streaks.ultimate.currentStreak > 0 ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          {state.streaks.ultimate.currentStreak > 0 ? '👑' : '💤'}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">🏆</span>
          <span className="text-xl font-bold">{state.streaks.routine.currentStreak}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Routine</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">🕌</span>
          <span className="text-xl font-bold">{state.streaks.prayer.currentStreak}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Gebeden</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-xl mb-1">🛡️</span>
          <span className="text-xl font-bold">{state.streaks.cleansoul.currentStreak}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Clean Soul</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative overflow-hidden rounded-3xl p-5 border flex items-center justify-between
          ${allDone
            ? 'bg-gradient-to-br from-violet-900/60 to-violet-800/40 border-violet-500/30 pulse-glow'
            : 'bg-white/[0.04] border-white/10'
          }`}
      >
        <div>
          <h3 className="font-bold text-lg mb-1">{allDone ? 'Dag Voltooid! 🎉' : 'Taken vandaag'}</h3>
          <p className="text-white/50 text-sm">{completedCount} van de {totalCount} voltooid</p>
        </div>
        <ProgressRing
          percentage={completionPct}
          size={70}
          strokeWidth={6}
          label={`${completionPct}%`}
        />
      </motion.div>

      {!allDone && quickTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-white/20"></span>
            Volgende taken
          </h2>
          <div className="flex flex-col gap-2">
            {quickTasks.map(task => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-4 gap-2"
      >
        {[
          { label: 'Gebed', icon: '🕌', tasks: prayerTasks, color: 'text-amber-500' },
          { label: 'Ochtend', icon: '🌅', tasks: morningTasks, color: 'text-amber-400' },
          { label: 'Dag', icon: '📅', tasks: dailyTasks, color: 'text-sky-400' },
          { label: 'Avond', icon: '🌙', tasks: eveningTasks, color: 'text-purple-400' },
        ].map(({ label, icon, tasks, color }) => {
          const done = tasks.filter(t => t.completed).length;
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-2 text-center">
              <div className={`${color} flex justify-center mb-1 text-sm`}>{icon}</div>
              <div className="text-white font-bold text-xs">{done}/{tasks.length}</div>
              <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-violet-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
