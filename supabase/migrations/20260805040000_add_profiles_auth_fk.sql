-- ============================================================================
-- Migration: restore missing FK from profiles.id to auth.users.id (Task 1.12)
-- Verified zero orphaned profiles.id rows before applying.
-- ============================================================================

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;