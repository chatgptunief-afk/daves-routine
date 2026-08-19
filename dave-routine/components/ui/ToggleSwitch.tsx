'use client';
import { m, useReducedMotion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

// Eén gedeelde schakelaar voor de hele app — i.p.v. dat elk instellingen-rijtje zijn eigen
// overgang uitvindt. Dezelfde --ease-emphasized-curve als de rest van het systeem, een klein
// drukmoment bij aanraken, en de duim krijgt net genoeg schaduw om fysiek te voelen zonder
// de "geen kaartschaduwen"-regel te breken (zelfde uitzondering als de Meter-pacemarker).
export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  const reduceMotion = useReducedMotion();
  return (
    <m.button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: reduceMotion ? 1 : 0.94 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="w-11 h-6 rounded-full flex-shrink-0 relative"
      style={{
        background: checked ? 'var(--color-ember-500)' : 'var(--color-ink-600)',
        transition: `background ${reduceMotion ? '0ms' : 'var(--dur-base)'} var(--ease-emphasized)`,
      }}
    >
      <m.span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-paper"
        style={{ boxShadow: '0 1px 2px rgba(7,7,12,0.35)' }}
        initial={false}
        animate={{ x: checked ? 22 : 2 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      />
    </m.button>
  );
}
