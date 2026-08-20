'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';

const SESSION_KEY = 'dagboog-intro-shown';
const EASE = [0.16, 1, 0.3, 1] as const;

// "Moet de intro nu tonen" hangt af van sessionStorage — een extern systeem, niet veilig
// tijdens SSR. useSyncExternalStore i.p.v. een mount-effect + setState: getSnapshot rekent
// precies één keer echt uit (en schrijft dan pas naar sessionStorage) en cachet daarna, dus
// herhaalde aanroepen door React (tearing-checks, re-renders) blijven puur/idempotent.
const noopSubscribe = () => () => {};
let cachedShouldShow: boolean | null = null;
function getShouldShowSnapshot(): boolean {
  if (cachedShouldShow === null) {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        cachedShouldShow = false;
      } else {
        sessionStorage.setItem(SESSION_KEY, '1');
        cachedShouldShow = true;
      }
    } catch {
      // Privénavigatie o.i.d. — geen harde afhankelijkheid, de intro toont dan gewoon elke keer.
      cachedShouldShow = true;
    }
  }
  return cachedShouldShow;
}
function useShouldShowIntro(): boolean {
  return useSyncExternalStore(noopSubscribe, getShouldShowSnapshot, () => false);
}

/**
 * De merk-opening — FLAi's "F die niet stilstaat", maar in het licht van Dagboog: dezelfde
 * amber-gloed en dezelfde tweelaagse lichttechniek als de Boog zelf (arcGradient/lightCore uit
 * Arc.tsx), niet FLAi's eigen violet-naar-cyaan. De fast lane licht op als hetzelfde licht als
 * het huidige-moment-punt op de Boog — een bewuste visuele brug tussen de twee merken, geen los
 * geplakt logo. Toont zich precies één keer per verse sessie (nieuwe tab, of een PWA die koud
 * vanaf het beginscherm start) — nooit opnieuw bij een cliëntside navigatie (de root layout,
 * waar dit in leeft, remount niet tussen pagina's) en nooit opnieuw binnen dezelfde sessie na een
 * harde refresh. Bij prefers-reduced-motion: geen tekenanimatie, geen beweging — alleen een
 * korte, zachte fade met het merk meteen zichtbaar in eindstaat.
 */
export function LaunchIntro() {
  const reduceMotion = useReducedMotion();
  const shouldShow = useShouldShowIntro();
  const [hasStarted, setHasStarted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Render-time afgeleide state, met een aparte "hasStarted"-vlag: shouldShow blijft `true`
  // voor de rest van de sessie zodra hij dat één keer was, dus zonder deze vlag zou de
  // hide-timer hieronder (die `visible` terugzet naar false) de intro telkens weer aanzetten.
  if (shouldShow && !hasStarted) {
    setHasStarted(true);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const outAt = reduceMotion ? 650 : 1550;
    const doneAt = reduceMotion ? 950 : 1900;
    const t1 = setTimeout(() => setFadingOut(true), outAt);
    const t2 = setTimeout(() => setVisible(false), doneAt);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="launch-intro"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center pt-safe pb-safe"
          style={{ background: '#0A0A0F' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: fadingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.3 : 0.4, ease: EASE }}
          aria-hidden="true"
        >
          {/* Zelfde warme, ademende gloed als de Atmosphere-laag bij Fajr — het openen van de
              app als het aanbreken van de dag, niet als een merklogo op een zwart vlak. */}
          <div
            className="absolute inset-0 animate-breathe"
            style={{
              background:
                'radial-gradient(60vw 34vh at 50% 42%, rgba(232,147,74,0.11), transparent 70%),' +
                'radial-gradient(55vw 28vh at 50% 102%, rgba(201,117,47,0.08), transparent 72%)',
            }}
          />

          <svg width="88" height="88" viewBox="0 0 256 256" className="relative">
            <defs>
              {/* Zelfde drie amber-stops als arcGradient in Arc.tsx — het merk is getekend met
                  het licht van de Boog, niet met FLAi's eigen violet-naar-cyaan. */}
              <linearGradient id="li-bM" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="248" y2="8">
                <stop offset="0" stopColor="#C9752F" />
                <stop offset="0.55" stopColor="#E8934A" />
                <stop offset="1" stopColor="#F2AC6E" />
              </linearGradient>
              {/* De fast lane is het huidige-moment-licht van de Boog — amber warmend naar de
                  bijna-witte lightCore-kleur, i.p.v. FLAi's eigen paars-naar-cyaan accent. */}
              <linearGradient id="li-aM" gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="110" y2="104">
                <stop offset="0" stopColor="#E8934A" />
                <stop offset="1" stopColor="#FFFBF2" />
              </linearGradient>
              <radialGradient id="li-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFBF2" />
                <stop offset="55%" stopColor="#F5F1E8" />
                <stop offset="100%" stopColor="#F5F1E8" stopOpacity="0" />
              </radialGradient>
              <filter id="li-gl" filterUnits="userSpaceOnUse" x="-40" y="-40" width="360" height="360">
                <feGaussianBlur stdDeviation="4.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="li-lightBloom" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {reduceMotion ? (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={12}>
                <path d="M44 52 H96" stroke="url(#li-bM)" />
                <circle cx={26} cy={52} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9} />
                <path d="M6 88 H96" stroke="url(#li-aM)" filter="url(#li-gl)" />
                <path d="M62 128 H96" stroke="url(#li-bM)" />
                <path d="M50 206 H62 L86 170 H96" stroke="url(#li-bM)" />
                <circle cx={26} cy={206} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9} />
                <path d="M124 192 H164 L184 212 H196" stroke="url(#li-bM)" />
              </g>
            ) : (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={12}>
                <m.path d="M44 52 H96" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: EASE }} />
                <m.circle cx={26} cy={52} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.12 }} />
                <m.path d="M6 88 H96" stroke="url(#li-aM)" filter="url(#li-gl)"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.42, delay: 0.06, ease: EASE }} />
                <m.path d="M62 128 H96" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.36, delay: 0.16, ease: EASE }} />
                <m.path d="M50 206 H62 L86 170 H96" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.38, delay: 0.18, ease: EASE }} />
                <m.circle cx={26} cy={206} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.26 }} />
                <m.path d="M124 192 H164 L184 212 H196" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.32, delay: 0.28, ease: EASE }} />
              </g>
            )}

            <m.g
              initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.44, delay: reduceMotion ? 0 : 0.22, ease: EASE }}
              style={{ transformOrigin: '125px 120px' }}
            >
              <circle cx={214} cy={212} r={13} fill="none" stroke="url(#li-bM)" strokeWidth={9} />
              <path
                d="M96 40 L196 40 C214 40 228 32 244 16 L210 68 L124 68 L124 114 L196 114 L178 142 L124 142 L124 216 L96 216 Z"
                fill="url(#li-bM)" stroke="url(#li-bM)" strokeWidth={7} strokeLinejoin="round"
              />
              <circle cx={110} cy={60} r={10.5} fill="#0A0A0F" />
              <circle cx={110} cy={196} r={10.5} fill="#0A0A0F" />
            </m.g>

            {/* De aankomst van het licht — zelfde tweelaagse techniek als het huidige-moment-punt
                op de Boog (grote wazige halo + kleine scherpe kern), niet één simpele stip. */}
            {reduceMotion ? (
              <>
                <circle cx={214} cy={212} r={20} fill="url(#li-halo)" opacity={0.45} filter="url(#li-lightBloom)" />
                <circle cx={214} cy={212} r={5} fill="#FFFBF2" />
              </>
            ) : (
              <m.g
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: [0.3, 1.25, 1] }}
                transition={{ duration: 0.55, delay: 0.62, ease: EASE }}
                style={{ transformOrigin: '214px 212px' }}
              >
                <circle cx={214} cy={212} r={20} fill="url(#li-halo)" opacity={0.45} filter="url(#li-lightBloom)" />
                <circle cx={214} cy={212} r={5} fill="#FFFBF2" />
              </m.g>
            )}
          </svg>

          <m.div
            className="relative mt-5 flex flex-col items-center gap-3"
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.78, ease: EASE }}
          >
            <svg width="98" height="38" viewBox="-4 -8 282 116">
              <defs>
                <linearGradient id="li-bW" gradientUnits="userSpaceOnUse" x1="-10" y1="96" x2="272" y2="4">
                  <stop offset="0" stopColor="#C9752F" />
                  <stop offset="0.55" stopColor="#E8934A" />
                  <stop offset="1" stopColor="#F2AC6E" />
                </linearGradient>
              </defs>
              <g fill="url(#li-bW)" fillRule="evenodd">
                <path d="M0 0 H62 L50 18 H18 V41 H52 L44 59 H18 V100 H0 Z" />
                <path transform="translate(82,0)" d="M0 0 H18 V82 H60 L48 100 H0 Z" />
                <path transform="translate(157,0)" d="M0 100 L26 0 L50 0 L76 100 Z M38 23 L47.6 60 L28.4 60 Z M23.7 78 L52.3 78 L58 100 L18 100 Z" />
                <path transform="translate(254,0)" d="M0 34 H18 V100 H0 Z" />
                <circle cx={263} cy={13} r={9.6} fill="url(#li-bW)" />
              </g>
            </svg>
            <span className="eyebrow" style={{ letterSpacing: '0.16em' }}>Snelheid door software</span>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
