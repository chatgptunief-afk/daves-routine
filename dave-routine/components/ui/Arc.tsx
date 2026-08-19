'use client';
import { useMemo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { PrayerTimes } from '@/types';
import {
  arcMarkerPositions, pointOnArc, fillDashOffset, gradientBrightShift,
  arcPosition, getCurrentPrayerWindow, ARC_PATH_LENGTH,
} from '@/lib/phase';

interface ArcProps {
  now: Date;
  times: PrayerTimes;
  completionRatio: number; // voltooide ankers / totaal ankers vandaag
  prayersCompleted: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', boolean>;
}

const WIDTH = 320;
const HEIGHT = 176;

export function Arc({ now, times, completionRatio, prayersCompleted }: ArcProps) {
  const reduceMotion = useReducedMotion();
  const markers = useMemo(() => arcMarkerPositions(times), [times]);
  const lightT = useMemo(() => arcPosition(now, times), [now, times]);
  const currentWindow = useMemo(() => getCurrentPrayerWindow(now, times), [now, times]);
  const brightShift = gradientBrightShift(completionRatio);

  const lightPoint = pointOnArc(lightT);
  const dashOffset = fillDashOffset(completionRatio);

  const markerList: { key: keyof typeof prayersCompleted; t: number }[] = [
    { key: 'fajr', t: markers.fajr },
    { key: 'dhuhr', t: markers.dhuhr },
    { key: 'asr', t: markers.asr },
    { key: 'maghrib', t: markers.maghrib },
    { key: 'isha', t: markers.isha },
  ];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: WIDTH }}
      className="mx-auto block"
      role="img"
      aria-label={`Boog van de dag. ${Math.round(completionRatio * 100)} procent van de ankers gemaakt.`}
    >
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9752F" />
          <stop offset={`${Math.max(30, 70 - brightShift * 20)}%`} stopColor="#E8934A" />
          <stop offset={`${70 + brightShift * 25}%`} stopColor="#F2AC6E" />
        </linearGradient>
      </defs>

      {/* track */}
      <path
        d={`M 20 168 A 140 140 0 0 1 300 168`}
        fill="none"
        stroke="rgba(245,241,232,0.20)"
        strokeWidth={3}
        strokeLinecap="round"
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
        transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* gebedsmarkers */}
      {markerList.map(({ key, t }) => {
        const p = pointOnArc(t);
        const isDone = prayersCompleted[key];
        const isCurrent = currentWindow === key;
        return (
          <g key={key}>
            {isCurrent && (
              <m.circle
                cx={p.x} cy={p.y} r={9}
                fill="rgba(166,167,228,0.24)"
                animate={reduceMotion ? {} : { opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <circle
              cx={p.x} cy={p.y}
              r={isDone ? 3.5 : 3}
              fill={isDone ? '#A6A7E4' : '#0A0A0F'}
              stroke={isDone ? 'none' : 'rgba(245,241,232,0.44)'}
              strokeWidth={isDone ? 0 : 1}
            />
          </g>
        );
      })}

      {/* lichtpunt: nu */}
      <circle cx={lightPoint.x} cy={lightPoint.y} r={16} fill="rgba(242,172,110,0.28)" style={{ filter: 'blur(6px)' }} />
      <circle cx={lightPoint.x} cy={lightPoint.y} r={5} fill="#F5F1E8" />
    </svg>
  );
}
