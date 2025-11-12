'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CalendarDays, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2, Check, Home, Calendar, Settings, Leaf } from 'lucide-react';

interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}

interface GroupedNotes {
  [dateKey: string]: Note[];
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [groupedNotes, setGroupedNotes] = useState<GroupedNotes>({});
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        console.log('Auth check:', { user: user?.id, error: authError });
        
        if (authError || !user) {
          console.error('Auth error - redirecting:', authError);
          router.replace('/login');
          return;
        }

        console.log('Fetching notes for user:', user.id);
        
        const { data, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('Supabase response:', { 
          hasData: !!data, 
          dataLength: data?.length,
          error: notesError,
          errorCode: notesError?.code,
          errorMessage: notesError?.message,
          errorDetails: notesError?.details
        });

        if (notesError) {
          console.error('Notes fetch error:', notesError);
          setError(notesError.message || 'Failed to load notes. Check RLS policies in Supabase.');
        } else {
          console.log('Notes loaded successfully:', data?.length || 0, 'notes');
          setNotes(data || []);
          setFilteredNotes(data || []);
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(err?.message || 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [router, supabase]);

  // Filter and group notes
  useEffect(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        (note.title?.toLowerCase().includes(query)) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Selected date filter
    if (selectedDate) {
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.created_at);
        const dateKey = noteDate.toISOString().split('T')[0];
        return dateKey === selectedDate;
      });
    }

    setFilteredNotes(filtered);

    // Group by date
    const grouped = filtered.reduce((acc: GroupedNotes, note) => {
      const date = new Date(note.created_at);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(note);
      return acc;
    }, {});

    setGroupedNotes(grouped);
  }, [notes, searchQuery, selectedDate]);

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        setError(deleteError.message);
        return;
      }

      setNotes(notes.filter(n => n.id !== noteId));
      console.log('Note deleted:', noteId);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.message || 'Failed to delete note');
    }
  };

  const handleToggleComplete = async (note: Note) => {
    try {
      const newCompletedStatus = !note.completed;
      
      const { error: updateError } = await supabase
        .from('notes')
        .update({ completed: newCompletedStatus })
        .eq('id', note.id);

      if (updateError) {
        console.error('Update error:', updateError);
        setError(updateError.message);
        return;
      }

      setNotes(notes.map(n => 
        n.id === note.id ? { ...n, completed: newCompletedStatus } : n
      ));
      console.log('Note toggled:', note.id, newCompletedStatus);
    } catch (err: any) {
      console.error('Toggle error:', err);
      setError(err?.message || 'Failed to update note');
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getNotesForDate = (dateKey: string) => {
    const noteDate = new Date(dateKey);
    return notes.filter(note => {
      const nDate = new Date(note.created_at);
      return nDate.toISOString().split('T')[0] === noteDate.toISOString().split('T')[0];
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (dateKey: string) => {
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toDateString();
    const todayOnly = today.toDateString();
    const yesterdayOnly = yesterday.toDateString();

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === yesterdayOnly) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (string | null)[] = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    calendarDays.push(dateKey);
  }

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
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const dateKeys = Object.keys(groupedNotes).sort().reverse();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
      paddingBottom: '100px'
    }}>
      <div style={{
        maxWidth: '420px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '24px',
          paddingTop: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <CalendarDays size={32} style={{ color: '#16a34a' }} strokeWidth={2} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Calendar & Notes
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            {selectedDate ? 'Viewing notes for ' + formatDate(selectedDate) : 'Select a date to view notes'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '16px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Calendar Grid */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Month Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <button
              onClick={handlePrevMonth}
              style={{
                background: '#dcfce7',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#16a34a',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              style={{
                background: '#dcfce7',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#16a34a',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Day Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            marginBottom: '10px'
          }}>
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#64748b',
                  padding: '8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px'
          }}>
            {calendarDays.map((dateKey, idx) => {
              if (!dateKey) {
                return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
              }

              const dayNotes = getNotesForDate(dateKey);
              const hasNotes = dayNotes.length > 0;
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              const dayNum = new Date(dateKey).getDate();

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateClick(dateKey)}
                  style={{
                    aspectRatio: '1',
                    border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    background: isSelected 
                      ? '#dcfce7' 
                      : isToday 
                      ? '#f0fdf4'
                      : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isToday || isSelected ? '700' : '600',
                    color: isSelected || isToday ? '#16a34a' : '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday ? '#f0fdf4' : '#ffffff';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {dayNum}
                  {hasNotes && (
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: isSelected ? '#16a34a' : '#4ade80'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '14px 18px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Search size={20} style={{ color: '#64748b', flexShrink: 0 }} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: '#0f172a',
              outline: 'none',
              fontWeight: '500'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '13px',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Clear Date Filter Button */}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
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
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
          >
            Show All Notes
          </button>
        )}

        {/* Notes Count */}
        {filteredNotes.length > 0 && (
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '16px',
            fontWeight: '600',
            paddingLeft: '4px'
          }}>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedDate && ` on ${formatDate(selectedDate)}`}
          </div>
        )}

        {/* Notes List */}
        {dateKeys.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '48px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: '#dcfce7',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CalendarDays size={36} style={{ color: '#16a34a' }} strokeWidth={2} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              No notes found
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              {searchQuery || selectedDate ? 'Try adjusting your filters' : 'Add notes from your home page'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {dateKeys.map(dateKey => (
              <div key={dateKey}>
                {/* Date Header */}
                {!selectedDate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    paddingLeft: '4px'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '28px',
                      background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
                      borderRadius: '2px'
                    }} />
                    <h2 style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      letterSpacing: '-0.01em'
                    }}>
                      {formatDate(dateKey)}
                    </h2>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '600'
                    }}>
                      {groupedNotes[dateKey].length} {groupedNotes[dateKey].length === 1 ? 'note' : 'notes'}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {groupedNotes[dateKey].map(note => {
                    const isExpanded = expandedNotes.has(note.id);
                    const hasTitle = note.title && note.title.trim();
                    const contentPreview = note.content.length > 120 
                      ? note.content.substring(0, 120) + '...' 
                      : note.content;

                    return (
                      <div
                        key={note.id}
                        style={{
                          background: note.completed ? '#f8fafc' : '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '20px',
                          padding: '18px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px'
                        }}>
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleComplete(note)}
                            style={{
                              width: '28px',
                              height: '28px',
                              minWidth: '28px',
                              borderRadius: '10px',
                              border: note.completed ? '2px solid #16a34a' : '2px solid #cbd5e1',
                              background: note.completed ? '#16a34a' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              marginTop: '2px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {note.completed && <Check size={18} strokeWidth={3} />}
                          </button>

                          {/* Content */}
                          <div 
                            style={{ 
                              flex: 1,
                              cursor: note.content.length > 120 ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (note.content.length > 120) {
                                toggleNoteExpansion(note.id);
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: hasTitle ? '8px' : 0 }}>
                              {hasTitle && (
                                <h3 style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: note.completed ? '#64748b' : '#0f172a',
                                  margin: 0,
                                  textDecoration: note.completed ? 'line-through' : 'none',
                                  flex: 1
                                }}>
                                  {note.title}
                                </h3>
                              )}
                              <Leaf size={18} style={{ color: '#16a34a', flexShrink: 0, marginLeft: '8px' }} strokeWidth={2} />
                            </div>
                            <p style={{
                              fontSize: '15px',
                              color: note.completed ? '#94a3b8' : '#475569',
                              lineHeight: '1.6',
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              textDecoration: note.completed ? 'line-through' : 'none'
                            }}>
                              {isExpanded ? note.content : contentPreview}
                            </p>
                            {note.content.length > 120 && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '10px',
                                fontSize: '13px',
                                color: '#16a34a',
                                fontWeight: '600'
                              }}>
                                {isExpanded ? (
                                  <>Show less <ChevronUp size={16} /></>
                                ) : (
                                  <>Show more <ChevronDown size={16} /></>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              width: '36px',
                              height: '36px',
                              minWidth: '36px',
                              borderRadius: '12px',
                              border: 'none',
                              background: '#fee2e2',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#dc2626',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        </div>

                        {/* Timestamp */}
                        <div style={{
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px solid #e2e8f0',
                          fontSize: '12px',
                          color: '#94a3b8',
                          fontWeight: '600'
                        }}>
                          {new Date(note.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
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
        <button
          onClick={() => router.push('/home')}
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
          <Home size={24} strokeWidth={2} />
          <span>Home</span>
        </button>
        <button
          style={{
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
          }}
        >
          <Calendar size={24} strokeWidth={2.5} />
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
    </div>
  );
}