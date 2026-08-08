-- ============================================================================
-- Migration: add missing super_admin RLS policies (Task 1.3)
-- Defense-in-depth only — current admin writes go through the service role,
-- which bypasses RLS entirely. These policies matter if an authenticated
-- (non-service-role) client is ever used for admin reads/writes, or if
-- someone browses these tables directly with a super_admin session.
-- ============================================================================

DROP POLICY IF EXISTS "stores_super_admin_all" ON public.stores;
CREATE POLICY "stores_super_admin_all"
  ON public.stores FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "menu_categories_super_admin_all" ON public.menu_categories;
CREATE POLICY "menu_categories_super_admin_all"
  ON public.menu_categories FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "menu_items_super_admin_all" ON public.menu_items;
CREATE POLICY "menu_items_super_admin_all"
  ON public.menu_items FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "profiles_super_admin_all" ON public.profiles;
CREATE POLICY "profiles_super_admin_all"
  ON public.profiles FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );