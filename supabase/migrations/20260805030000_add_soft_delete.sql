-- ============================================================================
-- Migration: add soft-delete columns (Task 1.9)
-- ============================================================================

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.menu_categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.stores.deleted_at IS 'Soft-delete marker. NULL = active/visible. Set instead of hard DELETE by admin store deletion. Distinct from status (active/inactive/archived), which is a separate business-state field.';
COMMENT ON COLUMN public.menu_categories.deleted_at IS 'Soft-delete marker. NULL = active/visible. Distinct from is_active, which is an owner-controlled visibility toggle, not deletion.';
COMMENT ON COLUMN public.menu_items.deleted_at IS 'Soft-delete marker. NULL = active/visible. Distinct from is_active, which is an owner-controlled visibility toggle, not deletion.';

CREATE INDEX IF NOT EXISTS stores_deleted_at_idx ON public.stores (deleted_at);
CREATE INDEX IF NOT EXISTS menu_categories_deleted_at_idx ON public.menu_categories (deleted_at);
CREATE INDEX IF NOT EXISTS menu_items_deleted_at_idx ON public.menu_items (deleted_at);