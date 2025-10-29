import { createClient as createBrowserClient } from './supabase/client';
import type { Note, CreateNoteInput, UpdateNoteInput, Interest, Reminder, ScheduleReminderInput, Profile, UpdateProfileInput, BreathSession, LogBreathSessionInput } from './validations';

const createClient = () => createBrowserClient();

// PROFILE QUERIES
export const fetchProfile = async (userId: string) => {
  const client = createClient();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
  return data as Profile;
};

export const upsertProfile = async (profile: Profile) => {
  const client = createClient();
  const { data, error } = await client
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(`Failed to upsert profile: ${error.message}`);
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: UpdateProfileInput) => {
  const client = createClient();
  const { data, error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as Profile;
};

// NOTE QUERIES
export const listNotes = async (
  userId: string,
  opts?: { limit?: number; orderBy?: 'updated_at' | 'created_at' }
) => {
  const client = createClient();
  const orderCol = opts?.orderBy || 'updated_at';
  const limit = opts?.limit || 50;

  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order(orderCol, { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list notes: ${error.message}`);
  return (data || []) as Note[];
};

export const listNotesByDateRange = async (
  userId: string,
  from: Date,
  to: Date
) => {
  const client = createClient();
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .gte('due_at', from.toISOString())
    .lte('due_at', to.toISOString())
    .order('due_at', { ascending: true });

  if (error) throw new Error(`Failed to list notes by date: ${error.message}`);
  return (data || []) as Note[];
};

export const searchNotes = async (userId: string, query: string) => {
  const client = createClient();
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,mood.ilike.%${query}%`)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to search notes: ${error.message}`);
  return (data || []) as Note[];
};

export const createNote = async (note: CreateNoteInput & { user_id: string }) => {
  const client = createClient();
  const { data, error } = await client
    .from('notes')
    .insert([note])
    .select()
    .single();

  if (error) throw new Error(`Failed to create note: ${error.message}`);
  return data as Note;
};

export const updateNote = async (noteId: string, updates: UpdateNoteInput) => {
  const client = createClient();
  const { data, error } = await client
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update note: ${error.message}`);
  return data as Note;
};

export const deleteNote = async (noteId: string) => {
  const client = createClient();
  const { error } = await client.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(`Failed to delete note: ${error.message}`);
};

// INTEREST QUERIES
export const listInterests = async (userId: string) => {
  const client = createClient();
  const { data, error } = await client
    .from('interests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list interests: ${error.message}`);
  return (data || []) as Interest[];
};

export const saveInterests = async (userId: string, tags: string[]) => {
  const client = createClient();

  // Delete old interests
  await client.from('interests').delete().eq('user_id', userId);

  // Insert new ones
  const { data, error } = await client
    .from('interests')
    .insert(tags.map((tag) => ({ user_id: userId, tag })))
    .select();

  if (error) throw new Error(`Failed to save interests: ${error.message}`);
  return (data || []) as Interest[];
};

// REMINDER QUERIES
export const listReminders = async (userId: string) => {
  const client = createClient();
  const { data, error } = await client
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true });

  if (error) throw new Error(`Failed to list reminders: ${error.message}`);
  return (data || []) as Reminder[];
};

export const scheduleReminder = async (
  reminder: ScheduleReminderInput & { user_id: string }
) => {
  const client = createClient();
  const { data, error } = await client
    .from('reminders')
    .insert([reminder])
    .select()
    .single();

  if (error) throw new Error(`Failed to schedule reminder: ${error.message}`);
  return data as Reminder;
};

export const updateReminder = async (
  reminderId: string,
  status: 'scheduled' | 'sent' | 'canceled'
) => {
  const client = createClient();
  const { data, error } = await client
    .from('reminders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update reminder: ${error.message}`);
  return data as Reminder;
};

// BREATH SESSION QUERIES
export const logBreathSession = async (
  session: LogBreathSessionInput & { user_id: string }
) => {
  const client = createClient();
  const { data, error } = await client
    .from('breath_sessions')
    .insert([{ ...session, duration_seconds: 60 }])
    .select()
    .single();

  if (error) throw new Error(`Failed to log breath session: ${error.message}`);
  return data as BreathSession;
};

export const listBreathSessions = async (userId: string) => {
  const client = createClient();
  const { data, error } = await client
    .from('breath_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(`Failed to list breath sessions: ${error.message}`);
  return (data || []) as BreathSession[];
};

// METRICS/STATS
export const getDailyStats = async (userId: string) => {
  const client = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [notesData, sessionsData, metricsData] = await Promise.all([
    client
      .from('notes')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString()),
    client
      .from('breath_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('started_at', today.toISOString()),
    client
      .from('metrics')
      .select('streak')
      .eq('user_id', userId)
      .single(),
  ]);

  const completedToday = notesData.data?.length || 0;
  const mindfulToday = sessionsData.data?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
  const streak = metricsData.data?.streak || 0;

  return { completedToday, mindfulToday, streak };
};
