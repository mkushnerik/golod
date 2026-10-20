/*
# Close public execution access for creator dashboard

1. Purpose
- Remove the remaining implicit PUBLIC execution grant from the creator dashboard function.

2. Modified database object
- `public.get_creator_dashboard()` remains available only to signed-in users.

3. Security changes
- Revoke EXECUTE from the PUBLIC role and anonymous users.
- Preserve EXECUTE for authenticated users.
- Existing creator email and creator flag checks remain unchanged.

4. Data safety
- No tables, columns, rows, or user data are deleted or modified.
*/

REVOKE EXECUTE ON FUNCTION public.get_creator_dashboard() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_creator_dashboard() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_creator_dashboard() TO authenticated;
