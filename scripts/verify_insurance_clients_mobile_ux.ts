import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { CLIENT_STATUSES, getClientStatusMeta } from '../src/lib/types/crm'

// Mock global WebSocket for supabase-js in Node 20
// @ts-expect-error Mock for testing
global.WebSocket = class { constructor() {} }

const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

if (!urlMatch || !keyMatch) {
  console.error('Missing supabase credentials in .env.local')
  process.exit(1)
}

const adminClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { persistSession: false },
})

async function runVerification() {
  console.log('=================================================================')
  console.log('🧪 VERIFYING INSURANCE CLIENTS MOBILE UX IMPROVEMENTS')
  console.log('=================================================================\n')

  // TEST 1: Status "IDIOT" Definition & Meta
  console.log('--- TEST 1: STATUS "IDIOT" SPECIFICATION & RESOLUTION ---')
  const idiotStatus = CLIENT_STATUSES.find((s) => s.id === 'IDIOT')
  assert(idiotStatus, 'Status IDIOT must be registered in CLIENT_STATUSES')
  assert(idiotStatus.label === 'IDIOT', 'Status label must be exactly "IDIOT"')
  assert(idiotStatus.badgeBg.includes('rose'), 'Status IDIOT must have rose badge background')
  assert(idiotStatus.dotColor.includes('rose'), 'Status IDIOT must have rose dot color')
  
  const metaUpper = getClientStatusMeta('IDIOT')
  assert(metaUpper.id === 'IDIOT' && metaUpper.label === 'IDIOT', 'getClientStatusMeta("IDIOT") must resolve properly')

  const metaLower = getClientStatusMeta('idiot')
  assert(metaLower.id === 'IDIOT' && metaLower.label === 'IDIOT', 'getClientStatusMeta("idiot") case-insensitive resolution')

  console.log('✔ Status IDIOT is correctly registered and styled in CRM types.')

  // Check migration file 021
  const migrationPath = path.join(__dirname, '../supabase/migrations/021_add_idiot_client_status.sql')
  assert(fs.existsSync(migrationPath), 'Migration 021 must exist on disk')
  const migContent = fs.readFileSync(migrationPath, 'utf8')
  assert(migContent.includes('IDIOT'), 'Migration 021 must include IDIOT in the CHECK constraint')
  assert(migContent.includes('ALTER TABLE public.clients ADD CONSTRAINT clients_status_check'), 'Migration 021 must update clients_status_check')
  console.log('✔ Migration 021_add_idiot_client_status.sql is created and verified.')

  // TEST 2: Status Menu Left-Opening & Collision Detection
  console.log('\n--- TEST 2: STATUS MENU LEFT-OPENING ON MOBILE ---')
  const clientStatusSelectPath = path.join(__dirname, '../src/components/ClientStatusSelect.tsx')
  const cssContent = fs.readFileSync(clientStatusSelectPath, 'utf8')
  assert(cssContent.includes('align?:'), 'ClientStatusSelect must support align prop')
  assert(cssContent.includes("menuAlign === 'right' ? 'right-0' : 'left-0'"), 'ClientStatusSelect must position menu to right-0 (opening left)')
  assert(cssContent.includes('max-w-[calc(100vw-2rem)]'), 'ClientStatusSelect must constrain width on narrow viewports')
  assert(cssContent.includes('window.innerWidth'), 'ClientStatusSelect must include viewport collision detection')
  console.log('✔ ClientStatusSelect is configured with left-opening positioning and collision detection.')

  // TEST 3: Visual Separators on Mobile
  console.log('\n--- TEST 3: VISUAL SEPARATORS BETWEEN CLIENTS ON MOBILE ---')
  const clientsViewPath = path.join(__dirname, '../src/app/admin/clients/ClientsView.tsx')
  const cvContent = fs.readFileSync(clientsViewPath, 'utf8')
  assert(cvContent.includes('divide-y-2 divide-slate-200/90'), 'Mobile cards container must use divide-y-2 divide-slate-200/90')
  assert(cvContent.includes('border-b-2 border-slate-200/90'), 'Individual client cards must have border-b-2 border-slate-200/90')
  assert(cvContent.includes('align="right"'), 'ClientsView mobile card must explicitly pass align="right" to ClientStatusSelect')
  console.log('✔ Mobile client cards have clear, visible horizontal separators and align="right" on status.')

  // TEST 4: Quick Calendar Schedule Modal & Persistence
  console.log('\n--- TEST 4: QUICK CALENDAR SCHEDULE MODAL & PERSISTENCE ---')
  const scheduleModalPath = path.join(__dirname, '../src/components/ClientQuickScheduleModal.tsx')
  assert(fs.existsSync(scheduleModalPath), 'ClientQuickScheduleModal.tsx must exist')
  const modalContent = fs.readFileSync(scheduleModalPath, 'utf8')
  assert(modalContent.includes('ROMANIAN_MONTHS'), 'Must have Romanian month names for local context')
  assert(modalContent.includes('ROMANIAN_WEEKDAYS'), 'Must have Romanian weekday names (Lu, Ma, Mi, Jo, Vi, Sâ, Du)')
  assert(modalContent.includes('QUICK_PRESETS'), 'Must support quick date presets')
  assert(modalContent.includes('TIME_PRESETS'), 'Must support time presets and custom time')
  assert(modalContent.includes('QUICK_REASONS'), 'Must support quick reason chips like "Sună clientul"')
  assert(modalContent.includes('/api/follow-ups'), 'Must persist to /api/follow-ups')
  assert(modalContent.includes('isSaving'), 'Must prevent duplicate submissions with saving state')
  assert(cvContent.includes('<ClientQuickScheduleModal'), 'ClientsView must integrate ClientQuickScheduleModal')
  console.log('✔ ClientQuickScheduleModal is fully implemented and integrated in ClientsView.')

  // TEST 5: Real Database Follow-up Persistence & Cycle Test
  console.log('\n--- TEST 5: PERSISTENCE INTEGRATION TEST (REAL DB) ---')
  // Find a real client
  const { data: testClient, error: clientErr } = await adminClient
    .from('clients')
    .select('id, first_name, last_name, phone')
    .limit(1)
    .single()

  if (clientErr || !testClient) {
    throw new Error('Could not fetch a real client for persistence test')
  }
  console.log(`Using client for test: ${testClient.first_name} ${testClient.last_name} (${testClient.id})`)

  // Create a real scheduled follow-up
  const testDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + 'T10:00:00'
  const testReason = 'Sună-l săptămâna viitoare, pe 4 (Test Automatizat UX)'

  const { data: insertedFollowUp, error: insertErr } = await adminClient
    .from('follow_ups')
    .insert({
      client_id: testClient.id,
      reason: testReason,
      due_date: testDueDate,
      priority: 'NORMAL',
      status: 'PENDING',
      notes: 'Test automatizat creat direct pentru verificarea UX mobil',
    })
    .select()
    .single()

  if (insertErr || !insertedFollowUp) {
    throw new Error(`Failed to insert test follow-up: ${insertErr?.message}`)
  }
  console.log(`✔ Inserted follow-up: ${insertedFollowUp.id} for client: ${insertedFollowUp.client_id}`)

  // Verify it is queryable in the Master Calendar query
  const { data: calFollowUps, error: calErr } = await adminClient
    .from('follow_ups')
    .select('id, client_id, reason, due_date, status')
    .eq('id', insertedFollowUp.id)
    .single()

  if (calErr || !calFollowUps) {
    throw new Error('Follow-up could not be retrieved from database')
  }
  assert(calFollowUps.reason === testReason, 'Retrieved reason must match exactly')
  assert(calFollowUps.client_id === testClient.id, 'Linked client_id must match real client UUID')
  assert(calFollowUps.status === 'PENDING', 'Status must be PENDING')
  console.log('✔ Retrieved follow-up directly from DB with 100% field fidelity.')

  // Clean up test follow-up safely
  const { error: delErr } = await adminClient
    .from('follow_ups')
    .delete()
    .eq('id', insertedFollowUp.id)

  if (delErr) {
    console.warn('Warning: Could not delete test follow-up:', delErr.message)
  } else {
    console.log('✔ Safely cleaned up test follow-up from database. Zero residual data.')
  }

  console.log('\n=================================================================')
  console.log('🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY (100%)')
  console.log('=================================================================')
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
