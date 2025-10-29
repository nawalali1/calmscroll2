'use client';

import { useEffect, useState, useCallback } from 'react';
import { logBreathSession } from '@/lib/db';

export const useBreather = (userId?: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = ((60 - seconds) / 60) * 100;

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
    setSessionStarted(true);
    setSeconds(60);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const cancel = useCallback(() => {
    setIsOpen(false);
    setIsRunning(false);
    setSeconds(60);
    setSessionStarted(false);
  }, []);

  const complete = useCallback(async () => {
    if (!userId) return;

    try {
      await logBreathSession({
        user_id: userId,
        duration_seconds: 60,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setIsOpen(false);
      setSessionStarted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log session');
    }
  }, [userId]);

  useEffect(() => {
    if (seconds === 0 && sessionStarted) {
      complete();
    }
  }, [seconds, sessionStarted, complete]);

  return {
    isOpen,
    setIsOpen,
    isRunning,
    seconds,
    progress,
    start,
    pause,
    resume,
    cancel,
    complete,
    error,
  };
};