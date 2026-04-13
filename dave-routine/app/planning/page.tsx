'use client';
import { useAppState } from '@/hooks/useAppState';
import { RoutineSection } from '@/components/ui/RoutineSection';
import { motion } from 'framer-motion';

export default function PlanningPage() {
  const { isLoaded, state, toggleTask, morningTasks, dailyTasks, eveningTasks, prayerTasks, cleanSoulTasks, completedCount, totalCount } = useAppState();

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Planning & Doelen</h1>
        <p className="text-white/40 text-sm mt-1">{completedCount} van {totalCount} taken voltooid vandaag</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <RoutineSection
          title="Gebeden"
          emoji="🕌"
          tasks={prayerTasks}
          onToggle={toggleTask}
          accentColor="bg-amber-500"
          defaultOpen={true}
        />
        <RoutineSection
          title="Ochtendroutine"
          emoji="🌅"
          tasks={morningTasks}
          onToggle={toggleTask}
          accentColor="bg-amber-400"
          defaultOpen={false}
        />
        <RoutineSection
          title="Dagelijkse Taken"
          emoji="📅"
          tasks={dailyTasks}
          onToggle={toggleTask}
          accentColor="bg-sky-400"
          defaultOpen={false}
        />
        <RoutineSection
          title="Avondroutine"
          emoji="🌙"
          tasks={eveningTasks}
          onToggle={toggleTask}
          accentColor="bg-purple-400"
          defaultOpen={false}
        />
        <RoutineSection
          title="Clean Soul"
          emoji="🛡️"
          tasks={cleanSoulTasks}
          onToggle={toggleTask}
          accentColor="bg-teal-400"
          defaultOpen={true}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/20 text-xs pb-4"
      >
        ↺ Taken resetten automatisch om middernacht
      </motion.p>
    </div>
  );
}
