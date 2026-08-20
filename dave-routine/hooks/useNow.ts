'use client';
import { useState, useSyncExternalStore } from 'react';

// Een "klok" is een extern systeem — precies waar useSyncExternalStore voor bedoeld is, en het
// voorkomt de klassieke setState-in-effect-bij-mount (die nodig zou zijn om niet 30/60 seconden
// te wachten op de eerste tick). getSnapshot geeft een gecachte waarde terug die alleen wijzigt
// wanneer de subscriber (interval of focus-event) 'm expliciet bijwerkt — nooit "de huidige tijd"
// bij elke aanroep, want dat zou useSyncExternalStore als "store wijzigt tijdens render" zien.
class Ticker {
  private ms: number;
  private listeners = new Set<() => void>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onFocus: (() => void) | null = null;

  constructor(private intervalMs: number, private refreshOnFocus: boolean) {
    this.ms = Date.now();
  }

  private notify = () => {
    this.ms = Date.now();
    this.listeners.forEach(l => l());
  };

  subscribe = (callback: () => void) => {
    this.listeners.add(callback);
    if (!this.intervalId) this.intervalId = setInterval(this.notify, this.intervalMs);
    if (this.refreshOnFocus && !this.onFocus) {
      this.onFocus = this.notify;
      window.addEventListener('focus', this.onFocus);
    }
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
        if (this.onFocus) { window.removeEventListener('focus', this.onFocus); this.onFocus = null; }
      }
    };
  };

  getSnapshot = () => this.ms;
}

const SERVER_SNAPSHOT = 0;

/**
 * Huidige tijd, ververst elke `intervalMs`. `refreshOnFocus` ververst ook zodra het tabblad
 * weer focus krijgt (bv. voor een klok die na lang op de achtergrond staan niet stil blijft).
 * Geeft `null` terug tijdens SSR/hydratie (er is dan geen "echte" klok) — consistent met hoe
 * de pagina's dit al als laadstaat behandelden.
 */
export function useNow(intervalMs = 30000, refreshOnFocus = false): Date | null {
  // Eén stabiele Ticker-instantie per component-leven, via een lazy useState-initializer
  // (loopt maar één keer, bij de eerste render) — geen ref nodig, dus geen "ref tijdens render".
  const [ticker] = useState(() => new Ticker(intervalMs, refreshOnFocus));

  const ms = useSyncExternalStore(ticker.subscribe, ticker.getSnapshot, () => SERVER_SNAPSHOT);
  return ms === SERVER_SNAPSHOT ? null : new Date(ms);
}
