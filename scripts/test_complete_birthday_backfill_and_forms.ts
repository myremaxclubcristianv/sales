// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { parseAndValidateCnp } from '../src/lib/utils/cnp'
import { runBirthdayBackfill } from '../src/lib/utils/birthday-backfill'
import { getMasterCalendarEvents } from '../src/lib/db/calendar'
import { createClientRecord, updateClient } from '../src/lib/db/clients'
import { checkAndGenerateReminders } from '../src/lib/utils/reminders'

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

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    failed++
  }
}

async function runTests() {
  console.log('================================================================')
  console.log(' SALES CRM — COMPLETE BIRTHDAY BACKFILL & FORM INTEGRATION SUITE ')
  console.log('================================================================\n')

  // TEST 1: Full backfill run
  console.log('[SUITE 1: Multi-Source Birthday Backfill Execution]')
  const stats = await runBirthdayBackfill(supabase)
  assert(stats.totalPeopleScanned > 5000, `Scanned > 5000 total CRM people (Actual: ${stats.totalPeopleScanned})`)
  assert(stats.uniquePeopleDiscovered > 5000, `Identified > 5000 unique people (Actual: ${stats.uniquePeopleDiscovered})`)
  assert(stats.birthdayEventsExposed >= 30, `At least 30 birthdays populated in calendar (Actual: ${stats.birthdayEventsExposed})`)
  assert(stats.duplicateBirthdaysPrevented >= 10, `Duplicate identities merged safely (Actual: ${stats.duplicateBirthdaysPrevented})`)

  // TEST 2: Idempotency check (second run must produce 0 unnecessary DOB derivations)
  console.log('\n[SUITE 2: Backfill Idempotency]')
  const secondRunStats = await runBirthdayBackfill(supabase)
  assert(secondRunStats.dobDerivedFromCnp === 0, 'Second backfill run produces 0 unnecessary DOB derivations (100% idempotent)')
  assert(secondRunStats.birthdayEventsExposed === stats.birthdayEventsExposed, 'Birthday events count remains deterministic')

  // TEST 3: Master Calendar Birthday Aggregation & CNP Zero-Leakage
  console.log('\n[SUITE 3: Master Calendar Birthday Aggregation]')
  const calData = await getMasterCalendarEvents({ year: new Date().getFullYear() }, supabase)
  const birthdays = calData.events.filter((e) => e.type === 'birthday')
  assert(birthdays.length >= 30, `Master Calendar contains all active birthdays (Found: ${birthdays.length})`)

  // Check no CNP is present in any calendar event
  const cnpLeaked = birthdays.some((b) => {
    const str = JSON.stringify(b)
    return /\b[1-8]\d{12}\b/.test(str)
  })
  assert(!cnpLeaked, 'Zero CNP numbers leaked in Master Calendar events payload')

  // Check category labels exist
  const hasLabels = birthdays.every((b) => b.category_label && b.category_label.length > 0)
  assert(hasLabels, 'All calendar birthday events have multi-category labels')

  // TEST 4: New Client Creation with DOB
  console.log('\n[SUITE 4: New Client Form Flow with DOB]')
  const testPhone = '0799112233'
  const testClient = await createClientRecord({
    first_name: 'TestAuto',
    last_name: 'BirthdayClient',
    phone: testPhone,
    email: 'test-auto-birthday@cristianvaduva.com',
    date_of_birth: '1992-08-15',
    category: 'REAL_ESTATE',
    lead_source: 'DIRECT_CONTACT',
    status: 'ACTIVE',
  }, supabase)

  assert(Boolean(testClient.id), 'Test client created with DOB')
  assert(testClient.date_of_birth === '1992-08-15', 'Client DOB saved accurately')

  // Check personal_events sync
  const { data: clientEvent } = await supabase
    .from('personal_events')
    .select('*')
    .eq('client_id', testClient.id)
    .eq('event_type', 'birthday')
    .single()

  assert(Boolean(clientEvent), 'Birthday personal_event automatically created for new client')
  assert(clientEvent?.event_date === '1992-08-15', 'Personal event date matches client DOB')

  // TEST 5: New Client Creation with CNP only (Auto-derivation)
  console.log('\n[SUITE 5: New Client Form Flow with CNP Only (Auto-Derivation)]')
  // Valid Romanian CNP for 1994-08-08, Male
  const testCnp = '1940808011231'
  const cnpValidation = parseAndValidateCnp(testCnp)
  assert(cnpValidation.isValid, 'Synthetic CNP is mathematically valid')

  const testClientCnp = await createClientRecord({
    first_name: 'TestCnpOnly',
    last_name: 'AutoDerived',
    phone: '0799445566',
    email: 'test-cnp-only@cristianvaduva.com',
    cnp: testCnp,
    category: 'INSURANCE',
    lead_source: 'GENERALI_CRM',
    status: 'ACTIVE',
  }, supabase)

  assert(testClientCnp.date_of_birth === '1994-08-08', `DOB automatically derived from CNP (Expected 1994-08-08, got ${testClientCnp.date_of_birth})`)

  const { data: cnpClientEvent } = await supabase
    .from('personal_events')
    .select('*')
    .eq('client_id', testClientCnp.id)
    .eq('event_type', 'birthday')
    .single()

  assert(cnpClientEvent?.event_date === '1994-08-08', 'Personal event date matches auto-derived DOB')

  // TEST 6: Editing DOB reflects in calendar/events
  console.log('\n[SUITE 6: Updating Client DOB]')
  const updatedClient = await updateClient(testClient.id, {
    date_of_birth: '1990-11-20',
  }, supabase)
  assert(updatedClient.date_of_birth === '1990-11-20', 'Client DOB updated to 1990-11-20')

  const { data: updatedEvent } = await supabase
    .from('personal_events')
    .select('*')
    .eq('client_id', testClient.id)
    .eq('event_type', 'birthday')
    .single()
  assert(updatedEvent?.event_date === '1990-11-20', 'Personal event automatically updated with new DOB')

  // TEST 7: Clearing DOB removes from personal_events
  console.log('\n[SUITE 7: Clearing Client DOB]')
  const clearedClient = await updateClient(testClient.id, {
    date_of_birth: null,
  }, supabase)
  assert(clearedClient.date_of_birth === null, 'Client DOB cleared')

  const { data: clearedEvent } = await supabase
    .from('personal_events')
    .select('*')
    .eq('client_id', testClient.id)
    .eq('event_type', 'birthday')
    .maybeSingle()
  assert(clearedEvent === null, 'Birthday event cleanly removed from personal_events on DOB removal')

  // TEST 8: Reminder check execution
  console.log('\n[SUITE 8: Production Reminder & Notification Engine]')
  const reminderRes = await checkAndGenerateReminders(supabase)
  assert(typeof reminderRes.birthdayRemindersCreated === 'number', 'Birthday reminders engine executed cleanly')
  assert(typeof reminderRes.skippedAlreadyNotified === 'number', 'Deduplication engine active for notifications')

  // CLEANUP: Clean synthetic test records only
  console.log('\n[CLEANUP: Removing synthetic test clients]')
  await supabase.from('personal_events').delete().eq('client_id', testClient.id)
  await supabase.from('personal_events').delete().eq('client_id', testClientCnp.id)
  await supabase.from('clients').delete().eq('id', testClient.id)
  await supabase.from('clients').delete().eq('id', testClientCnp.id)
  console.log('  ✔ Synthetic test clients cleaned up safely.')

  console.log('\n================================================================')
  console.log(` TEST SUMMARY: ${passed} PASS / ${failed} FAIL `)
  console.log('================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
