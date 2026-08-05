-- ============================================
-- MenuQR Platform — Base Schema
-- Run this ONCE on a fresh Supabase project
-- before running any other migrations
-- Last updated: 2026-05-22
-- ============================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Table: stores
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  primary_color text,
  secondary_color text,
  logo_url text,
  banner_url text,
  hero_image_url text,
  menu_background_url text,
  welcome_title text,
  welcome_subtitle text,
  welcome_button_text text,
  welcome_title_ar text,
  welcome_title_he text,
  welcome_title_en text,
  welcome_subtitle_ar text,
  welcome_subtitle_he text,
  welcome_subtitle_en text,
  welcome_button_text_ar text,
  welcome_button_text_he text,
  welcome_button_text_en text,
  default_content_language text NOT NULL DEFAULT 'ar',
  show_welcome_screen boolean NOT NULL DEFAULT true,
  email text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.stores.hero_image_url IS 'Alternate full-screen background if banner_url is empty';
COMMENT ON COLUMN public.stores.welcome_title IS 'Headline on welcome intro at /{slug}';
COMMENT ON COLUMN public.stores.welcome_subtitle IS 'Welcome message on intro screen';
COMMENT ON COLUMN public.stores.welcome_button_text IS 'Legacy custom CTA (app uses fixed Start Now labels)';
COMMENT ON COLUMN public.stores.show_welcome_screen IS 'Legacy flag; public /{slug} always shows welcome intro';
COMMENT ON COLUMN public.stores.menu_background_url IS 'Full-screen background for public menu categories page';
COMMENT ON COLUMN public.stores.default_content_language IS 'Owner input language: ar | he | en';

-- ---------------------------------------------------------------------------
-- Table: profiles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL,
  store_id uuid REFERENCES public.stores (id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Table: menu_categories
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  name_he text,
  name_en text,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Table: menu_items
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories (id) ON DELETE SET NULL,
  name text NOT NULL,
  name_ar text,
  name_he text,
  name_en text,
  slug text NOT NULL,
  description text,
  description_ar text,
  description_he text,
  description_en text,
  price numeric NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security — profiles
-- (from supabase/profiles-rls.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Example: link an existing Auth user to super_admin (replace USER_UUID and name)
-- insert into public.profiles (id, full_name, role, store_id)
-- values ('USER_UUID', 'Super Admin', 'super_admin', null)
-- on conflict (id) do update set role = 'super_admin', full_name = excluded.full_name;

-- ---------------------------------------------------------------------------
-- Row Level Security — store owner access
-- (from supabase/store-owner-rls.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_categories_owner_select" ON public.menu_categories;
CREATE POLICY "menu_categories_owner_select"
  ON public.menu_categories FOR SELECT TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_categories_owner_insert" ON public.menu_categories;
CREATE POLICY "menu_categories_owner_insert"
  ON public.menu_categories FOR INSERT TO authenticated
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_categories_owner_update" ON public.menu_categories;
CREATE POLICY "menu_categories_owner_update"
  ON public.menu_categories FOR UPDATE TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_categories_owner_delete" ON public.menu_categories;
CREATE POLICY "menu_categories_owner_delete"
  ON public.menu_categories FOR DELETE TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- Mirror for menu_items
DROP POLICY IF EXISTS "menu_items_owner_select" ON public.menu_items;
CREATE POLICY "menu_items_owner_select"
  ON public.menu_items FOR SELECT TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_items_owner_insert" ON public.menu_items;
CREATE POLICY "menu_items_owner_insert"
  ON public.menu_items FOR INSERT TO authenticated
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_items_owner_update" ON public.menu_items;
CREATE POLICY "menu_items_owner_update"
  ON public.menu_items FOR UPDATE TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "menu_items_owner_delete" ON public.menu_items;
CREATE POLICY "menu_items_owner_delete"
  ON public.menu_items FOR DELETE TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "stores_owner_select" ON public.stores;
CREATE POLICY "stores_owner_select"
  ON public.stores FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "stores_owner_update" ON public.stores;
CREATE POLICY "stores_owner_update"
  ON public.stores FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT store_id FROM public.profiles
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- Row Level Security — public menu reads
-- (from supabase/public-menu-rls.sql)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "stores_public_select_active" ON public.stores;
CREATE POLICY "stores_public_select_active"
  ON public.stores FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "menu_categories_public_select_active" ON public.menu_categories;
CREATE POLICY "menu_categories_public_select_active"
  ON public.menu_categories FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND store_id IN (SELECT id FROM public.stores WHERE status = 'active')
  );

DROP POLICY IF EXISTS "menu_items_public_select_active" ON public.menu_items;
CREATE POLICY "menu_items_public_select_active"
  ON public.menu_items FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND store_id IN (SELECT id FROM public.stores WHERE status = 'active')
  );

-- After running this file, no additional
-- ALTER TABLE migrations are needed.
-- All columns are included above.
