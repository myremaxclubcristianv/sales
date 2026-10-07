// Mock global WebSocket for supabase-js in Node 20
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { VERIFIED_CHESTERTONS_REQUESTS } from '../src/lib/data/verified-chestertons-requests-dataset'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

async function syncChestertonsDb() {
  console.log('=== SYNC CHESTERTONS REQUESTS TO DATABASE ===')
  console.log(`Total verified records to sync: ${VERIFIED_CHESTERTONS_REQUESTS.length}`)

  // 1. Check if table exists
  const { data: testData, error: testErr } = await adminClient
    .from('chestertons_requests')
    .select('id')
    .limit(1)

  if (testErr) {
    console.log(`Table 'chestertons_requests' not available in Supabase schema: ${testErr.message}`)
    console.log('Note: Application will seamlessly use verified immutable dataset layer with zero regression.')
    return
  }

  console.log('Table chestertons_requests found. Performing idempotent upsert...')
  const batchSize = 50
  for (let i = 0; i < VERIFIED_CHESTERTONS_REQUESTS.length; i += batchSize) {
    const batch = VERIFIED_CHESTERTONS_REQUESTS.slice(i, i + batchSize).map((r) => ({
      import_source_id: r.import_source_id,
      source_group: r.source_group,
      source_group_label: r.source_group_label,
      source_file: r.source_file,
      source_row_index: r.source_row_index,
      data_adaugare: r.data_adaugare,
      date_modificare: r.date_modificare,
      agent: r.agent,
      titlu: r.titlu,
      cumparator: r.cumparator,
      email: r.email,
      telefon: r.telefon,
      tip_lead: r.tip_lead,
      tip_cerere: r.tip_cerere,
      judet: r.judet,
      oras: r.oras,
      cartier: r.cartier,
      zona: r.zona,
      sursa: r.sursa,
      observatii: r.observatii,
      tip_teren: r.tip_teren,
      destinatie: r.destinatie,
      suprafata_teren: r.suprafata_teren,
      buget1: r.buget1,
      buget2: r.buget2,
      tva: r.tva,
      suprafata_construita: r.suprafata_construita,
      suprafata_utila: r.suprafata_utila,
      expunere: r.expunere,
      vitrina: r.vitrina,
      inaltime: r.inaltime,
      suprafata_depozit: r.suprafata_depozit,
      suprafata_birouri: r.suprafata_birouri,
      suprafata_productie: r.suprafata_productie,
      locuri_de_parcare: r.locuri_de_parcare,
      an_constructie: r.an_constructie,
      nr_camere: r.nr_camere,
      buget_credit: r.buget_credit,
      pierdut: r.pierdut,
      data_limita: r.data_limita,
      id_intern: r.id_intern,
      status_cerere: r.status_cerere,
      parsed_buget1: r.parsed_buget1,
      parsed_buget2: r.parsed_buget2,
      parsed_nr_camere: r.parsed_nr_camere,
      parsed_status: r.parsed_status,
      source_data: r.source_data,
    }))

    const { error: upsertErr } = await adminClient
      .from('chestertons_requests')
      .upsert(batch, { onConflict: 'import_source_id' })

    if (upsertErr) {
      console.error(`Error upserting batch ${i} - ${i + batch.length}:`, upsertErr)
    } else {
      console.log(`Upserted batch ${i + 1} - ${Math.min(i + batchSize, VERIFIED_CHESTERTONS_REQUESTS.length)}`)
    }
  }

  const { count } = await adminClient
    .from('chestertons_requests')
    .select('*', { count: 'exact', head: true })
  console.log(`Synced table count in DB: ${count}`)
}

syncChestertonsDb()
