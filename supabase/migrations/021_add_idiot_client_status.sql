-- Migration 021: Add IDIOT client status to check constraint safely
-- Keeps all existing operational statuses intact and appends 'IDIOT'

-- 1. Drop existing check constraint on clients.status safely
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- 2. Re-create CHECK constraint with all previous operational statuses plus 'IDIOT'
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
    'ARCHIVED',
    'IDIOT'
  ));
