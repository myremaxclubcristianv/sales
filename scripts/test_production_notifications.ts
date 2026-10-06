import {
  parseAndValidateCnp,
  isValidCnp,
  deriveDobFromCnp,
  calculateAge,
  formatDobDisplay,
  maskCnp,
  getBucharestDateParts,
  getBirthdayCountdownInfo,
  getRomanianBirthdayWish,
} from '../src/lib/utils/cnp'
import {
  formatBirthdayTelegramMessage,
  formatFollowUpTelegramMessage,
} from '../src/lib/telegram/telegram'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✓ PASS: ${testName}`)
  } else {
    failedTests++
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`)
  }
}

console.log('\n========================================')
console.log('🧪 RUNNING PRODUCTION NOTIFICATIONS & TIMEZONE TEST SUITE')
console.log('========================================\n')

// 1. Timezone & Date Extraction Tests
console.log('--- 1. Romanian Timezone & Bucharest Date Extraction ---')
const bucharestDate = getBucharestDateParts(new Date('2026-10-06T20:00:00Z'))
assert(typeof bucharestDate.year === 'number', 'Bucharest year is a valid number')
assert(typeof bucharestDate.month === 'number' && bucharestDate.month >= 1 && bucharestDate.month <= 12, 'Bucharest month is 1-12')
assert(typeof bucharestDate.day === 'number' && bucharestDate.day >= 1 && bucharestDate.day <= 31, 'Bucharest day is 1-31')
assert(/^\d{4}-\d{2}-\d{2}$/.test(bucharestDate.dateStr), 'Bucharest dateStr is formatted YYYY-MM-DD')

// 2. Birthday Countdown Calculations
console.log('\n--- 2. Birthday Countdown & Dynamic Wishes ---')
const refDate = new Date(Date.UTC(2026, 9, 6)) // 2026-10-06 in UTC

// Case A: Birthday today (10-06)
const todayDob = '1990-10-06'
const todayInfo = getBirthdayCountdownInfo(todayDob, refDate)
assert(todayInfo.hasDob === true, 'Birthday today: hasDob is true')
assert(todayInfo.isToday === true, 'Birthday today: isToday is true')
assert(todayInfo.daysUntil === 0, 'Birthday today: daysUntil is 0')
assert(todayInfo.statusTextRo.includes('ASTĂZI'), 'Birthday today: statusTextRo contains ASTĂZI')

// Case B: Birthday in 2 days (10-08)
const twoDaysDob = '1994-10-08'
const twoDaysInfo = getBirthdayCountdownInfo(twoDaysDob, refDate)
assert(twoDaysInfo.isToday === false, 'Birthday in 2 days: isToday is false')
assert(twoDaysInfo.daysUntil === 2, 'Birthday in 2 days: daysUntil is 2')
assert(twoDaysInfo.statusTextRo === 'ÎN 2 ZILE', 'Birthday in 2 days: statusTextRo is ÎN 2 ZILE')

// Case C: Birthday in 7 days (10-13)
const sevenDaysDob = '1985-10-13'
const sevenDaysInfo = getBirthdayCountdownInfo(sevenDaysDob, refDate)
assert(sevenDaysInfo.daysUntil === 7, 'Birthday in 7 days: daysUntil is 7')
assert(sevenDaysInfo.statusTextRo === 'ÎN 7 ZILE', 'Birthday in 7 days: statusTextRo is ÎN 7 ZILE')

// Case D: Birthday passed earlier this year (08-08)
const passedDob = '1994-08-08'
const passedInfo = getBirthdayCountdownInfo(passedDob, refDate)
assert(passedInfo.isToday === false, 'Passed birthday: isToday is false')
assert(passedInfo.daysUntil > 200, 'Passed birthday: daysUntil points to next year (2027)')
assert(passedInfo.turningAge === 33, 'Passed birthday: turningAge is calculated for next year (33)')

// Case E: Romanian Birthday Wish Generator
const wish = getRomanianBirthdayWish('Ion')
assert(wish.includes('La mulți ani, Ion!'), 'Birthday wish contains personalized name')
assert(wish.includes('multă sănătate'), 'Birthday wish contains polite Romanian wishes')

// 3. Telegram Birthday Formatters
console.log('\n--- 3. Telegram Birthday Messages ---')
const tg7d = formatBirthdayTelegramMessage({
  fullName: 'Ion Popescu',
  dateOfBirth: '1994-08-08',
  categoryLabel: 'INSURANCE · REAL ESTATE',
  stage: '7d',
  clientId: 'client-123',
})
assert(tg7d.includes('BIRTHDAY IN 7 DAYS'), '7-day Telegram message contains correct header')
assert(tg7d.includes('Ion Popescu'), '7-day Telegram message contains client name')
assert(tg7d.includes('INSURANCE · REAL ESTATE'), '7-day Telegram message contains categories')
assert(!tg7d.includes('1940808'), '7-day Telegram message contains NO CNP')

const tg2d = formatBirthdayTelegramMessage({
  fullName: 'Maria Ionescu',
  dateOfBirth: '1990-05-15',
  categoryLabel: 'CREDITE',
  stage: '2d',
  clientId: 'client-456',
})
assert(tg2d.includes('BIRTHDAY IN 2 DAYS'), '2-day Telegram message contains correct header')
assert(tg2d.includes('La mulți ani'), '2-day Telegram message reminds operator to prepare greetings')

const tg0d = formatBirthdayTelegramMessage({
  fullName: 'Cristian Popescu',
  dateOfBirth: '1994-08-08',
  categoryLabel: 'INSURANCE',
  stage: '0d',
  age: 32,
  clientId: 'client-789',
})
assert(tg0d.includes('BIRTHDAY TODAY'), 'Today Telegram message contains BIRTHDAY TODAY header')
assert(tg0d.includes('32 ani'), 'Today Telegram message contains client age')

// 4. Telegram Follow-up Formatters
console.log('\n--- 4. Telegram Follow-up Messages ---')
const tgFlw = formatFollowUpTelegramMessage({
  clientName: 'Ion Popescu',
  reason: 'Revenire ofertă apartament',
  notes: 'Sun pentru feedback după vizionare.',
  dueDateStr: '2026-10-15',
  timeStr: '11:30',
  priority: 'HIGH',
  stage: '0d',
  clientId: 'client-123',
})
assert(tgFlw.includes('FOLLOW-UP TODAY'), 'Follow-up Telegram contains FOLLOW-UP TODAY')
assert(tgFlw.includes('Ion Popescu'), 'Follow-up Telegram contains client name')
assert(tgFlw.includes('Revenire ofertă apartament'), 'Follow-up Telegram contains reason')
assert(tgFlw.includes('Sun pentru feedback'), 'Follow-up Telegram contains notes')
assert(tgFlw.includes('HIGH'), 'Follow-up Telegram contains priority')

// 5. Zero CNP Leakage & Security Verification
console.log('\n--- 5. Security & Masking Audit ---')
const sampleCnp = '1940808280015'
const masked = maskCnp(sampleCnp)
assert(masked === '•••••••••••••', 'maskCnp returns 13 bullets without plaintext exposure')
assert(!masked.includes('1940808'), 'Masked CNP contains zero plaintext digits')

console.log('\n========================================')
console.log(`TOTAL TESTS: ${totalTests}`)
console.log(`PASSED: ${passedTests}`)
console.log(`FAILED: ${failedTests}`)
console.log('========================================\n')

if (failedTests > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
