ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS original_price numeric NULL;

COMMENT ON COLUMN public.menu_items.original_price IS
'Original price before discount. If set, item appears in Offers section.';
