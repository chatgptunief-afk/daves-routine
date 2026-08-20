'use client';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-paper-56 block">
          {label}
        </label>
      )}
      {/* text-[16px], niet kleiner: onder 16px zoomt iOS Safari automatisch in zodra dit veld
          focus krijgt, en omdat maximumScale bewust niet vergrendeld is (WCAG 1.4.4), zoomt de
          pagina daarna niet vanzelf weer uit — de gebruiker blijft ingezoomd hangen na het
          opslaan. Op exact 16px triggert Safari die auto-zoom niet, dus dit voorkomt het
          probleem bij de bron in plaats van een aparte zoom-reset te bouwen. */}
      <input
        id={id}
        className={`w-full h-[52px] bg-ink-600 rounded-control border border-line px-4 text-paper text-[16px] placeholder:text-paper-44 focus:outline-none focus:border-ember-500/50 ${className}`}
        {...props}
      />
    </div>
  );
}
