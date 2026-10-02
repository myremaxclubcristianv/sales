-- Migration 012: Visitor Intelligence & Marketing Analytics Schema
-- Enables privacy-conscious session tracking, page journeys, event logging, and lead attribution

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  landing_page TEXT NOT NULL,
  current_page TEXT,
  exit_page TEXT,
  page_count INTEGER NOT NULL DEFAULT 1,
  active_duration_seconds INTEGER NOT NULL DEFAULT 0,
  referrer TEXT,
  source TEXT DEFAULT 'direct',
  medium TEXT,
  campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  screen_resolution TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  language TEXT,
  timezone TEXT,
  ip_hash TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  page_journey JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  previous_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON public.visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started_at ON public.visitor_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_source ON public.visitor_sessions(source);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_lead_id ON public.visitor_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON public.visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON public.visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON public.visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON public.visitor_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated staff / admins can view analytics; Anonymous can insert via service role API only
CREATE POLICY "Admins can view visitor sessions"
  ON public.visitor_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can view visitor events"
  ON public.visitor_events FOR SELECT
  TO authenticated
  USING (true);
