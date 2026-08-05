-- Update plan constraint for size-based tiers (small / medium / large).
-- Keeps legacy values (basic / pro / premium) for existing rows.

ALTER TABLE public.pending_signups
DROP CONSTRAINT IF EXISTS pending_signups_plan_check;

ALTER TABLE public.pending_signups
ADD CONSTRAINT pending_signups_plan_check
CHECK (plan IN ('basic', 'pro', 'premium', 'small', 'medium', 'large'));
