ALTER TABLE public.pending_signups
ADD COLUMN IF NOT EXISTS estimated_items text NULL;
