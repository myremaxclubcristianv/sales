-- Migration 009: Harden SECURITY DEFINER functions, enforce least-privilege grants, and restrict RPCs

-- 1. Update create_insurance_client_full with strict authorization check
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
  v_current_user_id UUID;
  v_is_authorized BOOLEAN := FALSE;
BEGIN
  -- Authorization verification: must be service_role or authenticated ADMIN/AGENT
  v_current_user_id := auth.uid();
  
  IF auth.role() = 'service_role' THEN
    v_is_authorized := TRUE;
  ELSIF v_current_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = v_current_user_id 
        AND role IN ('ADMIN', 'AGENT')
    ) INTO v_is_authorized;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Unauthorized: only admins and agents can create full insurance client records';
  END IF;

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

  v_lead_source := NULLIF(TRIM(v_client_data->>'lead_source'), '');
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
    category,
    lead_source,
    preferred_communication,
    date_of_birth,
    personal_notes,
    interest_summary,
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
    'INSURANCE',
    v_lead_source,
    v_pref_comm,
    NULLIF(TRIM(v_client_data->>'date_of_birth'), '')::DATE,
    NULLIF(TRIM(v_client_data->>'personal_notes'), ''),
    NULLIF(TRIM(v_client_data->>'interest_summary'), ''),
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
      engine_capacity_cc,
      power_kw,
      registration_date
    ) VALUES (
      v_client_id,
      UPPER(TRIM(v_vehicle_data->>'vin')),
      NULLIF(TRIM(v_vehicle_data->>'make'), ''),
      NULLIF(TRIM(v_vehicle_data->>'model'), ''),
      NULLIF(TRIM(v_vehicle_data->>'year'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'plate_number'), ''),
      NULLIF(TRIM(v_vehicle_data->>'fuel_type'), ''),
      NULLIF(TRIM(v_vehicle_data->>'engine_capacity_cc'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'power_kw'), '')::INTEGER,
      NULLIF(TRIM(v_vehicle_data->>'registration_date'), '')::DATE
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
      postal_code,
      year_built,
      usable_area_sqm,
      structure_type,
      cadastral_number,
      estimated_value_eur
    ) VALUES (
      v_client_id,
      COALESCE(NULLIF(TRIM(v_property_data->>'property_type'), ''), 'APARTMENT'),
      TRIM(v_property_data->>'address'),
      NULLIF(TRIM(v_property_data->>'city'), ''),
      NULLIF(TRIM(v_property_data->>'county'), ''),
      NULLIF(TRIM(v_property_data->>'postal_code'), ''),
      NULLIF(TRIM(v_property_data->>'year_built'), '')::INTEGER,
      NULLIF(TRIM(v_property_data->>'usable_area_sqm'), '')::NUMERIC,
      NULLIF(TRIM(v_property_data->>'structure_type'), ''),
      NULLIF(TRIM(v_property_data->>'cadastral_number'), ''),
      NULLIF(TRIM(v_property_data->>'estimated_value_eur'), '')::NUMERIC
    )
    RETURNING id INTO v_property_id;
  END IF;

  -- 4. Optional Policy
  IF v_policy_data IS NOT NULL AND NULLIF(TRIM(v_policy_data->>'product'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_policies (
      client_id,
      vehicle_id,
      property_id,
      policy_number,
      insurer,
      product,
      start_date,
      expiry_date,
      premium,
      currency,
      commission,
      status,
      auto_renewal,
      notes
    ) VALUES (
      v_client_id,
      v_vehicle_id,
      v_property_id,
      NULLIF(TRIM(v_policy_data->>'policy_number'), ''),
      COALESCE(NULLIF(TRIM(v_policy_data->>'insurer'), ''), 'Generali'),
      TRIM(v_policy_data->>'product'),
      COALESCE(NULLIF(TRIM(v_policy_data->>'start_date'), '')::DATE, CURRENT_DATE),
      COALESCE(NULLIF(TRIM(v_policy_data->>'expiry_date'), '')::DATE, CURRENT_DATE + INTERVAL '1 year'),
      COALESCE(NULLIF(TRIM(v_policy_data->>'premium'), '')::NUMERIC, 0),
      COALESCE(NULLIF(TRIM(v_policy_data->>'currency'), ''), 'EUR'),
      NULLIF(TRIM(v_policy_data->>'commission'), '')::NUMERIC,
      'ACTIVE',
      COALESCE((v_policy_data->>'auto_renewal')::BOOLEAN, FALSE),
      NULLIF(TRIM(v_policy_data->>'notes'), '')
    )
    RETURNING id INTO v_policy_id;
  END IF;

  -- 5. Optional Opportunity
  IF v_opportunity_data IS NOT NULL AND NULLIF(TRIM(v_opportunity_data->>'product'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_opportunities (
      client_id,
      product,
      insurer,
      estimated_premium,
      currency,
      status,
      notes
    ) VALUES (
      v_client_id,
      TRIM(v_opportunity_data->>'product'),
      NULLIF(TRIM(v_opportunity_data->>'insurer'), ''),
      NULLIF(TRIM(v_opportunity_data->>'estimated_premium'), '')::NUMERIC,
      COALESCE(NULLIF(TRIM(v_opportunity_data->>'currency'), ''), 'EUR'),
      'PROPOSAL_SENT',
      NULLIF(TRIM(v_opportunity_data->>'notes'), '')
    )
    RETURNING id INTO v_opportunity_id;
  END IF;

  -- 6. Optional Initial Interaction (Activity & Follow-Up)
  IF v_interaction_data IS NOT NULL THEN
    IF NULLIF(TRIM(v_interaction_data->>'activity_title'), '') IS NOT NULL THEN
      INSERT INTO public.activities (
        client_id,
        type,
        title,
        notes,
        date
      ) VALUES (
        v_client_id,
        COALESCE(NULLIF(TRIM(v_interaction_data->>'activity_type'), ''), 'MEETING'),
        TRIM(v_interaction_data->>'activity_title'),
        NULLIF(TRIM(v_interaction_data->>'activity_notes'), ''),
        COALESCE(NULLIF(TRIM(v_interaction_data->>'activity_date'), '')::TIMESTAMPTZ, NOW())
      )
      RETURNING id INTO v_activity_id;
    END IF;

    IF NULLIF(TRIM(v_interaction_data->>'follow_up_due_date'), '') IS NOT NULL THEN
      INSERT INTO public.follow_ups (
        client_id,
        reason,
        notes,
        due_date,
        priority,
        status
      ) VALUES (
        v_client_id,
        COALESCE(NULLIF(TRIM(v_interaction_data->>'follow_up_reason'), ''), 'Follow-up inițial asigurare'),
        NULLIF(TRIM(v_interaction_data->>'follow_up_notes'), ''),
        (v_interaction_data->>'follow_up_due_date')::TIMESTAMPTZ,
        COALESCE(NULLIF(TRIM(v_interaction_data->>'follow_up_priority'), ''), 'MEDIUM'),
        'PENDING'
      )
      RETURNING id INTO v_follow_up_id;
    END IF;
  END IF;

  -- 7. Optional Claim
  IF v_claim_data IS NOT NULL AND v_policy_id IS NOT NULL AND NULLIF(TRIM(v_claim_data->>'claim_number'), '') IS NOT NULL THEN
    INSERT INTO public.insurance_claims (
      policy_id,
      client_id,
      claim_number,
      incident_date,
      claim_amount,
      currency,
      status,
      description
    ) VALUES (
      v_policy_id,
      v_client_id,
      TRIM(v_claim_data->>'claim_number'),
      COALESCE(NULLIF(TRIM(v_claim_data->>'incident_date'), '')::DATE, CURRENT_DATE),
      NULLIF(TRIM(v_claim_data->>'claim_amount'), '')::NUMERIC,
      COALESCE(NULLIF(TRIM(v_claim_data->>'currency'), ''), 'EUR'),
      'REGISTERED',
      NULLIF(TRIM(v_claim_data->>'description'), '')
    )
    RETURNING id INTO v_claim_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
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

-- 2. Revoke execute from anonymous role on security definer function
REVOKE EXECUTE ON FUNCTION public.create_insurance_client_full(JSONB) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_insurance_client_full(JSONB) TO authenticated, service_role;
