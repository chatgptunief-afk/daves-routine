'use client';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
}

export function Button({ variant = 'primary', className = '', style, children, ...props }: ButtonProps) {
  const base = 'tap rounded-control font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40';
  const variants: Record<string, string> = {
    primary: 'text-ember-ink w-full h-[52px]',
    secondary: 'text-paper-72 h-11 bg-transparent',
    destructive: 'text-clay-500 h-11 bg-transparent',
  };
  const primaryStyle =
    variant === 'primary'
      ? { background: 'linear-gradient(180deg, var(--color-ember-400) 0%, var(--color-ember-500) 100%)', ...style }
      : style;
  return (
    <button className={`${base} ${variants[variant]} ${className}`} style={primaryStyle} {...props}>
      {children}
    </button>
  );
}
