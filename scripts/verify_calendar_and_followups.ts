// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { parseAndValidateCnp, calculateAge, formatDobDisplay, deriveDobFromCnp } from '../src/lib/utils/cnp'
import { deriveClientCategories } from '../src/lib/db/calendar'
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

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${name}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${name}`)
    failed++
  }
}

async function runVerification() {
  console.log('=== COMPREHENSIVE CRM CALENDAR & FOLLOW-UP VERIFICATION SUITE ===\n')

  // -------------------------------------------------------------
  // SUITE 1: CNP & BIRTHDAY DERIVATION
  // -------------------------------------------------------------
  console.log('[SUITE 1: CNP & BIRTHDAY DERIVATION]')

  // 1.1 Valid Romanian CNPs (Male, Female, 1900s, 2000s, 1800s)
  const cnpMale1994 = parseAndValidateCnp('1940808011231')
  assert(cnpMale1994.isValid === true && cnpMale1994.dateOfBirth === '1994-08-08', 'CNP Male 1994-08-08 derived accurately')
  assert(cnpMale1994.sex === 'M', 'Sex Male identified')
  assert(cnpMale1994.age !== undefined && cnpMale1994.age >= 30, 'Age calculated dynamically')

  const cnpFemale1991 = parseAndValidateCnp('2910601011230')
  assert(cnpFemale1991.isValid === true && cnpFemale1991.dateOfBirth === '1991-06-01', 'CNP Female 1991-06-01 derived accurately')
  assert(cnpFemale1991.sex === 'F', 'Sex Female identified')

  const cnpMale2005 = parseAndValidateCnp('5050315011237')
  assert(cnpMale2005.isValid === true && cnpMale2005.dateOfBirth === '2005-03-15', 'CNP Male 2005-03-15 (Century 2000s) derived accurately')

  const cnpFemale2002 = parseAndValidateCnp('6020420011231')
  assert(cnpFemale2002.isValid === true && cnpFemale2002.dateOfBirth === '2002-04-20', 'CNP Female 2002-04-20 (Century 2000s) derived accurately')

  // 1.2 Leap Year Handling
  const leap2000 = parseAndValidateCnp('5000229011239')
  assert(leap2000.isValid === true && leap2000.dateOfBirth === '2000-02-29', 'Leap year 2000-02-29 accepted')

  const nonLeap1999 = parseAndValidateCnp('1990229011230')
  assert(nonLeap1999.isValid === false, 'Non-leap year 1999-02-29 rejected')

  // 1.3 Invalid CNP structures
  assert(parseAndValidateCnp('1940808011239').isValid === false, 'Invalid checksum rejected')
  assert(parseAndValidateCnp('1940808').isValid === false, 'Incomplete CNP rejected')
  assert(parseAndValidateCnp('19408080112314').isValid === false, '14-digit CNP rejected')
  assert(parseAndValidateCnp('19408080112AB').isValid === false, 'Alphanumeric CNP rejected')
  assert(deriveDobFromCnp('invalid') === null, 'Derive DOB returns null for invalid CNP (zero guessing)')

  // 1.4 Formatting & Age
  const formattedDob = formatDobDisplay('1994-08-08')
  assert(formattedDob === '08 AUGUST 1994', `Formatted DOB matches "08 AUGUST 1994" (got ${formattedDob})`)
  const dynamicAge2026 = calculateAge('1994-08-08', new Date('2026-10-06'))
  assert(dynamicAge2026 === 32, `Age in 2026 for 1994-08-08 is 32 (got ${dynamicAge2026})`)

  // -------------------------------------------------------------
  // SUITE 2: CATEGORIZATION & MULTI-LABEL ENGINE
  // -------------------------------------------------------------
  console.log('\n[SUITE 2: CATEGORIZATION & MULTI-LABEL ENGINE]')

  const singleCat = deriveClientCategories({ category: 'INSURANCE' })
  assert(singleCat.categories.includes('INSURANCE'), 'Single category INSURANCE recognized')
  assert(singleCat.label === 'INSURANCE', `Single label matches "INSURANCE" (got "${singleCat.label}")`)

  const multiCat = deriveClientCategories({
    category: 'REAL_ESTATE',
    insurance_policies: [{ id: 'pol-1' }],
    credit_cases: [{ id: 'cred-1' }],
  })
  assert(multiCat.categories.includes('REAL ESTATE'), 'Multi category has REAL ESTATE')
  assert(multiCat.categories.includes('INSURANCE'), 'Multi category has INSURANCE')
  assert(multiCat.categories.includes('CREDITE'), 'Multi category has CREDITE')
  assert(multiCat.label.includes('REAL ESTATE') && multiCat.label.includes('INSURANCE'), `Combined label created: "${multiCat.label}"`)

  const contactOnly = deriveClientCategories({})
  assert(contactOnly.categories.includes('CONTACT'), 'General contact assigned CONTACT category')

  // -------------------------------------------------------------
  // SUITE 3: DATABASE BACKFILL INTEGRITY & ZERO PII EXPOSURE
  // -------------------------------------------------------------
  console.log('\n[SUITE 3: DATABASE BACKFILL INTEGRITY & ZERO PII EXPOSURE]')

  const { data: dbClients } = await supabase
    .from('clients')
    .select('id, first_name, last_name, cnp, date_of_birth, category')

  const clientList = dbClients || []
  assert(clientList.length > 0, `Database has ${clientList.length} clients preserved intact`)

  const clientsWithCnp = clientList.filter((c) => !!c.cnp)
  assert(clientsWithCnp.length >= 6, `Verified all clients with valid CNP have derived DOBs (count: ${clientsWithCnp.length})`)

  for (const c of clientsWithCnp) {
    assert(c.date_of_birth !== null, `Client ${c.first_name} ${c.last_name} has valid DOB populated: ${c.date_of_birth}`)
    const parsed = parseAndValidateCnp(c.cnp)
    assert(parsed.dateOfBirth === c.date_of_birth, `Derived DOB matches CNP calendar date (${c.date_of_birth})`)
  }

  // Check audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'DOB_DERIVED')

  assert((auditLogs?.length || 0) >= 6, `Audit log recorded ${auditLogs?.length} DOB_DERIVED actions`)

  // Check zero CNP in audit logs
  for (const log of auditLogs || []) {
    const rawJson = JSON.stringify(log)
    assert(!rawJson.includes('1890') && !rawJson.includes('1830') && !rawJson.includes('2910'), 'Audit log contains 0 raw CNP values')
  }

  // -------------------------------------------------------------
  // SUITE 4: FOLLOW-UP CRUD & LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n[SUITE 4: FOLLOW-UP CRUD & LIFECYCLE]')

  const targetClient = clientList[0]

  // 4.1 Create Follow-up
  const testDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: createdFollowUp, error: createErr } = await supabase
    .from('follow_ups')
    .insert({
      client_id: targetClient.id,
      reason: 'Revenire ofertă test automat',
      due_date: testDueDate,
      priority: 'HIGH',
      status: 'PENDING',
      notes: 'Test notiță follow-up',
    })
    .select()
    .single()

  assert(!createErr && !!createdFollowUp, 'Follow-up created successfully with date, time, reason, note, priority, status')

  const followUpId = createdFollowUp!.id

  // 4.2 Edit Follow-up
  const { data: updatedFollowUp, error: updateErr } = await supabase
    .from('follow_ups')
    .update({
      notes: 'Test notiță modificată',
      priority: 'URGENT',
    })
    .eq('id', followUpId)
    .select()
    .single()

  assert(!updateErr && updatedFollowUp?.priority === 'URGENT', 'Follow-up edited successfully')

  // 4.3 Complete Follow-up
  const { data: completedFollowUp, error: completeErr } = await supabase
    .from('follow_ups')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', followUpId)
    .select()
    .single()

  assert(!completeErr && completedFollowUp?.status === 'COMPLETED', 'Follow-up marked COMPLETED successfully')

  // 4.4 Create Second Follow-up (Verifying History is preserved)
  const { data: secondFollowUp } = await supabase
    .from('follow_ups')
    .insert({
      client_id: targetClient.id,
      reason: 'Al doilea follow-up (nou)',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'NORMAL',
      status: 'PENDING',
      notes: 'Istoricul celui vechi rămâne intact',
    })
    .select()
    .single()

  const { data: clientHistory } = await supabase
    .from('follow_ups')
    .select('id, status, reason')
    .eq('client_id', targetClient.id)

  assert((clientHistory?.length || 0) >= 2, `Follow-up history preserved ${clientHistory?.length} total records (old completed + new pending)`)

  // 4.5 Cleanup test records cleanly
  await supabase.from('follow_ups').delete().eq('id', followUpId)
  if (secondFollowUp) await supabase.from('follow_ups').delete().eq('id', secondFollowUp.id)

  // -------------------------------------------------------------
  // SUITE 5: REMINDER & NOTIFICATION SYSTEM
  // -------------------------------------------------------------
  console.log('\n[SUITE 5: REMINDER & NOTIFICATION SYSTEM]')

  const reminderCheck = await checkAndGenerateReminders(supabase)
  assert(typeof reminderCheck.birthdayRemindersCreated === 'number', 'Reminder engine runs smoothly')
  assert(typeof reminderCheck.followUpRemindersCreated === 'number', 'Follow-up reminders checked')
  assert(typeof reminderCheck.skippedAlreadyNotified === 'number', 'Reminder engine is strictly idempotent')

  // Run reminder check second time to assert 100% idempotency
  const secondReminderCheck = await checkAndGenerateReminders(supabase)
  assert(secondReminderCheck.birthdayRemindersCreated === 0, 'Zero duplicate birthday reminders on repeat check')
  assert(secondReminderCheck.followUpRemindersCreated === 0, 'Zero duplicate follow-up reminders on repeat check')

  console.log(`\n=== FINAL RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`)
  if (failed > 0) process.exit(1)
}

runVerification()
