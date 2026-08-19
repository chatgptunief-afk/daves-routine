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
      <input
        id={id}
        className={`w-full h-[52px] bg-ink-600 rounded-control border border-line px-4 text-paper text-[15px] placeholder:text-paper-44 focus:outline-none focus:border-ember-500/50 ${className}`}
        {...props}
      />
    </div>
  );
}
