'use client';
import Link from 'next/link';
import { ChevronRight, ListChecks, Anchor, Settings } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';

export default function IkPage() {
  const { state, isLoaded, streak, purityStreak } = useApp();

  if (!isLoaded || !state) {
    return <div className="pt-16 text-center"><p className="text-paper-56 text-[14px]">Laden...</p></div>;
  }

  return (
    <div className="pb-8">
      <p className="eyebrow mb-1">Ik</p>
      <p className="font-display text-[26px] text-paper mb-1">{state.userName}</p>
      {state.identityStatement && (
        <p className="text-[14px] text-paper-56 italic mb-6 leading-relaxed">&ldquo;{state.identityStatement}&rdquo;</p>
      )}
      {!state.identityStatement && <div className="mb-6" />}

      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatBlock label="Reeks" value={String(streak.current)} />
        <StatBlock label="Langste" value={String(streak.longest)} />
        <StatBlock label="Ritme 30d" value={`${streak.ritme30}%`} />
        <StatBlock label="Zuiverheid" value={String(purityStreak)} />
      </div>

      <div className="rounded-card bg-ink-700 border border-line overflow-hidden">
        <NavRow href="/ik/routine" icon={ListChecks} label="Routine beheren" />
        <NavRow href="/ik/ankers" icon={Anchor} label="Ankers kiezen" />
        <NavRow href="/ik/instellingen" icon={Settings} label="Instellingen" last />
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="tnum font-display text-[22px] text-paper leading-none mb-1">{value}</p>
      <p className="text-[10px] text-paper-56 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function NavRow({ href, icon: Icon, label, last }: { href: string; icon: typeof ListChecks; label: string; last?: boolean }) {
  return (
    <Link href={href} className={`tap flex items-center gap-3 px-5 py-4 ${!last ? 'border-b border-line' : ''}`}>
      <Icon size={18} strokeWidth={1.75} className="text-paper-56" />
      <span className="flex-1 text-[15px] text-paper font-medium">{label}</span>
      <ChevronRight size={16} className="text-paper-44" />
    </Link>
  );
}
