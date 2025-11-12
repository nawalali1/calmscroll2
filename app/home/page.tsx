'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Target, 
  Wind, 
  Calendar, 
  NotebookPen,
  Activity,
  Loader,
  Home,
  Settings,
  Plus,
  X,
  Leaf,
  Sparkles
} from 'lucide-react';
import { useBreather } from '@/hooks/useBreather';
import BreatherSheet from '@/components/BreatherSheet';

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

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [stats, setStats] = useState<Stats>({ refocuses_today: 0, mindful_minutes_today: 0 });
  const [weekBars, setWeekBars] = useState<WeekBar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add Note sheet state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Breather state
  const breather = useBreather(user?.id);

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

        const [refocusesRes, minutesRes] = await Promise.all([
          supabase.from('v_refocuses_today').select('refocuses_today').single(),
          supabase.from('v_mindful_minutes_today').select('mindful_minutes_today').single(),
        ]);

        setStats({
          refocuses_today: refocusesRes.data?.refocuses_today || 0,
          mindful_minutes_today: minutesRes.data?.mindful_minutes_today || 0,
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

  const refreshRecentNotes = async (uid: string) => {
    const { data } = await supabase
      .from('notes')
      .select('id, title, content, updated_at')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false })
      .limit(3);
    setNotes(data || []);
  };

  const openAddNote = () => {
    setNoteTitle('');
    setNoteContent('');
    setSaveError(null);
    setShowAddNote(true);
  };

  const saveNote = async () => {
    if (!user) return;
    if (!noteTitle.trim() && !noteContent.trim()) {
      setSaveError('Please enter a title or some content.');
      return;
    }
    setSavingNote(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: noteTitle.trim() || null,
          content: noteContent.trim(),
        });
      if (error) throw error;

      await refreshRecentNotes(user.id);
      setShowAddNote(false);
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save note.');
    } finally {
      setSavingNote(false);
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
          <Loader size={32} style={{ color: '#16a34a' }} className="animate-spin" />
          <p style={{ color: '#16a34a', fontSize: '14px', margin: 0, fontWeight: '500' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Friend';
  const maxBarHeight = Math.max(...weekBars.map(b => b.refocuses), 1);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)', 
      paddingBottom: '80px' 
    }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px 16px' }}>
        
        {/* Header */}
        <header style={{
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#0f172a', 
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#64748b', 
            margin: 0,
            fontWeight: '400'
          }}>
            Hi, {displayName}
          </p>
        </header>

        {/* Mindful Minutes Feature Card */}
        <div 
          onClick={() => {
            console.log('🔴 CLICKED!');
            console.log('breather:', breather);
            console.log('breather.isOpen:', breather.isOpen);
            console.log('Calling setIsOpen(true)...');
            breather.setIsOpen(true);
            console.log('Calling start()...');
            breather.start();
            console.log('Done!');
          }}
          style={{
          background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
          border: '1px solid #86efac',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.15)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#166534', 
                fontWeight: '600', 
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Minute breather to stop doom scrolling
              </p>
              <h3 style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#14532d', 
                margin: '0 0 4px 0',
                lineHeight: '1'
              }}>
                {stats.mindful_minutes_today}
              </h3>
              <p style={{ 
                fontSize: '13px', 
                color: '#15803d', 
                margin: 0,
                fontWeight: '500'
              }}>
                Tap to breathe
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wind size={32} style={{ color: '#15803d' }} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '15px', 
            fontWeight: '700', 
            color: '#0f172a', 
            margin: '0 0 12px 0',
            paddingLeft: '4px',
            letterSpacing: '-0.01em'
          }}>
            Quick Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '20px 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                background: '#dcfce7', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <Target size={22} style={{ color: '#16a34a' }} strokeWidth={2} />
              </div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#0f172a', 
                lineHeight: '1'
              }}>
                {stats.refocuses_today}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Refocuses
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '20px 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                background: '#dcfce7', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <Activity size={22} style={{ color: '#16a34a' }} strokeWidth={2} />
              </div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#0f172a', 
                lineHeight: '1'
              }}>
                {stats.mindful_minutes_today}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Minutes
              </div>
            </div>
          </div>
        </div>

        {/* Week Bars */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#0f172a', 
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}>
            This Week
          </h2>
          {errors.week && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.week}</p>}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            gap: '10px', 
            height: '140px' 
          }}>
            {weekBars.map((bar) => {
              const heightPercent = maxBarHeight > 0 ? (bar.refocuses / maxBarHeight) * 100 : 0;
              return (
                <div key={bar.date_key} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '10px', 
                  height: '100%' 
                }}>
                  <div style={{ 
                    flex: 1, 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'center' 
                  }}>
                    <div 
                      style={{ 
                        width: '100%', 
                        maxWidth: '36px', 
                        height: `${Math.max(heightPercent, 10)}%`,
                        background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)', 
                        borderRadius: '8px 8px 4px 4px',
                        minHeight: '10px',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
                      }}
                    />
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#64748b', 
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {bar.day_label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interests */}
        {interests.length > 0 && (
          <section style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#0f172a', 
              margin: '0 0 16px 0',
              letterSpacing: '-0.01em'
            }}>
              Your Interests
            </h2>
            {errors.interests && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.interests}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {interests.map((interest) => (
                <span
                  key={interest.id}
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '16px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#15803d',
                    fontWeight: '600',
                  }}
                >
                  {interest.tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 20 
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#0f172a', 
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Recent Notes
            </h2>
            <button 
              onClick={openAddNote}
              style={{
                background: '#dcfce7',
                border: 'none',
                borderRadius: '12px',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Add note"
              onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>

          {errors.notes && <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>{errors.notes}</p>}
          {notes.length === 0 ? (
            <div style={{ 
              padding: '32px 16px', 
              textAlign: 'center' 
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#dcfce7',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Leaf size={28} style={{ color: '#16a34a' }} />
              </div>
              <p style={{ 
                color: '#64748b', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '500'
              }}>
                No notes yet
              </p>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                marginBottom: '16px' 
              }}>
                {notes.map((note) => (
                  <div key={note.id} style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '16px', 
                    padding: '16px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: note.title ? '8px' : 0 }}>
                      {note.title && (
                        <h3 style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: '#0f172a', 
                          margin: 0,
                          flex: 1
                        }}>
                          {note.title}
                        </h3>
                      )}
                      <Leaf size={16} style={{ color: '#16a34a', flexShrink: 0, marginLeft: '8px' }} />
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b', 
                      lineHeight: '1.6', 
                      margin: 0 
                    }}>
                      {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/calendar')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#dcfce7',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#16a34a',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
              >
                View all in Calendar
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
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 16px 0',
        maxWidth: '420px',
        margin: '0 auto'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          color: '#16a34a',
          fontSize: '12px',
          fontWeight: '600',
          padding: '8px 20px'
        }}>
          <Home size={24} strokeWidth={2.5} />
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
            gap: '6px',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: '500',
            padding: '8px 20px'
          }}
        >
          <Calendar size={24} strokeWidth={2} />
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
            gap: '6px',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: '500',
            padding: '8px 20px'
          }}
        >
          <Settings size={24} strokeWidth={2} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Add Note Sheet */}
      {showAddNote && (
        <>
          <div 
            onClick={() => setShowAddNote(false)}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0, 0, 0, 0.4)', 
              backdropFilter: 'blur(4px)',
              zIndex: 100 
            }}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: '420px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '24px 24px 0 0',
            padding: '24px',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 101
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 20 
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#0f172a',
                letterSpacing: '-0.01em'
              }}>
                New Note
              </h3>
              <button
                onClick={() => setShowAddNote(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 12,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {saveError && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: 13, 
                marginBottom: 12,
                padding: '12px',
                background: '#fee2e2',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Title (optional)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 15,
                  color: '#0f172a',
                  background: '#f8fafc',
                  fontWeight: '500'
                }}
              />
              <textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 15,
                  color: '#0f172a',
                  background: '#f8fafc',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6'
                }}
              />
              <button
                onClick={saveNote}
                disabled={savingNote}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 16,
                  border: 'none',
                  outline: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: savingNote ? 'not-allowed' : 'pointer',
                  opacity: savingNote ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {savingNote ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Breather Sheet */}
      <BreatherSheet
        isOpen={breather.isOpen}
        onClose={breather.cancel}
        seconds={breather.seconds}
        progress={breather.progress}
        isRunning={breather.isRunning}
        onStart={breather.start}
        onPause={breather.pause}
        onResume={breather.resume}
        onCancel={breather.cancel}
        onComplete={breather.complete}
      />
    </div>
  );
}