-- Migration 007: Quick Client, Contacts Agenda, and CSV Import Infrastructure

-- 1. Extend clients table with interest_summary and category
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS interest_summary TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'REAL_ESTATE';

-- Update check constraint on clients.lead_source safely to allow expanded sources
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_lead_source_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_lead_source_check 
  CHECK (lead_source IS NULL OR lead_source IN (
    'DIRECT_CONTACT', 'PHONE', 'WHATSAPP', 'WHATSAPP_GROUPS', 'EMAIL', 'JOTFORM', 
    'LINKEDIN', 'WEBSITE_INSURANCE', 'WEBSITE_HOMEFIND', 'WEBSITE_CREDITE', 'WEBSITE_OS', 
    'INSTAGRAM', 'FACEBOOK', 'TELEGRAM', 'REFERRAL', 'OTHER',
    'website', 'whatsapp', 'telegram', 'instagram', 'facebook', 'referral', 'phone', 'email', 'property', 'campaign', 'other'
  ));

CREATE INDEX IF NOT EXISTS idx_clients_category ON public.clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_lead_source ON public.clients(lead_source);

-- 2. Enhance contacts table to serve as the unified Agenda (phone book & contact hub)
-- Allow contacts to exist independently without requiring a company_id
ALTER TABLE public.contacts ALTER COLUMN company_id DROP NOT NULL;

-- Allow contacts to link to CRM client records when converted
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS interest_summary TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Romania',
  ADD COLUMN IF NOT EXISTS raw_data JSONB;

CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON public.contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts(category);

-- 3. Create contact_imports table for audit & batch tracking
CREATE TABLE IF NOT EXISTS public.contact_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_rows INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  invalid_count INTEGER DEFAULT 0,
  summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_imports_created_at ON public.contact_imports(created_at DESC);

-- 4. Enable RLS on contact_imports
ALTER TABLE public.contact_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access to contact_imports" ON public.contact_imports;
CREATE POLICY "No public access to contact_imports" ON public.contact_imports
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "Authenticated users can view contact_imports" ON public.contact_imports;
CREATE POLICY "Authenticated users can view contact_imports" ON public.contact_imports
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and agents can manage contact_imports" ON public.contact_imports;
CREATE POLICY "Admins and agents can manage contact_imports" ON public.contact_imports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );
