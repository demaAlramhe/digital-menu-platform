-- Background image for the public menu page (/{storeSlug}/menu)
-- Run in Supabase SQL Editor after store-welcome-columns.sql

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS menu_background_url text;

COMMENT ON COLUMN stores.menu_background_url IS 'Full-screen background for public menu categories page';
