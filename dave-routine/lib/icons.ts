// Curatie van lucide-react iconen voor taken. GEEN emoji — zie Visuele Regel 1.
// De keys zijn wat er in Task.icon wordt opgeslagen; ICON_MAP levert de component.

import {
  Sunrise, Sunset, Moon, Droplet, Droplets, Wind, Footprints, Dumbbell,
  BookOpen, GraduationCap, Utensils, Apple, Smartphone, Leaf, ClipboardList,
  ShieldCheck, PenLine, Bed, Shirt, Timer, AlarmClock, Sun, Waves, Snowflake,
  Heart, Sparkles, Target, Book, Feather, Music, Coffee, Bike, Salad,
  MonitorOff, Brain, Flower2, Mountain, Compass, type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  sunrise: Sunrise, sunset: Sunset, moon: Moon, droplet: Droplet, droplets: Droplets,
  wind: Wind, footprints: Footprints, dumbbell: Dumbbell, 'book-open': BookOpen,
  'graduation-cap': GraduationCap, utensils: Utensils, apple: Apple, smartphone: Smartphone,
  leaf: Leaf, 'clipboard-list': ClipboardList, 'shield-check': ShieldCheck, 'pen-line': PenLine,
  bed: Bed, shirt: Shirt, timer: Timer, 'alarm-clock': AlarmClock, sun: Sun, waves: Waves,
  snowflake: Snowflake, heart: Heart, sparkles: Sparkles, target: Target, book: Book,
  feather: Feather, music: Music, coffee: Coffee, bike: Bike, salad: Salad,
  'monitor-off': MonitorOff, brain: Brain, 'flower-2': Flower2, mountain: Mountain, compass: Compass,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}

export const ICON_PICKER_LIST = Object.keys(ICON_MAP);
