'use client';
import Link from 'next/link';
import { ChevronRight, ListChecks, Anchor, Settings, Leaf } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { LoadingState } from '@/components/ui/LoadingState';

export default function IkPage() {
  const { state, isLoaded, streak, purityStreak } = useApp();

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  return (
    <div className="pb-8">
      <p className="eyebrow mb-1">Ik</p>
      <p className="font-display text-[26px] text-paper mb-1">{state.userName}</p>
      {state.identityStatement && (
        <p className="text-[14px] text-paper-56 italic mb-7 leading-relaxed max-w-[290px]">&ldquo;{state.identityStatement}&rdquo;</p>
      )}
      {!state.identityStatement && <div className="mb-7" />}

      <div className="flex items-end justify-between mb-8 pb-6 border-b border-line">
        <div>
          <p className="numeral-hero text-paper text-[44px]">{streak.current}</p>
          <p className="text-[13px] text-paper-56 mt-0.5">
            {streak.current === 1 ? 'dag op rij' : 'dagen op rij'}
          </p>
        </div>
        <div className="flex gap-5 pb-1">
          <MiniStat label="Langste" value={String(streak.longest)} />
          <MiniStat label="Ritme" value={`${streak.ritme30}%`} />
          <MiniStat label="Clean" value={String(purityStreak)} />
        </div>
      </div>

      <div className="rounded-card bg-ink-700 divide-y divide-line overflow-hidden">
        <NavRow href="/ik/routine" icon={ListChecks} label="Routine beheren" />
        <NavRow href="/ik/ankers" icon={Anchor} label="Ankers kiezen" />
        <NavRow href="/ik/zuiverheid" icon={Leaf} label="Clean Soul beheren" />
        <NavRow href="/ik/instellingen" icon={Settings} label="Instellingen" />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="tnum text-[17px] text-paper font-medium leading-none mb-1">{value}</p>
      <p className="text-[10px] text-paper-44 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function NavRow({ href, icon: Icon, label }: { href: string; icon: typeof ListChecks; label: string }) {
  return (
    <Link href={href} className="tap flex items-center gap-3 px-5 py-4">
      <Icon size={17} strokeWidth={1.5} className="text-paper-56" />
      <span className="flex-1 text-[15px] text-paper font-medium">{label}</span>
      <ChevronRight size={15} className="text-paper-44" />
    </Link>
  );
}
