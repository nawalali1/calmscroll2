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
  TrendingUp,
  TreePine,
  Loader2
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
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(34, 197, 94, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Loader2 size={32} style={{ color: '#16a34a' }} className="animate-spin" />
          <span style={{ color: '#16a34a', fontWeight: '500', fontSize: '14px' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px' 
      }}>
        <div style={{ 
          width: '420px',
          maxWidth: '100%',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: '#dcfce7',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <TreePine size={40} style={{ color: '#16a34a' }} strokeWidth={2} />
          </div>
          <h2 style={{ 
            marginBottom: '12px', 
            fontSize: '24px', 
            color: '#0f172a',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Check your email
          </h2>
          <p style={{ 
            fontSize: '15px', 
            color: '#64748b', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Please confirm your account, then log in to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{ 
              width: '100%',
              padding: '14px 20px', 
              borderRadius: '16px', 
              background: '#16a34a', 
              color: '#ffffff', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
      background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
    }}>
      <div style={{ 
        width: '740px', 
        maxWidth: '100%', 
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.2)'
          }}>
            <TreePine size={32} style={{ color: '#15803d' }} strokeWidth={2.5} />
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '12px', 
            color: '#0f172a', 
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            What interests you?
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#64748b',
            lineHeight: '1.6',
            maxWidth: '480px',
            margin: '0 auto'
          }}>
            Select topics you care about. We'll send helpful reminders based on your interests.
          </p>
        </div>

        {error && (
          <div style={{ 
            color: '#dc2626', 
            fontSize: '14px', 
            marginBottom: '24px', 
            textAlign: 'center',
            padding: '14px',
            background: '#fee2e2',
            borderRadius: '16px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Interest Categories */}
        <div style={{ marginBottom: '32px' }}>
          {INTEREST_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.title} style={{ marginBottom: '32px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#dcfce7',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComponent 
                      size={18} 
                      style={{ color: '#16a34a' }} 
                      strokeWidth={2}
                    />
                  </div>
                  <h3 style={{ 
                    fontSize: '17px', 
                    fontWeight: '700', 
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    {category.title}
                  </h3>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px',
                  paddingLeft: '46px',
                }}>
                  {category.interests.map(tag => {
                    const isSelected = selected.has(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          background: isSelected ? '#dcfce7' : '#ffffff',
                          color: isSelected ? '#15803d' : '#64748b',
                          fontWeight: isSelected ? '600' : '500',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }
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

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ 
            textAlign: 'center', 
            fontSize: '14px', 
            color: '#64748b',
            fontWeight: '600'
          }}>
            {selected.size} interest{selected.size !== 1 ? 's' : ''} selected
          </div>
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? 'Saving...' : 'Continue to CalmScroll'}
          </button>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '13px', 
            color: '#94a3b8', 
            margin: 0,
            fontWeight: '500'
          }}>
            You can change these later in settings
          </p>
        </div>
      </div>
    </div>
  );
}