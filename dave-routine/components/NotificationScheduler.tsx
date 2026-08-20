'use client';
import { useEffect, useRef } from 'react';
import { useApp } from './AppStateProvider';
import { todayString, timeStringToDate } from '@/lib/date';
import { getCurrentPrayerWindow } from '@/lib/phase';
import { getExistingSubscription, syncPushPreferences } from '@/lib/push/client';

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

// Twee rollen in één component, bewust niet gesplitst in een tweede systeem:
//
// 1) Voorgrond-vangnet — vuurt lokaal, elke minuut zolang de app open is, zodra er op basis
//    van échte data iets te melden valt. Dit is de enige laag die werkt zolang er geen
//    pushabonnement is (browser ondersteunt het niet, iOS nog niet op het beginscherm gezet,
//    of VAPID nog niet geconfigureerd) — zie PUSH.md.
// 2) Zodra er wél een echt pushabonnement is (aangemaakt via NotificationPrompt.tsx of de
//    schakelaar bij Instellingen), stapt de voorgrondmelding voor Ochtend/Avond/Ritme opzij —
//    dat stuurt vanaf dan app/api/push/send/route.ts via Vercel Cron, óók als de app dicht is.
//    Om dubbele meldingen te voorkomen wordt hier niet nog eens lokaal gevuurd. Gebedsmeldingen
//    blijven ALTIJD ook lokaal vuren, omdat de server de dagelijkse afvink-status niet kent
//    (die leeft alleen op het toestel) en dus een net-afgevinkt gebed niet kan overslaan.
//    Deze component synct daarnaast de actuele voorkeuren naar de server, zodat de cron-taak
//    altijd met verse instellingen rekent.
export function NotificationScheduler() {
  const { state, isLoaded, ankerTasks, gebedTasks } = useApp();
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded || !state) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const tick = async () => {
      if (!state.settings.notificationsEnabled || Notification.permission !== 'granted') return;
      const now = new Date();
      const today = todayString(now);
      const times = state.prayerTimesCache;
      const hasPush = !!(await getExistingSubscription());

      if (!hasPush && state.settings.notifMorningEnabled) {
        const key = `${today}-morning`;
        if (now >= timeStringToDate(today, state.settings.notifMorningTime) && !alreadyFired(key)) {
          markFired(key);
          notify('Je dag begint.', 'morning');
        }
      }

      if (!hasPush && state.settings.notifEveningEnabled) {
        const key = `${today}-evening`;
        if (now >= timeStringToDate(today, state.settings.notifEveningTime) && !alreadyFired(key)) {
          markFired(key);
          notify('Je dag sluit af.', 'evening');
        }
      }

      // Ritme: één rustig duwtje halverwege de middag, en alleen als er ankers openstaan.
      // Geen ankers ingesteld -> nooit een melding, wat er ook aan staat.
      if (!hasPush && state.settings.notifRoutineEnabled && ankerTasks.length > 0) {
        const key = `${today}-routine`;
        const anyOpen = ankerTasks.some(t => !t.completed);
        if (anyOpen && now >= timeStringToDate(today, '14:00') && !alreadyFired(key)) {
          markFired(key);
          notify('De volgende stap wacht.', 'routine');
        }
      }

      // Gebed: leunt volledig op de bestaande gebedstijden-logica (lib/phase.ts), geen eigen
      // berekening. Blijft ook mét pushabonnement lokaal vuren — zie uitleg hierboven.
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

  // Synchroniseert voorkeuren + gebedsinstellingen + "heeft ankers" naar een bestaand
  // pushabonnement, licht gedebounced zodat bv. het typen in een tijdveld niet bij elke
  // toetsaanslag een verzoek stuurt. Maakt zelf nooit een abonnement aan — alleen updaten.
  useEffect(() => {
    if (!isLoaded || !state) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      syncPushPreferences({
        prefs: {
          notificationsEnabled: state.settings.notificationsEnabled,
          notifMorningEnabled: state.settings.notifMorningEnabled,
          notifMorningTime: state.settings.notifMorningTime,
          notifRoutineEnabled: state.settings.notifRoutineEnabled,
          notifEveningEnabled: state.settings.notifEveningEnabled,
          notifEveningTime: state.settings.notifEveningTime,
          notifPrayerEnabled: state.settings.notifPrayerEnabled,
        },
        prayer: {
          prayerTimeSource: state.settings.prayerTimeSource,
          location: state.settings.location,
          manualPrayerTimes: state.settings.manualPrayerTimes,
        },
        hasAnkers: state.ankerIds.length > 0,
      });
    }, 1000);
    return () => { if (syncTimeout.current) clearTimeout(syncTimeout.current); };
  }, [
    isLoaded, state?.settings.notificationsEnabled, state?.settings.notifMorningEnabled,
    state?.settings.notifMorningTime, state?.settings.notifRoutineEnabled,
    state?.settings.notifEveningEnabled, state?.settings.notifEveningTime,
    state?.settings.notifPrayerEnabled, state?.settings.prayerTimeSource,
    state?.settings.location, state?.settings.manualPrayerTimes, state?.ankerIds,
  ]);

  return null;
}
