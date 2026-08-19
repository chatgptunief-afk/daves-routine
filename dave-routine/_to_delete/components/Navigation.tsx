'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, TrendingUp, CircleUser } from 'lucide-react';
import { m } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Vandaag', icon: CalendarCheck },
  { href: '/voortgang', label: 'Voortgang', icon: TrendingUp },
  { href: '/profiel', label: 'Profiel', icon: CircleUser },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="mx-4 mb-4 p-1.5 rounded-sheet bg-surface/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-card flex-1 text-center min-w-[64px] min-h-[52px]"
                >
                  {isActive && (
                    <m.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-accent-soft border border-accent/30 rounded-card"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-text-tertiary'}`}
                  />
                  <span className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-accent-strong' : 'text-text-tertiary'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
