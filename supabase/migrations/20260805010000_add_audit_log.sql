-- ============================================================================
-- Migration: add audit_log table (Task 1.8)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS 'Append-only record of admin actions (store/user/signup mutations). Written via service role only; never updated or deleted by the app.';
COMMENT ON COLUMN public.audit_log.actor_email IS 'Denormalized snapshot of the acting admin''s email at write time — profiles has no email column, and this survives if the actor is later deleted.';

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_actor_id_idx ON public.audit_log (actor_id);
CREATE INDEX IF NOT EXISTS audit_log_target_idx ON public.audit_log (target_type, target_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_super_admin_select" ON public.audit_log;
CREATE POLICY "audit_log_super_admin_select"
  ON public.audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- No INSERT/UPDATE/DELETE policy for authenticated/anon — writes only ever happen via the
-- service-role client (createAdminClient()), which bypasses RLS entirely, matching every
-- other write path in this app. This table is append-only from the app's perspective.