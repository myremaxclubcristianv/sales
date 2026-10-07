// Mock global WebSocket for supabase-js in Node 20
;(global as any).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { VERIFIED_CHESTERTONS_REQUESTS } from '../src/lib/data/verified-chestertons-requests-dataset'

const PROD_URL = 'https://sales.cristianvaduva.com'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

async function verifyLiveProduction() {
  console.log('================================================================')
  console.log('      LIVE PRODUCTION DEPLOYMENT VERIFICATION & AUDIT          ')
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

  // --- 1. HTTP Endpoint Liveness ---
  console.log('--- 1. HTTP Production Liveness ---')
  const resHome = await fetch(PROD_URL, { redirect: 'manual' })
  assert(resHome.status === 200 || resHome.status === 307 || resHome.status === 308, `Home page responds (HTTP ${resHome.status})`)

  const resLogin = await fetch(`${PROD_URL}/login`)
  assert(resLogin.status === 200, `Login page responds (HTTP ${resLogin.status})`)

  // --- 2. Security Check (Unauthenticated Access Denied) ---
  console.log('\n--- 2. Unauthenticated Security & Access Denied ---')
  const resUnauthApi = await fetch(`${PROD_URL}/api/requests/chestertons`)
  assert(resUnauthApi.status === 401, `Unauthenticated API access returns 401 Unauthorized (got HTTP ${resUnauthApi.status})`)

  const resUnauthAdmin = await fetch(`${PROD_URL}/admin/requests/chestertons`, { redirect: 'manual' })
  assert(resUnauthAdmin.status === 307 || resUnauthAdmin.status === 308 || resUnauthAdmin.status === 302, `Unauthenticated /admin route redirects to /login (got HTTP ${resUnauthAdmin.status})`)

  // --- 3. Chestertons Dataset Integrity ---
  console.log('\n--- 3. Chestertons Dataset Integrity ---')
  assert(VERIFIED_CHESTERTONS_REQUESTS.length === 229, 'Total Chestertons requests count is exactly 229', `Got ${VERIFIED_CHESTERTONS_REQUESTS.length}`)

  const apartments = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.tip_lead === 'Apartament').length
  const houses = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.tip_lead === 'Casa').length
  const active = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Activa').length
  const retracted = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Retrasa').length
  const blank = VERIFIED_CHESTERTONS_REQUESTS.filter((r) => r.parsed_status === 'Blank').length

  assert(apartments === 120, 'Apartamente = 120', `Got ${apartments}`)
  assert(houses === 109, 'Case = 109', `Got ${houses}`)
  assert(active === 177, 'Active = 177', `Got ${active}`)
  assert(retracted === 51, 'Retrase = 51', `Got ${retracted}`)
  assert(blank === 1, 'Blank Status = 1', `Got ${blank}`)

  // --- 4. Database Zero-Regression Check ---
  console.log('\n--- 4. Database Zero-Regression Verification ---')
  const { count: clientsCount } = await adminClient.from('clients').select('*', { count: 'exact', head: true })
  assert(clientsCount === 66, 'Production clients count is strictly UNCHANGED (66 total / 25 personal)', `Got ${clientsCount}`)

  const { count: leadsCount } = await adminClient.from('leads').select('*', { count: 'exact', head: true })
  assert(leadsCount === 5, 'Production leads count is strictly UNCHANGED (5)', `Got ${leadsCount}`)

  const { count: propertiesCount } = await adminClient.from('properties').select('*', { count: 'exact', head: true })
  assert(propertiesCount === 391, 'Production properties count is strictly UNCHANGED (391)', `Got ${propertiesCount}`)

  console.log('\n================================================================')
  console.log(`LIVE PRODUCTION RESULT: ${passedGates} / ${totalGates} GATES PASSED`)
  console.log('================================================================')

  if (passedGates === totalGates) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

verifyLiveProduction()
