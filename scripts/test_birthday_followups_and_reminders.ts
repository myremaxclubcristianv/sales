// Mock global WebSocket for supabase-js in Node
;(global as unknown as { WebSocket: unknown }).WebSocket = class { constructor() {} }

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { getFollowUpsByView, acknowledgeBirthday } from '../src/lib/db/follow-ups'
import { getMasterCalendarEvents } from '../src/lib/db/calendar'
import { checkAndGenerateReminders } from '../src/lib/utils/reminders'
import { formatBirthdayTelegramMessage } from '../src/lib/telegram/telegram'
import { createClientRecord } from '../src/lib/db/clients'
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
  console.log('🧪 SALES CRM — BIRTHDAYS IN FOLLOW-UPS & NOTIFICATIONS TEST SUITE')
  console.log('======================================================\n')

  const todayParts = getBucharestDateParts(new Date())
  const todayStr = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`
  const todayMMDD = `${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`

  // 1. Create a synthetic test client with birthday today
  const testClientName = `TestClientFollowUp_${Date.now()}`
  let testClientId: string | null = null
  let standardFuId: string | null = null

  try {
    console.log('--- TEST GROUP 1: Dynamic Birthday Follow-ups Ingestion ---')
    const newClient = await createClientRecord({
      first_name: testClientName,
      last_name: 'Popescu',
      email: `${testClientName.toLowerCase()}@example.com`,
      phone: '+40799988877',
      date_of_birth: `1990-${todayMMDD}`,
      category: 'INSURANCE',
    }, supabase)

    testClientId = newClient.id
    assert(Boolean(testClientId), 'Created synthetic client with birthday today')

    // Fetch follow-ups for 'today'
    const todayFollowUps = await getFollowUpsByView('today', 'all', supabase)
    const birthdayInToday = todayFollowUps.find(f => f.client_id === testClientId && f.is_birthday)
    assert(Boolean(birthdayInToday), 'Birthday follow-up appears in "today" view')
    assert(birthdayInToday?.type === 'birthday', 'Follow-up item type is "birthday"')
    assert(birthdayInToday?.categories.includes('INSURANCE') || false, 'Birthday follow-up has correct category')
    assert(birthdayInToday?.is_birthday === true, 'is_birthday flag is true')

    // Test filter by type: 'birthdays'
    const birthdaysOnly = await getFollowUpsByView('today', 'birthdays', supabase)
    assert(birthdaysOnly.every(i => i.is_birthday), 'Filter "birthdays" returns only birthday items')
    assert(birthdaysOnly.some(i => i.client_id === testClientId), 'Test client is present in "birthdays" filter')

    // Test filter by type: 'follow_ups'
    const followUpsOnly = await getFollowUpsByView('today', 'follow_ups', supabase)
    assert(followUpsOnly.every(i => !i.is_birthday), 'Filter "follow_ups" excludes birthday items')
    assert(!followUpsOnly.some(i => i.client_id === testClientId && i.is_birthday), 'Birthday is excluded when type is "follow_ups"')

    console.log('\n--- TEST GROUP 2: Non-Destructive Birthday Acknowledgement ---')
    // Acknowledge birthday for current year
    const ackRes = await acknowledgeBirthday(testClientId!, todayParts.year, 'Felicitat telefonic cu succes!', supabase)
    assert(ackRes.success === true, 'Birthday acknowledgement executed successfully')

    // Check completed view
    const completedItems = await getFollowUpsByView('completed', 'all', supabase)
    const completedBirthday = completedItems.find(i => i.client_id === testClientId && i.is_birthday)
    assert(Boolean(completedBirthday), 'Acknowledged birthday appears in "completed" view')
    assert(completedBirthday?.status === 'COMPLETED', 'Birthday status is marked COMPLETED')

    // Check that client's DOB is intact and future recurring birthday exists
    const { data: clientAfterAck } = await supabase
      .from('clients')
      .select('date_of_birth')
      .eq('id', testClientId!)
      .single()
    assert(clientAfterAck?.date_of_birth === `1990-${todayMMDD}`, 'Client DOB remains intact after acknowledgement')

    const masterCal = await getMasterCalendarEvents({ year: todayParts.year + 1 }, supabase)
    const nextYearBirthday = masterCal.events.find(e => e.client_id === testClientId && e.type === 'birthday' && e.date.startsWith(String(todayParts.year + 1)))
    assert(Boolean(nextYearBirthday), 'Next year annual birthday recurrence exists and is untouched')

    console.log('\n--- TEST GROUP 3: Standard Follow-ups Non-Regression ---')
    // Create standard follow-up via direct db insertion using service client
    const { data: standardFu, error: fuErr } = await supabase
      .from('follow_ups')
      .insert({
        client_id: testClientId!,
        reason: 'Standard review call',
        due_date: `${todayStr}T15:00:00`,
        priority: 'HIGH',
        status: 'PENDING',
      })
      .select()
      .single()

    assert(!fuErr && Boolean(standardFu?.id), 'Created standard sales follow-up')
    standardFuId = standardFu?.id || null

    const todayItemsWithStd = await getFollowUpsByView('today', 'all', supabase)
    const foundStd = todayItemsWithStd.find(i => i.id === standardFuId)
    assert(Boolean(foundStd), 'Standard follow-up appears in today view alongside birthdays')
    assert(foundStd?.is_birthday === false, 'Standard follow-up is not flagged as birthday')

    // Complete standard follow-up
    await supabase
      .from('follow_ups')
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
      .eq('id', standardFuId!)

    const { data: stdAfterComplete } = await supabase
      .from('follow_ups')
      .select('status, completed_at')
      .eq('id', standardFuId!)
      .single()
    assert(stdAfterComplete?.status === 'COMPLETED', 'Standard follow-up successfully marked COMPLETED')

    console.log('\n--- TEST GROUP 4: Telegram & Reminder Notifications Formatting ---')
    // Test Telegram formatting
    const tg7d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'REAL ESTATE · INSURANCE',
      stage: '7d',
      clientId: testClientId!,
    })
    assert(tg7d.includes('BIRTHDAY IN 7 DAYS'), '7-day Telegram message contains correct header')
    assert(tg7d.includes('Prepare to say: La mulți ani 🎊'), '7-day Telegram message includes action cue')
    assert(!tg7d.includes('19900808') && !tg7d.includes('cnp'), 'Zero CNP leakage in 7-day Telegram message')

    const tg2d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'INSURANCE',
      stage: '2d',
      clientId: testClientId!,
    })
    assert(tg2d.includes('BIRTHDAY IN 2 DAYS'), '2-day Telegram message contains correct header')
    assert(tg2d.includes('Pregătește urările: La mulți ani 🎊'), '2-day Telegram message includes warm cue')

    const tg0d = formatBirthdayTelegramMessage({
      fullName: 'Ion Popescu',
      dateOfBirth: '1990-08-08',
      categoryLabel: 'REAL ESTATE · INSURANCE',
      stage: '0d',
      age: 36,
      clientId: testClientId!,
    })
    assert(tg0d.includes('BIRTHDAY TODAY'), 'Day-of Telegram message contains correct header')
    assert(tg0d.includes('LA MULȚI ANI! 🎊'), 'Day-of Telegram message contains greeting')
    assert(tg0d.includes('36 ani'), 'Day-of Telegram message includes calculated age')

    console.log('\n--- TEST GROUP 5: Reminders Engine Idempotency ---')
    // Run reminder check once
    const rem1 = await checkAndGenerateReminders(supabase)
    assert(typeof rem1.birthdayRemindersCreated === 'number', 'Reminders check 1 executed successfully')

    // Run reminder check twice (idempotency test)
    const rem2 = await checkAndGenerateReminders(supabase)
    assert(rem2.birthdayRemindersCreated === 0, 'Reminders check 2 created 0 duplicate notifications')

  } finally {
    // Cleanup synthetic test records
    if (testClientId) {
      await supabase.from('activities').delete().eq('client_id', testClientId)
      await supabase.from('follow_ups').delete().eq('client_id', testClientId)
      await supabase.from('notifications').delete().eq('related_entity_id', testClientId)
      await supabase.from('personal_events').delete().eq('client_id', testClientId)
      await supabase.from('clients').delete().eq('id', testClientId)
      console.log('\n🧹 Cleaned up synthetic test client record safely.')
    }
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
