/**
 * Canonical Romanian Mobile Phone Number & International Utilities
 *
 * CANONICAL ROMANIAN MOBILE FORMAT:
 * Exactly 10 digits starting with '07' -> '07xxxxxxxx'
 *
 * RULES:
 * 1. Trim whitespace
 * 2. Remove spaces, '-', '(', ')', '.', '/', etc.
 * 3. If starts with '+4007' or '004007' -> '07xxxxxxxx'
 * 4. If starts with '+40' or '0040' and followed by 7... (9 digits) -> '0' + 7... = '07xxxxxxxx'
 * 5. If starts with '40' and followed by 7... (9 digits) -> '0' + 7... = '07xxxxxxxx'
 * 6. If starts with 7 and total 9 digits -> '07xxxxxxxx'
 * 7. If starts with 07 and total 10 digits -> '07xxxxxxxx'
 * 8. If Romanian landline (starts with +402, +403, 402, 403, 02, 03) -> 10 digits starting with 02 or 03
 * 9. If international (not matching Romanian mobile/landline): preserve international digits with leading +
 */

export function normalizePhone(raw?: string | null): string {
  if (!raw) return ''

  // 1. Trim
  let str = raw.trim()
  if (!str) return ''

  // 2. Clean non-digit and non-plus characters
  str = str.replace(/[^\d+]/g, '')
  if (!str) return ''

  // 3. Handle '0040' prefix -> '+40'
  if (str.startsWith('0040')) {
    str = '+40' + str.slice(4)
  }

  // 4. Handle '+400' prefix (e.g. +400767110439 -> 0767110439)
  if (str.startsWith('+400') && /^(\+400[237]\d{8})$/.test(str)) {
    return '0' + str.slice(4)
  }

  // 5. Romanian Mobile (+407xxxxxxxx -> 07xxxxxxxx)
  if (/^\+407\d{8}$/.test(str)) {
    return '0' + str.slice(3)
  }

  // 6. Romanian Mobile (407xxxxxxxx -> 07xxxxxxxx)
  if (/^407\d{8}$/.test(str)) {
    return '0' + str.slice(2)
  }

  // 7. Romanian Mobile (7xxxxxxxx - 9 digits -> 07xxxxxxxx)
  if (/^7\d{8}$/.test(str)) {
    return '0' + str
  }

  // 8. Romanian Mobile (07xxxxxxxx - 10 digits)
  if (/^07\d{8}$/.test(str)) {
    return str
  }

  // 9. Romanian Landlines (+40[23]xxxxxxxx or 40[23]xxxxxxxx or [23]xxxxxxxx or 0[23]xxxxxxxx)
  if (/^\+40[23]\d{8}$/.test(str)) {
    return '0' + str.slice(3)
  }
  if (/^40[23]\d{8}$/.test(str)) {
    return '0' + str.slice(2)
  }
  if (/^[23]\d{8}$/.test(str)) {
    return '0' + str
  }
  if (/^0[23]\d{8}$/.test(str)) {
    return str
  }

  // 10. Foreign / International Numbers: keep original or formatted digits with +
  return str
}

/**
 * Validates if the phone number is a valid canonical Romanian mobile number
 */
export function isValidRomanianPhone(phone?: string | null): boolean {
  if (!phone) return false
  const canonical = normalizePhone(phone)
  return /^07\d{8}$/.test(canonical)
}

/**
 * Generates the tel: URL for click-to-call actions
 * For Romanian numbers: tel:07xxxxxxxx (starts with 07, NEVER +40 or 40)
 * For international numbers: tel:<number>
 */
export function getTelUrl(phone?: string | null): string {
  if (!phone) return ''
  const canonical = normalizePhone(phone)
  if (!canonical) return ''
  return `tel:${canonical}`
}

/**
 * Generates the WhatsApp wa.me URL
 * WhatsApp wa.me requires digits only in international format WITHOUT '+'
 * For Romanian canonical 07xxxxxxxx -> wa.me/407xxxxxxxx
 * For international numbers -> wa.me/<digits_without_plus>
 */
export function getWhatsAppUrl(phone?: string | null, text?: string): string {
  if (!phone) return ''
  const canonical = normalizePhone(phone)
  if (!canonical) return ''

  let waNumber = ''
  // Romanian mobile (07xxxxxxxx -> 407xxxxxxxx)
  if (/^07\d{8}$/.test(canonical)) {
    waNumber = '40' + canonical.slice(1)
  } else if (/^0[23]\d{8}$/.test(canonical)) {
    waNumber = '40' + canonical.slice(1)
  } else {
    // International: strip '+' and non-digits
    waNumber = canonical.replace(/\D/g, '')
  }

  if (!waNumber) return ''
  const base = `https://wa.me/${waNumber}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/**
 * Formats a phone number for display in the UI
 * Canonical Romanian numbers are always displayed as 07xxxxxxxx (10 digits)
 */
export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return ''
  const canonical = normalizePhone(phone)
  return canonical || phone.trim()
}

/**
 * Generates common query variants of a phone number to search in SQL or DB
 */
export function getPhoneVariants(phone?: string | null): string[] {
  if (!phone) return []
  const norm = normalizePhone(phone)
  const variants = new Set<string>()

  if (phone.trim()) variants.add(phone.trim())
  if (norm) {
    variants.add(norm)
    // Digits only
    const digitsOnly = norm.replace(/\D/g, '')
    variants.add(digitsOnly)

    // If canonical Romanian 07xxxxxxxx
    if (/^07\d{8}$/.test(norm)) {
      variants.add('+40' + norm.slice(1)) // +407xxxxxxxx
      variants.add('40' + norm.slice(1))  // 407xxxxxxxx
      variants.add(norm.slice(1))         // 7xxxxxxxx
      // Formatted with spaces: 07xx xxx xxx
      variants.add(`${norm.slice(0, 4)} ${norm.slice(4, 7)} ${norm.slice(7)}`)
      variants.add(`${norm.slice(0, 4)}-${norm.slice(4, 7)}-${norm.slice(7)}`)
      // +40 7xx xxx xxx
      variants.add(`+40 ${norm.slice(1, 4)} ${norm.slice(4, 7)} ${norm.slice(7)}`)
      variants.add(`40 ${norm.slice(1, 4)} ${norm.slice(4, 7)} ${norm.slice(7)}`)
    } else if (norm.startsWith('+40') && norm.length === 12) {
      const national = '0' + norm.slice(3)
      variants.add(national)
      variants.add('40' + norm.slice(3))
    }
  }

  return Array.from(variants).filter(Boolean)
}

/**
 * Checks if two phone strings represent the same phone number
 */
export function arePhonesMatching(p1?: string | null, p2?: string | null): boolean {
  if (!p1 || !p2) return false
  const n1 = normalizePhone(p1)
  const n2 = normalizePhone(p2)
  if (!n1 || !n2) return false
  if (n1 === n2) return true

  // Canonical Romanian comparison
  const d1 = n1.replace(/\D/g, '')
  const d2 = n2.replace(/\D/g, '')
  if (d1 === d2) return true

  // Check last 9 digits (national number without leading 0 / country code 40)
  if (d1.length >= 9 && d2.length >= 9) {
    return d1.slice(-9) === d2.slice(-9)
  }
  return false
}

/**
 * Normalizes email address for comparison
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return ''
  return email.trim().toLowerCase()
}

/**
 * Sanitizes input string against CSV / Spreadsheet formula injection (=, +, -, @, tab, newline)
 */
export function sanitizeSpreadsheetValue(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (trimmed.startsWith('=') || trimmed.startsWith('+') || trimmed.startsWith('-') || trimmed.startsWith('@')) {
    return `'` + trimmed
  }
  return trimmed
}
