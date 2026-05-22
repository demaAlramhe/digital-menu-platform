-- Welcome / intro screen fields for public store landing (/{storeSlug})
-- Run in Supabase SQL Editor after deploying app changes.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS welcome_title text,
  ADD COLUMN IF NOT EXISTS welcome_subtitle text,
  ADD COLUMN IF NOT EXISTS welcome_button_text text,
  ADD COLUMN IF NOT EXISTS show_welcome_screen boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN stores.hero_image_url IS 'Full-screen hero background for welcome intro (Cloudinary URL)';
COMMENT ON COLUMN stores.welcome_title IS 'Headline on welcome intro screen';
COMMENT ON COLUMN stores.welcome_subtitle IS 'Subheadline on welcome intro screen';
COMMENT ON COLUMN stores.welcome_button_text IS 'CTA label on welcome intro screen';
COMMENT ON COLUMN stores.show_welcome_screen IS 'When true, /{slug} shows premium welcome before menu';
