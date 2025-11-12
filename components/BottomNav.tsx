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
    <nav style={{
      position: 'sticky',
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
      paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '12px 16px 8px',
        maxWidth: '420px',
        margin: '0 auto'
      }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 20px',
                borderRadius: '16px',
                background: active 
                  ? 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)' 
                  : 'transparent',
                color: active ? '#15803d' : '#64748b',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                minWidth: '80px'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <Icon 
                size={24} 
                strokeWidth={active ? 2.5 : 2}
              />
              <span style={{
                fontSize: '11px',
                fontWeight: active ? '700' : '500',
                letterSpacing: '0.02em'
              }}>
                {label}
              </span>
              
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '16px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)'
                }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}