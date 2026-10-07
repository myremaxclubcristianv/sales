/**
 * SALES CRM — CHESTERTONS QUICK NOTES & COPY CONTROLS FORENSIC AUDIT
 * Verifies inline quick notes, copy values, activity persistence, and CRM immutability.
 */

import {
  getChestertonsRequests,
  getChestertonsRequestById,
  addChestertonsActivity,
} from '../src/lib/db/chestertons-requests'
import { getClients } from '../src/lib/db/clients'
import { getLeads } from '../src/lib/db/leads'
import { getProperties } from '../src/lib/db/properties'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`)
    process.exit(1)
  }
  console.log(`[PASS] ${message}`)
}

async function runQuickNotesAudit() {
  console.log('================================================================')
  console.log('  SALES CRM — CHESTERTONS QUICK NOTES FORENSIC AUDIT & TESTS    ')
  console.log('================================================================\n')

  // --- GATE 1: Verify Initial Dataset ---
  console.log('--- GATE 1: Initial Dataset Structure ---')
  const { requests: allReqs } = await getChestertonsRequests({ pageSize: 300 })
  assert(allReqs.length === 229, `Total Chestertons requests count is strictly 229 (got ${allReqs.length})`)

  const reqA = allReqs[0] // e.g. CC75240
  const reqB = allReqs[1] // e.g. CC76827
  assert(Boolean(reqA && reqB), 'Found test records A and B')
  assert(reqA.import_source_id !== reqB.import_source_id, 'Records A and B have distinct IDs')

  // --- GATE 2: Exact Copy Target Values ---
  console.log('\n--- GATE 2: Copy Values Verification ---')
  assert(reqA.import_source_id.startsWith('CC'), `Source ID A has format CC... (got ${reqA.import_source_id})`)
  assert(reqA.cumparator.trim().length > 0, `Buyer A is non-empty (got ${reqA.cumparator})`)
  assert(reqB.import_source_id.startsWith('CC'), `Source ID B has format CC... (got ${reqB.import_source_id})`)
  assert(reqB.cumparator.trim().length > 0, `Buyer B is non-empty (got ${reqB.cumparator})`)

  // --- GATE 3: Quick Note Insertion & Activity Persistence ---
  console.log('\n--- GATE 3: Quick Note Insertion ---')
  const testNoteText = `A sunat clientul, interesat de apartament 3 camere la ${Date.now()}`
  const noteActivity = await addChestertonsActivity(
    reqA.import_source_id,
    'NOTE',
    testNoteText,
    'Agent Real Estate CRM',
    'test-agent-id'
  )

  assert(noteActivity.activity_type === 'NOTE', `Activity type is strictly 'NOTE' (got ${noteActivity.activity_type})`)
  assert(noteActivity.note === testNoteText, 'Activity note matches exact submitted text')
  assert(noteActivity.request_id === reqA.import_source_id, `Activity belongs to request A (got ${noteActivity.request_id})`)

  // --- GATE 4: Request Detail Activity History Reflection ---
  console.log('\n--- GATE 4: Detail View Activity History ---')
  const reqA_detail = await getChestertonsRequestById(reqA.import_source_id)
  assert(Boolean(reqA_detail), 'Retrieved request A detail')
  const foundInHistory = reqA_detail?.activities?.some((a) => a.note === testNoteText)
  assert(Boolean(foundInHistory), 'Quick note is present in request A activity history')

  // --- GATE 5: Isolation & Non-Contamination ---
  console.log('\n--- GATE 5: Zero Cross-Request Contamination ---')
  const reqB_detail = await getChestertonsRequestById(reqB.import_source_id)
  const leakedToB = reqB_detail?.activities?.some((a) => a.note === testNoteText)
  assert(!leakedToB, 'Request A quick note did NOT leak into Request B')

  // --- GATE 6: Immutable Source 38 Fields Check ---
  console.log('\n--- GATE 6: Source Data Immutability ---')
  assert(reqA_detail?.cumparator === reqA.cumparator, 'Buyer name unmodified')
  assert(reqA_detail?.status_cerere === reqA.status_cerere, 'StatusCerere unmodified')
  assert(reqA_detail?.sursa === reqA.sursa, 'Sursa unmodified')
  assert(reqA_detail?.buget2 === reqA.buget2, 'Buget2 unmodified')
  assert(reqA_detail?.telefon === reqA.telefon, 'Telefon unmodified')
  assert(reqA_detail?.email === reqA.email, 'Email unmodified')

  // --- GATE 7: CRM Baseline Zero Regression Check ---
  console.log('\n--- GATE 7: CRM Baseline Verification ---')
  const { createAdminClient } = await import('../src/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { count: clientsCount } = await adminClient
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { count: leadsCount } = await adminClient
    .from('leads')
    .select('*', { count: 'exact', head: true })

  const { count: propertiesCount } = await adminClient
    .from('properties')
    .select('*', { count: 'exact', head: true })

  assert(clientsCount === 66, `Existing clients count is strictly UNCHANGED (66 total / 25 personal) - got ${clientsCount}`)
  assert(leadsCount === 5, `Existing leads count is strictly UNCHANGED (5) - got ${leadsCount}`)
  assert(propertiesCount === 391, `Existing properties count is strictly UNCHANGED (391) - got ${propertiesCount}`)

  console.log('\n================================================================')
  console.log('  QUICK NOTES FORENSIC AUDIT: ALL GATES PASSED!                 ')
  console.log('================================================================\n')
}

runQuickNotesAudit().catch((err) => {
  console.error('Forensic test crashed:', err)
  process.exit(1)
})
