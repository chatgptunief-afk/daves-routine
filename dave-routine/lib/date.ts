// Enige plek in de app die met datums als string rekent.
// Regel: NOOIT toISOString() gebruiken voor een lokale datum (fixt D3 — de tijdzone-bug).

export function todayString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, n: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + n);
  return todayString(d);
}

export function daysBetween(a: string, b: string): number {
  const da = parseDateString(a).getTime();
  const db = parseDateString(b).getTime();
  return Math.round((db - da) / 86400000);
}

export function isBefore(a: string, b: string): boolean {
  return a < b; // YYYY-MM-DD is lexicografisch sorteerbaar
}

export function weekday(dateStr: string): number {
  return parseDateString(dateStr).getDay(); // 0 = zondag
}

export function lastNDays(n: number, from: string = todayString()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(from, -i));
  return out;
}

// "HH:mm" string -> Date op een gegeven dag (lokale tijd)
export function timeStringToDate(dateStr: string, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = parseDateString(dateStr);
  d.setHours(h, m, 0, 0);
  return d;
}

export function formatHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const DAY_LABELS_NL = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const MONTH_LABELS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const DAY_LABELS_FULL_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

export function shortDayLabel(dateStr: string): string {
  return DAY_LABELS_NL[weekday(dateStr)];
}

export function fullDayLabel(dateStr: string): string {
  return DAY_LABELS_FULL_NL[weekday(dateStr)];
}

export function dateLabel(dateStr: string = todayString()): string {
  const d = parseDateString(dateStr);
  return `${fullDayLabel(dateStr)} ${d.getDate()} ${MONTH_LABELS_NL[d.getMonth()]}`;
}
