'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Target, 
  Wind, 
  Flame, 
  Calendar, 
  NotebookPen, 
  Activity,
  Loader,
  Home,
  Settings,
  X
} from 'lucide-react';

interface Profile {
  display_name?: string;
  email?: string;
}

interface Interest {
  id: string;
  tag: string;
}

interface Stats {
  refocuses_today: number;
  mindful_minutes_today: number;
  streak: number;
}

interface WeekBar {
  date_key: string;
  day_label: string;
  refocuses: number;
}

interface Note {
  id: string;
  title?: string;
  content: string;
  updated_at: string;
}

function BreatherSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 100
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '420px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px 24px 0 0',
        padding: '24px',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
        zIndex: 101
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Take a Breather</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(100, 116, 139, 0.1)',
              border: 'none',
              borderRadius: '12px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1'
          }}>
            <Wind size={48} />
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Breathing exercise placeholder</p>
          <div style={{ width: '100%', height: '8px', background: 'rgba(226, 232, 240, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)' }} />
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '12px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [stats, setStats] = useState<Stats>({ refocuses_today: 0, mindful_minutes_today: 0, streak: 0 });
  const [weekBars, setWeekBars] = useState<WeekBar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBreather, setShowBreather] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace('/login');
          return;
        }

        setUser(user);

        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single();

        if (profileErr) setErrors(prev => ({ ...prev, profile: profileErr.message }));
        else setProfile(profileData || { email: user.email });

        const { data: interestsData, error: interestsErr } = await supabase
          .from('interests')
          .select('id, tag')
          .eq('user_id', user.id);

        if (interestsErr) setErrors(prev => ({ ...prev, interests: interestsErr.message }));
        else setInterests(interestsData || []);

        const [refocusesRes, minutesRes, streakRes] = await Promise.all([
          supabase.from('v_refocuses_today').select('refocuses_today').single(),
          supabase.from('v_mindful_minutes_today').select('mindful_minutes_today').single(),
          supabase.from('v_refocus_streak').select('streak').single(),
        ]);

        setStats({
          refocuses_today: refocusesRes.data?.refocuses_today || 0,
          mindful_minutes_today: minutesRes.data?.mindful_minutes_today || 0,
          streak: streakRes.data?.streak || 0,
        });

        const { data: weekData, error: weekErr } = await supabase
          .from('v_week_refocus_bars')
          .select('date_key, day_label, refocuses')
          .order('date_key');

        if (weekErr) setErrors(prev => ({ ...prev, week: weekErr.message }));
        else setWeekBars(weekData || []);

        const { data: notesData, error: notesErr } = await supabase
          .from('notes')
          .select('id, title, content, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);

        if (notesErr) setErrors(prev => ({ ...prev, notes: notesErr.message }));
        else setNotes(notesData || []);

      } catch (err: any) {
        setErrors({ general: err?.message || 'Failed to load' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Loader size={32} style={{ color: '#6366f1' }} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Friend';
  const maxBarHeight = Math.max(...weekBars.map(b => b.refocuses), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf3 100%)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px 16px' }}>
        
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Hi, {displayName}</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => console.log('new-note')}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '14px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6366f1'
              }}
              title="New note"
            >
              <NotebookPen size={18} />
            </button>
            <button 
              onClick={() => setShowBreather(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '14px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6366f1'
              }}
              title="Breathing"
            >
              <Wind size={18} />
            </button>
            <button 
              onClick={() => console.log('refocus')}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '14px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6366f1'
              }}
              title="Refocus"
            >
              <Target size={18} />
            </button>
          </div>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '20px',
            padding: '16px 12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Target size={20} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>{stats.refocuses_today}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Refocuses</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '20px',
            padding: '16px 12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Activity size={20} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>{stats.mindful_minutes_today}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Minutes</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '20px',
            padding: '16px 12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Flame size={20} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>{stats.streak}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Streak</div>
          </div>
        </div>

        {/* Week Bars */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px 0' }}>This Week</h2>
          {errors.week && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.week}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {weekBars.map((bar) => {
              const heightPercent = maxBarHeight > 0 ? (bar.refocuses / maxBarHeight) * 100 : 0;
              return (
                <div key={bar.date_key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div 
                      style={{ 
                        width: '100%', 
                        maxWidth: '32px', 
                        height: `${Math.max(heightPercent, 8)}%`,
                        background: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)', 
                        borderRadius: '6px 6px 3px 3px',
                        minHeight: '8px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>{bar.day_label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interests */}
        {interests.length > 0 && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px 0' }}>Your Interests</h2>
            {errors.interests && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.interests}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => console.log('Interest:', interest.tag)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '16px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: '#4f46e5',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {interest.tag}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px 0' }}>Recent Notes</h2>
          {errors.notes && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.notes}</p>}
          {notes.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px 0', margin: 0 }}>No notes yet</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {notes.map((note) => (
                  <div key={note.id} style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', padding: '14px 16px' }}>
                    {note.title && <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>{note.title}</h3>}
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                      {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/notes')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  color: '#6366f1',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View all
              </button>
            </>
          )}
        </section>

      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        maxWidth: '420px',
        margin: '0 auto'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: '#6366f1',
          fontSize: '11px',
          fontWeight: '500',
          padding: '8px 20px'
        }}>
          <Home size={20} />
          <span>Home</span>
        </button>
        <button 
          onClick={() => router.push('/calendar')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: '500',
            padding: '8px 20px'
          }}
        >
          <Calendar size={20} />
          <span>Calendar</span>
        </button>
        <button 
          onClick={() => router.push('/settings')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: '500',
            padding: '8px 20px'
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Breather Sheet */}
      <BreatherSheet isOpen={showBreather} onClose={() => setShowBreather(false)} />
    </div>
  );
}