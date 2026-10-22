-- Migration 022: Server-side atomic transaction for quick schedule (follow_ups + activities)
-- Provides full ACID atomicity at the Postgres database engine level.
-- DO NOT APPLY TO PRODUCTION WITHOUT USER CONFIRMATION.

CREATE OR REPLACE FUNCTION public.create_scheduled_follow_up(
  p_client_id UUID,
  p_reason TEXT,
  p_due_date TIMESTAMPTZ,
  p_priority TEXT DEFAULT 'NORMAL',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_follow_up RECORD;
  v_activity RECORD;
  v_user_id UUID;
  v_is_authorized BOOLEAN := FALSE;
  v_profile_user_id UUID := NULL;
  v_priority TEXT;
  v_date_str TEXT;
  v_time_str TEXT;
  v_activity_notes TEXT;
BEGIN
  -- 1. Verificare utilizator autentificat
  v_user_id := auth.uid();
  IF auth.role() = 'service_role' THEN
    v_is_authorized := TRUE;
  ELSIF v_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = v_user_id 
        AND role IN ('ADMIN', 'AGENT')
    ) INTO v_is_authorized;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Unauthorized: Doar administratorii și agenții autorizați pot programa activități.';
  END IF;

  -- 2. Validare parametri obligatorii
  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'client_id este obligatoriu.';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'reason este obligatoriu.';
  END IF;

  IF p_due_date IS NULL THEN
    RAISE EXCEPTION 'due_date este obligatoriu.';
  END IF;

  -- 3. Verificare existență client
  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id) THEN
    RAISE EXCEPTION 'Clientul specificat nu există sau nu aveți acces.';
  END IF;

  -- 4. Validare prioritate conform constrângerii follow_ups_priority_check
  v_priority := upper(trim(COALESCE(p_priority, 'NORMAL')));
  IF v_priority NOT IN ('LOW', 'NORMAL', 'HIGH', 'URGENT') THEN
    v_priority := 'NORMAL';
  END IF;

  -- 5. Verificare existență profil pentru FK activities_created_by_fkey
  IF v_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    v_profile_user_id := v_user_id;
  END IF;

  -- 6. Inserare follow-up în tranzacție
  INSERT INTO public.follow_ups (
    client_id,
    reason,
    due_date,
    priority,
    status,
    notes
  ) VALUES (
    p_client_id,
    trim(p_reason),
    p_due_date,
    v_priority,
    'PENDING',
    p_notes
  )
  RETURNING * INTO v_follow_up;

  -- 7. Formatare dată și oră pentru timeline activități (fus orar Europa/București)
  v_date_str := to_char(p_due_date AT TIME ZONE 'Europe/Bucharest', 'DD.MM.YYYY');
  v_time_str := to_char(p_due_date AT TIME ZONE 'Europe/Bucharest', 'HH24:MI');

  v_activity_notes := 'Dată: ' || v_date_str;
  IF v_time_str IS NOT NULL AND v_time_str <> '00:00' THEN
    v_activity_notes := v_activity_notes || ' la ' || v_time_str;
  END IF;
  IF p_notes IS NOT NULL AND length(trim(p_notes)) > 0 THEN
    v_activity_notes := v_activity_notes || ' · Note: ' || trim(p_notes);
  END IF;

  -- 8. Inserare activitate asociată în aceeași tranzacție
  INSERT INTO public.activities (
    client_id,
    type,
    title,
    notes,
    date,
    created_by
  ) VALUES (
    p_client_id,
    'FOLLOW_UP',
    'Programat: ' || trim(p_reason),
    v_activity_notes,
    now(),
    v_profile_user_id
  )
  RETURNING * INTO v_activity;

  -- Returnare ambele entități confirmate
  RETURN jsonb_build_object(
    'followUp', row_to_json(v_follow_up),
    'activity', row_to_json(v_activity)
  );
END;
$$;

-- Restrângere privilegii conform principiului minimului de drepturi
REVOKE EXECUTE ON FUNCTION public.create_scheduled_follow_up(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_scheduled_follow_up(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_scheduled_follow_up(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO authenticated, service_role;
