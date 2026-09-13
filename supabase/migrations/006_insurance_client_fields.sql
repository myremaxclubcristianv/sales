-- Migration 006: Comprehensive Insurance Data Model (Vehicles, Properties, Claims, Extended Fields & Atomic RPC)

-- 1. Extend clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS cnp TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'INDIVIDUAL';

-- 2. Create normalized client_vehicles table (Asset -> Policy -> Client)
CREATE TABLE IF NOT EXISTS public.client_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  vin TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate_number TEXT,
  fuel_type TEXT,
  engine_capacity INTEGER,
  power_hp INTEGER,
  value NUMERIC(15, 2),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_vehicles_client_id ON public.client_vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_client_vehicles_vin ON public.client_vehicles(vin);

-- 3. Create normalized client_properties table (Asset -> Policy -> Client)
CREATE TABLE IF NOT EXISTS public.client_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  address TEXT NOT NULL,
  city TEXT,
  county TEXT,
  surface_sqm NUMERIC(10, 2),
  property_value NUMERIC(15, 2),
  insured_value NUMERIC(15, 2),
  construction_year INTEGER,
  details TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_properties_client_id ON public.client_properties(client_id);

-- 4. Extend insurance_policies table
ALTER TABLE public.insurance_policies
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.client_vehicles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_property_id UUID REFERENCES public.client_properties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS issue_date DATE,
  ADD COLUMN IF NOT EXISTS details TEXT;

CREATE INDEX IF NOT EXISTS idx_insurance_policies_vehicle_id ON public.insurance_policies(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_client_property_id ON public.insurance_policies(client_property_id);

-- Update constraints on insurance_policies safely
ALTER TABLE public.insurance_policies DROP CONSTRAINT IF EXISTS insurance_policies_product_check;
ALTER TABLE public.insurance_policies ADD CONSTRAINT insurance_policies_product_check 
  CHECK (product IN (
    'RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL', 
    'LIABILITY', 'PROFESSIONAL_LIABILITY', 'CARGO', 'IMM', 
    'BUSINESS', 'CYBER', 'OTHER'
  ));

ALTER TABLE public.insurance_policies DROP CONSTRAINT IF EXISTS insurance_policies_status_check;
ALTER TABLE public.insurance_policies ADD CONSTRAINT insurance_policies_status_check 
  CHECK (status IN (
    'DRAFT', 'OFFERED', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_RENEWAL'
  ));

-- Update constraints on insurance_opportunities safely
ALTER TABLE public.insurance_opportunities DROP CONSTRAINT IF EXISTS insurance_opportunities_product_check;
ALTER TABLE public.insurance_opportunities ADD CONSTRAINT insurance_opportunities_product_check 
  CHECK (product IN (
    'RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL', 
    'LIABILITY', 'PROFESSIONAL_LIABILITY', 'CARGO', 'IMM', 
    'BUSINESS', 'CYBER', 'OTHER'
  ));

-- 5. Create insurance_claims table
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
  incident_date DATE NOT NULL,
  claim_type TEXT NOT NULL,
  claim_number TEXT,
  insurer TEXT,
  estimated_amount NUMERIC(15, 2),
  currency TEXT DEFAULT 'RON' CHECK (currency IN ('EUR', 'USD', 'RON')),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CLOSED')),
  description TEXT,
  notes TEXT,
  next_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_client_id ON public.insurance_claims(client_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON public.insurance_claims(policy_id);

-- 6. Enable RLS on new tables
ALTER TABLE public.client_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- No public access
DROP POLICY IF EXISTS "No public access to client_vehicles" ON public.client_vehicles;
CREATE POLICY "No public access to client_vehicles" ON public.client_vehicles FOR SELECT USING (false);

DROP POLICY IF EXISTS "No public access to client_properties" ON public.client_properties;
CREATE POLICY "No public access to client_properties" ON public.client_properties FOR SELECT USING (false);

DROP POLICY IF EXISTS "No public access to insurance_claims" ON public.insurance_claims;
CREATE POLICY "No public access to insurance_claims" ON public.insurance_claims FOR SELECT USING (false);

-- Authenticated users access
DROP POLICY IF EXISTS "Authenticated users can view client_vehicles" ON public.client_vehicles;
CREATE POLICY "Authenticated users can view client_vehicles" ON public.client_vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view client_properties" ON public.client_properties;
CREATE POLICY "Authenticated users can view client_properties" ON public.client_properties
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view insurance_claims" ON public.insurance_claims;
CREATE POLICY "Authenticated users can view insurance_claims" ON public.insurance_claims
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents manage
DROP POLICY IF EXISTS "Admins and agents can manage client_vehicles" ON public.client_vehicles;
CREATE POLICY "Admins and agents can manage client_vehicles" ON public.client_vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins and agents can manage client_properties" ON public.client_properties;
CREATE POLICY "Admins and agents can manage client_properties" ON public.client_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

DROP POLICY IF EXISTS "Admins and agents can manage insurance_claims" ON public.insurance_claims;
CREATE POLICY "Admins and agents can manage insurance_claims" ON public.insurance_claims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- 7. Atomic Full Client Creation RPC Function
CREATE OR REPLACE FUNCTION public.create_insurance_client_full(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id UUID;
  v_vehicle_id UUID := NULL;
  v_property_id UUID := NULL;
  v_policy_id UUID := NULL;
  v_opportunity_id UUID := NULL;
  v_activity_id UUID := NULL;
  v_follow_up_id UUID := NULL;
  v_claim_id UUID := NULL;

  v_client_data JSONB;
  v_policy_data JSONB;
  v_vehicle_data JSONB;
  v_property_data JSONB;
  v_opportunity_data JSONB;
  v_interaction_data JSONB;
  v_claim_data JSONB;

  v_lead_source TEXT;
  v_pref_comm TEXT;
BEGIN
  v_client_data := payload->'client';
  v_policy_data := payload->'policy';
  v_vehicle_data := payload->'vehicle';
  v_property_data := payload->'property';
  v_opportunity_data := payload->'opportunity';
  v_interaction_data := payload->'interaction';
  v_claim_data := payload->'claim';

  -- 1. Validate & Insert Client
  IF v_client_data IS NULL OR (v_client_data->>'first_name' IS NULL AND v_client_data->>'last_name' IS NULL) THEN
    RAISE EXCEPTION 'Client name is required';
  END IF;

  v_lead_source := LOWER(NULLIF(TRIM(v_client_data->>'lead_source'), ''));
  v_pref_comm := LOWER(NULLIF(TRIM(v_client_data->>'preferred_communication'), ''));
  IF v_pref_comm NOT IN ('phone', 'whatsapp', 'email') THEN
    v_pref_comm := 'whatsapp';
  END IF;

  INSERT INTO public.clients (
    first_name,
    last_name,
    phone,
    whatsapp,
    email,
    address,
    city,
    county,
    postal_code,
    country,
    role,
    client_type,
    lead_source,
    preferred_communication,
    date_of_birth,
    personal_notes,
    status
  ) VALUES (
    COALESCE(v_client_data->>'first_name', ''),
    COALESCE(v_client_data->>'last_name', ''),
    NULLIF(TRIM(v_client_data->>'phone'), ''),
    NULLIF(TRIM(v_client_data->>'whatsapp'), ''),
    NULLIF(TRIM(v_client_data->>'email'), ''),
    NULLIF(TRIM(v_client_data->>'address'), ''),
    NULLIF(TRIM(v_client_data->>'city'), ''),
    NULLIF(TRIM(v_client_data->>'county'), ''),
    NULLIF(TRIM(v_client_data->>'postal_code'), ''),
    COALESCE(NULLIF(TRIM(v_client_data->>'country'), ''), 'Romania'),
    NULLIF(TRIM(v_client_data->>'role'), ''),
    COALESCE(NULLIF(TRIM(v_client_data->>'client_type'), ''), 'INDIVIDUAL'),
    v_lead_source,
    v_pref_comm,
    NULLIF(TRIM(v_client_data->>'date_of_birth'), '')::DATE,
    NULLIF(TRIM(v_client_data->>'personal_notes'), ''),
    'ACTIVE'
  )
  RETURNING id INTO v_client_id;

  -- 2. Optional Vehicle
  IF v_vehicle_data IS NOT NULL AND NULLIF(TRIM(v_vehicle_data->>'vin'), '') IS NOT NULL THEN
    INSERT INTO public.client_vehicles (
      client_id,
      vin,
      make,
      model,
      year,
      plate_number,
      fuel_type,
      engine_capacity,
      power_hp,
      value,
      details
    ) VALUES (
      v_client_id,
      UPPER(TRIM(v_vehicle_data->>'vin')),
      COALESCE(NULLIF(TRIM(v_vehicle_data->>'make'), ''), 'Unknown'),
      COALESCE(NULLIF(TRIM(v_vehicle_data->>'model'), ''), 'Unknown'),
      NULLIF(TRIM(v_vehicle_data->>'year'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'plate_number'), ''),
      NULLIF(TRIM(v_vehicle_data->>'fuel_type'), ''),
      NULLIF(TRIM(v_vehicle_data->>'engine_capacity'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'power_hp'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'value'), '')::NUMERIC,
      NULLIF(TRIM(v_vehicle_data->>'details'), '')
    )
    RETURNING id INTO v_vehicle_id;
  END IF;

  -- 3. Optional Property
  IF v_property_data IS NOT NULL AND NULLIF(TRIM(v_property_data->>'address'), '') IS NOT NULL THEN
    INSERT INTO public.client_properties (
      client_id,
      property_type,
      address,
      city,
      county,
      surface_sqm,
      property_value,
      insured_value,
      construction_year,
      details,
      notes
    ) VALUES (
      v_client_id,
      COALESCE(NULLIF(TRIM(v_property_data->>'property_type'), ''), 'apartment'),
      TRIM(v_property_data->>'address'),
      NULLIF(TRIM(v_property_data->>'city'), ''),
      NULLIF(TRIM(v_property_data->>'county'), ''),
      NULLIF(TRIM(v_property_data->>'surface_sqm'), '')::NUMERIC,
      NULLIF(TRIM(v_property_data->>'property_value'), '')::NUMERIC,
      NULLIF(TRIM(v_property_data->>'insured_value'), '')::NUMERIC,
      NULLIF(TRIM(v_property_data->>'construction_year'), '')::INTEGER,
      NULLIF(TRIM(v_property_data->>'details'), ''),
      NULLIF(TRIM(v_property_data->>'notes'), '')
    )
    RETURNING id INTO v_property_id;
  END IF;

  -- 4. Optional Policy
  IF v_policy_data IS NOT NULL AND NULLIF(TRIM(v_policy_data->>'product'), '') IS NOT NULL AND NULLIF(TRIM(v_policy_data->>'insurer'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_policies (
      client_id,
      vehicle_id,
      client_property_id,
      policy_number,
      product,
      insurer,
      premium,
      commission,
      currency,
      start_date,
      issue_date,
      expiry_date,
      status,
      notes,
      details
    ) VALUES (
      v_client_id,
      v_vehicle_id,
      v_property_id,
      NULLIF(TRIM(v_policy_data->>'policy_number'), ''),
      TRIM(v_policy_data->>'product'),
      TRIM(v_policy_data->>'insurer'),
      COALESCE(NULLIF(TRIM(v_policy_data->>'premium'), '')::NUMERIC, 0),
      COALESCE(NULLIF(TRIM(v_policy_data->>'commission'), '')::NUMERIC, 0),
      COALESCE(NULLIF(TRIM(v_policy_data->>'currency'), ''), 'RON'),
      COALESCE(NULLIF(TRIM(v_policy_data->>'start_date'), '')::DATE, CURRENT_DATE),
      COALESCE(NULLIF(TRIM(v_policy_data->>'issue_date'), '')::DATE, NULLIF(TRIM(v_policy_data->>'start_date'), '')::DATE, CURRENT_DATE),
      COALESCE(NULLIF(TRIM(v_policy_data->>'expiry_date'), '')::DATE, CURRENT_DATE + INTERVAL '1 year'),
      COALESCE(NULLIF(TRIM(v_policy_data->>'status'), ''), 'ACTIVE'),
      NULLIF(TRIM(v_policy_data->>'notes'), ''),
      NULLIF(TRIM(v_policy_data->>'details'), '')
    )
    RETURNING id INTO v_policy_id;
  END IF;

  -- 5. Optional Opportunity
  IF v_opportunity_data IS NOT NULL AND NULLIF(TRIM(v_opportunity_data->>'product'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_opportunities (
      client_id,
      product,
      estimated_premium,
      currency,
      status,
      notes
    ) VALUES (
      v_client_id,
      TRIM(v_opportunity_data->>'product'),
      NULLIF(TRIM(v_opportunity_data->>'estimated_premium'), '')::NUMERIC,
      COALESCE(NULLIF(TRIM(v_opportunity_data->>'currency'), ''), 'RON'),
      COALESCE(NULLIF(TRIM(v_opportunity_data->>'status'), ''), 'LEAD'),
      NULLIF(TRIM(v_opportunity_data->>'notes'), '')
    )
    RETURNING id INTO v_opportunity_id;
  END IF;

  -- 6. Optional Initial Activity (Last Interaction)
  IF v_interaction_data IS NOT NULL AND (NULLIF(TRIM(v_interaction_data->>'last_activity_title'), '') IS NOT NULL OR NULLIF(TRIM(v_interaction_data->>'title'), '') IS NOT NULL) THEN
    INSERT INTO public.activities (
      client_id,
      type,
      title,
      notes,
      date
    ) VALUES (
      v_client_id,
      COALESCE(UPPER(NULLIF(TRIM(COALESCE(v_interaction_data->>'last_activity_type', v_interaction_data->>'type')), '')), 'CALL'),
      COALESCE(TRIM(v_interaction_data->>'last_activity_title'), TRIM(v_interaction_data->>'title')),
      COALESCE(NULLIF(TRIM(v_interaction_data->>'last_activity_notes'), ''), NULLIF(TRIM(v_interaction_data->>'notes'), '')),
      COALESCE(NULLIF(TRIM(COALESCE(v_interaction_data->>'last_activity_date', v_interaction_data->>'date')), '')::TIMESTAMP WITH TIME ZONE, NOW())
    )
    RETURNING id INTO v_activity_id;
  END IF;

  -- 7. Optional Scheduled Follow-up (Next Interaction)
  IF v_interaction_data IS NOT NULL AND (NULLIF(TRIM(v_interaction_data->>'next_followup_reason'), '') IS NOT NULL OR NULLIF(TRIM(v_interaction_data->>'reason'), '') IS NOT NULL) THEN
    INSERT INTO public.follow_ups (
      client_id,
      insurance_id,
      reason,
      due_date,
      priority,
      status,
      notes
    ) VALUES (
      v_client_id,
      v_policy_id,
      COALESCE(TRIM(v_interaction_data->>'next_followup_reason'), TRIM(v_interaction_data->>'reason')),
      COALESCE(NULLIF(TRIM(COALESCE(v_interaction_data->>'next_followup_date', v_interaction_data->>'due_date')), '')::DATE, CURRENT_DATE + INTERVAL '7 days'),
      COALESCE(NULLIF(TRIM(COALESCE(v_interaction_data->>'next_followup_priority', v_interaction_data->>'priority')), ''), 'MEDIUM'),
      'PENDING',
      COALESCE(NULLIF(TRIM(v_interaction_data->>'next_followup_notes'), ''), NULLIF(TRIM(v_interaction_data->>'notes'), ''))
    )
    RETURNING id INTO v_follow_up_id;
  END IF;

  -- 8. Optional Claim
  IF v_claim_data IS NOT NULL AND NULLIF(TRIM(v_claim_data->>'claim_type'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_claims (
      client_id,
      policy_id,
      incident_date,
      claim_type,
      claim_number,
      insurer,
      estimated_amount,
      currency,
      status,
      description,
      notes,
      next_action
    ) VALUES (
      v_client_id,
      v_policy_id,
      COALESCE(NULLIF(TRIM(v_claim_data->>'incident_date'), '')::DATE, CURRENT_DATE),
      TRIM(v_claim_data->>'claim_type'),
      NULLIF(TRIM(v_claim_data->>'claim_number'), ''),
      COALESCE(NULLIF(TRIM(v_claim_data->>'insurer'), ''), NULLIF(TRIM(v_policy_data->>'insurer'), '')),
      NULLIF(TRIM(v_claim_data->>'estimated_amount'), '')::NUMERIC,
      COALESCE(NULLIF(TRIM(v_claim_data->>'currency'), ''), 'RON'),
      COALESCE(NULLIF(TRIM(v_claim_data->>'status'), ''), 'OPEN'),
      NULLIF(TRIM(v_claim_data->>'description'), ''),
      NULLIF(TRIM(v_claim_data->>'notes'), ''),
      NULLIF(TRIM(v_claim_data->>'next_action'), '')
    )
    RETURNING id INTO v_claim_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'client_id', v_client_id,
    'policy_id', v_policy_id,
    'vehicle_id', v_vehicle_id,
    'property_id', v_property_id,
    'opportunity_id', v_opportunity_id,
    'activity_id', v_activity_id,
    'follow_up_id', v_follow_up_id,
    'claim_id', v_claim_id
  );
END;
$$;
