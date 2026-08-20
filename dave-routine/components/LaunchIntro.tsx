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
 * De merk-opening — FLAi's "F die niet stilstaat": sporen lopen de F in, de fast lane licht
 * als laatste op, dan het woordmerk en de pay-off. Toont zich precies één keer per verse sessie
 * (nieuwe tab, of een PWA die koud vanaf het beginscherm start) — nooit opnieuw bij een
 * cliëntside navigatie (de root layout, waar dit in leeft, remount niet tussen pagina's) en
 * nooit opnieuw binnen dezelfde sessie na een harde refresh. Bij prefers-reduced-motion: geen
 * tekenanimatie, geen beweging — alleen een korte, zachte fade met het merk meteen zichtbaar.
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
    const outAt = reduceMotion ? 650 : 1400;
    const doneAt = reduceMotion ? 950 : 1750;
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
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60vw 34vh at 50% 42%, rgba(124,58,237,0.10), transparent 70%),' +
                'radial-gradient(50vw 26vh at 50% 100%, rgba(34,211,238,0.05), transparent 70%)',
            }}
          />

          <svg width="88" height="88" viewBox="0 0 256 256" className="relative">
            <defs>
              <linearGradient id="li-bM" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="248" y2="8">
                <stop offset="0" stopColor="#7C3AED" />
                <stop offset="0.34" stopColor="#4F46E5" />
                <stop offset="0.66" stopColor="#2563EB" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="li-aM" gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="110" y2="104">
                <stop offset="0" stopColor="#A855F7" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
              <filter id="li-gl" filterUnits="userSpaceOnUse" x="-40" y="-40" width="360" height="360">
                <feGaussianBlur stdDeviation="4.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
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
                  transition={{ duration: 0.38, ease: EASE }} />
                <m.circle cx={26} cy={52} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
                <m.path d="M6 88 H96" stroke="url(#li-aM)" filter="url(#li-gl)"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.05, ease: EASE }} />
                <m.path d="M62 128 H96" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.34, delay: 0.14, ease: EASE }} />
                <m.path d="M50 206 H62 L86 170 H96" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.36, delay: 0.16, ease: EASE }} />
                <m.circle cx={26} cy={206} r={12} fill="none" stroke="url(#li-bM)" strokeWidth={9}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.24 }} />
                <m.path d="M124 192 H164 L184 212 H196" stroke="url(#li-bM)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.26, ease: EASE }} />
              </g>
            )}

            <m.g
              initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.2, ease: EASE }}
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

            {reduceMotion ? (
              <circle cx={214} cy={212} r={4.5} fill="url(#li-aM)" filter="url(#li-gl)" />
            ) : (
              <m.circle
                cx={214} cy={212} r={4.5} fill="url(#li-aM)" filter="url(#li-gl)"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: [0.4, 1.3, 1] }}
                transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
                style={{ transformOrigin: '214px 212px' }}
              />
            )}
          </svg>

          <m.div
            className="relative mt-5 flex flex-col items-center gap-3"
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.65, ease: EASE }}
          >
            <svg width="98" height="38" viewBox="-4 -8 282 116">
              <defs>
                <linearGradient id="li-bW" gradientUnits="userSpaceOnUse" x1="-10" y1="96" x2="272" y2="4">
                  <stop offset="0" stopColor="#7C3AED" />
                  <stop offset="0.42" stopColor="#4F46E5" />
                  <stop offset="0.74" stopColor="#2563EB" />
                  <stop offset="1" stopColor="#22D3EE" />
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
