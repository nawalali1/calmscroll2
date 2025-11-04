'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
          setUser(null);
        } else {
          setUser(user || null);
        }
      } catch (err) {
        console.error('Get user error:', err);
        setError(err instanceof Error ? err.message : 'Auth error');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
    }
  };

  const signup = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithMicrosoft = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { 
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    signInWithGoogle,
    signInWithMicrosoft,
  };
};
