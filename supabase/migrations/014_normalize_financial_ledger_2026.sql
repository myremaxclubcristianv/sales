-- ==============================================================================
-- Migration 014: Normalize Financial Ledger 2026 (CIF Asigurări)
-- Safe, Idempotent Data Normalization:
-- 1. Ensure raw_category and raw_supplier columns exist for full traceability
-- 2. Normalize canonical category to 'MASINA' and 'TRANSPORT'
-- 3. Normalize canonical supplier to 'OMV', 'MOL', 'PETROM', 'METROREX', 'AUTONOM'
-- 4. Set source_year_label = 2026, source_file = 2026, year_discrepancy_flag = false
-- ==============================================================================

-- 1. Add raw columns if they don't exist
ALTER TABLE public.insurance_financial_expenses
  ADD COLUMN IF NOT EXISTS raw_category TEXT,
  ADD COLUMN IF NOT EXISTS raw_supplier TEXT;

-- 2. Populate raw_category and raw_supplier with existing values where null
UPDATE public.insurance_financial_expenses
SET raw_category = category
WHERE raw_category IS NULL;

UPDATE public.insurance_financial_expenses
SET raw_supplier = supplier
WHERE raw_supplier IS NULL;

-- 3. Canonicalize categories in expenses
UPDATE public.insurance_financial_expenses
SET category = 'MASINA'
WHERE UPPER(TRIM(category)) IN ('MASINA', 'MAȘINĂ');

UPDATE public.insurance_financial_expenses
SET category = 'TRANSPORT'
WHERE UPPER(TRIM(category)) = 'TRANSPORT';

-- 4. Canonicalize suppliers in expenses
UPDATE public.insurance_financial_expenses
SET supplier = 'OMV'
WHERE UPPER(TRIM(supplier)) = 'OMV';

UPDATE public.insurance_financial_expenses
SET supplier = 'MOL'
WHERE UPPER(TRIM(supplier)) = 'MOL';

UPDATE public.insurance_financial_expenses
SET supplier = 'PETROM'
WHERE UPPER(TRIM(supplier)) = 'PETROM';

UPDATE public.insurance_financial_expenses
SET supplier = 'METROREX'
WHERE UPPER(TRIM(supplier)) = 'METROREX';

UPDATE public.insurance_financial_expenses
SET supplier = 'AUTONOM'
WHERE UPPER(TRIM(supplier)) = 'AUTONOM';

-- 5. Normalize metadata to 2026
UPDATE public.insurance_financial_expenses
SET
  source_file = 'EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026',
  source_year_label = 2026,
  year_discrepancy_flag = false
WHERE source_year_label = 2025 OR year_discrepancy_flag = true;

UPDATE public.insurance_financial_income
SET
  source_file = 'EVIDENȚĂ ÎNCASĂRI (COMISIOANE) – CIF ASIGURĂRI 2026',
  source_year_label = 2026,
  year_discrepancy_flag = false
WHERE source_year_label = 2025 OR year_discrepancy_flag = true;
