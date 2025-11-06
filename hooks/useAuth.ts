'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    // initial session
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      setLoading(false);
    })();

    // listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (event === 'SIGNED_IN' && u) {
        // decide onboarding vs home
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', u.id)
          .maybeSingle();

        if (!profile || profile.onboarding_complete !== true) {
          router.replace('/onboarding');
        } else {
          router.replace('/home');
        }
      }

      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange will route
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // If confirm-email is ON, no session yet; our signup page will still route to /onboarding.
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) throw error;
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return { user, loading, login, signup, signInWithGoogle, signInWithMicrosoft, logout };
};
