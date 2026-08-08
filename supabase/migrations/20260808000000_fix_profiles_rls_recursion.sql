-- Fix: infinite recursion in profiles RLS policy, introduced by Task 1.3's
-- profiles_super_admin_all policy (self-referencing EXISTS subquery on the
-- same table it's defined on). Standard Supabase fix: move the role check
-- into a SECURITY DEFINER function, which bypasses RLS internally and
-- breaks the recursive cycle.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

DROP POLICY IF EXISTS "profiles_super_admin_all" ON public.profiles;
CREATE POLICY "profiles_super_admin_all"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "stores_super_admin_all" ON public.stores;
CREATE POLICY "stores_super_admin_all"
  ON public.stores FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "menu_categories_super_admin_all" ON public.menu_categories;
CREATE POLICY "menu_categories_super_admin_all"
  ON public.menu_categories FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "menu_items_super_admin_all" ON public.menu_items;
CREATE POLICY "menu_items_super_admin_all"
  ON public.menu_items FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());