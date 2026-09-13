-- Migration 005: Add foreign key constraints for leads table
-- Ensures explicit referential integrity and PostgREST schema relation mapping

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_campaign_id_fkey'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_campaign_id_fkey
      FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;
