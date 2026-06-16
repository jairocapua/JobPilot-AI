-- Feature 06 — Profile Save Logic
-- The InsForge storage SDK `upload(path, file)` auto-renames on key collision
-- (no upsert option), so true single-resume overwrite requires deleting the
-- prior object by its stored key. Persist the storage key alongside the URL.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_pdf_key TEXT;
