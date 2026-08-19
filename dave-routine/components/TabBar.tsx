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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-[430px]">
        <div className="mx-4 mb-4 border-t border-line bg-ink-850/85 backdrop-blur-xl">
          <div className="flex items-stretch justify-around h-14">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-1 flex-1 text-center min-w-[64px]"
                >
                  {isActive && (
                    <m.div
                      layoutId="nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-ember-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className={isActive ? 'text-ember-500' : 'text-paper-56'}
                  />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-ember-500' : 'text-paper-56'}`}>
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
