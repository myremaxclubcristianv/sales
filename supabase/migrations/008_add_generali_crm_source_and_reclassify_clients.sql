-- Migration 008: Add GENERALI_CRM source and reclassify existing 17 clients to INSURANCE

-- 1. Extend lead_source constraint to include GENERALI_CRM
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_lead_source_check;

ALTER TABLE public.clients ADD CONSTRAINT clients_lead_source_check
  CHECK (
    lead_source IS NULL OR lead_source IN (
      'GENERALI_CRM',
      'DIRECT_CONTACT',
      'PHONE',
      'WHATSAPP',
      'WHATSAPP_GROUPS',
      'EMAIL',
      'JOTFORM',
      'LINKEDIN',
      'WEBSITE_INSURANCE',
      'WEBSITE_HOMEFIND',
      'WEBSITE_CREDITE',
      'WEBSITE_OS',
      'INSTAGRAM',
      'FACEBOOK',
      'TELEGRAM',
      'REFERRAL',
      'OTHER',
      'website',
      'whatsapp',
      'telegram',
      'instagram',
      'facebook',
      'referral',
      'phone',
      'email',
      'property',
      'campaign',
      'other'
    )
  );

-- 2. Reclassify the existing dataset of 17 clients from REAL_ESTATE to INSURANCE
-- Note: Modifies strictly category without altering names, phones, emails, sources, notes, etc.
UPDATE public.clients
SET category = 'INSURANCE'
WHERE category = 'REAL_ESTATE'
  AND id IN (
    '7dc9c7d7-3017-45b5-8a2f-167b542f7c6f',
    '323532c9-c5b6-47aa-bbaa-3b840036d85e',
    '6bc0890f-ffec-4577-931c-43e31bb217ae',
    '57403298-a839-481f-ac45-122fb806d4c2',
    '6c48c10f-8899-42f7-bf37-f47e6a184756',
    '2aef18ed-fee2-440b-9262-8789a0f5a55d',
    '2372fd64-abc6-4caf-8ea2-61e3612b0a16',
    '367e2dd3-ec0b-4d0e-a340-21eb7e0727a5',
    '0981cb53-208a-4e88-959d-ce8474fdcd98',
    '105d3f68-0898-40fd-88dc-7ecc72dc761e',
    'b41e6456-98ed-4b5e-a699-6711875291db',
    '99360279-a051-43a1-8a8a-78c156935c9d',
    '98d0e0e1-e93f-46b3-8825-42d60e911b00',
    '5a3bac94-5e64-46c3-ab34-b342713b93c7',
    '2f366336-2010-4916-b163-9ac5b68d45e8',
    '33726108-8ed6-4c56-9f25-7889991d6428',
    '9df4c67d-6938-4717-a014-4239130829a8'
  );
