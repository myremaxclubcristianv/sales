-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'AGENT', 'ASSISTANT', 'VIEWER')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  registration_number TEXT,
  tax_id TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Romania',
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (persons)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  role TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  secondary_contact TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Romania',
  preferred_communication TEXT DEFAULT 'whatsapp' CHECK (preferred_communication IN ('phone', 'whatsapp', 'email')),
  lead_source TEXT CHECK (lead_source IN ('website', 'whatsapp', 'telegram', 'instagram', 'facebook', 'referral', 'phone', 'email', 'property', 'campaign', 'other')),
  tags TEXT[],
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  date_of_birth DATE,
  important_dates JSONB,
  personal_notes TEXT,
  communication_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client relationships (multiple roles per client)
CREATE TABLE IF NOT EXISTS public.client_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('buyer', 'seller', 'landlord', 'investor', 'insurance', 'credit', 'b2b', 'partner', 'referral')),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, relationship_type)
);

-- Contacts (for companies)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'villa', 'land', 'commercial', 'office', 'retail', 'industrial', 'other')),
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  neighborhood TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  rooms INTEGER,
  built_area NUMERIC(10, 2),
  land_area NUMERIC(10, 2),
  price NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  property_status TEXT DEFAULT 'DRAFT' CHECK (property_status IN ('DRAFT', 'PRIVATE', 'PUBLIC', 'OFF_MARKET', 'RESERVED', 'SOLD', 'ARCHIVED')),
  availability TEXT CHECK (availability IN ('available', 'reserved', 'sold', 'rented', 'off_market')),
  description TEXT,
  features JSONB,
  owner_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  internal_notes TEXT,
  minimum_internal_price NUMERIC(15, 2),
  commission NUMERIC(10, 2),
  commission_percentage NUMERIC(5, 2),
  public_visibility BOOLEAN DEFAULT FALSE,
  public_price_visibility BOOLEAN DEFAULT TRUE,
  public_location_visibility BOOLEAN DEFAULT TRUE,
  public_request_visibility BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property media
CREATE TABLE IF NOT EXISTS public.property_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property documents (private)
CREATE TABLE IF NOT EXISTS public.property_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT CHECK (category IN ('contract', 'ownership', 'cadastral', 'legal', 'other')),
  description TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer requests
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'villa', 'land', 'commercial', 'office', 'retail', 'industrial', 'other')),
  preferred_locations TEXT[],
  budget_min NUMERIC(15, 2),
  budget_max NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  minimum_area NUMERIC(10, 2),
  desired_features JSONB,
  timeline TEXT,
  financing_required BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED')),
  notes TEXT,
  public_visibility BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT CHECK (source IN ('website', 'whatsapp', 'telegram', 'instagram', 'facebook', 'referral', 'phone', 'email', 'property', 'campaign', 'other')),
  campaign_id UUID,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  message TEXT,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'ARCHIVED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'rent', 'buy', 'insurance', 'credit', 'other')),
  title TEXT NOT NULL,
  value NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  stage TEXT DEFAULT 'PROSPECT' CHECK (stage IN ('PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'NOTE', 'VIEWING', 'FOLLOW_UP', 'TASK', 'DOCUMENT', 'OFFER', 'STATUS_CHANGE')),
  title TEXT NOT NULL,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  insurance_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
  credit_id UUID REFERENCES public.credit_cases(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'SNOOZED')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viewings
CREATE TABLE IF NOT EXISTS public.viewings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  attendees TEXT[],
  notes TEXT,
  feedback TEXT,
  interest TEXT CHECK (interest IN ('high', 'medium', 'low', 'none')),
  next_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  asking_price NUMERIC(15, 2) NOT NULL,
  offer_price NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  offer_date DATE NOT NULL,
  party TEXT CHECK (party IN ('buyer', 'seller')),
  notes TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'WITHDRAWN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance policies
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE,
  product TEXT NOT NULL CHECK (product IN ('RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'IMM', 'BUSINESS', 'PROFESSIONAL_LIABILITY', 'CARGO', 'OTHER')),
  insurer TEXT NOT NULL,
  premium NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_RENEWAL')),
  documents JSONB,
  notes TEXT,
  renewal_follow_up_id UUID REFERENCES public.follow_ups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance opportunities
CREATE TABLE IF NOT EXISTS public.insurance_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product TEXT NOT NULL CHECK (product IN ('RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'IMM', 'BUSINESS', 'PROFESSIONAL_LIABILITY', 'CARGO', 'OTHER')),
  estimated_premium NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  status TEXT DEFAULT 'LEAD' CHECK (status IN ('LEAD', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  notes TEXT,
  converted_to_policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit cases
CREATE TABLE IF NOT EXISTS public.credit_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'LEAD' CHECK (status IN ('LEAD', 'QUALIFICATION', 'ANALYSIS', 'DOCUMENTS', 'OFFERS', 'APPROVAL', 'CONTRACT', 'COMPLETED', 'LOST')),
  institution TEXT,
  documents JSONB,
  notes TEXT,
  follow_up_id UUID REFERENCES public.follow_ups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit documents
CREATE TABLE IF NOT EXISTS public.credit_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  credit_case_id UUID NOT NULL REFERENCES public.credit_cases(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents (client document vault)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  category TEXT CHECK (category IN ('general', 'real_estate', 'insurance', 'credit', 'other')),
  folder_name TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  insurance_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
  credit_id UUID REFERENCES public.credit_cases(id) ON DELETE SET NULL,
  notes TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document folders
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  objective TEXT,
  channel TEXT CHECK (channel IN ('website', 'social', 'email', 'paid_ads', 'referral', 'other')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2),
  currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'RON')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing events
CREATE TABLE IF NOT EXISTS public.marketing_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  referred_client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  opportunities_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal events (birthdays, anniversaries, etc.)
CREATE TABLE IF NOT EXISTS public.personal_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'custom')),
  event_date DATE NOT NULL,
  title TEXT,
  notes TEXT,
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public metrics
CREATE TABLE IF NOT EXISTS public.public_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  metric_value INTEGER NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(property_status);
CREATE INDEX IF NOT EXISTS idx_properties_public_visibility ON public.properties(public_visibility);
CREATE INDEX IF NOT EXISTS idx_requests_buyer_id ON public.requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date ON public.follow_ups(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_client_id ON public.follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON public.activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_insurance_expiry ON public.insurance_policies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_insurance_client_id ON public.insurance_policies(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_status ON public.credit_cases(status);
CREATE INDEX IF NOT EXISTS idx_credit_client_id ON public.credit_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_viewings_date ON public.viewings(date);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON public.viewings(status);
