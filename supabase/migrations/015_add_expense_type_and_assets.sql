-- ==============================================================================
-- Migration 015: Add Expense Type & Asset Tracking (CIF Asigurări 2026)
-- Safe, Idempotent:
-- 1. Adds expense_type, is_asset, asset_name, purchase_value, depreciation_years,
--    annual_depreciation_rate, annual_depreciation, monthly_depreciation, depreciation_method
-- 2. Backfills expense_type for existing 45 operational expenses
-- 3. Idempotently inserts 2 new asset/equipment records (MacBook M5 & Cooler Laptop)
-- ==============================================================================

-- 1. Add asset and expense_type columns
ALTER TABLE public.insurance_financial_expenses
  ADD COLUMN IF NOT EXISTS expense_type TEXT,
  ADD COLUMN IF NOT EXISTS is_asset BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS asset_name TEXT,
  ADD COLUMN IF NOT EXISTS purchase_value NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS depreciation_years INTEGER,
  ADD COLUMN IF NOT EXISTS annual_depreciation_rate NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS annual_depreciation NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS monthly_depreciation NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS depreciation_method TEXT;

-- 2. Backfill expense_type for existing records
UPDATE public.insurance_financial_expenses
SET
  expense_type = 'MOTORINĂ',
  category = 'MASINA'
WHERE LOWER(description) LIKE '%motorina%';

UPDATE public.insurance_financial_expenses
SET
  expense_type = 'SPĂLĂTORIE MAȘINĂ',
  category = 'MASINA'
WHERE LOWER(description) LIKE '%spalatorie%';

UPDATE public.insurance_financial_expenses
SET
  expense_type = 'TRECERE FETEȘTI',
  category = 'MASINA'
WHERE LOWER(description) LIKE '%fetesti%' OR LOWER(description) LIKE '%fetești%';

UPDATE public.insurance_financial_expenses
SET
  expense_type = 'ABONAMENT ASISTENȚĂ RUTIERĂ',
  category = 'MASINA'
WHERE LOWER(description) LIKE '%asistenta rutiera%' OR LOWER(description) LIKE '%asistență rutieră%';

UPDATE public.insurance_financial_expenses
SET
  expense_type = 'METROREX ABONAMENT',
  category = 'TRANSPORT'
WHERE LOWER(description) LIKE '%metrorex%';

-- 3. Idempotent insert of Row 46: LAPTOP MACBOOK M5
INSERT INTO public.insurance_financial_expenses (
  source,
  source_file,
  source_year_label,
  source_row,
  raw_date,
  expense_date,
  document_number,
  raw_description,
  description,
  expense_type,
  raw_category,
  category,
  raw_supplier,
  supplier,
  net_amount,
  vat_amount,
  total_amount,
  observations,
  is_asset,
  asset_name,
  purchase_value,
  depreciation_years,
  annual_depreciation_rate,
  annual_depreciation,
  monthly_depreciation,
  depreciation_method,
  record_year,
  year_discrepancy_flag,
  fingerprint
)
SELECT
  'EXPENSE_ENTRY_2026',
  'EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026',
  2026,
  46,
  '',
  '2026-01-01',
  NULL,
  'LAPTOP MACBOOK M5',
  'LAPTOP MACBOOK M5',
  'LAPTOP',
  'IT / ECHIPAMENTE',
  'IT / ECHIPAMENTE',
  'ALTEX',
  'ALTEX',
  5498.99,
  NULL,
  5498.99,
  NULL,
  true,
  'LAPTOP MACBOOK M5',
  5498.99,
  3,
  33.00,
  1814.67,
  151.22,
  'STRAIGHT_LINE',
  2026,
  false,
  'FINGERPRINT_EXPENSE_46_MACBOOK_M5'
WHERE NOT EXISTS (
  SELECT 1 FROM public.insurance_financial_expenses
  WHERE description = 'LAPTOP MACBOOK M5' OR source_row = 46
);

-- 4. Idempotent insert of Row 47: COOLER LAPTOP
INSERT INTO public.insurance_financial_expenses (
  source,
  source_file,
  source_year_label,
  source_row,
  raw_date,
  expense_date,
  document_number,
  raw_description,
  description,
  expense_type,
  raw_category,
  category,
  raw_supplier,
  supplier,
  net_amount,
  vat_amount,
  total_amount,
  observations,
  is_asset,
  asset_name,
  purchase_value,
  depreciation_years,
  annual_depreciation_rate,
  annual_depreciation,
  monthly_depreciation,
  depreciation_method,
  record_year,
  year_discrepancy_flag,
  fingerprint
)
SELECT
  'EXPENSE_ENTRY_2026',
  'EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026',
  2026,
  47,
  '',
  '2026-01-01',
  NULL,
  'COOLER LAPTOP',
  'COOLER LAPTOP',
  'ACCESORIU IT',
  'IT / ECHIPAMENTE',
  'IT / ECHIPAMENTE',
  'ALTEX',
  'ALTEX',
  109.90,
  NULL,
  109.90,
  NULL,
  false,
  NULL,
  109.90,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  2026,
  false,
  'FINGERPRINT_EXPENSE_47_COOLER_LAPTOP'
WHERE NOT EXISTS (
  SELECT 1 FROM public.insurance_financial_expenses
  WHERE description = 'COOLER LAPTOP' OR source_row = 47
);
