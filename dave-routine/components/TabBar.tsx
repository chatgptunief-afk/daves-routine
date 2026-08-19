'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sunrise, Target, Layers, User } from 'lucide-react';
import { m } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Vandaag', icon: Sunrise },
  { href: '/doelen', label: 'Doelen', icon: Target },
  { href: '/muur', label: 'Muur', icon: Layers },
  { href: '/ik', label: 'Ik', icon: User },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/welkom') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="mx-auto max-w-[430px] pointer-events-auto">
        <div
          className="mx-6 mb-3 flex items-center justify-around h-[52px] rounded-full backdrop-blur-xl"
          style={{ background: 'rgba(10,10,15,0.55)', border: '1px solid rgba(245,241,232,0.09)' }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'text-ember-400' : 'text-paper-44'}
                />
                {isActive && (
                  <m.span
                    layoutId="nav-dot"
                    className="absolute bottom-[9px] w-[3px] h-[3px] rounded-full bg-ember-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
