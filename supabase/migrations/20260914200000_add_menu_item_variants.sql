-- ============================================================================
-- Migration: menu item size/price variants (additive; items without variants
-- continue to use menu_items.price as the display fallback).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_item_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  name_he text,
  name_en text,
  price numeric NOT NULL CHECK (price >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.menu_item_variants IS
  'Optional size/price variants for a menu item (e.g. Small/Medium/Large). Items with no rows keep using menu_items.price.';

ALTER TABLE public.menu_item_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS menu_item_variants_owner_select ON public.menu_item_variants;
CREATE POLICY menu_item_variants_owner_select ON public.menu_item_variants
  FOR SELECT TO authenticated
  USING (menu_item_id IN (
    SELECT id FROM public.menu_items WHERE store_id IN (
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  ));

DROP POLICY IF EXISTS menu_item_variants_owner_insert ON public.menu_item_variants;
CREATE POLICY menu_item_variants_owner_insert ON public.menu_item_variants
  FOR INSERT TO authenticated
  WITH CHECK (menu_item_id IN (
    SELECT id FROM public.menu_items WHERE store_id IN (
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  ));

DROP POLICY IF EXISTS menu_item_variants_owner_update ON public.menu_item_variants;
CREATE POLICY menu_item_variants_owner_update ON public.menu_item_variants
  FOR UPDATE TO authenticated
  USING (menu_item_id IN (
    SELECT id FROM public.menu_items WHERE store_id IN (
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  ));

DROP POLICY IF EXISTS menu_item_variants_owner_delete ON public.menu_item_variants;
CREATE POLICY menu_item_variants_owner_delete ON public.menu_item_variants
  FOR DELETE TO authenticated
  USING (menu_item_id IN (
    SELECT id FROM public.menu_items WHERE store_id IN (
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  ));

DROP POLICY IF EXISTS menu_item_variants_public_select_active ON public.menu_item_variants;
CREATE POLICY menu_item_variants_public_select_active ON public.menu_item_variants
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true AND deleted_at IS NULL AND menu_item_id IN (
      SELECT id FROM public.menu_items WHERE is_active = true AND deleted_at IS NULL
        AND store_id IN (SELECT id FROM public.stores WHERE status = 'active')
    )
  );

DROP POLICY IF EXISTS menu_item_variants_super_admin_all ON public.menu_item_variants;
CREATE POLICY menu_item_variants_super_admin_all ON public.menu_item_variants
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE INDEX IF NOT EXISTS idx_menu_item_variants_menu_item_id
  ON public.menu_item_variants(menu_item_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.menu_item_variants TO authenticated;
GRANT SELECT ON TABLE public.menu_item_variants TO anon;
GRANT ALL ON TABLE public.menu_item_variants TO service_role;
