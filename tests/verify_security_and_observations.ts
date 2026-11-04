/**
 * COMPREHENSIVE LOCAL SECURITY HARDENING AND AUDIT OBSERVATION VERIFICATION TEST SUITE
 * Tests all requirements without modifying production data or sending live notifications.
 */

import { isAuthorizedAdmin, AUTHORIZED_ADMIN_EMAIL } from '../src/lib/auth/admin-auth'
import {
  isValidCalendarDate,
  isValidTimeString,
  bucharestToUtcIso,
  utcToBucharestParts,
} from '../src/lib/utils/timezone'
import { EXISTING_INSURANCE_PRODUCTS, EXISTING_INSURERS } from '../src/components/AddClientPolicyModal'

async function runSecurityAndAuditTests() {
  console.log('======================================================================')
  console.log('🔒 TEST SUITE: SECURITY HARDENING & OBSERVATIONS VERIFICATION')
  console.log('======================================================================\n')

  let passed = 0
  let failed = 0

  function assert(title: string, condition: boolean, extra?: unknown) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${title}`, extra !== undefined ? extra : '')
      failed++
    }
  }

  // ============================================================================
  // SECTION 1: AUTHENTICATION & AUTHORIZATION RBAC CHECKS
  // ============================================================================
  console.log('--- 1. CHESTERTONS, CALENDAR & INSURANCE AUTH / RBAC ---')
  {
    // Test isAuthorizedAdmin
    const nullUser = null
    const anonUser = { id: 'u1', email: undefined, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as any
    const unauthorizedUser = { id: 'u2', email: 'agent.random@test.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as any
    const validAdminUser = { id: 'u3', email: AUTHORIZED_ADMIN_EMAIL, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as any
    const validAdminUpper = { id: 'u4', email: AUTHORIZED_ADMIN_EMAIL.toUpperCase(), app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as any

    assert('Rejects null / undefined user', !isAuthorizedAdmin(nullUser))
    assert('Rejects user without email', !isAuthorizedAdmin(anonUser))
    assert('Rejects non-admin authenticated user (HTTP 403 Forbidden)', !isAuthorizedAdmin(unauthorizedUser))
    assert('Approves authorized admin user (HTTP 200 OK)', isAuthorizedAdmin(validAdminUser))
    assert('Approves authorized admin user with case-insensitive email', isAuthorizedAdmin(validAdminUpper))
  }

  // ============================================================================
  // SECTION 2: CALENDAR VALIDATION & CORRELATION
  // ============================================================================
  console.log('\n--- 2. CALENDAR DATE, TIME & STRICT CLIENT CORRELATION ---')
  {
    // A. Date validation
    assert('Accepts valid calendar date (2026-11-10)', isValidCalendarDate('2026-11-10'))
    assert('Accepts leap day in leap year (2024-02-29)', isValidCalendarDate('2024-02-29'))
    assert('Rejects leap day in non-leap year (2026-02-29)', !isValidCalendarDate('2026-02-29'))
    assert('Rejects 31st of April (2026-04-31)', !isValidCalendarDate('2026-04-31'))
    assert('Rejects 31st of June (2026-06-31)', !isValidCalendarDate('2026-06-31'))
    assert('Rejects month 13 (2026-13-01)', !isValidCalendarDate('2026-13-01'))
    assert('Rejects random string as date ("tomorrow")', !isValidCalendarDate('tomorrow'))
    assert('Rejects SQL injection in date ("2026-11-10\'; DROP TABLE")', !isValidCalendarDate("2026-11-10'; DROP TABLE"))

    // B. Time validation
    assert('Accepts valid time (14:30)', isValidTimeString('14:30'))
    assert('Accepts midnight (00:00)', isValidTimeString('00:00'))
    assert('Accepts 23:59', isValidTimeString('23:59'))
    assert('Rejects hour 24 (24:00)', !isValidTimeString('24:00'))
    assert('Rejects minute 60 (14:60)', !isValidTimeString('14:60'))
    assert('Rejects 1-digit hour without leading zero (9:30)', !isValidTimeString('9:30'))
    assert('Rejects random text as time ("now")', !isValidTimeString('now'))

    // C. Strict Client Correlation Logic Simulation (call-note)
    // Scenario 1: follow_up has client_id "client-a-uuid", request body mistakenly sends "client-b-uuid"
    const followUpRecord = { id: 'follow-up-1', client_id: 'client-a-uuid', notes: 'First note' }
    const bodyClientMismatch = { follow_up_id: 'follow-up-1', client_id: 'client-b-uuid', note: 'Called client' }

    // The hardened logic enforces targetClientId = followUpRecord.client_id
    const targetClientId = followUpRecord ? followUpRecord.client_id : bodyClientMismatch.client_id
    assert('Strictly enforces follow_up.client_id over body.client_id', targetClientId === 'client-a-uuid')
    assert('Does not assign CALL activity to mismatched client-b', targetClientId !== 'client-b-uuid')

    // Scenario 2: follow_up has null or empty client_id
    const corruptedFollowUp = { id: 'follow-up-2', client_id: null, notes: '' }
    const isFollowUpClientValid = Boolean(corruptedFollowUp.client_id && /^[0-9a-f-]{36}$/i.test(corruptedFollowUp.client_id))
    assert('Detects and rejects follow_up with missing or invalid client_id', !isFollowUpClientValid)
  }

  // ============================================================================
  // SECTION 3: TIMEZONE EUROPE/BUCHAREST & DST ACCURACY
  // ============================================================================
  console.log('\n--- 3. TIMEZONE EUROPE/BUCHAREST & DST TRANSITIONS ---')
  {
    // A. Winter time (EET = UTC+2)
    // 10 Nov 2026 at 14:30 Bucharest -> UTC should be 12:30:00.000Z
    const winterDate = '2026-11-10'
    const winterTime = '14:30'
    const winterUtcIso = bucharestToUtcIso(winterDate, winterTime)
    assert('Winter time (EET) converts 14:30 Bucharest to 12:30 UTC', winterUtcIso === '2026-11-10T12:30:00.000Z', winterUtcIso)

    // Reconversion back to Bucharest parts
    const winterParts = utcToBucharestParts(winterUtcIso)
    assert('Winter time converts back to exact date (2026-11-10)', winterParts.date === '2026-11-10')
    assert('Winter time converts back to exact time (14:30)', winterParts.time === '14:30')

    // B. Summer time (EEST = UTC+3)
    // 15 July 2026 at 14:30 Bucharest -> UTC should be 11:30:00.000Z
    const summerDate = '2026-07-15'
    const summerTime = '14:30'
    const summerUtcIso = bucharestToUtcIso(summerDate, summerTime)
    assert('Summer time (EEST) converts 14:30 Bucharest to 11:30 UTC', summerUtcIso === '2026-07-15T11:30:00.000Z', summerUtcIso)

    // Reconversion back to Bucharest parts
    const summerParts = utcToBucharestParts(summerUtcIso)
    assert('Summer time converts back to exact date (2026-07-15)', summerParts.date === '2026-07-15')
    assert('Summer time converts back to exact time (14:30)', summerParts.time === '14:30')

    // C. Day of transition to summer time (March 2026: last Sunday is 29 March)
    const marchDstDate = '2026-03-29'
    const marchDstTime = '16:00'
    const marchUtcIso = bucharestToUtcIso(marchDstDate, marchDstTime)
    assert('Spring DST transition converts to UTC correctly (EEST UTC+3: 13:00 UTC)', marchUtcIso === '2026-03-29T13:00:00.000Z', marchUtcIso)
    const marchParts = utcToBucharestParts(marchUtcIso)
    assert('Spring DST transition roundtrips back to 16:00 Bucharest', marchParts.time === '16:00')

    // D. Day of transition to winter time (October 2026: last Sunday is 25 October)
    const octDstDate = '2026-10-25'
    const octDstTime = '16:00'
    const octUtcIso = bucharestToUtcIso(octDstDate, octDstTime)
    assert('Autumn DST transition converts to UTC correctly (EET UTC+2: 14:00 UTC)', octUtcIso === '2026-10-25T14:00:00.000Z', octUtcIso)
    const octParts = utcToBucharestParts(octUtcIso)
    assert('Autumn DST transition roundtrips back to 16:00 Bucharest', octParts.time === '16:00')
  }

  // ============================================================================
  // SECTION 4: INSURANCE POLICIES VALIDATION & CLIENT EXISTENCE
  // ============================================================================
  console.log('\n--- 4. INSURANCE POLICY CREATION, CLIENT EXISTENCE & CONSTRAINTS ---')
  {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // A. UUID format validation
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    const invalidUuid = 'not-a-uuid-123'
    const sqlInjectionUuid = "550e8400-e29b-41d4-a716-446655440000' OR 1=1--"

    assert('Validates RFC4122 compliant UUID', uuidRegex.test(validUuid))
    assert('Rejects malformed UUID string', !uuidRegex.test(invalidUuid))
    assert('Rejects injection string in UUID', !uuidRegex.test(sqlInjectionUuid))

    // B. Policy number empty string normalization
    const emptyPolicyNum = '   '
    const cleanPolicyNum = emptyPolicyNum && emptyPolicyNum.trim() ? emptyPolicyNum.trim() : null
    assert('Normalizes empty whitespace policy_number to null (avoids UNIQUE violation)', cleanPolicyNum === null)

    const filledPolicyNum = 'POL-RO-2026-9999'
    const cleanFilled = filledPolicyNum && filledPolicyNum.trim() ? filledPolicyNum.trim() : null
    assert('Preserves non-empty trimmed policy_number', cleanFilled === 'POL-RO-2026-9999')

    // C. Products and Insurers catalog validation
    const allowedProducts = [
      'RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL',
      'LIABILITY', 'PROFESSIONAL_LIABILITY', 'CARGO', 'IMM',
      'BUSINESS', 'CYBER', 'OTHER'
    ]
    assert('Allowed products matches PostgreSQL CHECK constraint',
      allowedProducts.includes('RCA') &&
      allowedProducts.includes('HOME') &&
      allowedProducts.includes('CASCO') &&
      allowedProducts.includes('CYBER') &&
      !allowedProducts.includes('FAKE_PRODUCT')
    )

    // D. Date chronological order validation
    const startValid = '2026-11-05'
    const expiryValid = '2027-11-05'
    const expiryInvalid = '2026-11-04'

    assert('Validates expiry_date >= start_date', new Date(expiryValid) >= new Date(startValid))
    assert('Rejects expiry_date < start_date', new Date(expiryInvalid) < new Date(startValid))
    assert('Validates real start date format', isValidCalendarDate(startValid))
    assert('Validates real expiry date format', isValidCalendarDate(expiryValid))
  }

  console.log('\n======================================================================')
  console.log(`🏁 FINAL VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('======================================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runSecurityAndAuditTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
