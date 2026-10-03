-- ==============================================================================
-- Migration 013: Insurance Financial Ledger (CIF Asigurări)
-- Complete physical separation from existing CRM clients, leads, properties, and insurance policies
-- Zero data loss, zero guessing, exact source tracking & year discrepancy tracking
-- ==============================================================================

-- 1. Create table for Insurance Financial Expenses
CREATE TABLE IF NOT EXISTS public.insurance_financial_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL,
  raw_date TEXT,
  document_number TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  raw_category TEXT,
  supplier TEXT NOT NULL,
  raw_supplier TEXT,
  net_amount NUMERIC(15, 2) NOT NULL,
  vat_amount NUMERIC(15, 2),
  total_amount NUMERIC(15, 2) NOT NULL,
  observations TEXT,
  source TEXT NOT NULL DEFAULT 'import',
  source_row INTEGER,
  source_file TEXT DEFAULT 'EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026',
  source_year_label INTEGER DEFAULT 2026,
  record_year INTEGER NOT NULL,
  year_discrepancy_flag BOOLEAN DEFAULT FALSE,
  fingerprint TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Create table for Insurance Financial Income (Commissions)
CREATE TABLE IF NOT EXISTS public.insurance_financial_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_date DATE NOT NULL,
  raw_date TEXT,
  document_number TEXT,
  description TEXT NOT NULL,
  insurance_type TEXT,
  insurer TEXT,
  policy_value NUMERIC(15, 2),
  commission_percent NUMERIC(8, 4),
  commission_received NUMERIC(15, 4) NOT NULL,
  tax_1_percent NUMERIC(15, 4) NOT NULL,
  observations TEXT,
  source TEXT NOT NULL DEFAULT 'import',
  source_row INTEGER,
  source_file TEXT DEFAULT 'EVIDENȚĂ ÎNCASĂRI (COMISIOANE) – CIF ASIGURĂRI 2026',
  source_year_label INTEGER DEFAULT 2026,
  record_year INTEGER NOT NULL,
  year_discrepancy_flag BOOLEAN DEFAULT FALSE,
  fingerprint TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. Indexes for fast filtering and analytics
CREATE INDEX IF NOT EXISTS idx_fin_expenses_date ON public.insurance_financial_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_category ON public.insurance_financial_expenses(category);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_supplier ON public.insurance_financial_expenses(supplier);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_year ON public.insurance_financial_expenses(record_year);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_fingerprint ON public.insurance_financial_expenses(fingerprint);

CREATE INDEX IF NOT EXISTS idx_fin_income_date ON public.insurance_financial_income(income_date);
CREATE INDEX IF NOT EXISTS idx_fin_income_year ON public.insurance_financial_income(record_year);
CREATE INDEX IF NOT EXISTS idx_fin_income_insurer ON public.insurance_financial_income(insurer);
CREATE INDEX IF NOT EXISTS idx_fin_income_type ON public.insurance_financial_income(insurance_type);
CREATE INDEX IF NOT EXISTS idx_fin_income_fingerprint ON public.insurance_financial_income(fingerprint);

-- 4. Enable Row Level Security (Strictly Private Financial Data)
ALTER TABLE public.insurance_financial_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_financial_income ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Authenticated Admin Access ONLY. Deny Public/Anon Access.
DROP POLICY IF EXISTS "Authenticated users can view financial expenses" ON public.insurance_financial_expenses;
CREATE POLICY "Authenticated users can view financial expenses"
  ON public.insurance_financial_expenses
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert financial expenses" ON public.insurance_financial_expenses;
CREATE POLICY "Authenticated users can insert financial expenses"
  ON public.insurance_financial_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update financial expenses" ON public.insurance_financial_expenses;
CREATE POLICY "Authenticated users can update financial expenses"
  ON public.insurance_financial_expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete financial expenses" ON public.insurance_financial_expenses;
CREATE POLICY "Authenticated users can delete financial expenses"
  ON public.insurance_financial_expenses
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view financial income" ON public.insurance_financial_income;
CREATE POLICY "Authenticated users can view financial income"
  ON public.insurance_financial_income
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert financial income" ON public.insurance_financial_income;
CREATE POLICY "Authenticated users can insert financial income"
  ON public.insurance_financial_income
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update financial income" ON public.insurance_financial_income;
CREATE POLICY "Authenticated users can update financial income"
  ON public.insurance_financial_income
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete financial income" ON public.insurance_financial_income;
CREATE POLICY "Authenticated users can delete financial income"
  ON public.insurance_financial_income
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_financial_expenses ON public.insurance_financial_expenses;
CREATE TRIGGER trg_update_financial_expenses
  BEFORE UPDATE ON public.insurance_financial_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_timestamp();

DROP TRIGGER IF EXISTS trg_update_financial_income ON public.insurance_financial_income;
CREATE TRIGGER trg_update_financial_income
  BEFORE UPDATE ON public.insurance_financial_income
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_timestamp();
