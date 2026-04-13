export interface EstateLevel {
  threshold: number;
  description: string;
  emoji: string;
}

export const ROUTINE_LEVELS: EstateLevel[] = [
  { threshold: 0,  description: 'Eenvoudig hutje',       emoji: '🛖' },
  { threshold: 5,  description: 'Klein huis',            emoji: '🏠' },
  { threshold: 10, description: 'Ruimer woonhuis',       emoji: '🏘️' },
  { threshold: 15, description: 'Modern huis',           emoji: '🏡' },
  { threshold: 20, description: 'Luxe villa',            emoji: '🏢' },
  { threshold: 30, description: 'Stijlvolle Mansion',    emoji: '🏛️' },
  { threshold: 40, description: 'Imposant Kasteel',      emoji: '🏰' },
  { threshold: 50, description: '👑 Gouden Paleis',      emoji: '✨🏯✨' },
];

export const PRAYER_LEVELS: EstateLevel[] = [
  { threshold: 0,  description: 'Stille duisternis',         emoji: '🌑' },
  { threshold: 5,  description: 'Warme lantaarns',           emoji: '🏮' },
  { threshold: 10, description: 'Serene gouden gloed',       emoji: '🌟' },
  { threshold: 20, description: 'Zuivere lichtstralen',      emoji: '✨' },
  { threshold: 30, description: 'Sterrenpracht',             emoji: '🌌' },
  { threshold: 40, description: 'Hemelse aurora',            emoji: '🌠' },
  { threshold: 50, description: '🌙 Goddelijk licht',        emoji: '☀️' },
];

export const CLEAN_SOUL_LEVELS: EstateLevel[] = [
  { threshold: 0,  description: 'Kale grond',                  emoji: '🟫' },
  { threshold: 5,  description: 'Jonge plantjes',              emoji: '🌱' },
  { threshold: 10, description: 'Bloeiende tuin',              emoji: '🌿' },
  { threshold: 15, description: 'Elegante waterpartij',        emoji: '💧' },
  { threshold: 20, description: 'Prachtige buitenruimte',      emoji: '🌺' },
  { threshold: 30, description: 'Tropisch paradijs',           emoji: '🌴' },
  { threshold: 40, description: 'Eeuwige bloementuin',         emoji: '🌸' },
  { threshold: 50, description: '🌍 Hemels Domein',            emoji: '🌈' },
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
