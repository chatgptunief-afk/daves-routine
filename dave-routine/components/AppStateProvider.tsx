'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useAppState } from '@/hooks/useAppState';

type AppStateValue = ReturnType<typeof useAppState>;

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/** Enige plek waar app-state gelezen/gewijzigd wordt — één IDB-load per sessie, gedeeld
 * door Atmosphere, TabBar en elk scherm. */
export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp() moet binnen <AppStateProvider> gebruikt worden.');
  return ctx;
}
