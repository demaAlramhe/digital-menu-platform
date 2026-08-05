CREATE TABLE IF NOT EXISTS public.pending_signups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  restaurant_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('basic', 'pro', 'premium', 'small', 'medium', 'large')),
  notes text,
  estimated_items text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signups_admin_all" ON public.pending_signups;
CREATE POLICY "signups_admin_all"
  ON public.pending_signups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "signups_public_insert" ON public.pending_signups;
CREATE POLICY "signups_public_insert"
  ON public.pending_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
