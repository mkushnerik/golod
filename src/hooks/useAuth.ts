import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthState {
  ready: boolean;
  userId: string | null;
  email: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    ready: false,
    userId: null,
    email: null,
  });

  useEffect(() => {
    // Get initial session
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setState({
        ready: true,
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
      });
    })();

    // Listen for auth changes — wrap async in IIFE to avoid deadlock
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setState({
          ready: true,
          userId: session?.user?.id ?? null,
          email: session?.user?.email ?? null,
        });
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState({ ready: true, userId: null, email: null });
  }, []);

  return {
    ready: state.ready,
    userId: state.userId,
    email: state.email,
    isAuthenticated: !!state.userId,
    signUp,
    signIn,
    signOut,
  };
}
