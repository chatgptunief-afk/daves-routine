'use client';
import { useMemo, useRef, useState, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PrayerTimes } from '@/types';
import {
  arcMarkerPositions, pointOnArc, fillDashOffset, gradientBrightShift,
  arcPosition, getCurrentPrayerWindow, timeAtArcPosition, ARC_PATH_LENGTH, ARC_CX, ARC_CY,
} from '@/lib/phase';
import { formatHHMM } from '@/lib/date';

interface ArcProps {
  now: Date;
  times: PrayerTimes;
  completionRatio: number; // voltooide ankers / totaal ankers vandaag
  prayersCompleted: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', boolean>;
}

const WIDTH = 320;
const HEIGHT = 196;

// De Boog is het gezicht van het product — geen dashboard-grafiek, maar een instrument.
// Drie lagen maken het verschil: een gloed die ECHT uit het gevulde deel lijkt te komen (SVG-
// blur, geen box-shadow), een tijdlezing die de boog aan de klok vastnaait, en een lichtpunt
// dat een sporend, uitdovend spoor achterlaat i.p.v. een losse stip te zijn. Je kunt er ook
// doorheen slepen — de boog wordt dan tijdelijk een instrument dat een ander moment van de dag
// toont, en veert bij loslaten rustig terug naar het echte nu.
export function Arc({ now, times, completionRatio, prayersCompleted }: ArcProps) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const isDownRef = useRef(false);
  const [scrubT, setScrubT] = useState<number | null>(null);
  const isScrubbing = scrubT !== null;

  const markers = useMemo(() => arcMarkerPositions(times), [times]);
  const lightT = useMemo(() => arcPosition(now, times), [now, times]);
  const liveWindow = useMemo(() => getCurrentPrayerWindow(now, times), [now, times]);
  const brightShift = gradientBrightShift(completionRatio);

  const displayT = scrubT ?? lightT;
  const displayTime = scrubT !== null ? timeAtArcPosition(scrubT, times) : now;
  const displayWindow = scrubT !== null ? getCurrentPrayerWindow(displayTime, times) : liveWindow;

  const lightPoint = pointOnArc(displayT);
  const dashOffset = fillDashOffset(completionRatio);
  const trailStart = Math.max(0.02, displayT - 0.09);
  const trailPoint = pointOnArc(trailStart);
  const livePoint = pointOnArc(lightT);

  const markerList: { key: keyof typeof prayersCompleted; t: number }[] = [
    { key: 'fajr', t: markers.fajr },
    { key: 'dhuhr', t: markers.dhuhr },
    { key: 'asr', t: markers.asr },
    { key: 'maghrib', t: markers.maghrib },
    { key: 'isha', t: markers.isha },
  ];

  const posToT = useCallback((clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return lightT;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return lightT;
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const localX = (clientX - rect.left) * scaleX;
    const localY = (clientY - rect.top) * scaleY;
    const dx = localX - ARC_CX;
    const dy = localY - ARC_CY;
    // Boven de basislijn: normale hoekberekening. Onder de basislijn (vinger onder de boog
    // getrokken) zou atan2 anders naar de verkeerde kant omslaan — klem dan naar het
    // dichtstbijzijnde uiteinde i.p.v. een sprong naar de overkant.
    const angle = dy <= 0 ? Math.atan2(-dy, dx) : (dx >= 0 ? 0 : Math.PI);
    const t = (Math.PI - angle) / Math.PI;
    return Math.max(0.02, Math.min(0.98, t));
  }, [lightT]);

  const handlePointerDown = (e: React.PointerEvent<SVGPathElement>) => {
    if (reduceMotion) return;
    isDownRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    setScrubT(posToT(e.clientX, e.clientY));
  };
  const handlePointerMove = (e: React.PointerEvent<SVGPathElement>) => {
    if (!isDownRef.current) return;
    setScrubT(posToT(e.clientX, e.clientY));
  };
  const endScrub = (e: React.PointerEvent<SVGPathElement>) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    if ((e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
    setScrubT(null);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: WIDTH }}>
      <div className="flex flex-col items-center pb-1 select-none">
        <span className="numeral-hero text-paper text-[42px] tabular-nums">{formatHHMM(displayTime)}</span>
        <AnimatePresence>
          {isScrubbing && (
            <m.span
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="tnum mt-1 text-[12px] text-paper-56"
            >
              nu is het {formatHHMM(now)}
            </m.span>
          )}
        </AnimatePresence>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        style={{ maxWidth: WIDTH }}
        className="block"
        role="img"
        aria-label={`Boog van de dag, huidige tijd ${formatHHMM(now)}. ${Math.round(completionRatio * 100)} procent van de ankers gemaakt. Sleep om andere momenten van de dag te bekijken.`}
      >
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9752F" />
            <stop offset={`${Math.max(30, 70 - brightShift * 20)}%`} stopColor="#E8934A" />
            <stop offset={`${70 + brightShift * 25}%`} stopColor="#F2AC6E" />
          </linearGradient>
          <radialGradient id="lightCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBF2" />
            <stop offset="55%" stopColor="#F5F1E8" />
            <stop offset="100%" stopColor="#F5F1E8" stopOpacity="0" />
          </radialGradient>
          <filter id="softBloom" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="lightBloom" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* horizongloed onder de boog, kleurt mee met de vulling */}
        <ellipse cx={WIDTH / 2} cy={HEIGHT - 14} rx={110} ry={14} fill="url(#arcGradient)" opacity={0.06} />

        {/* track */}
        <path
          d={`M 20 168 A 140 140 0 0 1 300 168`}
          fill="none"
          stroke="rgba(245,241,232,0.14)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* zachte gloed onder de vulling — lijkt of het licht er echt uit komt */}
        <m.path
          d={`M 20 168 A 140 140 0 0 1 300 168`}
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={ARC_PATH_LENGTH}
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          opacity={0.22}
          filter="url(#softBloom)"
        />

        {/* vulling */}
        <m.path
          d={`M 20 168 A 140 140 0 0 1 300 168`}
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={ARC_PATH_LENGTH}
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* gebedsmarkers — dunne straaltjes i.p.v. bolletjes */}
        {markerList.map(({ key, t }) => {
          const p = pointOnArc(t);
          const angle = Math.PI - t * Math.PI;
          const nx = Math.cos(angle);
          const ny = -Math.sin(angle);
          const isDone = prayersCompleted[key];
          const isCurrent = displayWindow === key;
          const len = isCurrent ? 8 : isDone ? 6 : 5;
          const x1 = p.x - nx * (len / 2);
          const y1 = p.y - ny * (len / 2);
          const x2 = p.x + nx * (len / 2);
          const y2 = p.y + ny * (len / 2);
          return (
            <g key={key}>
              {isCurrent && (
                <m.circle
                  cx={p.x} cy={p.y} r={11}
                  fill="rgba(166,167,228,0.20)"
                  animate={reduceMotion ? {} : { opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isDone ? '#A6A7E4' : 'rgba(245,241,232,0.38)'}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* spoor achter het lichtpunt — geeft richting en beweging, geen losse stip */}
        {!reduceMotion && (
          <line
            x1={trailPoint.x} y1={trailPoint.y} x2={lightPoint.x} y2={lightPoint.y}
            stroke="url(#arcGradient)" strokeWidth={2} strokeLinecap="round" opacity={0.35}
          />
        )}

        {/* het echte nu — blijft zichtbaar als een dof puntje zolang je aan het slepen bent */}
        {isScrubbing && (
          <m.circle
            cx={livePoint.x} cy={livePoint.y} r={2.5}
            fill="rgba(245,241,232,0.5)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}

        {/* lichtpunt: het getoonde moment (nu, of het versleepte moment) */}
        <m.circle
          cx={lightPoint.x} cy={lightPoint.y} r={20}
          fill="url(#lightCore)" opacity={0.4} filter="url(#lightBloom)"
          animate={{ cx: lightPoint.x, cy: lightPoint.y }}
          transition={{ duration: isScrubbing || reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
        <m.circle
          cx={lightPoint.x} cy={lightPoint.y}
          fill="#FFFBF2"
          animate={{
            cx: lightPoint.x, cy: lightPoint.y,
            r: isScrubbing || reduceMotion ? 5.6 : [4.5, 5.2, 4.5],
          }}
          transition={{
            cx: { duration: isScrubbing || reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] },
            cy: { duration: isScrubbing || reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] },
            r: isScrubbing ? { duration: 0.15 } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* onzichtbaar, breed grijppad langs de boog — houdt de echte lijn dun terwijl de boog
            met de vinger net zo makkelijk te pakken is als een fysieke wijzer */}
        {!reduceMotion && (
          <path
            d={`M 20 168 A 140 140 0 0 1 300 168`}
            fill="none"
            stroke="transparent"
            strokeWidth={44}
            strokeLinecap="round"
            style={{ touchAction: 'none', cursor: isScrubbing ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endScrub}
            onPointerCancel={endScrub}
          />
        )}
      </svg>
    </div>
  );
}
