-- =======================================================
-- MIGRATION: ADD IS_IMPORTANT TO NEWS TABLE
-- =======================================================

ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false NOT NULL;
