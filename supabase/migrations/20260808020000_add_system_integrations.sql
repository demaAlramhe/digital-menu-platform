-- ============================================================================
-- system_integrations — tracked third-party services (admin System page)
-- ============================================================================
CREATE TABLE public.system_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('hosting', 'database', 'email', 'ai', 'security', 'other')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expiring_soon', 'expired', 'inactive')),
  expires_at timestamptz,
  renewal_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.system_integrations IS
  'Super-admin tracked third-party integrations (hosting, DB, email, AI, etc.) with expiry status.';
CREATE INDEX system_integrations_expires_at_idx
  ON public.system_integrations (expires_at ASC NULLS LAST);
ALTER TABLE public.system_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "system_integrations_super_admin_all"
  ON public.system_integrations;
CREATE POLICY "system_integrations_super_admin_all"
  ON public.system_integrations
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());