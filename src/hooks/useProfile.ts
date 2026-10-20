import { useCallback, useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';

export interface ProfileData {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
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
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (data: ProfileData) => {
      if (!userId) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          age: data.age,
          gender: data.gender,
        })
        .eq('id', userId);
      if (error) throw error;
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
