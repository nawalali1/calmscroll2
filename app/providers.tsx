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

  // Check auth only once on mount
  useEffect(() => {
    setIsClient(true);
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Only redirect if we have a definitive user state
        if (!user && pathname !== '/login' && !pathname.startsWith('/auth')) {
          router.push('/login');
        } else if (user && pathname === '/login') {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - run only once on mount

  if (!isClient || isChecking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={32} className="text-calm-blue-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}