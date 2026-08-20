'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '@/components/AppStateProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, ChevronLeft } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';

const TOTAL_STEPS = 6;

const EASE = [0.16, 1, 0.3, 1] as const;

// Onboarding is geen formulier — het is de eerste stap ín de wereld van het product. Elke stap
// toont precies één gedachte, in dezelfde toon en typografie als de rest van de app. De dunne
// balk bovenaan vult zich net als de Boog: dezelfde vul-taal, alleen nu voor "hoever ben ik in
// het beginnen" i.p.v. "hoever ben ik in de dag".
export default function WelkomPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const app = useApp();
  const { isLoaded, setUserName, setIdentityStatement, updateSettings, completeOnboarding, ritmeTasks, chooseFirstStone } = app;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('Dave');
  const [identity, setIdentity] = useState('');
  const [locStatus, setLocStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [firstStoneId, setFirstStoneId] = useState<string | null>(null);

  if (!isLoaded) {
    return <LoadingState />;
  }

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

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

  const finish = () => {
    setUserName(name.trim() || 'Dave');
    setIdentityStatement(identity.trim());
    if (firstStoneId) chooseFirstStone(firstStoneId);
    completeOnboarding();
    router.replace('/');
  };

  const slide = {
    initial: { opacity: 0, x: reduceMotion ? 0 : direction * 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -direction * 16 },
    transition: { duration: reduceMotion ? 0.1 : 0.32, ease: EASE },
  };

  return (
    <div className="h-dvh flex flex-col px-6 pt-8 pb-8">
      <div className="flex items-center gap-3 mb-10 flex-shrink-0">
        {step > 0 ? (
          <button
            onClick={() => goTo(step - 1)}
            className="tap w-8 h-8 -ml-1.5 rounded-full flex items-center justify-center text-paper-56"
            aria-label="Vorige"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>
        ) : (
          <div className="w-8 h-8 -ml-1.5" />
        )}
        <div className="flex-1 h-[2px] rounded-full bg-white/[0.07] overflow-hidden">
          <m.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-ember-600), var(--color-ember-400))' }}
            initial={false}
            animate={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <m.div key="0" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-ember-400">Dagboog</p>
              <p className="font-display text-[32px] text-paper leading-[1.16] mb-4 max-w-[300px]">
                Van Fajr tot Isha buigt de dag open — en weer dicht.
              </p>
              <p className="text-[14.5px] text-paper-56 leading-relaxed max-w-[280px]">
                Geen streaks die breken. Geen schuldgevoel. Elke dag legt een steen op de Muur,
                en de Muur wordt nooit gewist.
              </p>
            </m.div>
          )}

          {step === 1 && (
            <m.div key="1" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-dusk-400">De boog van vandaag</p>
              <p className="font-display text-[28px] text-paper leading-[1.2] mb-4 max-w-[300px]">
                Je dag krijgt vorm rond vijf momenten van gebed.
              </p>
              <p className="text-[14px] text-paper-56 leading-relaxed max-w-[290px] mb-6">
                Gebruik je locatie voor automatisch berekende tijden, of stel ze later handmatig
                in bij Instellingen.
              </p>
              <button onClick={useLocation} className="tap self-start flex items-center gap-2 text-ember-400 text-[14px] font-medium">
                <MapPin size={15} strokeWidth={1.75} />
                {locStatus === 'done' ? 'Locatie ingesteld' : 'Gebruik mijn locatie'}
              </button>
              {locStatus === 'error' && (
                <p className="text-[12px] text-paper-56 mt-2">Kon locatie niet ophalen — geen probleem, later instelbaar.</p>
              )}
            </m.div>
          )}

          {step === 2 && (
            <m.div key="2" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-ember-400">Wie ben jij</p>
              <p className="font-display text-[28px] text-paper leading-[1.2] mb-7 max-w-[300px]">
                Hoe mogen we je noemen?
              </p>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dave" autoFocus />
            </m.div>
          )}

          {step === 3 && (
            <m.div key="3" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-dusk-400">Wie wil je worden</p>
              <p className="font-display text-[26px] text-paper leading-[1.22] mb-7 max-w-[300px]">
                Niet wie je vandaag was. Wie je wordt.
              </p>
              <Input
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                placeholder="Iemand die opstaat voordat hij er zin in heeft."
              />
              <p className="text-[12.5px] text-paper-44 mt-3">Optioneel — je kunt dit later altijd aanpassen.</p>
            </m.div>
          )}

          {step === 4 && (
            <m.div key="4" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-grove-400">De eerste steen</p>
              <p className="font-display text-[26px] text-paper leading-[1.22] mb-2 max-w-[300px]">
                Kies één ding dat vandaag telt.
              </p>
              <p className="text-[14px] text-paper-56 leading-relaxed mb-6 max-w-[290px]">
                Niet alles. Eén ding — het eerste dat je vandaag legt.
              </p>
              {ritmeTasks.length === 0 ? (
                <p className="text-[13.5px] text-paper-44">
                  Voor vandaag staat er nog niets gepland — dat is oké, je kunt er later één kiezen.
                </p>
              ) : (
                <div className="space-y-1 -mx-1">
                  {ritmeTasks.map(task => {
                    const selected = firstStoneId === task.id;
                    return (
                      <button
                        key={task.id}
                        onClick={() => setFirstStoneId(selected ? null : task.id)}
                        className="tap w-full flex items-center gap-3 px-1 py-3 text-left border-b border-line last:border-b-0"
                      >
                        <span
                          className="relative flex-shrink-0 w-5 h-5 rounded-full border"
                          style={{ borderColor: selected ? 'var(--color-ember-500)' : 'rgba(245,241,232,0.28)' }}
                        >
                          <m.span
                            className="absolute inset-[4px] rounded-full"
                            style={{ background: 'var(--color-ember-500)' }}
                            initial={false}
                            animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.16, ease: EASE }}
                          />
                        </span>
                        <span className={`text-[15px] ${selected ? 'text-paper' : 'text-paper-72'}`}>{task.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </m.div>
          )}

          {step === 5 && (
            <m.div key="5" {...slide} className="flex-1 flex flex-col justify-start pt-6">
              <p className="eyebrow mb-4 text-ember-400">Klaar</p>
              <p className="font-display text-[30px] text-paper leading-[1.18] mb-4 max-w-[300px]">
                Dat is genoeg om te beginnen.
              </p>
              <p className="text-[14.5px] text-paper-56 leading-relaxed max-w-[280px]">
                Vandaag hoeft niet perfect te zijn. Begin gewoon.
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-6 flex-shrink-0">
        {step < TOTAL_STEPS - 1 ? (
          <Button onClick={() => goTo(step + 1)}>Verder</Button>
        ) : (
          <Button onClick={finish}>Beginnen</Button>
        )}
      </div>
    </div>
  );
}
