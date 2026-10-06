// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { getFollowUpsByView, acknowledgeBirthday } from '../src/lib/db/follow-ups'
import { getMasterCalendarEvents } from '../src/lib/db/calendar'
import { checkAndGenerateReminders } from '../src/lib/utils/reminders'
import { formatBirthdayTelegramMessage } from '../src/lib/telegram/telegram'
import { createClientRecord, updateClient } from '../src/lib/db/clients'
import { getBucharestDateParts } from '../src/lib/utils/cnp'

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

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`)
    failed++
  }
}

async function runTests() {
  console.log('\n======================================================')
  console.log('🧪 SALES CRM — OPERATIONAL BIRTHDAY FOLLOW-UPS TEST SUITE')
  console.log('======================================================\n')

  const todayParts = getBucharestDateParts(new Date())
  const todayStr = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`
  const todayMMDD = `${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`

  const testClientName = `TestOpBirthday_${Date.now()}`
  let testClientId: string | null = null
  let noDobClientId: string | null = null
  let multiCatClientId: string | null = null

  try {
    console.log('--- TEST GROUP 1: Operational Birthday Follow-up Scheduling ---')
    const newClient = await createClientRecord({
      first_name: testClientName,
      last_name: 'Popescu',
      email: `${testClientName.toLowerCase()}@example.com`,
      phone: '+40799988877',
      date_of_birth: `1990-${todayMMDD}`,
      category: 'INSURANCE',
    }, supabase)

    testClientId = newClient.id
    assert(Boolean(testClientId), 'Created client with valid DOB')

    // Fetch follow-ups for 'today'
    const todayFollowUps = await getFollowUpsByView('today', 'all', supabase)
    const birthdayInToday = todayFollowUps.find(f => f.client_id === testClientId && f.is_birthday)
    assert(Boolean(birthdayInToday), 'Birthday follow-up is automatically scheduled for calling in "today" view')
    assert(birthdayInToday?.due_date.endsWith('T10:00:00') || false, 'Birthday follow-up scheduled at default 10:00 Europe/Bucharest calling time')
    assert(birthdayInToday?.notes?.includes('Sună clientul și transmite-i La mulți ani 🎊') || false, 'Birthday follow-up includes calling instruction in notes')
    assert(birthdayInToday?.status === 'PENDING', 'Day-of birthday follow-up has status PENDING for action')

    // Filter by 'birthdays' and 'follow_ups'
    const birthdaysOnly = await getFollowUpsByView('today', 'birthdays', supabase)
    assert(birthdaysOnly.every(i => i.is_birthday), 'Filter "birthdays" contains exclusively birthday follow-ups')
    const followUpsOnly = await getFollowUpsByView('today', 'follow_ups', supabase)
    assert(followUpsOnly.every(i => !i.is_birthday), 'Filter "follow_ups" contains exclusively standard follow-ups')

    console.log('\n--- TEST GROUP 2: Person Without DOB Behavior ---')
    const noDobClient = await createClientRecord({
      first_name: `NoDob_${Date.now()}`,
      last_name: 'Ionescu',
      email: `nodob_${Date.now()}@example.com`,
      category: 'REAL_ESTATE',
    }, supabase)
    noDobClientId = noDobClient.id

    const allFollowUps = await getFollowUpsByView('all', 'birthdays', supabase)
    const noDobFound = allFollowUps.find(f => f.client_id === noDobClientId)
    assert(!noDobFound, 'Person without DOB has 0 birthday follow-ups generated (zero guessing)')

    console.log('\n--- TEST GROUP 3: Multi-Category Aggregation ---')
    const multiCatClient = await createClientRecord({
      first_name: `MultiCat_${Date.now()}`,
      last_name: 'Dumitrescu',
      email: `multicat_${Date.now()}@example.com`,
      date_of_birth: `1985-${todayMMDD}`,
      category: 'INSURANCE',
    }, supabase)
    multiCatClientId = multiCatClient.id

    // Add relationships / policies / credit cases
    await supabase.from('credit_cases').insert({
      client_id: multiCatClientId,
      amount: 100000,
      purpose: 'Mortgage',
    })
    await supabase.from('client_relationships').insert({
      client_id: multiCatClientId,
      relationship_type: 'buyer',
    })

    const multiCatItems = await getFollowUpsByView('today', 'birthdays', supabase)
    const multiCatFollowUp = multiCatItems.find(f => f.client_id === multiCatClientId)
    assert(Boolean(multiCatFollowUp), 'Multi-category client has birthday follow-up present')
    assert(Boolean(multiCatFollowUp?.categories.includes('INSURANCE') && multiCatFollowUp?.categories.includes('CREDITE') && multiCatFollowUp?.categories.includes('REAL ESTATE')), '1 Person = 1 Birthday Follow-up with aggregated categories (REAL ESTATE · INSURANCE · CREDITE)')

    console.log('\n--- TEST GROUP 4: Non-Destructive Completion & Next Year Auto-Preservation ---')
    const ackRes = await acknowledgeBirthday(testClientId!, todayParts.year, 'Sunat și felicitat cu succes!', supabase)
    assert(ackRes.success === true, 'Birthday follow-up marked completed for current year')

    const completedItems = await getFollowUpsByView('completed', 'all', supabase)
    const completedBirthday = completedItems.find(i => i.client_id === testClientId && i.is_birthday)
    assert(Boolean(completedBirthday) && completedBirthday?.status === 'COMPLETED', 'Current year birthday follow-up is visible under "completed"')

    // Verify next year's occurrence is already pre-scheduled in upcoming
    const upcomingItems = await getFollowUpsByView('all', 'birthdays', supabase)
    const nextYearItem = upcomingItems.find(i => i.client_id === testClientId && i.due_date.startsWith(String(todayParts.year + 1)))
    assert(Boolean(nextYearItem), 'Next year annual birthday follow-up automatically exists and is pre-scheduled')
    assert(nextYearItem?.due_date.endsWith('T10:00:00') || false, 'Next year birthday follow-up maintains 10:00 calling time')

    console.log('\n--- TEST GROUP 5: Telegram Calling Prompts & Reminders ---')
    const tg7d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'REAL ESTATE · INSURANCE',
      stage: '7d',
      clientId: testClientId!,
    })
    assert(tg7d.includes('BIRTHDAY IN 7 DAYS'), '7-day Telegram message contains correct header')
    assert(tg7d.includes('Pregătește-te să îl/o suni: La mulți ani 🎊'), '7-day Telegram message contains call preparation cue')
    assert(!tg7d.includes('19900808') && !tg7d.includes('cnp'), 'Zero CNP leakage in 7-day Telegram alert')

    const tg2d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'INSURANCE',
      stage: '2d',
      clientId: testClientId!,
    })
    assert(tg2d.includes('BIRTHDAY IN 2 DAYS'), '2-day Telegram message contains correct header')
    assert(tg2d.includes('Pregătește urările: La mulți ani 🎊'), '2-day Telegram message contains greeting cue')

    const tg0d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'REAL ESTATE · INSURANCE',
      stage: '0d',
      age: 36,
      clientId: testClientId!,
    })
    assert(tg0d.includes('BIRTHDAY TODAY'), 'Day-of Telegram alert contains BIRTHDAY TODAY header')
    assert(tg0d.includes('Sună clientul: LA MULȚI ANI! 🎊'), 'Day-of Telegram alert contains direct call prompt')

    console.log('\n--- TEST GROUP 6: Dynamic DOB Updates and Removal ---')
    // Remove DOB
    await updateClient(testClientId!, { date_of_birth: null }, supabase)
    const afterRemoval = await getFollowUpsByView('all', 'birthdays', supabase)
    const afterRemovalFound = afterRemoval.find(f => f.client_id === testClientId)
    assert(!afterRemovalFound, 'Removing DOB removes future birthday follow-up from active queue')

    console.log('\n--- TEST GROUP 7: Idempotency & Repeat Runs ---')
    const run1 = await checkAndGenerateReminders(supabase)
    const run2 = await checkAndGenerateReminders(supabase)
    assert(run2.birthdayRemindersCreated === 0, 'Reminder checks are strictly idempotent (0 duplicate alerts)')

  } finally {
    // Cleanup
    if (testClientId) {
      await supabase.from('activities').delete().eq('client_id', testClientId)
      await supabase.from('follow_ups').delete().eq('client_id', testClientId)
      await supabase.from('notifications').delete().eq('related_entity_id', testClientId)
      await supabase.from('personal_events').delete().eq('client_id', testClientId)
      await supabase.from('clients').delete().eq('id', testClientId)
    }
    if (noDobClientId) {
      await supabase.from('clients').delete().eq('id', noDobClientId)
    }
    if (multiCatClientId) {
      await supabase.from('credit_cases').delete().eq('client_id', multiCatClientId)
      await supabase.from('client_relationships').delete().eq('client_id', multiCatClientId)
      await supabase.from('personal_events').delete().eq('client_id', multiCatClientId)
      await supabase.from('clients').delete().eq('id', multiCatClientId)
    }
    console.log('\n🧹 Safely cleaned up synthetic test records.')
  }

  console.log('\n======================================================')
  console.log(`TEST SUMMARY: ${passed} PASS / ${failed} FAIL`)
  console.log('======================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err)
  process.exit(1)
})
