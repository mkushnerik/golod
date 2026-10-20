/*
# Prevent multiple active fasting sessions

1. Database protection
- Adds a partial unique index on `fasting_sessions.user_id` for rows whose
  `end_time` is null.

2. Behavior
- Each authenticated user can have at most one unfinished fasting session.
- Completed and stopped historical sessions remain unchanged.

3. Security
- This protects the business rule at the database boundary, not only in the
  React interface.
*/

CREATE UNIQUE INDEX IF NOT EXISTS one_active_fasting_session_per_user
ON public.fasting_sessions (user_id)
WHERE end_time IS NULL;
