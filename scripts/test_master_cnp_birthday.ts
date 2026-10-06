import { parseAndValidateCnp, isValidCnp, deriveDobFromCnp, calculateAge, formatDobDisplay } from '../src/lib/utils/cnp'

console.log('=== CNP & DOB DERIVATION TEST MATRIX ===\n')

let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${message}`)
    failed++
  }
}

// 1. Structural Check on the prompt's example: 1940808xxxxx
// We construct a valid checksum for 194080801123 -> S=1, YY=94, MM=08, DD=08, JJ=01, NNN=123
// Weights: 2 7 9 1 4 6 3 5 8 2 7 9
// 1*2 + 9*7 + 4*9 + 0*1 + 8*4 + 0*6 + 8*3 + 0*5 + 1*8 + 1*2 + 2*7 + 3*9 = 2 + 63 + 36 + 0 + 32 + 0 + 24 + 0 + 8 + 2 + 14 + 27 = 208
// 208 % 11 = 10 -> Control digit = 1.
// CNP: 1940808011231
const sampleValidCnp = '1940808011231'
const sampleRes = parseAndValidateCnp(sampleValidCnp)
assert(sampleRes.isValid === true, 'Sample 1940808... is valid')
assert(sampleRes.dateOfBirth === '1994-08-08', `Sample 1940808... DOB is 1994-08-08 (got ${sampleRes.dateOfBirth})`)
assert(sampleRes.sex === 'M', 'Sex is Male')
assert(sampleRes.year === 1994, 'Year is 1994')
assert(sampleRes.month === 8, 'Month is 8')
assert(sampleRes.day === 8, 'Day is 8')

// 2. Sex & Century Tests
// Female 1900-1999 (S=2)
// 291060101123 -> 2*2 + 9*7 + 1*9 + 0*1 + 6*4 + 0*6 + 1*3 + 0*5 + 1*8 + 1*2 + 2*7 + 3*9 = 4 + 63 + 9 + 0 + 24 + 0 + 3 + 0 + 8 + 2 + 14 + 27 = 154
// 154 % 11 = 0 -> Control = 0 -> 2910601011230
const s2Res = parseAndValidateCnp('2910601011230')
assert(s2Res.isValid === true, 'S=2 female CNP valid')
assert(s2Res.dateOfBirth === '1991-06-01', `S=2 DOB is 1991-06-01 (got ${s2Res.dateOfBirth})`)
assert(s2Res.sex === 'F', 'Sex is Female')

// Male 2000-2099 (S=5)
// 505031501123 -> 5*2 + 0*7 + 5*9 + 0*1 + 3*4 + 1*6 + 5*3 + 0*5 + 1*8 + 1*2 + 2*7 + 3*9 = 10 + 0 + 45 + 0 + 12 + 6 + 15 + 0 + 8 + 2 + 14 + 27 = 139
// 139 % 11 = 7 -> Control = 7 -> 5050315011237
const s5Res = parseAndValidateCnp('5050315011237')
assert(s5Res.isValid === true, 'S=5 2000-2099 male CNP valid')
assert(s5Res.dateOfBirth === '2005-03-15', `S=5 DOB is 2005-03-15 (got ${s5Res.dateOfBirth})`)

// Female 2000-2099 (S=6)
// 602042001123 -> 6*2 + 0*7 + 2*9 + 0*1 + 4*4 + 2*6 + 0*3 + 0*5 + 1*8 + 1*2 + 2*7 + 3*9 = 12 + 0 + 18 + 0 + 16 + 12 + 0 + 0 + 8 + 2 + 14 + 27 = 109
// 109 % 11 = 10 -> Control = 1 -> 6020420011231
const s6Res = parseAndValidateCnp('6020420011231')
assert(s6Res.isValid === true, 'S=6 2000-2099 female CNP valid')
assert(s6Res.dateOfBirth === '2002-04-20', `S=6 DOB is 2002-04-20 (got ${s6Res.dateOfBirth})`)

// 3. Leap Year Tests
// Leap year: 2000-02-29 (S=5 -> 2000)
// 500022901123 -> 5*2 + 0 + 0 + 0 + 2*4 + 2*6 + 9*3 + 0 + 1*8 + 1*2 + 2*7 + 3*9 = 10 + 8 + 12 + 27 + 8 + 2 + 14 + 27 = 108
// 108 % 11 = 9 -> Control = 9 -> 5000229011239
const leapValid = parseAndValidateCnp('5000229011239')
assert(leapValid.isValid === true, 'Leap year 2000-02-29 is valid')
assert(leapValid.dateOfBirth === '2000-02-29', 'Leap year DOB is 2000-02-29')

// Non-leap year: 1999-02-29 is INVALID
// 199022901123 -> invalid day for Feb 1999
const nonLeapInvalid = parseAndValidateCnp('1990229011230')
assert(nonLeapInvalid.isValid === false, 'Non-leap year 1999-02-29 is invalid')

// 4. Invalid Checksum
assert(parseAndValidateCnp('1940808011239').isValid === false, 'Wrong checksum is invalid')

// 5. Incomplete / Alphanumeric / Bad Length
assert(parseAndValidateCnp('1940808').isValid === false, 'Incomplete CNP is invalid')
assert(parseAndValidateCnp('19408080112314').isValid === false, '14 digits is invalid')
assert(parseAndValidateCnp('19408080112AB').isValid === false, 'Alphanumeric CNP is invalid')
assert(parseAndValidateCnp('').isValid === false, 'Empty CNP is invalid')
assert(parseAndValidateCnp(null).isValid === false, 'Null CNP is invalid')

// 6. Age Calculation
const age1994 = calculateAge('1994-08-08', new Date('2026-10-06'))
assert(age1994 === 32, `Age for 1994-08-08 in Oct 2026 is 32 (got ${age1994})`)

// 7. DOB Formatting
const formattedDob = formatDobDisplay('1994-08-08')
assert(formattedDob === '08 AUGUST 1994', `Formatted DOB is "08 AUGUST 1994" (got ${formattedDob})`)

console.log(`\nResults: ${passed} passed, ${failed} failed.`)
if (failed > 0) process.exit(1)
