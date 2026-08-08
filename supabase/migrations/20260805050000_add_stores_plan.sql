-- ============================================================================
-- Migration: add stores.plan for plan-based item limits (Task 1.7)
-- Already applied to the live database; tracked here for history.
-- ============================================================================

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'large';

ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_plan_check;

ALTER TABLE public.stores
  ADD CONSTRAINT stores_plan_check
  CHECK (plan IN ('small', 'medium', 'large', 'custom'));

COMMENT ON COLUMN public.stores.plan IS
  'Billing size tier. Determines menu item count limit (small=25, medium=50, large=80, custom=unlimited).';
