import { useCallback, useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';

const GOAL_KEY = 'pg_goal_weight_kg';

export interface ProfileData {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
  goal_weight_kg?: number | null;
}

function loadGoalFromStorage(): number | null {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (raw === null) return null;
    const val = parseFloat(raw);
    return isNaN(val) ? null : val;
  } catch {
    return null;
  }
}

function saveGoalToStorage(v: number | null) {
  try {
    if (v === null) localStorage.removeItem(GOAL_KEY);
    else localStorage.setItem(GOAL_KEY, String(v));
  } catch { /* ignore */ }
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      setLoading(false);
      return;
    }
    // Merge goal_weight_kg from localStorage if not in DB row
    const goalFromDb = (data as Profile & { goal_weight_kg?: number | null })?.goal_weight_kg ?? null;
    const goalFromStorage = loadGoalFromStorage();
    const merged: Profile = {
      ...data,
      goal_weight_kg: goalFromDb ?? goalFromStorage,
    };
    setProfile(merged);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (data: ProfileData) => {
      if (!userId) return;
      // Always persist goal to localStorage as fallback
      saveGoalToStorage(data.goal_weight_kg ?? null);

      const updatePayload: Record<string, unknown> = {
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        age: data.age,
        gender: data.gender,
      };
      // Only include goal_weight_kg if it is not undefined
      if ('goal_weight_kg' in data) {
        updatePayload.goal_weight_kg = data.goal_weight_kg;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);
      // Ignore column-not-found errors silently (migration not yet applied)
      if (error && !error.message.includes('goal_weight_kg')) throw error;
      await loadProfile();
    },
    [userId, loadProfile],
  );

  const hasBodyData = !!(
    profile?.weight_kg &&
    profile?.height_cm &&
    profile?.age &&
    profile?.gender
  );

  return {
    profile,
    loading,
    updateProfile,
    loadProfile,
    hasBodyData,
  };
}
