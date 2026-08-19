'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Input } from '@/components/ui/Input';
import { DEFAULT_MANUAL_TIMES } from '@/lib/prayerTimes';
import { PrayerTimes } from '@/types';

export default function InstellingenPage() {
  const router = useRouter();
  const { state, isLoaded, setUserName, setIdentityStatement, updateSettings, toggleNotifications, toast } = useApp();
  const [locError, setLocError] = useState<string | null>(null);

  if (!isLoaded || !state) {
    return <div className="pt-16 text-center"><p className="text-paper-56 text-[14px]">Laden...</p></div>;
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
      <div className="rounded-card bg-ink-700 border border-line p-5 mb-8 space-y-4">
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

      <p className="eyebrow mb-3">Voorkeuren</p>
      <div className="rounded-card bg-ink-700 border border-line divide-y divide-line mb-8">
        <SettingRow label="Meldingen" checked={state.settings.notificationsEnabled} onChange={toggleNotifications} />
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
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="tap w-11 h-6 rounded-full flex-shrink-0 relative transition-colors"
      style={{ background: checked ? 'var(--color-ember-500)' : 'var(--color-ink-600)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-paper transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}
