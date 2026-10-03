-- ==============================================================================
-- Migration 015: Add Expense Type & Asset Tracking in June 2026 (CIF Asigurări)
-- Safe, Idempotent:
-- 1. Adds expense_type, is_asset, asset_name, purchase_value, depreciation_years,
--    annual_depreciation_rate, annual_depreciation, monthly_depreciation, depreciation_method, record_month
-- 2. Backfills expense_type and record_month for existing 45 operational expenses
-- 3. Idempotently inserts/updates 2 new asset/equipment records (MacBook & Cooler Laptop) for June 2026
-- ==============================================================================

-- 1. Add asset, expense_type, and record_month columns
ALTER TABLE public.insurance_financial_expenses
  ADD COLUMN IF NOT EXISTS expense_type TEXT,
  ADD COLUMN IF NOT EXISTS is_asset BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS asset_name TEXT,
  ADD COLUMN IF NOT EXISTS purchase_value NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS depreciation_years INTEGER,
  ADD COLUMN IF NOT EXISTS annual_depreciation_rate NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS annual_depreciation NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS monthly_depreciation NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS depreciation_method TEXT,
  ADD COLUMN IF NOT EXISTS record_month INTEGER;

ALTER TABLE public.insurance_financial_income
  ADD COLUMN IF NOT EXISTS record_month INTEGER;

-- 2. Backfill record_month on existing records
UPDATE public.insurance_financial_expenses
SET record_month = EXTRACT(MONTH FROM expense_date::date)
WHERE expense_date IS NOT NULL AND expense_date != '' AND record_month IS NULL;

UPDATE public.insurance_financial_income
SET record_month = EXTRACT(MONTH FROM income_date::date)
WHERE income_date IS NOT NULL AND income_date != '' AND record_month IS NULL;

-- 3. Backfill expense_type for existing records
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

-- 4. Idempotent insert or update of Row 46: MacBook (June 2026)
DELETE FROM public.insurance_financial_expenses
WHERE supplier = 'ALTEX' AND total_amount = 5498.99 AND (LOWER(description) LIKE '%macbook%' OR source_row = 46);

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
  record_month,
  year_discrepancy_flag,
  fingerprint
)
VALUES (
  'EXPENSE_ENTRY_2026',
  'ACHIZIȚII ACTIVE – CIF ASIGURĂRI 2026',
  2026,
  46,
  '06/2026',
  '2026-06',
  NULL,
  'MacBook',
  'MacBook',
  'LAPTOP',
  'IT / Echipamente',
  'IT / ECHIPAMENTE',
  'ALTEX',
  'ALTEX',
  5498.99,
  NULL,
  5498.99,
  NULL,
  true,
  'MacBook',
  5498.99,
  3,
  33.00,
  1814.67,
  151.22,
  'STRAIGHT_LINE',
  2026,
  6,
  false,
  'FINGERPRINT_EXPENSE_46_MACBOOK_JUNE_2026'
);

-- 5. Idempotent insert or update of Row 47: Cooler laptop (June 2026)
DELETE FROM public.insurance_financial_expenses
WHERE supplier = 'ALTEX' AND total_amount = 109.90 AND (LOWER(description) LIKE '%cooler%' OR source_row = 47);

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
  record_month,
  year_discrepancy_flag,
  fingerprint
)
VALUES (
  'EXPENSE_ENTRY_2026',
  'ACHIZIȚII ACTIVE – CIF ASIGURĂRI 2026',
  2026,
  47,
  '06/2026',
  '2026-06',
  NULL,
  'Cooler laptop',
  'Cooler laptop',
  'ACCESORIU IT',
  'IT / Accesorii',
  'IT / ACCESORII',
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
  6,
  false,
  'FINGERPRINT_EXPENSE_47_COOLER_JUNE_2026'
);
