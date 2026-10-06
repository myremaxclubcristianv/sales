/**
 * CNP (Cod Numeric Personal) Utilities & Validation for Romanian Identity Numbers
 *
 * Rules:
 * - Exactly 13 numeric digits: S YY MM DD JJ NNN C
 * - Structure:
 *   - S: Sex and Century
 *     1 = M born 1900-1999, 2 = F born 1900-1999
 *     3 = M born 1800-1899, 4 = F born 1800-1899
 *     5 = M born 2000-2099, 6 = F born 2000-2099
 *     7 = M foreign resident (1900-1999), 8 = F foreign resident (1900-1999)
 *     9 = Foreign citizen (1900-1999)
 *   - YY: Year (00-99)
 *   - MM: Month (01-12)
 *   - DD: Day (01-31, valid for given month/year including leap years)
 *   - JJ: County code (01-52)
 *   - NNN: Sequential order number (001-999)
 *   - C: Checksum / Control digit
 * - Control key weights: 2 7 9 1 4 6 3 5 8 2 7 9
 * - Zero guessing: only derive DOB if CNP is strictly valid!
 */

const CNP_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]

/**
 * Normalizes CNP input by removing all whitespace and non-digit characters.
 */
export function normalizeCnp(raw?: string | null): string {
  if (!raw) return ''
  return raw.trim().replace(/\D/g, '')
}

export interface CnpValidationResult {
  isValid: boolean
  normalized: string | null
  error?: string
  dateOfBirth?: string // YYYY-MM-DD
  sex?: 'M' | 'F'
  age?: number
  year?: number
  month?: number
  day?: number
}

/**
 * Validates Romanian CNP strictly against format, dates, and control checksum.
 */
export function parseAndValidateCnp(raw?: string | null): CnpValidationResult {
  if (!raw || !raw.trim()) {
    return { isValid: false, normalized: null, error: 'CNP lipsă.' }
  }

  // Check if invalid characters (non-digits/non-spaces) are present
  if (/[^\d\s]/.test(raw)) {
    return {
      isValid: false,
      normalized: normalizeCnp(raw),
      error: 'CNP-ul trebuie să conțină exact 13 cifre numerice.',
    }
  }

  const normalized = normalizeCnp(raw)
  if (normalized.length !== 13 || !/^\d{13}$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: 'CNP-ul trebuie să conțină exact 13 cifre.',
    }
  }

  const digits = normalized.split('').map(Number)
  const s = digits[0]
  if (s < 1 || s > 9) {
    return {
      isValid: false,
      normalized,
      error: 'Prima cifră a CNP-ului (S) este invalidă.',
    }
  }

  // Determine Century prefix
  let century = 1900
  if (s === 1 || s === 2) {
    century = 1900
  } else if (s === 3 || s === 4) {
    century = 1800
  } else if (s === 5 || s === 6) {
    century = 2000
  } else if (s === 7 || s === 8 || s === 9) {
    century = 1900
  }

  const year = century + digits[1] * 10 + digits[2]
  const month = digits[3] * 10 + digits[4]
  const day = digits[5] * 10 + digits[6]

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      normalized,
      error: `Luna (${month}) este invalidă în CNP.`,
    }
  }

  // Check valid days in month considering leap years
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) {
    return {
      isValid: false,
      normalized,
      error: `Ziua (${day}) este invalidă pentru anul ${year}, luna ${month}.`,
    }
  }

  // Checksum calculation: sum(digit[i] * weight[i]) % 11
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * CNP_WEIGHTS[i]
  }
  const remainder = sum % 11
  const control = remainder === 10 ? 1 : remainder

  if (control !== digits[12]) {
    return {
      isValid: false,
      normalized,
      error: 'Cifra de control (checksum) a CNP-ului este invalidă.',
    }
  }

  const mmStr = String(month).padStart(2, '0')
  const ddStr = String(day).padStart(2, '0')
  const dateOfBirth = `${year}-${mmStr}-${ddStr}`
  const sex: 'M' | 'F' = s % 2 === 1 ? 'M' : 'F'
  const age = calculateAge(dateOfBirth)

  return {
    isValid: true,
    normalized,
    dateOfBirth,
    sex,
    age: age !== null ? age : undefined,
    year,
    month,
    day,
  }
}

/**
 * Validates whether a provided CNP string is valid.
 * Returns true if valid, false otherwise.
 */
export function isValidCnp(raw?: string | null): boolean {
  if (!raw) return false
  return parseAndValidateCnp(raw).isValid
}

/**
 * Derives Date of Birth (YYYY-MM-DD) from a valid CNP.
 * Returns null if CNP is invalid or missing.
 */
export function deriveDobFromCnp(raw?: string | null): string | null {
  const result = parseAndValidateCnp(raw)
  if (!result.isValid || !result.dateOfBirth) return null
  return result.dateOfBirth
}

/**
 * Comprehensive CNP validator returning validation status, normalized value, and localized error.
 */
export function validateCnp(
  raw?: string | null,
  isOptional: boolean = true
): { isValid: boolean; normalized: string | null; error?: string; dateOfBirth?: string } {
  if (!raw || !raw.trim()) {
    if (isOptional) {
      return { isValid: true, normalized: null }
    }
    return { isValid: false, normalized: null, error: 'CNP-ul este obligatoriu.' }
  }

  const result = parseAndValidateCnp(raw)
  if (!result.isValid) {
    return {
      isValid: false,
      normalized: result.normalized,
      error: result.error || 'CNP invalid.',
    }
  }

  return {
    isValid: true,
    normalized: result.normalized,
    dateOfBirth: result.dateOfBirth,
  }
}

/**
 * Calculates current age in years from date of birth (YYYY-MM-DD) or Date object.
 * Can calculate age as of an optional reference date (e.g. for calendar occurrences in future/past years).
 */
export function calculateAge(dob?: string | Date | null, referenceDate: Date = new Date()): number | null {
  if (!dob) return null
  const birth = typeof dob === 'string' ? new Date(dob) : dob
  if (isNaN(birth.getTime())) return null

  let age = referenceDate.getFullYear() - birth.getFullYear()
  const m = referenceDate.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : 0
}

/**
 * Formats a date of birth for clean UI display (e.g. "08 AUGUST 1994" or "08 Aug 1994").
 */
export function formatDobDisplay(dob?: string | Date | null, uppercase: boolean = true): string {
  if (!dob) return '—'
  const birth = typeof dob === 'string' ? new Date(dob) : dob
  if (isNaN(birth.getTime())) return '—'

  const monthsRo = [
    'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
    'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
  ]

  const day = String(birth.getDate()).padStart(2, '0')
  const month = monthsRo[birth.getMonth()]
  const year = birth.getFullYear()

  const formatted = `${day} ${month} ${year}`
  return uppercase ? formatted.toUpperCase() : formatted
}

/**
 * Masks a CNP string for secure display in the UI.
 * Returns 13 bullet characters (•••••••••••••) or dash if empty.
 */
export function maskCnp(cnp?: string | null): string {
  if (!cnp || !cnp.trim()) return '—'
  return '•••••••••••••'
}

/**
 * Extracts calendar date parts in Europe/Bucharest timezone.
 * Guarantees Romanian EET/EEST timezone accuracy regardless of server/client local timezone.
 */
export function getBucharestDateParts(d: Date = new Date()): {
  year: number
  month: number
  day: number
  dateStr: string // YYYY-MM-DD
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const dateStr = formatter.format(d)
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  return {
    year: Number(yearStr),
    month: Number(monthStr),
    day: Number(dayStr),
    dateStr,
  }
}

export interface BirthdayCountdownInfo {
  hasDob: boolean
  daysUntil: number
  isToday: boolean
  isTomorrow: boolean
  isUpcoming: boolean
  currentAge: number | null
  turningAge: number | null
  nextBirthdayDateStr: string
  formattedDayMonth: string
  formattedFullDob: string
  statusTextRo: string
}

/**
 * Computes dynamic Romanian birthday countdown info and turning age.
 */
export function getBirthdayCountdownInfo(
  dob?: string | Date | null,
  referenceDate: Date = new Date()
): BirthdayCountdownInfo {
  if (!dob) {
    return {
      hasDob: false,
      daysUntil: -1,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      currentAge: null,
      turningAge: null,
      nextBirthdayDateStr: '',
      formattedDayMonth: '—',
      formattedFullDob: '—',
      statusTextRo: 'Dată naștere indisponibilă',
    }
  }

  const birthDate = typeof dob === 'string' ? new Date(dob) : dob
  if (isNaN(birthDate.getTime())) {
    return {
      hasDob: false,
      daysUntil: -1,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      currentAge: null,
      turningAge: null,
      nextBirthdayDateStr: '',
      formattedDayMonth: '—',
      formattedFullDob: '—',
      statusTextRo: 'Dată naștere invalidă',
    }
  }

  // Use Bucharest timezone for both today and birthday calculation
  const todayParts = getBucharestDateParts(referenceDate)
  const bMonth = birthDate.getMonth() + 1
  const bDay = birthDate.getDate()
  const bYear = birthDate.getFullYear()

  const monthsRo = [
    'IANUARIE', 'FEBRUARIE', 'MARTIE', 'APRILIE', 'MAI', 'IUNIE',
    'IULIE', 'AUGUST', 'SEPTEMBRIE', 'OCTOMBRIE', 'NOIEMBRIE', 'DECEMBRIE',
  ]
  const formattedDayMonth = `${String(bDay).padStart(2, '0')} ${monthsRo[bMonth - 1]}`
  const formattedFullDob = `${formattedDayMonth} ${bYear}`

  const currentAge = calculateAge(dob, referenceDate)

  // Compare this year's birthday vs today's date in Bucharest
  const todayUtc = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day)
  let targetYear = todayParts.year
  let targetUtc = Date.UTC(targetYear, bMonth - 1, bDay)

  let diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24))

  // If this year's birthday has already passed, compute for next year
  if (diffDays < 0) {
    targetYear = todayParts.year + 1
    targetUtc = Date.UTC(targetYear, bMonth - 1, bDay)
    diffDays = Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24))
  }

  const isToday = diffDays === 0
  const isTomorrow = diffDays === 1
  const isUpcoming = diffDays > 0 && diffDays <= 7
  const turningAge = targetYear - bYear

  const mmStr = String(bMonth).padStart(2, '0')
  const ddStr = String(bDay).padStart(2, '0')
  const nextBirthdayDateStr = `${targetYear}-${mmStr}-${ddStr}`

  let statusTextRo = ''
  if (isToday) {
    statusTextRo = 'ASTĂZI — LA MULȚI ANI! 🎊'
  } else if (isTomorrow) {
    statusTextRo = 'MÂINE'
  } else if (isUpcoming) {
    statusTextRo = `ÎN ${diffDays} ZILE`
  } else {
    statusTextRo = `ÎN ${diffDays} ZILE`
  }

  return {
    hasDob: true,
    daysUntil: diffDays,
    isToday,
    isTomorrow,
    isUpcoming,
    currentAge,
    turningAge,
    nextBirthdayDateStr,
    formattedDayMonth,
    formattedFullDob,
    statusTextRo,
  }
}

/**
 * Returns a polite, professional Romanian birthday greeting message.
 */
export function getRomanianBirthdayWish(firstName?: string | null): string {
  const name = firstName?.trim() || 'dragă client'
  return `La mulți ani, ${name}! 🎊 Îți doresc multă sănătate, bucurii, împliniri și o zi cât mai frumoasă!`
}

