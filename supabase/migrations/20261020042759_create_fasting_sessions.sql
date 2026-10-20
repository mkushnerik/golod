/*
# Create fasting_sessions table (single-tenant, no auth)

1. New Tables
- `fasting_sessions`
  - `id` (uuid, primary key)
  - `protocol` (text, e.g. "16:8", "custom")
  - `target_hours` (numeric, the planned fasting duration in hours)
  - `start_time` (timestamptz, when the fast began)
  - `end_time` (timestamptz, when the fast ended, null if in progress)
  - `actual_hours` (numeric, the actual duration completed, null if in progress)
  - `completed` (boolean, whether the target was reached)
  - `created_at` (timestamptz)
2. Security
- Enable RLS on `fasting_sessions`.
- Allow anon + authenticated full CRUD because the data is intentionally public/shared (single-tenant app, no sign-in).
3. Indexes
- Index on start_time for history ordering.
*/

CREATE TABLE IF NOT EXISTS fasting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol text NOT NULL DEFAULT 'custom',
  target_hours numeric NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  actual_hours numeric,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_fasting_sessions" ON fasting_sessions;
CREATE POLICY "anon_select_fasting_sessions" ON fasting_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fasting_sessions" ON fasting_sessions;
CREATE POLICY "anon_insert_fasting_sessions" ON fasting_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fasting_sessions" ON fasting_sessions;
CREATE POLICY "anon_update_fasting_sessions" ON fasting_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fasting_sessions" ON fasting_sessions;
CREATE POLICY "anon_delete_fasting_sessions" ON fasting_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_fasting_sessions_start_time ON fasting_sessions(start_time DESC);
