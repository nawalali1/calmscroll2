'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Bell, Clock, User, Bookmark, Sparkles, Save, Loader2, Home, Calendar, Settings, Leaf } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type ReminderPrefs = {
  dailyReminder: boolean;
  streakAlerts: boolean;
  weeklySummary: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [prefs, setPrefs] = useState<ReminderPrefs>({
    dailyReminder: true,
    streakAlerts: true,
    weeklySummary: false,
  });

  // --- Data loading ---
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserId(user.id || null);
        setEmail(user.email || '');

        // Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
        setDisplayName(profile?.display_name || '');

        // Interests
        const { data: ints } = await supabase
          .from('interests')
          .select('tag')
          .eq('user_id', user.id);
        setInterests((ints || []).map((r: any) => r.tag));

        // Reminder settings (if table exists in your schema)
        const { data: rs } = await supabase
          .from('reminder_settings')
          .select('daily_reminder, streak_alerts, weekly_summary')
          .eq('user_id', user.id)
          .maybeSingle();

        if (rs) {
          setPrefs({
            dailyReminder: !!rs.daily_reminder,
            streakAlerts: !!rs.streak_alerts,
            weeklySummary: !!rs.weekly_summary,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Actions ---
  const saveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    setSaveMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', userId);
      if (error) {
        setSaveMessage({ type: 'error', text: 'Failed to save: ' + error.message });
        throw error;
      }
      setSaveMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error('Save profile failed:', e);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async () => {
    if (!userId) return;
    setSavingPrefs(true);
    try {
      // Upsert by user_id as primary key in your schema
      const { error } = await supabase.from('reminder_settings').upsert(
        {
          user_id: userId,
          daily_reminder: prefs.dailyReminder,
          streak_alerts: prefs.streakAlerts,
          weekly_summary: prefs.weeklySummary,
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
    } finally {
      setSavingPrefs(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } finally {
      setSigningOut(false);
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
          <span style={{ color: '#16a34a', fontWeight: '500', fontSize: '14px' }}>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
      paddingBottom: '100px'
    }}>
      <div style={{
        maxWidth: '420px',
        margin: '0 auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{
          paddingTop: '12px',
          marginBottom: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <Settings size={32} style={{ color: '#16a34a' }} strokeWidth={2} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Settings
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            Manage your profile and preferences
          </p>
        </div>

        {/* Success/Error Message */}
        {saveMessage && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: saveMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${saveMessage.type === 'success' ? '#86efac' : '#fecaca'}`,
            color: saveMessage.type === 'success' ? '#15803d' : '#dc2626',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span>{saveMessage.type === 'success' ? '✓' : '✕'}</span>
            {saveMessage.text}
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}>
            Profile
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={32} style={{ color: '#16a34a' }} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '4px'
              }}>
                {email?.split('@')[0] || 'User'}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {email}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Display name
            </label>
            <input
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                fontSize: '15px',
                color: '#0f172a',
                background: '#f8fafc',
                fontWeight: '500'
              }}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name as shown in the app"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={savingProfile}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '16px',
              border: 'none',
              outline: 'none',
              background: '#16a34a',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '15px',
              cursor: savingProfile ? 'not-allowed' : 'pointer',
              opacity: savingProfile ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Save size={18} strokeWidth={2} />
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </div>

        {/* Interests */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
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

          {interests.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '16px'
            }}>
              <Leaf size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                No interests selected yet
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {interests.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '16px',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push('/onboarding')}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
          >
            <Bookmark size={16} strokeWidth={2} />
            Edit interests
          </button>
        </div>

        {/* Preferences */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}>
            Preferences
          </h2>

          {/* Notifications Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={20} style={{ color: '#16a34a' }} strokeWidth={2} />
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  color: '#0f172a',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  Notifications
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Enable daily updates and nudges
                </div>
              </div>
            </div>
            <div
              role="switch"
              aria-checked={prefs.dailyReminder}
              onClick={() => setPrefs((p) => ({ ...p, dailyReminder: !p.dailyReminder }))}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '999px',
                background: prefs.dailyReminder ? '#16a34a' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.25s',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '999px',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                position: 'absolute',
                top: '2px',
                left: prefs.dailyReminder ? '24px' : '2px',
                transition: 'left 0.25s'
              }} />
            </div>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', margin: '0 -24px' }} />

          {/* Breathing Reminders Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={20} style={{ color: '#16a34a' }} strokeWidth={2} />
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  color: '#0f172a',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  Breathing Reminders
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Mindful breathing prompts
                </div>
              </div>
            </div>
            <div
              role="switch"
              aria-checked={prefs.streakAlerts}
              onClick={() => setPrefs((p) => ({ ...p, streakAlerts: !p.streakAlerts }))}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '999px',
                background: prefs.streakAlerts ? '#16a34a' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.25s',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '999px',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                position: 'absolute',
                top: '2px',
                left: prefs.streakAlerts ? '24px' : '2px',
                transition: 'left 0.25s'
              }} />
            </div>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', margin: '0 -24px' }} />

          {/* Weekly Summary Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={20} style={{ color: '#16a34a' }} strokeWidth={2} />
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  color: '#0f172a',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  Weekly Summary
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Highlights of your week
                </div>
              </div>
            </div>
            <div
              role="switch"
              aria-checked={prefs.weeklySummary}
              onClick={() => setPrefs((p) => ({ ...p, weeklySummary: !p.weeklySummary }))}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '999px',
                background: prefs.weeklySummary ? '#16a34a' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.25s',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '999px',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                position: 'absolute',
                top: '2px',
                left: prefs.weeklySummary ? '24px' : '2px',
                transition: 'left 0.25s'
              }} />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={savePrefs}
              disabled={savingPrefs}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '16px',
                border: 'none',
                outline: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: savingPrefs ? 'not-allowed' : 'pointer',
                opacity: savingPrefs ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <Save size={18} strokeWidth={2} />
              {savingPrefs ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* About */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 16px 0',
            letterSpacing: '-0.01em'
          }}>
            About
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0'
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              App Version
            </div>
            <div style={{
              color: '#16a34a',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              1.0.0
            </div>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0' }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0'
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              Build
            </div>
            <div style={{
              color: '#64748b',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              2025.11
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          disabled={signingOut}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            background: '#fee2e2',
            color: '#dc2626',
            fontWeight: '700',
            fontSize: '15px',
            cursor: signingOut ? 'not-allowed' : 'pointer',
            opacity: signingOut ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!signingOut) e.currentTarget.style.background = '#fecaca';
          }}
          onMouseLeave={(e) => {
            if (!signingOut) e.currentTarget.style.background = '#fee2e2';
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b',
          fontWeight: '500',
          margin: '8px 0 0 0',
          lineHeight: '1.6'
        }}>
          CalmScroll helps you break the doom scroll.
          <br />
          Reset, plan, and refocus.
        </p>
      </div>

      {/* Bottom Nav */}
      <BottomNav />

      

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}