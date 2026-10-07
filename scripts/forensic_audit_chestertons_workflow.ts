// Mock global WebSocket for supabase-js in Node 20
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'

const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach((line) => {
    const parts = line.split('=')
    if (parts[0] && parts[1] && !process.env[parts[0].trim()]) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim()
    }
  })
}

import { createClient } from '@supabase/supabase-js'
import {
  getChestertonsRequests,
  getChestertonsRequestById,
  updateChestertonsRequestStatus,
  addChestertonsActivity,
  updateChestertonsFollowUp,
  getChestertonsMetrics,
} from '../src/lib/db/chestertons-requests'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

async function runWorkflowAudit() {
  console.log('================================================================')
  console.log('  SALES CRM — CHESTERTONS WORKFLOW & ACTIVITIES FORENSIC AUDIT  ')
  console.log('================================================================\n')

  let passedGates = 0
  let totalGates = 0

  function assert(condition: boolean, testName: string, details = '') {
    totalGates++
    if (condition) {
      passedGates++
      console.log(`[PASS] ${testName}`)
    } else {
      console.error(`[FAIL] ${testName} -> ${details}`)
    }
  }

  // --- GATE 1: Initial Default CRM Status ---
  console.log('--- GATE 1: Default CRM Status Verification ---')
  const reqA_id = 'CC75240' // Gabriel Popa
  const reqB_id = 'CC76827' // Vali Bancica

  const reqA_initial = await getChestertonsRequestById(reqA_id)
  assert(!!reqA_initial, `Found record A (${reqA_id})`)
  assert(reqA_initial?.crm_status === 'NESUNAT', `Record A initial crm_status is 'NESUNAT' (got '${reqA_initial?.crm_status}')`)
  assert(reqA_initial?.status_cerere === 'Retrasa', `Record A original source StatusCerere is 'Retrasa' (got '${reqA_initial?.status_cerere}')`)

  // --- GATE 2: Status Transition NESUNAT -> AM_VORBIT on Request A ---
  console.log('\n--- GATE 2: Status Transition (NESUNAT -> AM_VORBIT) ---')
  const statusRes1 = await updateChestertonsRequestStatus(
    reqA_id,
    'AM_VORBIT',
    'Discutat cu clientul, este interesat de oferte in zona de nord.',
    'Cristian Vaduva'
  )
  assert(statusRes1.success && statusRes1.crm_status === 'AM_VORBIT', 'Status update to AM_VORBIT succeeded')

  const reqA_afterUpdate1 = await getChestertonsRequestById(reqA_id)
  assert(reqA_afterUpdate1?.crm_status === 'AM_VORBIT', `Record A crm_status persisted as 'AM_VORBIT'`)
  assert(reqA_afterUpdate1?.status_cerere === 'Retrasa', `Record A original StatusCerere strictly preserved as 'Retrasa'`)

  // --- GATE 3: Adding Activity & Notes to Request A ---
  console.log('\n--- GATE 3: Adding Notes & Contact Activity to Request A ---')
  const act1 = await addChestertonsActivity(
    reqA_id,
    'CALL',
    'Apel telefonic efectuat. A confirmat bugetul de 100.000 EUR.',
    'Cristian Vaduva'
  )
  assert(!!act1.id, 'Created CALL activity for Request A')

  const reqA_afterAct = await getChestertonsRequestById(reqA_id)
  assert((reqA_afterAct?.activities || []).length >= 2, `Request A has activities (got ${reqA_afterAct?.activities?.length})`)
  assert(!!reqA_afterAct?.last_contact_at, `Request A last_contact_at was automatically updated by CALL activity`)

  // --- GATE 4: Zero Cross-Request Contamination (Request B Isolation) ---
  console.log('\n--- GATE 4: Zero Cross-Request Contamination Check ---')
  const reqB = await getChestertonsRequestById(reqB_id)
  assert(reqB?.crm_status === 'NESUNAT', `Request B crm_status is unaffected and remains 'NESUNAT'`)
  assert((reqB?.activities || []).length === 0, `Request B has 0 activities (Request A activities did not leak)`)

  // --- GATE 5: Adding Activity to Request B ---
  console.log('\n--- GATE 5: Request B Independent Activity ---')
  const actB = await addChestertonsActivity(
    reqB_id,
    'WHATSAPP',
    'Trimis catalog proprietati pe WhatsApp.',
    'Cristian Vaduva'
  )
  assert(!!actB.id, 'Created WHATSAPP activity for Request B')

  const reqB_after = await getChestertonsRequestById(reqB_id)
  assert((reqB_after?.activities || []).length === 1, `Request B has exactly 1 activity`)
  assert(Boolean(reqB_after?.activities?.[0]?.note?.includes('catalog proprietati')), 'Request B activity contains correct note text')

  // --- GATE 6: Status History Tracking (AM_VORBIT -> FOLLOW_UP) ---
  console.log('\n--- GATE 6: Status History Audit on Request A ---')
  await updateChestertonsRequestStatus(
    reqA_id,
    'FOLLOW_UP',
    'Revenire necesara cu fisa de vizionare.',
    'Cristian Vaduva'
  )

  const reqA_final = await getChestertonsRequestById(reqA_id)
  assert(reqA_final?.crm_status === 'FOLLOW_UP', 'Request A crm_status updated to FOLLOW_UP')

  const statusChanges = (reqA_final?.activities || []).filter((a: any) => a.activity_type === 'STATUS_CHANGE')
  assert(statusChanges.length >= 2, `Status history contains audit transitions (got ${statusChanges.length})`)

  // --- GATE 7: Follow-up Scheduling ---
  console.log('\n--- GATE 7: Follow-up Scheduling ---')
  const followUpDate = new Date(Date.now() + 86400000).toISOString()
  await updateChestertonsFollowUp(reqA_id, followUpDate)

  const reqA_fu = await getChestertonsRequestById(reqA_id)
  assert(reqA_fu?.next_follow_up_at === followUpDate, 'next_follow_up_at persisted accurately')

  // --- GATE 8: CRM Status Filtering & Metrics ---
  console.log('\n--- GATE 8: CRM Status Filtering & Dynamic Metrics ---')
  const metrics = await getChestertonsMetrics()
  assert(metrics.totalRequests === 229, 'Total requests in metrics remains 229')
  assert(metrics.crmStatusBreakdown['FOLLOW_UP'] >= 1, 'Dynamic metrics reflect FOLLOW_UP count >= 1')
  assert(metrics.crmStatusBreakdown['NESUNAT'] >= 200, 'Dynamic metrics reflect NESUNAT count')

  const followUpFiltered = await getChestertonsRequests({ crmStatus: 'FOLLOW_UP' })
  assert(followUpFiltered.requests.some((r) => r.import_source_id === reqA_id), 'CRM Status filter returns updated request')

  // --- GATE 9: Source Data Immutability Check ---
  console.log('\n--- GATE 9: Immutable Source Fields Check ---')
  assert(reqA_fu?.cumparator === 'Gabriel Popa', 'Cumparator name unchanged')
  assert(reqA_fu?.buget2 === '450000', 'Buget2 unchanged')
  assert(reqA_fu?.sursa === 'chestertons.ro', 'Sursa unchanged')
  assert(reqA_fu?.status_cerere === 'Retrasa', 'StatusCerere unchanged')
  assert(reqA_fu?.source_group === 'REAL_ESTATE_CHESTERTONS_REQUESTS', 'Source group unchanged')

  // --- GATE 10: Database Zero-Regression Baseline Check ---
  console.log('\n--- GATE 10: CRM Baseline Zero-Regression Check ---')
  const { count: clientsCount } = await adminClient.from('clients').select('*', { count: 'exact', head: true })
  assert(clientsCount === 66, 'Production clients count is strictly UNCHANGED (66 total / 25 personal)', `Got ${clientsCount}`)

  const { count: leadsCount } = await adminClient.from('leads').select('*', { count: 'exact', head: true })
  assert(leadsCount === 5, 'Production leads count is strictly UNCHANGED (5)', `Got ${leadsCount}`)

  const { count: propertiesCount } = await adminClient.from('properties').select('*', { count: 'exact', head: true })
  assert(propertiesCount === 391, 'Production properties count is strictly UNCHANGED (391)', `Got ${propertiesCount}`)

  console.log('\n================================================================')
  console.log(`WORKFLOW AUDIT RESULT: ${passedGates} / ${totalGates} GATES PASSED`)
  console.log('================================================================')

  if (passedGates === totalGates) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runWorkflowAudit()
