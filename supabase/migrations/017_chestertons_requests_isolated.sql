-- Migration 017: Isolated Chestertons Real Estate Requests Architecture
-- Fully isolated from existing CRM clients, properties, and standard requests
-- Zero mixing / Zero regression / Complete 38-column fidelity

CREATE TABLE IF NOT EXISTS public.chestertons_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_source_id TEXT NOT NULL UNIQUE,
  source_group TEXT NOT NULL DEFAULT 'REAL_ESTATE_CHESTERTONS_REQUESTS',
  source_group_label TEXT NOT NULL DEFAULT 'Cereri Chestertons',
  source_file TEXT,
  source_row_index INTEGER,

  -- All 38 source fields preserved exactly
  data_adaugare TEXT,
  date_modificare TEXT,
  agent TEXT,
  titlu TEXT,
  cumparator TEXT NOT NULL,
  email TEXT,
  telefon TEXT,
  tip_lead TEXT NOT NULL,
  tip_cerere TEXT,
  judet TEXT,
  oras TEXT,
  cartier TEXT,
  zona TEXT,
  sursa TEXT,
  observatii TEXT,
  tip_teren TEXT,
  destinatie TEXT,
  suprafata_teren TEXT,
  buget1 TEXT,
  buget2 TEXT,
  tva TEXT,
  suprafata_construita TEXT,
  suprafata_utila TEXT,
  expunere TEXT,
  vitrina TEXT,
  inaltime TEXT,
  suprafata_depozit TEXT,
  suprafata_birouri TEXT,
  suprafata_productie TEXT,
  locuri_de_parcare TEXT,
  an_constructie TEXT,
  nr_camere TEXT,
  buget_credit TEXT,
  pierdut TEXT,
  data_limita TEXT,
  id_intern TEXT,
  status_cerere TEXT,

  -- Parsed helper fields for fast querying
  parsed_buget1 NUMERIC(15, 2),
  parsed_buget2 NUMERIC(15, 2),
  parsed_nr_camere INTEGER,
  parsed_status TEXT NOT NULL DEFAULT 'Blank' CHECK (parsed_status IN ('Activa', 'Retrasa', 'Blank')),

  -- Complete raw source payload
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance and Filter Indexes
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_import_source_id ON public.chestertons_requests(import_source_id);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_source_group ON public.chestertons_requests(source_group);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_status_cerere ON public.chestertons_requests(status_cerere);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_parsed_status ON public.chestertons_requests(parsed_status);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_tip_lead ON public.chestertons_requests(tip_lead);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_sursa ON public.chestertons_requests(sursa);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_agent ON public.chestertons_requests(agent);
CREATE INDEX IF NOT EXISTS idx_chestertons_requests_id_intern ON public.chestertons_requests(id_intern);

-- Enable RLS
ALTER TABLE public.chestertons_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated CRM users / profiles have full read/write access
CREATE POLICY "Authenticated users can view chestertons requests"
  ON public.chestertons_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chestertons requests"
  ON public.chestertons_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chestertons requests"
  ON public.chestertons_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users cannot access private client request records
CREATE POLICY "Deny anonymous access to chestertons requests"
  ON public.chestertons_requests
  FOR ALL
  TO anon
  USING (false);
