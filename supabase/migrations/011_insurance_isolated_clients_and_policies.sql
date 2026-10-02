-- Migration 011: Isolated Insurance Clients, Policies, Notes, and Activities Architecture
-- Fully isolated from existing CRM clients to prevent collisions, mutations, or regressions

-- 1. Create dedicated insurance_clients table
CREATE TABLE IF NOT EXISTS public.insurance_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_source_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  canonical_phone TEXT,
  email TEXT,
  cnp TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  postal_code TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  source TEXT,
  last_interaction TEXT,
  notes TEXT,
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Create dedicated insurance_client_policies table
CREATE TABLE IF NOT EXISTS public.insurance_client_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_client_id UUID NOT NULL REFERENCES public.insurance_clients(id) ON DELETE CASCADE,
  import_source_id TEXT UNIQUE,
  policy_type TEXT NOT NULL,
  insurer TEXT,
  insurer_raw TEXT,
  policy_number TEXT,
  issue_date DATE,
  expiry_date DATE NOT NULL,
  premium_amount NUMERIC(15, 2),
  premium_currency TEXT NOT NULL DEFAULT 'RON' CHECK (premium_currency IN ('RON', 'EUR', 'USD')),
  commission_amount NUMERIC(15, 2),
  commission_rate TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED', 'PENDING_RENEWAL')),
  vin TEXT,
  vehicle_registration TEXT,
  property_details TEXT,
  details TEXT,
  notes TEXT,
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. Create dedicated insurance_client_notes table
CREATE TABLE IF NOT EXISTS public.insurance_client_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_client_id UUID NOT NULL REFERENCES public.insurance_clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create dedicated insurance_client_activities table
CREATE TABLE IF NOT EXISTS public.insurance_client_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_client_id UUID NOT NULL REFERENCES public.insurance_clients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'NOTE' CHECK (activity_type IN ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'NOTE', 'POLICY_CREATED', 'EXPIRATION_ALERT', 'MANUAL_UPDATE', 'IMPORT')),
  title TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Performance and Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_clients_phone ON public.insurance_clients(phone);
CREATE INDEX IF NOT EXISTS idx_insurance_clients_canonical_phone ON public.insurance_clients(canonical_phone);
CREATE INDEX IF NOT EXISTS idx_insurance_clients_email ON public.insurance_clients(email);
CREATE INDEX IF NOT EXISTS idx_insurance_clients_status ON public.insurance_clients(status);
CREATE INDEX IF NOT EXISTS idx_insurance_clients_import_id ON public.insurance_clients(import_source_id);

CREATE INDEX IF NOT EXISTS idx_ins_client_policies_client_id ON public.insurance_client_policies(insurance_client_id);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_expiry_date ON public.insurance_client_policies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_policy_number ON public.insurance_client_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_vin ON public.insurance_client_policies(vin);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_veh_reg ON public.insurance_client_policies(vehicle_registration);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_status ON public.insurance_client_policies(status);
CREATE INDEX IF NOT EXISTS idx_ins_client_policies_import_id ON public.insurance_client_policies(import_source_id);

CREATE INDEX IF NOT EXISTS idx_ins_client_notes_client_id ON public.insurance_client_notes(insurance_client_id);
CREATE INDEX IF NOT EXISTS idx_ins_client_activities_client_id ON public.insurance_client_activities(insurance_client_id);

-- 6. Enable Row Level Security (RLS) on all isolated tables
ALTER TABLE public.insurance_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_client_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_client_activities ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Explicitly Block Anonymous / Public Access
DROP POLICY IF EXISTS "No public access to insurance_clients" ON public.insurance_clients;
CREATE POLICY "No public access to insurance_clients" ON public.insurance_clients FOR SELECT USING (false);

DROP POLICY IF EXISTS "No public access to insurance_client_policies" ON public.insurance_client_policies;
CREATE POLICY "No public access to insurance_client_policies" ON public.insurance_client_policies FOR SELECT USING (false);

DROP POLICY IF EXISTS "No public access to insurance_client_notes" ON public.insurance_client_notes;
CREATE POLICY "No public access to insurance_client_notes" ON public.insurance_client_notes FOR SELECT USING (false);

DROP POLICY IF EXISTS "No public access to insurance_client_activities" ON public.insurance_client_activities;
CREATE POLICY "No public access to insurance_client_activities" ON public.insurance_client_activities FOR SELECT USING (false);

-- 8. RLS Policies: Authenticated Read Access
DROP POLICY IF EXISTS "Authenticated users can view insurance_clients" ON public.insurance_clients;
CREATE POLICY "Authenticated users can view insurance_clients" ON public.insurance_clients
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view insurance_client_policies" ON public.insurance_client_policies;
CREATE POLICY "Authenticated users can view insurance_client_policies" ON public.insurance_client_policies
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view insurance_client_notes" ON public.insurance_client_notes;
CREATE POLICY "Authenticated users can view insurance_client_notes" ON public.insurance_client_notes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view insurance_client_activities" ON public.insurance_client_activities;
CREATE POLICY "Authenticated users can view insurance_client_activities" ON public.insurance_client_activities
  FOR SELECT USING (auth.role() = 'authenticated');

-- 9. RLS Policies: Admin and Agent Management Access
DROP POLICY IF EXISTS "Admins and agents can manage insurance_clients" ON public.insurance_clients;
CREATE POLICY "Admins and agents can manage insurance_clients" ON public.insurance_clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins and agents can manage insurance_client_policies" ON public.insurance_client_policies;
CREATE POLICY "Admins and agents can manage insurance_client_policies" ON public.insurance_client_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins and agents can manage insurance_client_notes" ON public.insurance_client_notes;
CREATE POLICY "Admins and agents can manage insurance_client_notes" ON public.insurance_client_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins and agents can manage insurance_client_activities" ON public.insurance_client_activities;
CREATE POLICY "Admins and agents can manage insurance_client_activities" ON public.insurance_client_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- 10. Service Role Full Access (for background automation & idempotent import scripts)
DROP POLICY IF EXISTS "Service role full access to insurance_clients" ON public.insurance_clients;
CREATE POLICY "Service role full access to insurance_clients" ON public.insurance_clients
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access to insurance_client_policies" ON public.insurance_client_policies;
CREATE POLICY "Service role full access to insurance_client_policies" ON public.insurance_client_policies
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access to insurance_client_notes" ON public.insurance_client_notes;
CREATE POLICY "Service role full access to insurance_client_notes" ON public.insurance_client_notes
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access to insurance_client_activities" ON public.insurance_client_activities;
CREATE POLICY "Service role full access to insurance_client_activities" ON public.insurance_client_activities
  FOR ALL USING (auth.role() = 'service_role');
