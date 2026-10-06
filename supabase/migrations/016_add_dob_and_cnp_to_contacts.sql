-- Migration 016: Add date_of_birth and cnp columns to contacts table for universal birthday tracking
-- Idempotent, safe, backward-compatible

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS cnp TEXT;

CREATE INDEX IF NOT EXISTS idx_contacts_date_of_birth ON public.contacts(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_contacts_cnp ON public.contacts(cnp);
