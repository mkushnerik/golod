/*
# Add secure creator dashboard access

1. New columns
- `profiles.is_creator` (boolean) marks the creator account. It defaults to false.

2. Security changes
- Regular users can still update only their body-data fields.
- The creator flag is not writable from the browser.
- A SECURITY DEFINER RPC returns dashboard aggregates only after checking the
  authenticated user's own `profiles.is_creator` flag.
- The current first project account is marked as the creator account so the
  requested creator page is usable immediately.

3. Dashboard data
- The RPC returns user id, email, registration date, total fasting sessions,
  and completed fasting sessions.
- No profile body measurements or private session details are exposed to the
  creator dashboard.

4. Important notes
- The browser cannot bypass the creator check because the check runs inside
  the database function using auth.uid().
- The function uses a fixed search_path and is not callable by anonymous users.
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_creator boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET is_creator = true
WHERE email = 'mkushnerik@mail.ru'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE is_creator = true
  );

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (weight_kg, height_cm, age, gender) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_creator_dashboard()
RETURNS TABLE (
  user_id uuid,
  email text,
  registered_at timestamptz,
  total_fastings bigint,
  completed_fastings bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_creator = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    u.created_at,
    COUNT(fs.id)::bigint,
    COUNT(fs.id) FILTER (WHERE fs.completed = true)::bigint
  FROM auth.users u
  LEFT JOIN public.fasting_sessions fs ON fs.user_id = u.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_creator_dashboard() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_creator_dashboard() TO authenticated;
