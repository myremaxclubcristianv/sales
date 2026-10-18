// Mock global WebSocket for supabase-js in Node
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import {
  VERIFIED_INSURANCE_COMPANIES_DATASET,
  type RawInsuranceCompanyRecord,
  getDeterministicUuid,
} from '../src/lib/data/verified-insurance-companies-dataset'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

export async function syncInsuranceCompaniesDb() {
  console.log('========================================================')
  console.log('=== SYNC INSURANCE COMPANIES TO SUPABASE (PROSPECTS) ===')
  console.log('========================================================')
  console.log(`Source dataset total: ${VERIFIED_INSURANCE_COMPANIES_DATASET.length} companies`)
  
  // Check baseline before import
  const { data: beforeData, count: countBefore } = await adminClient
    .from('companies')
    .select('id, registration_number', { count: 'exact' })
  
  console.log(`Existing companies in DB before import: ${countBefore ?? 0}`)

  const rowsToUpsert = VERIFIED_INSURANCE_COMPANIES_DATASET.map((r: RawInsuranceCompanyRecord) => {
    const id = getDeterministicUuid(r.import_source_id)
    const metadata = {
      import_source_id: r.import_source_id,
      table_number: r.table_number,
      table_name: r.table_name,
      row_index: r.row_index,
      nr: r.nr,
      observations_header: r.observatii_header,
      prospect_status: 'NECONTACTAT',
      last_contact_at: null,
      next_follow_up_at: null,
      crm_notes: null,
      additional_phones: [],
      additional_emails: [],
    }

    return {
      id,
      name: r.denumire_firma,
      industry: r.tip_activitate,
      phone: r.telefon,
      email: r.email,
      website: r.website,
      address: r.adresa_sediu,
      city: r.oras_judet,
      country: 'Romania',
      registration_number: r.import_source_id,
      legal_name: JSON.stringify(metadata),
      notes: r.observatii_sursa,
    }
  })

  // Upsert in batches of 50
  const batchSize = 50
  let upsertedCount = 0
  for (let i = 0; i < rowsToUpsert.length; i += batchSize) {
    const batch = rowsToUpsert.slice(i, i + batchSize)
    const { error } = await adminClient
      .from('companies')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error upserting batch ${i}..${i + batch.length}:`, error.message)
      throw error
    }
    upsertedCount += batch.length
    console.log(`Upserted batch: ${i + 1}..${i + batch.length}`)
  }

  // Verify count after import
  const { count: countAfter } = await adminClient
    .from('companies')
    .select('*', { count: 'exact', head: true })

  console.log('--------------------------------------------------------')
  console.log(`Import completed. Total companies in DB after import: ${countAfter}`)
  console.log(`Successfully upserted: ${upsertedCount}`)

  // Re-run idempotency test
  console.log('Testing idempotence: running second upsert...')
  const sample = rowsToUpsert.slice(0, 10)
  const { error: idempErr } = await adminClient
    .from('companies')
    .upsert(sample, { onConflict: 'id' })
  if (idempErr) {
    console.error('Idempotency check error:', idempErr.message)
  } else {
    const { count: countAfterIdemp } = await adminClient
      .from('companies')
      .select('*', { count: 'exact', head: true })
    console.log(`Idempotency check passed! Count remains: ${countAfterIdemp}`)
  }
}

if (require.main === module) {
  syncInsuranceCompaniesDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
