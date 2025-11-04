'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user && pathname !== '/login' && !pathname.startsWith('/auth')) {
          router.replace('/login');
        } else if (user && pathname === '/login') {
          router.replace('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Also listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, [pathname, router]);

  if (!isClient || isChecking) {
    return <div className="flex-1 flex items-center justify-center"><Loader size={32} className="animate-spin" /></div>;
  }
  return <>{children}</>;
}
