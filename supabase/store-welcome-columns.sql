-- Welcome / intro screen fields for public store landing (/{storeSlug})
-- Run in Supabase SQL Editor after deploying app changes.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS welcome_title text,
  ADD COLUMN IF NOT EXISTS welcome_subtitle text,
  ADD COLUMN IF NOT EXISTS welcome_button_text text,
  ADD COLUMN IF NOT EXISTS show_welcome_screen boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN stores.hero_image_url IS 'Alternate full-screen background if banner_url is empty';
COMMENT ON COLUMN stores.welcome_title IS 'Headline on welcome intro at /{slug}';
COMMENT ON COLUMN stores.welcome_subtitle IS 'Welcome message on intro screen';
COMMENT ON COLUMN stores.welcome_button_text IS 'Legacy custom CTA (app uses fixed Start Now labels)';
COMMENT ON COLUMN stores.show_welcome_screen IS 'Legacy flag; public /{slug} always shows welcome intro';
