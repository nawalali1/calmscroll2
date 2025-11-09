'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Brain, 
  Heart, 
  Activity, 
  Target, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

const INTEREST_CATEGORIES = [
  {
    title: 'Mindfulness & Wellbeing',
    icon: Brain,
    interests: [
      'Mindful breaks',
      'Breathing exercises',
      'Meditation',
      'Gratitude journaling',
      'Digital detox',
      'Calm soundscapes',
    ],
  },
  {
    title: 'Personal Growth',
    icon: Sparkles,
    interests: [
      'Reading time',
      'Learning something new',
      'Journaling',
      'Habit building',
      'Productivity tips',
      'Self-improvement',
    ],
  },
  {
    title: 'Health & Body',
    icon: Heart,
    interests: [
      'Fitness & movement',
      'Stretch reminders',
      'Hydration',
      'Nutrition & balance',
      'Sleep hygiene',
      'Mindful eating',
    ],
  },
  {
    title: 'Focus & Work',
    icon: Target,
    interests: [
      'Pomodoro focus',
      'Deep work',
      'Goal tracking',
      'Reflection & planning',
      'Time management',
    ],
  },
  {
    title: 'Inspiration & Motivation',
    icon: Activity,
    interests: [
      'Daily quotes',
      'Creative inspiration',
      'Minimalism',
      'Success stories',
      'Positive affirmations',
    ],
  },
  {
    title: 'Life & Goals',
    icon: TrendingUp,
    interests: [
      'Career growth',
      'Personal finance',
      'Self-discipline',
      'Mental health',
      'Life balance',
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndInterests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        setUser(user);

        const { data: interests } = await supabase
          .from('interests')
          .select('tag')
          .eq('user_id', user.id);

        if (interests) {
          setSelected(new Set(interests.map((i: any) => i.tag)));
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndInterests();
  }, [supabase]);

  const toggleInterest = (tag: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const finish = async () => {
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      const { error: deleteError } = await supabase
        .from('interests')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      if (selected.size > 0) {
        const interests = Array.from(selected).map(tag => ({
          user_id: user.id,
          tag,
        }));

        const { error: insertError } = await supabase
          .from('interests')
          .insert(interests);

        if (insertError) throw insertError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, onboarding_complete: true },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;

      router.replace('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748B' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 360, border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12, fontSize: 20, color: '#1E293B' }}>Check your email</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>
            Please confirm your account, then log in to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              borderRadius: 8, 
              background: '#6366F1', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 20,
      background: '#F8FAFC',
    }}>
      <div style={{ 
        width: 720, 
        maxWidth: '100%', 
        border: '1px solid #e2e8f0', 
        borderRadius: 12, 
        padding: 32, 
        background: '#fff',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8, color: '#1E293B', fontWeight: '600' }}>
            What are you interested in?
          </h1>
          <p style={{ fontSize: 15, color: '#64748B' }}>
            We'll send you helpful reminders based on your interests
          </p>
        </div>

        {error && (
          <div style={{ 
            color: '#b91c1c', 
            fontSize: 14, 
            marginBottom: 20, 
            textAlign: 'center',
            padding: '10px',
            background: '#FEE2E2',
            borderRadius: 8,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          {INTEREST_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.title} style={{ marginBottom: 28 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 12,
                }}>
                  <IconComponent 
                    size={18} 
                    style={{ color: '#6366F1' }} 
                  />
                  <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#334155',
                    margin: 0,
                  }}>
                    {category.title}
                  </h3>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 8,
                  paddingLeft: 26,
                }}>
                  {category.interests.map(tag => {
                    const isSelected = selected.has(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: isSelected ? '2px solid #6366F1' : '1px solid #E2E8F0',
                          background: isSelected ? '#EEF2FF' : '#FFFFFF',
                          color: isSelected ? '#4F46E5' : '#64748B',
                          fontWeight: isSelected ? '500' : '400',
                          cursor: 'pointer',
                          fontSize: 14,
                          transition: 'all 0.2s',
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ 
          borderTop: '1px solid #E2E8F0', 
          paddingTop: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ 
            textAlign: 'center', 
            fontSize: 13, 
            color: '#64748B',
          }}>
            {selected.size} interest{selected.size !== 1 ? 's' : ''} selected
          </div>
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 8,
              background: '#6366F1',
              color: '#fff',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            {saving ? 'Saving...' : 'Finish onboarding'}
          </button>
          <p style={{ 
            textAlign: 'center', 
            fontSize: 12, 
            color: '#94A3B8', 
            margin: 0,
          }}>
            You can change these later in settings
          </p>
        </div>
      </div>
    </div>
  );
}