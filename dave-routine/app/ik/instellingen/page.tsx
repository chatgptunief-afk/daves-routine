'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Input } from '@/components/ui/Input';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { DEFAULT_MANUAL_TIMES } from '@/lib/prayerTimes';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrayerTimes } from '@/types';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push/client';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function InstellingenPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { state, isLoaded, setUserName, setIdentityStatement, updateSettings, toast } = useApp();
  const [locError, setLocError] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  const manual = state.settings.manualPrayerTimes ?? DEFAULT_MANUAL_TIMES;

  const setManualTime = (key: keyof Omit<PrayerTimes, 'date'>, value: string) => {
    updateSettings({ manualPrayerTimes: { ...manual, [key]: value } });
  };

  const useLocation = () => {
    setLocError(null);
    if (!('geolocation' in navigator)) { setLocError('Locatie niet beschikbaar op dit apparaat.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        updateSettings({
          prayerTimeSource: 'calculated',
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      },
      () => setLocError('Locatie geweigerd. Gebruik handmatige tijden hieronder.'),
      { timeout: 10000 }
    );
  };

  // Zet, wanneer de gebruiker "Meldingen" aanzet, ook echt browserpermissie + pushabonnement
  // om — anders staat de schakelaar aan terwijl er nooit iets kan verschijnen. Bij weigering
  // blijft de schakelaar uit; we vragen daarna niet opnieuw, alleen een rustige uitleg.
  const handleToggleNotifications = async () => {
    const turningOn = !state.settings.notificationsEnabled;
    setNotifError(null);

    if (!turningOn) {
      updateSettings({ notificationsEnabled: false });
      await unsubscribeFromPush();
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifError('Meldingen worden niet ondersteund in deze browser.');
      return;
    }
    if (Notification.permission === 'denied') {
      setNotifError('Meldingen staan uit voor Dagboog in je browser- of systeeminstellingen. Zet ze daar aan om dit te gebruiken.');
      return;
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') {
      setNotifError('Geen toestemming gekregen.');
      return;
    }

    updateSettings({ notificationsEnabled: true });
    const result = await subscribeToPush({
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
    if (!result.ok && result.reason === 'ios-not-installed') {
      setNotifError("Meldingen werken hier zolang de app open is. Zet Dagboog op je beginscherm (Delen → Zet op beginscherm) voor meldingen ook als de app dicht is.");
    }
    // Overige mislukkingen (nog geen VAPID-configuratie, server niet bereikbaar) blijven stil —
    // de voorgrond-planner vangt het op, en er is niets bruikbaars om de gebruiker over te zeggen.
  };

  return (
    <div className="pb-8">
      <button onClick={() => router.push('/ik')} className="tap flex items-center gap-1 text-paper-56 text-[14px] mb-4">
        <ChevronLeft size={16} /> Ik
      </button>

      <p className="font-display text-[24px] text-paper mb-6">Instellingen</p>

      <div className="space-y-4 mb-8">
        <Input label="Naam" defaultValue={state.userName} onBlur={e => setUserName(e.target.value || 'Dave')} />
        <Input
          label="Identiteitszin (optioneel)"
          defaultValue={state.identityStatement}
          onBlur={e => setIdentityStatement(e.target.value)}
          placeholder="Iemand die opstaat voordat hij er zin in heeft."
        />
      </div>

      <p className="eyebrow mb-3">Gebedstijden</p>
      <div className="rounded-card bg-ink-700 p-5 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] text-paper font-medium">Berekend op locatie</p>
            <p className="text-[12px] text-paper-56 mt-0.5">Automatisch, o.b.v. je huidige positie</p>
          </div>
          <ToggleSwitch
            checked={state.settings.prayerTimeSource === 'calculated'}
            onChange={checked => (checked ? useLocation() : updateSettings({ prayerTimeSource: 'manual' }))}
          />
        </div>
        {locError && <p className="text-[12px] text-paper-56">{locError}</p>}

        {state.settings.prayerTimeSource === 'manual' && (
          <div className="pt-2 border-t border-line grid grid-cols-2 gap-3">
            <TimeField label="Fajr" value={manual.fajr} onChange={v => setManualTime('fajr', v)} />
            <TimeField label="Zonsopgang" value={manual.sunrise} onChange={v => setManualTime('sunrise', v)} />
            <TimeField label="Dhuhr" value={manual.dhuhr} onChange={v => setManualTime('dhuhr', v)} />
            <TimeField label="Asr" value={manual.asr} onChange={v => setManualTime('asr', v)} />
            <TimeField label="Maghrib" value={manual.maghrib} onChange={v => setManualTime('maghrib', v)} />
            <TimeField label="Isha" value={manual.isha} onChange={v => setManualTime('isha', v)} />
          </div>
        )}
      </div>

      <p className="eyebrow mb-3">Meldingen</p>
      <div className="rounded-card bg-ink-700 divide-y divide-line mb-8">
        <div>
          <SettingRow label="Meldingen" checked={state.settings.notificationsEnabled} onChange={handleToggleNotifications} />
          {notifError && <p className="text-[12px] text-paper-56 px-5 pb-4 -mt-2 leading-relaxed">{notifError}</p>}
        </div>
        <AnimatePresence initial={false}>
          {state.settings.notificationsEnabled && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
              className="overflow-hidden divide-y divide-line"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[15px] text-paper">Ochtend</p>
                  <p className="text-[12px] text-paper-56 mt-0.5">Je dag begint.</p>
                </div>
                <div className="flex items-center gap-3">
                  {state.settings.notifMorningEnabled && (
                    <input
                      type="time"
                      value={state.settings.notifMorningTime}
                      onChange={e => updateSettings({ notifMorningTime: e.target.value })}
                      className="h-9 bg-ink-600 rounded-control border border-line px-2.5 text-paper text-[13px] tnum focus:outline-none focus:border-ember-500/50"
                    />
                  )}
                  <ToggleSwitch
                    checked={state.settings.notifMorningEnabled}
                    onChange={checked => updateSettings({ notifMorningEnabled: checked })}
                    label="Ochtendmelding"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[15px] text-paper">Ritme</p>
                  <p className="text-[12px] text-paper-56 mt-0.5">Een duwtje als je ankers nog openstaan.</p>
                </div>
                <ToggleSwitch
                  checked={state.settings.notifRoutineEnabled}
                  onChange={checked => updateSettings({ notifRoutineEnabled: checked })}
                  label="Ritmemelding"
                />
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[15px] text-paper">Avond</p>
                  <p className="text-[12px] text-paper-56 mt-0.5">Je dag sluit af.</p>
                </div>
                <div className="flex items-center gap-3">
                  {state.settings.notifEveningEnabled && (
                    <input
                      type="time"
                      value={state.settings.notifEveningTime}
                      onChange={e => updateSettings({ notifEveningTime: e.target.value })}
                      className="h-9 bg-ink-600 rounded-control border border-line px-2.5 text-paper text-[13px] tnum focus:outline-none focus:border-ember-500/50"
                    />
                  )}
                  <ToggleSwitch
                    checked={state.settings.notifEveningEnabled}
                    onChange={checked => updateSettings({ notifEveningEnabled: checked })}
                    label="Avondmelding"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[15px] text-paper">Gebed</p>
                  <p className="text-[12px] text-paper-56 mt-0.5">Bij elk gebed dat nog niet is afgevinkt.</p>
                </div>
                <ToggleSwitch
                  checked={state.settings.notifPrayerEnabled}
                  onChange={checked => updateSettings({ notifPrayerEnabled: checked })}
                  label="Gebedsmelding"
                />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <p className="eyebrow mb-3">Voorkeuren</p>
      <div className="rounded-card bg-ink-700 divide-y divide-line mb-8">
        <SettingRow
          label="Verminderde beweging"
          checked={state.settings.reducedMotionOverride}
          onChange={checked => updateSettings({ reducedMotionOverride: checked })}
        />
        <SettingRow
          label="Hoog contrast"
          checked={state.settings.highContrast}
          onChange={checked => updateSettings({ highContrast: checked })}
        />
      </div>

      {toast && <p className="text-[12px] text-paper-56 text-center">{toast}</p>}
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[12px] text-paper-56 block mb-1">{label}</label>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 bg-ink-600 rounded-control border border-line px-3 text-paper text-[14px] tnum focus:outline-none focus:border-ember-500/50"
      />
    </div>
  );
}

function SettingRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-[15px] text-paper">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
