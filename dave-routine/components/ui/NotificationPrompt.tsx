'use client';
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { useApp } from '../AppStateProvider';

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
    updateSettings({ notifPromptShown: true, notificationsEnabled: permission === 'granted' });
    setOpen(false);
  };

  return (
    <Sheet open={open} onClose={close} title="Meldingen">
      <div className="pt-2 pb-1">
        <p className="font-display text-[22px] text-paper leading-[1.28] mb-3 max-w-[280px]">
          Wil je dat ik je zacht herinner aan je ritme?
        </p>
        <p className="text-[14px] text-paper-56 leading-relaxed mb-7 max-w-[280px]">
          Een enkel moment per dagdeel — nooit meer dan dat. Alles is los uit te zetten bij Instellingen.
        </p>
        <div className="space-y-2.5">
          <Button onClick={enable}>Meldingen inschakelen</Button>
          <Button variant="secondary" onClick={close} className="w-full">Misschien later</Button>
        </div>
      </div>
    </Sheet>
  );
}
