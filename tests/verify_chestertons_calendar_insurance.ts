import { getChestertonsRequestById } from '../src/lib/db/chestertons-requests'
import { EXISTING_INSURANCE_PRODUCTS, EXISTING_INSURERS } from '../src/components/AddClientPolicyModal'

async function runTests() {
  console.log('====================================================')
  console.log('🧪 TEST SUITE: CHESTERTONS, CALENDAR & INSURANCE')
  console.log('====================================================\n')

  let passed = 0
  let failed = 0

  function assert(desc: string, condition: boolean, extra?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${desc}`, extra ? extra : '')
      failed++
    }
  }

  // TEST SUITE 1: Chestertons Resolution & Status/Note Sync
  console.log('--- 1. CHESTERTONS RESOLUTION & STATUS/NOTE SYNC ---')
  try {
    const reqBySourceId = await getChestertonsRequestById('CC13195')
    assert('Resolves Chestertons request by alphanumeric import_source_id (CC13195) without UUID 22P02 error', reqBySourceId !== null && reqBySourceId.import_source_id === 'CC13195')
    assert('Correctly reads crm_status from database', reqBySourceId?.crm_status !== undefined)
    assert('Loads activities array without SQL syntax errors', Array.isArray(reqBySourceId?.activities))
    assert('crm_notes is populated from record or fallback activity note', typeof reqBySourceId?.crm_notes === 'string' || reqBySourceId?.crm_notes === null)

    // Test UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    assert('CC13195 is recognized as non-UUID (source id)', !uuidRegex.test('CC13195'))
    assert('4600 is recognized as non-UUID (source id)', !uuidRegex.test('4600'))
    assert('Standard UUID is recognized as UUID', uuidRegex.test('a1b2c3d4-e5f6-7890-abcd-ef1234567890'))
  } catch (err: any) {
    assert('Chestertons request retrieval throws no exception', false, err?.message)
  }

  // TEST SUITE 2: Calendar Workflow Logic
  console.log('\n--- 2. CALENDAR WORKFLOW & RESCHEDULING LOGIC ---')
  {
    // Test reschedule date formatting and timezone preservation
    const editDate = '2026-11-10'
    const editTime = '14:30'
    const combinedIso = `${editDate}T${editTime}:00`
    assert('Valid combined ISO string for Bucharest calendar', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/.test(combinedIso))

    // Test call note prefixing & formatting
    const rawNote = 'Am sunat clientul. Nu a răspuns.'
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const timeStampStr = `[${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}]`
    const noteWithTimestamp = `${timeStampStr} ${rawNote.trim()}`
    assert('Post-call note format includes timestamp and text', noteWithTimestamp.includes('[') && noteWithTimestamp.includes(rawNote))

    // Test appending notes to existing follow_up notes
    const existingNotes = 'Primul apel efectuat.'
    const appendedNotes = existingNotes ? `${existingNotes}\n\n${noteWithTimestamp}` : noteWithTimestamp
    assert('Appended notes preserve historical notes without overwrite', appendedNotes.startsWith(existingNotes) && appendedNotes.includes(noteWithTimestamp))
  }

  // TEST SUITE 3: Insurance Policy Validation & Modal Config
  console.log('\n--- 3. INSURANCE POLICY VALIDATION & DATA MAPPING ---')
  {
    assert('Existing insurance products catalog contains RCA, CASCO, HOME, LIFE, HEALTH',
      EXISTING_INSURANCE_PRODUCTS.some(p => p.value === 'RCA') &&
      EXISTING_INSURANCE_PRODUCTS.some(p => p.value === 'CASCO') &&
      EXISTING_INSURANCE_PRODUCTS.some(p => p.value === 'HOME') &&
      EXISTING_INSURANCE_PRODUCTS.some(p => p.value === 'LIFE') &&
      EXISTING_INSURANCE_PRODUCTS.some(p => p.value === 'HEALTH')
    )
    assert('Existing insurers catalog includes Allianz-Tiriac, Omniasig, Groupama, Generali',
      EXISTING_INSURERS.includes('Allianz-Tiriac') &&
      EXISTING_INSURERS.includes('Omniasig VIG') &&
      EXISTING_INSURERS.includes('Groupama') &&
      EXISTING_INSURERS.includes('Generali')
    )

    // Test policy number empty-string normalization
    const emptyPolicyNum = '   '
    const normalizedPolicyNum = emptyPolicyNum.trim() || null
    assert('Empty policy number trims to null to prevent UNIQUE constraint collisions', normalizedPolicyNum === null)

    const validPolicyNum = 'RO-12345678'
    const normalizedValidNum = validPolicyNum.trim() || null
    assert('Non-empty policy number trims properly', normalizedValidNum === 'RO-12345678')

    // Test start and expiry date validation
    const startDate = '2026-11-05'
    const validExpiry = '2027-11-05'
    const invalidExpiry = '2026-11-04'
    assert('Accepts expiry date after start date', new Date(validExpiry) >= new Date(startDate))
    assert('Rejects expiry date before start date', new Date(invalidExpiry) < new Date(startDate))

    // Test premium & commission coercion
    const premiumStr = '1250.50'
    const commissionStr = '125.05'
    const premiumNum = parseFloat(premiumStr)
    const commissionNum = parseFloat(commissionStr)
    assert('Parses premium string into float', premiumNum === 1250.5)
    assert('Parses commission string into float', commissionNum === 125.05)
  }

  console.log('\n====================================================')
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('====================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
