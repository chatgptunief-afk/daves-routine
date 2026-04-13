'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Flame, Map, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estate', label: 'Home', icon: Map },
  { href: '/planning', label: 'Planning', icon: ListChecks },
  { href: '/streak', label: 'Streak', icon: Flame },
  { href: '/profile', label: 'Profiel', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="mx-4 mb-4 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-around">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center gap-1 px-6 py-2.5 rounded-xl flex-1 text-center"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-violet-500/20 border border-violet-500/30 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-violet-400' : 'text-white/40'}`}
                  />
                  <span className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-violet-300' : 'text-white/30'}`}>
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
