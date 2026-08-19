'use client';
import { useEffect } from 'react';
import { useApp } from './AppStateProvider';
import { todayString, timeStringToDate } from '@/lib/date';
import { getCurrentPrayerWindow } from '@/lib/phase';

const FIRED_KEY_PREFIX = 'dagboog-notif-fired-';

function alreadyFired(key: string): boolean {
  try { return localStorage.getItem(FIRED_KEY_PREFIX + key) === '1'; } catch { return false; }
}
function markFired(key: string): void {
  try { localStorage.setItem(FIRED_KEY_PREFIX + key, '1'); } catch {}
}

async function notify(body: string, tag: string) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification('Dagboog', { body, tag, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
        return;
      }
    }
    new Notification('Dagboog', { body, tag, icon: '/icons/icon-192.png' });
  } catch {
    // Notification-constructor kan gooien op sommige mobiele browsers zonder SW — negeren,
    // er is geen zinvolle fallback binnen een enkele client-tick.
  }
}

const PRAYER_NAMES: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

// Stille planner voor lokale meldingen. Controleert elke minuut, zólang de app open is, of er
// op basis van ECHTE data iets te melden valt — nooit een vaste tekst zonder aanleiding.
//
// BELANGRIJK — wat dit wel en niet is: dit is een voorgrond-planner. Hij werkt zolang het
// tabblad/de geïnstalleerde app open is of onlangs open is geweest, net als de meeste kleine
// PWA's zonder eigen server. Een melding die ook binnenkomt terwijl het toestel dicht is,
// vereist échte Web Push: een VAPID-sleutelpaar, opslag van pushabonnementen en een server die
// op tijd verstuurt. Die serverkant bestaat in dit project nog niet (er is geen backend/database
// — alles staat lokaal via idb-keyval). De service worker (public/sw.js) kan een binnenkomende
// push al wél tonen, dus zodra die serverkant er is, werkt de rest meteen mee.
export function NotificationScheduler() {
  const { state, isLoaded, ankerTasks, gebedTasks } = useApp();

  useEffect(() => {
    if (!isLoaded || !state) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const tick = () => {
      if (!state.settings.notificationsEnabled || Notification.permission !== 'granted') return;
      const now = new Date();
      const today = todayString(now);
      const times = state.prayerTimesCache;

      if (state.settings.notifMorningEnabled) {
        const key = `${today}-morning`;
        if (now >= timeStringToDate(today, state.settings.notifMorningTime) && !alreadyFired(key)) {
          markFired(key);
          notify('Je dag begint.', 'morning');
        }
      }

      if (state.settings.notifEveningEnabled) {
        const key = `${today}-evening`;
        if (now >= timeStringToDate(today, state.settings.notifEveningTime) && !alreadyFired(key)) {
          markFired(key);
          notify('Je dag sluit af.', 'evening');
        }
      }

      // Ritme: één rustig duwtje halverwege de middag, en alleen als er ankers openstaan.
      // Geen ankers ingesteld -> nooit een melding, wat er ook aan staat.
      if (state.settings.notifRoutineEnabled && ankerTasks.length > 0) {
        const key = `${today}-routine`;
        const anyOpen = ankerTasks.some(t => !t.completed);
        if (anyOpen && now >= timeStringToDate(today, '14:00') && !alreadyFired(key)) {
          markFired(key);
          notify('De volgende stap wacht.', 'routine');
        }
      }

      // Gebed: leunt volledig op de bestaande gebedstijden-logica (lib/phase.ts), geen eigen
      // berekening. Alleen als het gebed nog niet is afgevinkt.
      if (state.settings.notifPrayerEnabled && times) {
        const prayerWindow = getCurrentPrayerWindow(now, times);
        if (prayerWindow) {
          const key = `${today}-prayer-${prayerWindow}`;
          const task = gebedTasks.find(t => t.prayer === prayerWindow);
          if (task && !task.completed && !alreadyFired(key)) {
            markFired(key);
            notify(`Het is ${PRAYER_NAMES[prayerWindow]}.`, `prayer-${prayerWindow}`);
          }
        }
      }
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [isLoaded, state, ankerTasks, gebedTasks]);

  return null;
}
