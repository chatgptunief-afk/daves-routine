'use client';
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { useApp } from '../AppStateProvider';
import { subscribeToPush, pushNeedsHomeScreenInstall } from '@/lib/push/client';

// De eenmalige, zachte vraag om meldingen — nooit meteen bij het openen van de app, pas nadat
// iemand is begonnen (na onboarding). Verschijnt hooguit één keer per installatie; wat de
// keuze ook is, we vragen het daarna nooit meer. Zie de meldingen-brief §6/§10.
export function NotificationPrompt() {
  const { state, isLoaded, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !state || scheduledRef.current) return;
    if (!state.onboardingComplete || state.settings.notifPromptShown) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission !== 'default') {
      // Al buiten onze eigen vraag om besloten (browserinstellingen) — gewoon onthouden.
      scheduledRef.current = true;
      updateSettings({ notifPromptShown: true });
      return;
    }

    scheduledRef.current = true;
    const t = setTimeout(() => setOpen(true), 1400);
    return () => clearTimeout(t);
  }, [isLoaded, state, updateSettings]);

  if (!isLoaded || !state) return null;

  const close = () => {
    setOpen(false);
    updateSettings({ notifPromptShown: true });
  };

  const enable = async () => {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    updateSettings({ notifPromptShown: true, notificationsEnabled: granted });
    if (granted && state) {
      await subscribeToPush({
        prefs: {
          notificationsEnabled: true,
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
      // Lukt het abonneren niet (bv. iOS buiten het beginscherm, of push nog niet
      // geconfigureerd) — dan blijft NotificationScheduler.tsx als voorgrond-vangnet werken.
    }
    setOpen(false);
  };

  const needsHomeScreen = pushNeedsHomeScreenInstall();

  return (
    <Sheet open={open} onClose={close} title="Meldingen">
      <div className="pt-2 pb-1">
        <p className="font-display text-[22px] text-paper leading-[1.28] mb-3 max-w-[280px]">
          Wil je dat ik je zacht herinner aan je ritme?
        </p>
        <p className="text-[14px] text-paper-56 leading-relaxed mb-4 max-w-[280px]">
          Een enkel moment per dagdeel — nooit meer dan dat. Alles is los uit te zetten bij Instellingen.
        </p>
        {needsHomeScreen && (
          <p className="text-[12.5px] text-paper-44 leading-relaxed mb-4 max-w-[280px]">
            Voor meldingen ook terwijl Dagboog dicht is: zet 'm eerst op je beginscherm via
            Delen → Zet op beginscherm.
          </p>
        )}
        <div className="space-y-2.5">
          <Button onClick={enable}>Meldingen inschakelen</Button>
          <Button variant="secondary" onClick={close} className="w-full">Misschien later</Button>
        </div>
      </div>
    </Sheet>
  );
}
