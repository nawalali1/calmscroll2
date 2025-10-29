'use client';

import { useCallback, useEffect, useState } from 'react';
import { listReminders, scheduleReminder, updateReminder, listInterests, saveInterests } from '@/lib/db';
import type { Reminder, Interest, ScheduleReminderInput } from '@/lib/validations';

export const useReminders = (userId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await listReminders(userId);
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchInterests = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await listInterests(userId);
      setInterests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interests');
    }
  }, [userId]);

  useEffect(() => {
    fetchReminders();
    fetchInterests();
  }, [fetchReminders, fetchInterests]);

  const createReminder = useCallback(
    async (input: ScheduleReminderInput) => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const newReminder = await scheduleReminder({ ...input, user_id: userId });
        setReminders((prev) => [...prev, newReminder]);
        return newReminder;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create reminder';
        setError(msg);
        throw err;
      }
    },
    [userId]
  );

  const cancelReminder = useCallback(async (reminderId: string) => {
    try {
      const updated = await updateReminder(reminderId, 'canceled');
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? updated : r))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel reminder';
      setError(msg);
      throw err;
    }
  }, []);

  const updateInterests = useCallback(
    async (tags: string[]) => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const updated = await saveInterests(userId, tags);
        setInterests(updated);
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save interests';
        setError(msg);
        throw err;
      }
    },
    [userId]
  );

  return {
    reminders,
    interests,
    loading,
    error,
    createReminder,
    cancelReminder,
    updateInterests,
  };
};