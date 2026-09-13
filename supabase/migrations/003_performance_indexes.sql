-- Phase 4, 5, 6, 7 Performance Optimization Indexes
-- Ensures high-speed index scans for Next-Best-Action radar, search, lead attribution, and real analytics

-- Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON public.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_request_id ON public.leads(request_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON public.campaigns(channel);

-- Offers & Negotiations Indexes
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON public.offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_client_id ON public.offers(client_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- Personal Events Indexes
CREATE INDEX IF NOT EXISTS idx_personal_events_client_id ON public.personal_events(client_id);
CREATE INDEX IF NOT EXISTS idx_personal_events_date ON public.personal_events(event_date);

-- Properties Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);

-- Client Relationships Indexes
CREATE INDEX IF NOT EXISTS idx_client_relationships_client_id ON public.client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_type ON public.client_relationships(relationship_type);
