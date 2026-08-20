'use client';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

// Zelfde volgorde als de TabBar — bepaalt de richting van de slide, niet alleen óf er
// geanimeerd wordt. Naar rechts in de tabbalk (bv. Vandaag -> Muur) schuift de nieuwe pagina
// in van rechts en de oude uit naar links, en omgekeerd. Een schermdiepte binnen dezelfde tab
// (bv. Ik -> Ik/Ankers) telt als "verder" (richting 1, van rechts), consistent met hoe een
// gewone iOS-achtige navigatie-push aanvoelt.
const TAB_ORDER = ['/', '/doelen', '/muur', '/ik'];

function tabIndex(pathname: string): number {
  if (pathname === '/') return 0;
  const top = '/' + pathname.split('/')[1];
  const idx = TAB_ORDER.indexOf(top);
  return idx === -1 ? 0 : idx;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Vorige pathname/index en de afgeleide richting leven in state, niet in een ref: een ref
  // lezen/muteren tijdens render is niet toegestaan (breekt onder Strict Mode double-invoke en
  // concurrent rendering, waar een render-pass verworpen kan worden zonder te committen). Dit
  // is het React-erkende patroon voor "state aanpassen tijdens render bij een prop-wijziging" —
  // idempotent op dezelfde pathname, en de aanroepen hier gebeuren maximaal één keer per
  // daadwerkelijke pathname-wijziging.
  const [prevPath, setPrevPath] = useState(pathname);
  const [prevIndex, setPrevIndex] = useState(() => tabIndex(pathname));
  const [direction, setDirection] = useState(1);

  if (pathname !== prevPath) {
    const newIndex = tabIndex(pathname);
    const diff = newIndex - prevIndex;
    setDirection(diff !== 0 ? Math.sign(diff) : 1);
    setPrevIndex(newIndex);
    setPrevPath(pathname);
  }

  // mode="wait" blijft nodig (geen layout-animaties beschikbaar in de LazyMotion domAnimation-
  // bundel om twee volle paginas overlappend te positioneren zonder sprong). Eerste poging was
  // te agressief ingekort (120ms uit / 14px) — dat oogde als een flikkering i.p.v. een bewuste
  // overgang. Dit is de middenweg: duidelijk zichtbare richting (24px), een uitgaande pagina die
  // vlot maar niet abrupt verdwijnt, en een inkomende die rustig landt — samen ruim onder de
  // oude 440ms "hangende" versie, maar niet zo kort dat de beweging niet meer leesbaar is.
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 22 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: reduceMotion
            ? { duration: 0.16 }
            : { duration: 0.23, ease: [0.16, 1, 0.3, 1] },
        }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0.12 } }
            : { opacity: 0, x: direction * -22, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }
        }
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
