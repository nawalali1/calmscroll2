'use client';
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export function ConditionalBottomNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname.startsWith('/auth') || pathname === '/onboarding' || pathname === '/') return null;
  return <BottomNav />;
}
