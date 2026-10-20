import { useCallback, useEffect, useRef } from 'react';
import { MASCOT_IMAGE } from '@/lib/mascot';

interface LiveActivityOptions {
  active: boolean;
  protocol: string;
  targetHours: number;
  startTime: number | null;
  elapsedMs: number;
  progress: number;
}

const MILESTONES = [0.25, 0.5, 0.75, 1.0];
const MILESTONE_MESSAGES: Record<number, string> = {
  0.25: 'Четверть пути пройдена! Так держать!',
  0.5: 'Половина голодания позади! Ты молодец!',
  0.75: 'Осталось совсем немного! Почти у цели!',
  1.0: 'Цель достигнута! Голодание завершено!',
};
const HOURLY_MESSAGES = [
  'ПораГолодать напоминает: каждый час — это ещё один шаг к твоей цели.',
  'Ты отлично справляешься. Дыши спокойно и продолжай свой ритм.',
  'Твоё постоянство растёт вместе с каждым часом.',
  'Небольшая пауза от еды — большая победа над автоматическими привычками.',
];
function sendNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: MASCOT_IMAGE,
      badge: MASCOT_IMAGE,
      tag: 'fasting-timer',
    });
  } catch {
    // The browser may reject notifications in private mode.
  }
}

export function useLiveActivity({
  active,
  protocol,
  targetHours,
  startTime,
  elapsedMs,
  progress,
}: LiveActivityOptions) {
  const notifiedMilestonesRef = useRef<Set<number>>(new Set());
  const notifiedHoursRef = useRef(0);

  const startLiveActivity = useCallback(async (): Promise<void> => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        return;
      }
    }
    if (Notification.permission === 'granted') {
      sendNotification('Голодание началось', `Режим ${protocol} · цель ${targetHours} ч`);
    }
  }, [protocol, targetHours]);

  const stopLiveActivity = useCallback(() => {
    notifiedMilestonesRef.current.clear();
    notifiedHoursRef.current = 0;
  }, []);

  useEffect(() => {
    if (!active) {
      notifiedMilestonesRef.current.clear();
      notifiedHoursRef.current = 0;
      return;
    }

    const elapsedHours = Math.floor(elapsedMs / 3600000);
    if (elapsedHours > 0 && elapsedHours > notifiedHoursRef.current) {
      notifiedHoursRef.current = elapsedHours;
      sendNotification(`Час ${elapsedHours} пройден`, HOURLY_MESSAGES[(elapsedHours - 1) % HOURLY_MESSAGES.length]);
    }

    for (const milestone of MILESTONES) {
      if (progress < milestone || notifiedMilestonesRef.current.has(milestone)) continue;
      notifiedMilestonesRef.current.add(milestone);
      const title = milestone === 1 ? 'Голодание завершено!' : `${Math.round(milestone * 100)}% голодания`;
      sendNotification(title, MILESTONE_MESSAGES[milestone]);
    }
  }, [active, elapsedMs, progress]);

  useEffect(() => {
    if (!active || !startTime) return;
    const timer = window.setInterval(() => {
      const elapsedHours = Math.floor((Date.now() - startTime) / 3600000);
      if (elapsedHours > notifiedHoursRef.current) {
        notifiedHoursRef.current = elapsedHours;
        sendNotification(`Час ${elapsedHours} пройден`, HOURLY_MESSAGES[(elapsedHours - 1) % HOURLY_MESSAGES.length]);
      }
    }, 60000);
    return () => window.clearInterval(timer);
  }, [active, startTime]);

  return { startLiveActivity, stopLiveActivity };
}
