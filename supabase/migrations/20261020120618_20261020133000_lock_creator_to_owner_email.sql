/*
# Lock creator dashboard to the creator email

1. Modified security behavior
- The creator dashboard RPC now requires the authenticated account email to
  match `mkushnerik@mail.ru` exactly after lowercasing and trimming.
- The existing `is_creator` flag remains an additional database-side check.

2. Important notes
- The email check uses auth.users, not a value editable in the browser.
- Ordinary accounts receive the same authorization failure regardless of UI
  navigation or manually typed routes.
- No user data is deleted or changed by this migration.
*/

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
    SELECT 1
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.id = auth.uid()
      AND p.is_creator = true
      AND lower(trim(coalesce(u.email, ''))) = 'mkushnerik@mail.ru'
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
