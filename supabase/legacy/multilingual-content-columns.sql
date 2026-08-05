-- Multilingual restaurant content (generated on save, stored in DB)
-- Run in Supabase SQL Editor.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS default_content_language text NOT NULL DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS welcome_title_ar text,
  ADD COLUMN IF NOT EXISTS welcome_title_he text,
  ADD COLUMN IF NOT EXISTS welcome_title_en text,
  ADD COLUMN IF NOT EXISTS welcome_subtitle_ar text,
  ADD COLUMN IF NOT EXISTS welcome_subtitle_he text,
  ADD COLUMN IF NOT EXISTS welcome_subtitle_en text,
  ADD COLUMN IF NOT EXISTS welcome_button_text_ar text,
  ADD COLUMN IF NOT EXISTS welcome_button_text_he text,
  ADD COLUMN IF NOT EXISTS welcome_button_text_en text;

ALTER TABLE menu_categories
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS name_he text,
  ADD COLUMN IF NOT EXISTS name_en text;

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS name_he text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_ar text,
  ADD COLUMN IF NOT EXISTS description_he text,
  ADD COLUMN IF NOT EXISTS description_en text;

COMMENT ON COLUMN stores.default_content_language IS 'Owner input language: ar | he | en';
