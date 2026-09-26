-- Migration 010: Client Status System and Operational Workflow State

-- 1. Drop existing check constraint on clients.status safely
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- 2. Add updated CHECK constraint with all operational status values
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check
  CHECK (status IN (
    'NEW',
    'NOT_CONTACTED',
    'CONTACTED',
    'IN_DISCUSSION',
    'ACTIVE',
    'OFFERING',
    'IN_PROGRESS',
    'FOLLOW_UP',
    'CALL_BACK',
    'WAITING_CLIENT',
    'WAITING_DOCUMENTS',
    'CONVERTED',
    'REFUSED',
    'NO_RESPONSE',
    'INACTIVE',
    'LOST',
    'ARCHIVED'
  ));

-- 3. Set safe column default for new records
ALTER TABLE public.clients ALTER COLUMN status SET DEFAULT 'NOT_CONTACTED';

-- 4. Ensure index exists for status-based filtering and CRM queries
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- 5. Backfill safe default for any record with missing status
UPDATE public.clients
SET status = 'NOT_CONTACTED'
WHERE status IS NULL;
