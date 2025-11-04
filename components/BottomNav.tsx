'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="safe-area-bottom border-t border-[var(--divider)] bg-[var(--surface-default)]">
      <div className="flex items-center justify-around h-20">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-16 h-16 gap-1 transition-colors ${
                active
                  ? 'text-[var(--accent-blue)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}