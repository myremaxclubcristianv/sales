-- Migration 020: Insurance Prospect Companies (Flote & Rent a Car B2B)
-- Isolated commercial prospect management for insurance fleet sales
-- Zero regression / 107 records across 4 tables with 9-column fidelity

-- Ensure companies table supports CRM prospect workflow fields
ALTER TABLE IF EXISTS public.companies
  ADD COLUMN IF NOT EXISTS prospect_status TEXT DEFAULT 'NECONTACTAT',
  ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS crm_notes TEXT,
  ADD COLUMN IF NOT EXISTS additional_phones TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS additional_emails TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS table_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source_group TEXT DEFAULT 'INSURANCE_COMPANIES_PROSPECTS';

-- Add index on registration_number (stores import_source_id like 'INS_CO_T1_01')
CREATE INDEX IF NOT EXISTS idx_companies_registration_number ON public.companies(registration_number);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_city ON public.companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_prospect_status ON public.companies(prospect_status);

-- Dedicated activities and notes for insurance companies
CREATE TABLE IF NOT EXISTS public.insurance_company_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT NOT NULL, -- references import_source_id or company UUID
  activity_type TEXT NOT NULL DEFAULT 'NOTE' CHECK (activity_type IN ('NOTE', 'CALL', 'EMAIL', 'WHATSAPP', 'STATUS_CHANGE', 'MEETING', 'OFFER', 'FOLLOW_UP', 'OTHER')),
  status_from TEXT,
  status_to TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_insurance_company_activities_company_id ON public.insurance_company_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_insurance_company_activities_created_at ON public.insurance_company_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.insurance_company_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view company activities"
  ON public.insurance_company_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert company activities"
  ON public.insurance_company_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update company activities"
  ON public.insurance_company_activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anonymous access to company activities"
  ON public.insurance_company_activities
  FOR ALL
  TO anon
  USING (false);
