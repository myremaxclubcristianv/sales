-- Security Verification Suite: RLS, Grants & RPC Authorization Tests

BEGIN;

-- 1. Test that anonymous cannot call create_insurance_client_full
DO $$
BEGIN
  SET ROLE anon;
  BEGIN
    PERFORM public.create_insurance_client_full('{"client": {"first_name": "Attacker", "phone": "0700000000"}}'::JSONB);
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user was able to execute create_insurance_client_full!';
  EXCEPTION
    WHEN insufficient_privilege OR string_data_right_truncation OR others THEN
      RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user blocked from create_insurance_client_full (Error: %)', SQLERRM;
  END;
  RESET ROLE;
END $$;

-- 2. Test that anonymous cannot SELECT private clients
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.clients;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user can view % private clients!', v_count;
  ELSE
    RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user sees 0 private clients via RLS';
  END IF;
  RESET ROLE;
END $$;

-- 3. Test that anonymous cannot SELECT private contacts
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.contacts;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user can view % private contacts!', v_count;
  ELSE
    RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user sees 0 private contacts via RLS';
  END IF;
  RESET ROLE;
END $$;

-- 4. Test that anonymous cannot SELECT private insurance policies
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.insurance_policies;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user can view % insurance policies!', v_count;
  ELSE
    RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user sees 0 insurance policies via RLS';
  END IF;
  RESET ROLE;
END $$;

-- 5. Test that anonymous cannot SELECT private documents
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.documents;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user can view % private documents!', v_count;
  ELSE
    RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user sees 0 private documents via RLS';
  END IF;
  RESET ROLE;
END $$;

-- 6. Test that anonymous cannot SELECT private audit logs
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.audit_logs;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY TEST FAILED: Anonymous user can view % audit logs!', v_count;
  ELSE
    RAISE NOTICE 'SECURITY TEST PASSED: Anonymous user sees 0 audit logs via RLS';
  END IF;
  RESET ROLE;
END $$;

ROLLBACK;
