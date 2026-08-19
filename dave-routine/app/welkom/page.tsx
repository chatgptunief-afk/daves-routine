'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppStateProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin } from 'lucide-react';

export default function WelkomPage() {
  const router = useRouter();
  const { isLoaded, setUserName, setIdentityStatement, updateSettings, completeOnboarding } = useApp();
  const [name, setName] = useState('Dave');
  const [identity, setIdentity] = useState('');
  const [locStatus, setLocStatus] = useState<'idle' | 'done' | 'error'>('idle');

  if (!isLoaded) {
    return <div className="pt-16 text-center"><p className="text-paper-56 text-[14px]">Laden...</p></div>;
  }

  const useLocation = () => {
    if (!('geolocation' in navigator)) { setLocStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        updateSettings({ prayerTimeSource: 'calculated', location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setLocStatus('done');
      },
      () => setLocStatus('error'),
      { timeout: 10000 }
    );
  };

  const handleStart = () => {
    setUserName(name.trim() || 'Dave');
    setIdentityStatement(identity.trim());
    completeOnboarding();
    router.replace('/');
  };

  return (
    <div className="pt-10 pb-8">
      <p className="eyebrow mb-2">Dagboog</p>
      <p className="font-display text-[30px] text-paper leading-tight mb-3">Van Fajr tot Isha.<br />Eén steen per dag.</p>
      <p className="text-[14px] text-paper-56 mb-10 leading-relaxed max-w-[300px]">
        Geen streaks die breken. Geen schuldgevoel. Elke dag legt een steen op de Muur —
        en de Muur wordt nooit gewist.
      </p>

      <div className="space-y-5 mb-8">
        <Input label="Hoe heet je?" value={name} onChange={e => setName(e.target.value)} />
        <Input
          label="Wie wil je worden? (optioneel)"
          value={identity}
          onChange={e => setIdentity(e.target.value)}
          placeholder="Iemand die opstaat voordat hij er zin in heeft."
        />
      </div>

      <div className="rounded-card bg-ink-700 border border-line p-5 mb-10">
        <p className="text-[15px] text-paper font-medium mb-1">Gebedstijden</p>
        <p className="text-[13px] text-paper-56 mb-4 leading-relaxed">
          Gebruik je locatie voor automatisch berekende tijden, of stel ze later handmatig in
          bij Instellingen.
        </p>
        <button onClick={useLocation} className="tap flex items-center gap-2 text-ember-500 text-[14px] font-medium">
          <MapPin size={16} />
          {locStatus === 'done' ? 'Locatie ingesteld' : 'Gebruik mijn locatie'}
        </button>
        {locStatus === 'error' && <p className="text-[12px] text-paper-56 mt-2">Kon locatie niet ophalen — geen probleem, later instelbaar.</p>}
      </div>

      <Button onClick={handleStart}>Beginnen</Button>
    </div>
  );
}
