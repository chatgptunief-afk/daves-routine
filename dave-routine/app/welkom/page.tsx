'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, useReducedMotion } from 'framer-motion';
import { useApp } from '@/components/AppStateProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';

const reveal = (reduceMotion: boolean | null, delay: number) => ({
  initial: { opacity: 0, y: reduceMotion ? 0 : 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export default function WelkomPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { isLoaded, setUserName, setIdentityStatement, updateSettings, completeOnboarding } = useApp();
  const [name, setName] = useState('Dave');
  const [identity, setIdentity] = useState('');
  const [locStatus, setLocStatus] = useState<'idle' | 'done' | 'error'>('idle');

  if (!isLoaded) {
    return <LoadingState />;
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
    <div className="pt-14 pb-10">
      <m.p {...reveal(reduceMotion, 0)} className="eyebrow mb-4 text-ember-400">Dagboog</m.p>
      <m.p {...reveal(reduceMotion, 0.06)} className="font-display text-[34px] text-paper leading-[1.15] mb-4">
        Van Fajr tot Isha.<br />Eén steen per dag.
      </m.p>
      <m.p {...reveal(reduceMotion, 0.12)} className="text-[14.5px] text-paper-56 mb-12 leading-relaxed max-w-[290px]">
        Geen streaks die breken. Geen schuldgevoel. Elke dag legt een steen op de Muur —
        en de Muur wordt nooit gewist.
      </m.p>

      <m.div {...reveal(reduceMotion, 0.2)} className="space-y-5 mb-9">
        <Input label="Hoe heet je?" value={name} onChange={e => setName(e.target.value)} />
        <Input
          label="Wie wil je worden? (optioneel)"
          value={identity}
          onChange={e => setIdentity(e.target.value)}
          placeholder="Iemand die opstaat voordat hij er zin in heeft."
        />
      </m.div>

      <m.div {...reveal(reduceMotion, 0.28)} className="mb-10 pt-6 border-t border-line">
        <p className="text-[14px] text-paper font-medium mb-1">Gebedstijden</p>
        <p className="text-[13px] text-paper-56 mb-3.5 leading-relaxed max-w-[290px]">
          Gebruik je locatie voor automatisch berekende tijden, of stel ze later handmatig in
          bij Instellingen.
        </p>
        <button onClick={useLocation} className="tap flex items-center gap-2 text-ember-400 text-[14px] font-medium">
          <MapPin size={15} strokeWidth={1.75} />
          {locStatus === 'done' ? 'Locatie ingesteld' : 'Gebruik mijn locatie'}
        </button>
        {locStatus === 'error' && <p className="text-[12px] text-paper-56 mt-2">Kon locatie niet ophalen — geen probleem, later instelbaar.</p>}
      </m.div>

      <m.div {...reveal(reduceMotion, 0.34)}>
        <Button onClick={handleStart}>Beginnen</Button>
      </m.div>
    </div>
  );
}
