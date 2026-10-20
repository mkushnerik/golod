import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FastingSession {
  id: string;
  user_id: string | null;
  protocol: string;
  target_hours: number;
  start_time: string;
  end_time: string | null;
  actual_hours: number | null;
  completed: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
  is_creator: boolean;
  created_at: string;
}
