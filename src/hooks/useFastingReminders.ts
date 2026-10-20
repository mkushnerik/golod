import { useEffect } from 'react';
import { FastingSession } from '@/lib/supabase';
import { MASCOT_IMAGE } from '@/lib/mascot';

const STORAGE_KEY = 'fasting-reminder-state';
const DAY_MS = 24 * 60 * 60 * 1000;
const REPEAT_MS = 6 * 60 * 60 * 1000;

interface ReminderState {
  sessionId: string;
  lastSentAt: number;
}

function readState(): ReminderState | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as ReminderState) : null;
  } catch {
    return null;
  }
}

export function useFastingReminders(active: boolean, history: FastingSession[]): void {
  useEffect(() => {
    if (active || !('Notification' in window) || Notification.permission !== 'granted') return;

    const check = () => {
      const latest = history.find((session) => session.end_time);
      if (!latest?.end_time) return;
      const endedAt = new Date(latest.end_time).getTime();
      const now = Date.now();
      if (now - endedAt < DAY_MS) return;

      const previous = readState();
      if (previous?.sessionId === latest.id && now - previous.lastSentAt < REPEAT_MS) return;

      try {
        new Notification('Крош ждёт тебя', {
          body: 'Прошло 24 часа после последнего голодания. Запусти новый трекер, когда будешь готов.',
          icon: MASCOT_IMAGE,
          badge: MASCOT_IMAGE,
          tag: 'fasting-reminder',
        });
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionId: latest.id, lastSentAt: now } satisfies ReminderState),
        );
      } catch {
        // The browser may reject notifications in private mode.
      }
    };

    check();
    const interval = window.setInterval(check, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [active, history]);
}
