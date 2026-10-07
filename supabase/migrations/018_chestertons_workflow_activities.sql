-- Migration 018: Chestertons Real Estate Requests CRM Workflow, Statuses, Notes & Activities
-- Fully isolated from personal CRM clients and properties

-- 1. Add CRM Workflow fields to chestertons_requests table if they do not already exist
ALTER TABLE IF EXISTS public.chestertons_requests
  ADD COLUMN IF NOT EXISTS crm_status TEXT NOT NULL DEFAULT 'NESUNAT',
  ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS crm_notes TEXT;

-- Index for CRM Status filtering & reporting
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_crm_status ON public.chestertons_requests(crm_status);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_next_follow_up ON public.chestertons_requests(next_follow_up_at);

-- 2. Create isolated activities and notes table for Chestertons requests
CREATE TABLE IF NOT EXISTS public.chestertons_request_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL, -- references import_source_id (e.g. 'CC88558')
  activity_type TEXT NOT NULL DEFAULT 'NOTE' CHECK (activity_type IN ('NOTE', 'CALL', 'WHATSAPP', 'EMAIL', 'FOLLOW_UP', 'STATUS_CHANGE', 'MEETING', 'VIEWING', 'OFFER', 'OTHER')),
  status_from TEXT,
  status_to TEXT,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chestertons_activities_request_id ON public.chestertons_request_activities(request_id);
CREATE INDEX IF NOT EXISTS idx_chestertons_activities_created_at ON public.chestertons_request_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.chestertons_request_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view chestertons request activities"
  ON public.chestertons_request_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chestertons request activities"
  ON public.chestertons_request_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chestertons request activities"
  ON public.chestertons_request_activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anonymous access to chestertons request activities"
  ON public.chestertons_request_activities
  FOR ALL
  TO anon
  USING (false);
