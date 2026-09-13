-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Service role can manage profiles (for auth triggers)
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- COMPANIES POLICIES
-- Authenticated users can view companies
CREATE POLICY "Authenticated users can view companies" ON public.companies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can create companies
CREATE POLICY "Admins and agents can create companies" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- Admins and agents can update companies
CREATE POLICY "Admins and agents can update companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CLIENTS POLICIES
-- IMPORTANT: Public users CANNOT view client data
CREATE POLICY "No public access to clients" ON public.clients
  FOR SELECT USING (false);

-- Authenticated users can view clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can create clients
CREATE POLICY "Admins and agents can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- Admins and agents can update clients
CREATE POLICY "Admins and agents can update clients" ON public.clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CLIENT RELATIONSHIPS POLICIES
-- No public access
CREATE POLICY "No public access to client relationships" ON public.client_relationships
  FOR SELECT USING (false);

-- Authenticated users can view client relationships
CREATE POLICY "Authenticated users can view client relationships" ON public.client_relationships
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage client relationships
CREATE POLICY "Admins and agents can manage client relationships" ON public.client_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CONTACTS POLICIES
-- No public access
CREATE POLICY "No public access to contacts" ON public.contacts
  FOR SELECT USING (false);

-- Authenticated users can view contacts
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage contacts
CREATE POLICY "Admins and agents can manage contacts" ON public.contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- PROPERTIES POLICIES
-- Public users can view public properties only
CREATE POLICY "Public can view public properties" ON public.properties
  FOR SELECT USING (
    public_visibility = true AND property_status = 'PUBLIC'
  );

-- Authenticated users can view all properties
CREATE POLICY "Authenticated users can view all properties" ON public.properties
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can create properties
CREATE POLICY "Admins and agents can create properties" ON public.properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- Admins and agents can update properties
CREATE POLICY "Admins and agents can update properties" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- PROPERTY MEDIA POLICIES
-- Public can view media for public properties
CREATE POLICY "Public can view property media" ON public.property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_media.property_id 
      AND public_visibility = true 
      AND property_status = 'PUBLIC'
    )
  );

-- Authenticated users can view all property media
CREATE POLICY "Authenticated users can view all property media" ON public.property_media
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage property media
CREATE POLICY "Admins and agents can manage property media" ON public.property_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- PROPERTY DOCUMENTS POLICIES
-- IMPORTANT: No public access to private property documents
CREATE POLICY "No public access to property documents" ON public.property_documents
  FOR SELECT USING (false);

-- Authenticated users can view property documents
CREATE POLICY "Authenticated users can view property documents" ON public.property_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage property documents
CREATE POLICY "Admins and agents can manage property documents" ON public.property_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- REQUESTS POLICIES
-- Public can view public requests (sanitized)
CREATE POLICY "Public can view public requests" ON public.requests
  FOR SELECT USING (
    public_visibility = true AND status = 'ACTIVE'
  );

-- Authenticated users can view all requests
CREATE POLICY "Authenticated users can view all requests" ON public.requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage requests
CREATE POLICY "Admins and agents can manage requests" ON public.requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- LEADS POLICIES
-- No public access to leads
CREATE POLICY "No public access to leads" ON public.leads
  FOR SELECT USING (false);

-- Authenticated users can view leads
CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage leads
CREATE POLICY "Admins and agents can manage leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- OPPORTUNITIES POLICIES
-- No public access to opportunities
CREATE POLICY "No public access to opportunities" ON public.opportunities
  FOR SELECT USING (false);

-- Authenticated users can view opportunities
CREATE POLICY "Authenticated users can view opportunities" ON public.opportunities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage opportunities
CREATE POLICY "Admins and agents can manage opportunities" ON public.opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- ACTIVITIES POLICIES
-- No public access to activities
CREATE POLICY "No public access to activities" ON public.activities
  FOR SELECT USING (false);

-- Authenticated users can view activities
CREATE POLICY "Authenticated users can view activities" ON public.activities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage activities
CREATE POLICY "Admins and agents can manage activities" ON public.activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- FOLLOW-UPS POLICIES
-- No public access to follow-ups
CREATE POLICY "No public access to follow-ups" ON public.follow_ups
  FOR SELECT USING (false);

-- Authenticated users can view follow-ups
CREATE POLICY "Authenticated users can view follow-ups" ON public.follow_ups
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage follow-ups
CREATE POLICY "Admins and agents can manage follow-ups" ON public.follow_ups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- TASKS POLICIES
-- No public access to tasks
CREATE POLICY "No public access to tasks" ON public.tasks
  FOR SELECT USING (false);

-- Authenticated users can view tasks
CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage tasks
CREATE POLICY "Admins and agents can manage tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- VIEWINGS POLICIES
-- No public access to viewings
CREATE POLICY "No public access to viewings" ON public.viewings
  FOR SELECT USING (false);

-- Authenticated users can view viewings
CREATE POLICY "Authenticated users can view viewings" ON public.viewings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage viewings
CREATE POLICY "Admins and agents can manage viewings" ON public.viewings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- OFFERS POLICIES
-- No public access to offers
CREATE POLICY "No public access to offers" ON public.offers
  FOR SELECT USING (false);

-- Authenticated users can view offers
CREATE POLICY "Authenticated users can view offers" ON public.offers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage offers
CREATE POLICY "Admins and agents can manage offers" ON public.offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- INSURANCE POLICIES POLICIES
-- No public access to insurance policies
CREATE POLICY "No public access to insurance policies" ON public.insurance_policies
  FOR SELECT USING (false);

-- Authenticated users can view insurance policies
CREATE POLICY "Authenticated users can view insurance policies" ON public.insurance_policies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage insurance policies
CREATE POLICY "Admins and agents can manage insurance policies" ON public.insurance_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- INSURANCE OPPORTUNITIES POLICIES
-- No public access to insurance opportunities
CREATE POLICY "No public access to insurance opportunities" ON public.insurance_opportunities
  FOR SELECT USING (false);

-- Authenticated users can view insurance opportunities
CREATE POLICY "Authenticated users can view insurance opportunities" ON public.insurance_opportunities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage insurance opportunities
CREATE POLICY "Admins and agents can manage insurance opportunities" ON public.insurance_opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CREDIT CASES POLICIES
-- No public access to credit cases
CREATE POLICY "No public access to credit cases" ON public.credit_cases
  FOR SELECT USING (false);

-- Authenticated users can view credit cases
CREATE POLICY "Authenticated users can view credit cases" ON public.credit_cases
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage credit cases
CREATE POLICY "Admins and agents can manage credit cases" ON public.credit_cases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CREDIT DOCUMENTS POLICIES
-- No public access to credit documents
CREATE POLICY "No public access to credit documents" ON public.credit_documents
  FOR SELECT USING (false);

-- Authenticated users can view credit documents
CREATE POLICY "Authenticated users can view credit documents" ON public.credit_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage credit documents
CREATE POLICY "Admins and agents can manage credit documents" ON public.credit_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- DOCUMENTS POLICIES
-- IMPORTANT: No public access to client documents
CREATE POLICY "No public access to documents" ON public.documents
  FOR SELECT USING (false);

-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents" ON public.documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage documents
CREATE POLICY "Admins and agents can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- DOCUMENT FOLDERS POLICIES
-- No public access to document folders
CREATE POLICY "No public access to document folders" ON public.document_folders
  FOR SELECT USING (false);

-- Authenticated users can view document folders
CREATE POLICY "Authenticated users can view document folders" ON public.document_folders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage document folders
CREATE POLICY "Admins and agents can manage document folders" ON public.document_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- CAMPAIGNS POLICIES
-- No public access to campaigns
CREATE POLICY "No public access to campaigns" ON public.campaigns
  FOR SELECT USING (false);

-- Authenticated users can view campaigns
CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage campaigns
CREATE POLICY "Admins and agents can manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- MARKETING EVENTS POLICIES
-- No public access to marketing events
CREATE POLICY "No public access to marketing events" ON public.marketing_events
  FOR SELECT USING (false);

-- Authenticated users can view marketing events
CREATE POLICY "Authenticated users can view marketing events" ON public.marketing_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage marketing events
CREATE POLICY "Admins and agents can manage marketing events" ON public.marketing_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- REFERRALS POLICIES
-- No public access to referrals
CREATE POLICY "No public access to referrals" ON public.referrals
  FOR SELECT USING (false);

-- Authenticated users can view referrals
CREATE POLICY "Authenticated users can view referrals" ON public.referrals
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage referrals
CREATE POLICY "Admins and agents can manage referrals" ON public.referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- PERSONAL EVENTS POLICIES
-- No public access to personal events
CREATE POLICY "No public access to personal events" ON public.personal_events
  FOR SELECT USING (false);

-- Authenticated users can view personal events
CREATE POLICY "Authenticated users can view personal events" ON public.personal_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and agents can manage personal events
CREATE POLICY "Admins and agents can manage personal events" ON public.personal_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'AGENT')
    )
  );

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications" ON public.notifications
  FOR ALL USING (auth.role() = 'service_role');

-- AUDIT LOGS POLICIES
-- No public access to audit logs
CREATE POLICY "No public access to audit logs" ON public.audit_logs
  FOR SELECT USING (false);

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Service role can manage audit logs
CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- PUBLIC METRICS POLICIES
-- Public can view visible metrics
CREATE POLICY "Public can view visible metrics" ON public.public_metrics
  FOR SELECT USING (visible = true);

-- Authenticated users can view all metrics
CREATE POLICY "Authenticated users can view all metrics" ON public.public_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage metrics
CREATE POLICY "Admins can manage metrics" ON public.public_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- SETTINGS POLICIES
-- No public access to settings
CREATE POLICY "No public access to settings" ON public.settings
  FOR SELECT USING (false);

-- Authenticated users can view settings
CREATE POLICY "Authenticated users can view settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
