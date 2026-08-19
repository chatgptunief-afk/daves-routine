'use client';
import { ReactNode } from 'react';

interface EmptyStateProps {
  line: string;
  explanation?: string;
  action?: ReactNode;
}

export function EmptyState({ line, explanation, action }: EmptyStateProps) {
  return (
    <div className="py-12 text-center space-y-3">
      <p className="font-display text-[24px] text-paper leading-tight">{line}</p>
      {explanation && <p className="text-[15px] text-paper-56 max-w-[280px] mx-auto leading-relaxed">{explanation}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
