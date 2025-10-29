'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';
import { useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsChecking(false);

      // Redirect logic
      if (!user && pathname !== '/login' && !pathname.startsWith('/auth')) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={32} className="text-calm-blue-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
