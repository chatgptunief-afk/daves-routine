export interface EstateLevel {
  threshold: number;
  description: string;
}

export const ROUTINE_LEVELS: EstateLevel[] = [
  { threshold: 0, description: 'Eenvoudig huis' },
  { threshold: 5, description: 'Netter en groter huis' },
  { threshold: 10, description: 'Modern huis' },
  { threshold: 20, description: 'Luxe Villa' },
  { threshold: 30, description: 'Premium Mansion' },
];

export const PRAYER_LEVELS: EstateLevel[] = [
  { threshold: 0, description: 'Stille rust' },
  { threshold: 5, description: 'Warme lantaarns' },
  { threshold: 10, description: 'Serene ambiance' },
  { threshold: 20, description: 'Zuivere lichtgloed' },
  { threshold: 30, description: 'Hemelse sterrenpracht' },
];

export const CLEAN_SOUL_LEVELS: EstateLevel[] = [
  { threshold: 0, description: 'Lege grond' },
  { threshold: 5, description: 'Bestaande tuin' },
  { threshold: 10, description: 'Bloeiende grote tuin' },
  { threshold: 15, description: 'Elegante waterpartij' },
  { threshold: 20, description: 'Luxe buitenruimte' },
  { threshold: 30, description: 'Compleet paradijselijk domein' },
];

export function getCurrentLevel(streakCount: number, levels: EstateLevel[]): EstateLevel {
  let current = levels[0];
  for (const level of levels) {
    if (streakCount >= level.threshold) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(streakCount: number, levels: EstateLevel[]): EstateLevel | null {
  for (const level of levels) {
    if (streakCount < level.threshold) {
      return level;
    }
  }
  return null;
}
