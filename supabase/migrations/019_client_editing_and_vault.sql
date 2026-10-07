-- ==============================================================================
-- 019: CLIENT EDITING + SECURE PRIVATE DOCUMENT VAULT
-- Additive migration for multiple phones/emails, private client documents, and cryptographic vault
-- ==============================================================================

-- 1. Add multiple phone & email support to clients table safely
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS phone_1 TEXT,
  ADD COLUMN IF NOT EXISTS phone_2 TEXT,
  ADD COLUMN IF NOT EXISTS phone_3 TEXT,
  ADD COLUMN IF NOT EXISTS email_1 TEXT,
  ADD COLUMN IF NOT EXISTS email_2 TEXT;

-- Backfill phone_1 and email_1 from existing phone/email
UPDATE public.clients
SET phone_1 = phone
WHERE phone_1 IS NULL AND phone IS NOT NULL;

UPDATE public.clients
SET email_1 = email
WHERE email_1 IS NULL AND email IS NOT NULL;

-- 2. Create client_documents table for private vault document metadata
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  safe_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ALTELE',
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_category ON public.client_documents(category);

-- 3. Create client_vaults table for Layer 2 cryptographic vault lock
CREATE TABLE IF NOT EXISTS public.client_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  vault_password_hash TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_vaults_client_id ON public.client_vaults(client_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_vaults ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Authenticated CRM users only, Anon DENIED
DROP POLICY IF EXISTS "Authenticated users full access to client_documents" ON public.client_documents;
CREATE POLICY "Authenticated users full access to client_documents"
  ON public.client_documents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to client_vaults" ON public.client_vaults;
CREATE POLICY "Authenticated users full access to client_vaults"
  ON public.client_vaults
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure public/anon have no select or modify access
REVOKE ALL ON public.client_documents FROM anon;
REVOKE ALL ON public.client_vaults FROM anon;
GRANT ALL ON public.client_documents TO authenticated, service_role;
GRANT ALL ON public.client_vaults TO authenticated, service_role;
