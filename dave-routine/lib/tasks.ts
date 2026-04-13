import { Task } from '@/types';

export const DEFAULT_TASKS: Omit<Task, 'completed'>[] = [
  // 🕌 Gebeden (Prayers)
  { id: 'prayer-1', title: 'Fajr', description: 'Ochtendgebed', category: 'prayer', icon: '🌅', order: 1 },
  { id: 'prayer-2', title: 'Dhuhr', description: 'Middaggebed', category: 'prayer', icon: '☀️', order: 2 },
  { id: 'prayer-3', title: 'Asr', description: 'Namiddaggebed', category: 'prayer', icon: '🌤️', order: 3 },
  { id: 'prayer-4', title: 'Maghrib', description: 'Zonsonderganggebed', category: 'prayer', icon: '🌆', order: 4 },
  { id: 'prayer-5', title: 'Isha', description: 'Avond/nachtgebed', category: 'prayer', icon: '🌙', order: 5 },

  // 🛡️ Puurheid / Clean Soul
  { id: 'cleansoul-1', title: 'Clean Soul', description: 'Vandaag je puurheid behouden', category: 'cleansoul', icon: '🛡️', order: 1 },

  // 🌅 Morning Routine
  { id: 'morning-1', title: 'Wakker worden zonder snooze', description: 'Direct opstaan als de wekker gaat', category: 'morning', icon: '⏰', order: 1 },
  { id: 'morning-2', title: 'Glas water drinken', description: 'Hydrateer je lichaam na de nacht', category: 'morning', icon: '💧', order: 2 },
  { id: 'morning-3', title: 'Stretching / mobiliteit', description: '10 minuten stretchen of yoga', category: 'morning', icon: '🧘', order: 3 },
  { id: 'morning-4', title: 'Koude douche', description: 'Minimaal 30 seconden koud water', category: 'morning', icon: '🚿', order: 4 },
  { id: 'morning-5', title: 'Gezond ontbijt', description: 'Voedzaam en bewust ontbijten', category: 'morning', icon: '🥗', order: 5 },
  { id: 'morning-6', title: 'Dagplanning bekijken', description: 'Top 3 prioriteiten bepalen', category: 'morning', icon: '📋', order: 6 },
  { id: 'morning-8', title: 'Buiten lopen (10 min)', description: 'Frisse lucht en daglicht', category: 'morning', icon: '🚶', order: 8 },

  // 📅 Daily Tasks
  { id: 'daily-1', title: 'Minimaal 2L water drinken', description: 'Houd hydratatie bij gedurende de dag', category: 'daily', icon: '🥤', order: 1 },
  { id: 'daily-2', title: 'Beweging / sport', description: 'Minimaal 30 min actief bewegen', category: 'daily', icon: '🏃', order: 2 },
  { id: 'daily-3', title: 'Gezonde maaltijden', description: 'Bewust eten zonder junkfood', category: 'daily', icon: '🍎', order: 3 },
  { id: 'daily-4', title: 'Schermtijd beperken', description: 'Max 2u social media', category: 'daily', icon: '📱', order: 4 },
  { id: 'daily-5', title: 'Leren / studeren', description: 'Minimaal 1u focussen op studie', category: 'daily', icon: '📚', order: 5 },
  { id: 'daily-6', title: 'Buiten zijn', description: 'Minimaal 30 min buitenlucht', category: 'daily', icon: '🌿', order: 6 },

  // 🌙 Evening Routine
  { id: 'evening-1', title: 'Dagboek / reflectie', description: 'Schrijf 3 dingen die goed gingen', category: 'evening', icon: '📔', order: 1 },
  { id: 'evening-2', title: 'Schermen uit om 21:00', description: 'Geen blue light voor het slapen', category: 'evening', icon: '🌛', order: 2 },
  { id: 'evening-3', title: 'Avond stretching', description: '10 minuten ontspannen stretchen', category: 'evening', icon: '🧘', order: 3 },
  { id: 'evening-4', title: 'Morgen voorbereiden', description: 'Kleding klaarleggen, tas inpakken', category: 'evening', icon: '👕', order: 4 },
  { id: 'evening-5', title: 'Slaaphygiëne', description: 'Kamer donker, koel en rustig', category: 'evening', icon: '😴', order: 5 },
  { id: 'evening-6', title: 'Op tijd slapen (23:00)', description: 'Minimaal 8 uur slaap', category: 'evening', icon: '🛏️', order: 6 },
];

export function getInitialTasks(): Task[] {
  return DEFAULT_TASKS.map(task => ({ ...task, completed: false }));
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
