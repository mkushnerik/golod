/*
# Harden creator dashboard function permissions

1. Purpose
- Keep the existing fasting database intact while correcting the access level of the creator dashboard function.

2. Modified database object
- `public.get_creator_dashboard()` keeps its existing creator-email and creator-flag checks.
- Anonymous callers no longer receive permission to execute the function.
- Signed-in users retain execution permission; unauthorized users are rejected by the function's database-side check.

3. Security changes
- Revoke EXECUTE from `anon`.
- Grant EXECUTE only to `authenticated`.
- No tables, rows, columns, or user data are deleted or changed.

4. Important notes
- The application already uses email/password sign-in, so authenticated-only access matches the existing user flow.
- Existing row-level security on profiles and fasting sessions remains unchanged.
*/

REVOKE EXECUTE ON FUNCTION public.get_creator_dashboard() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_creator_dashboard() TO authenticated;
