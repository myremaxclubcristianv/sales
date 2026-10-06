// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { runBirthdayBackfill } from '../src/lib/utils/birthday-backfill'

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

if (!urlMatch || !keyMatch) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { persistSession: false },
})

async function run() {
  console.log('================================================================');
  console.log('       SALES CRM — COMPLETE MULTI-SOURCE BIRTHDAY BACKFILL       ');
  console.log('================================================================\n');

  const stats = await runBirthdayBackfill(supabase)

  console.log('BIRTHDAY BACKFILL DISCOVERY REPORT\n')
  console.log(`Insurance people scanned:   ${stats.insurancePeopleScanned}`)
  console.log(`Real Estate people scanned: ${stats.realEstatePeopleScanned}`)
  console.log(`Credit people scanned:      ${stats.creditPeopleScanned}`)
  console.log(`General contacts scanned:   ${stats.contactsScanned}`)
  console.log(`Other CRM people scanned:   ${stats.otherPeopleScanned}`)
  console.log(`------------------------------------------------`)
  console.log(`Total people scanned:       ${stats.totalPeopleScanned}`)
  console.log(`Unique people discovered:   ${stats.uniquePeopleDiscovered}\n`)

  console.log(`Already had DOB:                       ${stats.alreadyHadDob}`)
  console.log(`DOB derived from valid CNP:            ${stats.dobDerivedFromCnp}`)
  console.log(`Missing DOB:                           ${stats.missingDob}`)
  console.log(`CNP/DOB conflicts:                     ${stats.cnpDobConflicts}`)
  console.log(`Ambiguous identities requiring review: ${stats.ambiguousIdentities}\n`)

  console.log(`Birthday events to expose in Calendar: ${stats.birthdayEventsExposed}`)
  console.log(`Duplicate birthday identities prevented: ${stats.duplicateBirthdaysPrevented}`)
  console.log('================================================================\n')
}

run()
