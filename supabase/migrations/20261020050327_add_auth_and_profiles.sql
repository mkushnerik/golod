/*
# Add user accounts and profiles for auth-scoped fasting

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `weight_kg` (numeric, nullable — user's weight in kilograms)
  - `height_cm` (numeric, nullable — user's height in centimeters)
  - `age` (integer, nullable — user's age in years)
  - `gender` (text, nullable — 'male' or 'female')
  - `created_at` (timestamptz)

2. Modified Tables
- `fasting_sessions` — add `user_id` column (uuid, defaults to auth.uid(), references auth.users)

3. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD on `profiles`.
- Replace single-tenant fasting_sessions policies with owner-scoped policies (authenticated only).
- Add a trigger to auto-create a profile row when a new auth user signs up.
*/

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  weight_kg numeric,
  height_cm numeric,
  age integer,
  gender text CHECK (gender IN ('male', 'female')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- 2. Add user_id to fasting_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fasting_sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE fasting_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE fasting_sessions ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- 3. Replace single-tenant fasting_sessions policies with owner-scoped ones
DROP POLICY IF EXISTS "anon_select_fasting_sessions" ON fasting_sessions;
DROP POLICY IF EXISTS "anon_insert_fasting_sessions" ON fasting_sessions;
DROP POLICY IF EXISTS "anon_update_fasting_sessions" ON fasting_sessions;
DROP POLICY IF EXISTS "anon_delete_fasting_sessions" ON fasting_sessions;

DROP POLICY IF EXISTS "select_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "select_own_fasting_sessions" ON fasting_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "insert_own_fasting_sessions" ON fasting_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "update_own_fasting_sessions" ON fasting_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "delete_own_fasting_sessions" ON fasting_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON fasting_sessions(user_id);

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
