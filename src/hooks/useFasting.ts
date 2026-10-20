import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, FastingSession } from '@/lib/supabase';

const STORAGE_KEY = 'fasting-active-session';

interface ActiveSession {
  id: string;
  protocol: string;
  target_hours: number;
  start_time: number; // epoch ms
}

export interface FastingState {
  active: boolean;
  sessionId: string | null;
  protocol: string;
  targetHours: number;
  startTime: number | null;
  elapsedMs: number;
  progress: number;
}

function loadActive(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

function saveActive(s: ActiveSession | null) {
  if (s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useFasting(userId: string | null) {
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [protocol, setProtocol] = useState('16:8');
  const [targetHours, setTargetHours] = useState(16);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [history, setHistory] = useState<FastingSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const tickRef = useRef<number | null>(null);

  const progress = startTime ? Math.min(elapsedMs / (targetHours * 3600_000), 1) : 0;

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(60);
    if (error) {
      setHistoryLoading(false);
      return;
    }
    setHistory(data ?? []);
    setHistoryLoading(false);
  }, [userId]);

  // Restore active session + load history when user is ready
  useEffect(() => {
    if (!userId) {
      setActive(false);
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    const saved = loadActive();
    if (saved) {
      setActive(true);
      setSessionId(saved.id);
      setProtocol(saved.protocol);
      setTargetHours(saved.target_hours);
      setStartTime(saved.start_time);
      setElapsedMs(Date.now() - saved.start_time);
    }
    loadHistory();
  }, [userId, loadHistory]);

  // Ticking
  useEffect(() => {
    if (!active || !startTime) return;
    const tick = () => setElapsedMs(Date.now() - (startTime as number));
    tick();
    tickRef.current = window.setInterval(tick, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [active, startTime]);

  const startFast = useCallback(
    async (proto: string, hours: number): Promise<boolean> => {
      if (!userId || active || loadActive()) return false;
      const now = Date.now();
      const { data, error } = await supabase
        .from('fasting_sessions')
        .insert({
          protocol: proto,
          target_hours: hours,
          start_time: new Date(now).toISOString(),
        })
        .select()
        .single();
      if (error || !data) return false;

      const s: ActiveSession = {
        id: data.id,
        protocol: proto,
        target_hours: hours,
        start_time: now,
      };
      saveActive(s);
      setActive(true);
      setSessionId(data.id);
      setProtocol(proto);
      setTargetHours(hours);
      setStartTime(now);
      setElapsedMs(0);
      return true;
    },
    [userId, active],
  );

  const finishFast = useCallback(
    async (completed: boolean) => {
      if (!sessionId || !startTime) return;
      const now = Date.now();
      const actualHours = (now - startTime) / 3600_000;

      await supabase
        .from('fasting_sessions')
        .update({
          end_time: new Date(now).toISOString(),
          actual_hours: Math.round(actualHours * 100) / 100,
          completed,
        })
        .eq('id', sessionId);

      saveActive(null);
      setActive(false);
      setSessionId(null);
      setStartTime(null);
      setElapsedMs(0);
      await loadHistory();
    },
    [sessionId, startTime, loadHistory],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await supabase.from('fasting_sessions').delete().eq('id', id);
      await loadHistory();
    },
    [loadHistory],
  );

  return {
    active,
    sessionId,
    protocol,
    targetHours,
    startTime,
    elapsedMs,
    progress,
    history,
    historyLoading,
    startFast,
    finishFast,
    deleteSession,
    loadHistory,
  };
}
