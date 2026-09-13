-- Migration: 004_portfolio_separation.sql
-- Description: Add portfolio_type and source_url to public.properties for explicit provenance separation

ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS portfolio_type text NOT NULL DEFAULT 'PERSONAL' CHECK (portfolio_type IN ('PERSONAL', 'CHESTERTONS')),
  ADD COLUMN IF NOT EXISTS source_url text;

-- Create indexes for performance filtering
CREATE INDEX IF NOT EXISTS idx_properties_portfolio_type ON public.properties(portfolio_type);
CREATE INDEX IF NOT EXISTS idx_properties_source_url ON public.properties(source_url);

-- Backfill source_url from features JSON for all imported HomeFind records
UPDATE public.properties 
SET source_url = features->>'source_url'
WHERE source_url IS NULL AND features->>'source_url' IS NOT NULL;

-- Backfill portfolio_type based on verified provenance
-- 1. Spain / TET / Chestertons network listings
UPDATE public.properties
SET portfolio_type = 'CHESTERTONS'
WHERE (features->>'country' = 'ES' OR description LIKE '%Chestertons%' OR description LIKE '%TET%');

-- 2. Romania / Cristian Vaduva direct representation listings
UPDATE public.properties
SET portfolio_type = 'PERSONAL'
WHERE features->>'country' = 'RO' OR (features->>'country' IS NULL AND description NOT LIKE '%Chestertons%');
