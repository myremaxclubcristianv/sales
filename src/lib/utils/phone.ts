/**
 * Phone number normalization, variant generation, and duplicate matching utilities.
 */

export function normalizePhone(raw?: string | null): string {
  if (!raw) return ''
  
  // Strip whitespace, hyphens, dots, brackets, slashes
  let cleaned = raw.replace(/[^\d+]/g, '').trim()
  if (!cleaned) return ''

  // Convert 0040... -> +40...
  if (cleaned.startsWith('0040')) {
    cleaned = '+40' + cleaned.slice(4)
  }

  // Handle Romanian numbers
  // +4007... -> +407...
  if (cleaned.startsWith('+400')) {
    cleaned = '+40' + cleaned.slice(4)
  }

  // 07xxxxxxxx (10 digits) -> +407xxxxxxxx
  if (/^0[237]\d{8}$/.test(cleaned)) {
    cleaned = '+40' + cleaned.slice(1)
  }

  // 7xxxxxxxx (9 digits) -> +407xxxxxxxx
  if (/^[237]\d{8}$/.test(cleaned)) {
    cleaned = '+40' + cleaned
  }

  // 407xxxxxxxx (11 digits without +) -> +407xxxxxxxx
  if (/^40[237]\d{8}$/.test(cleaned)) {
    cleaned = '+' + cleaned
  }

  return cleaned
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
    
    // If Romanian +40...
    if (norm.startsWith('+40') && norm.length === 12) {
      const national = '0' + norm.slice(3) // 07xxxxxxxx
      variants.add(national)
      variants.add(norm.slice(3)) // 7xxxxxxxx
      // Formatted with spaces: 07xx xxx xxx
      if (national.length === 10) {
        variants.add(`${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`)
        variants.add(`${national.slice(0, 4)}-${national.slice(4, 7)}-${national.slice(7)}`)
      }
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

  // Check last 9 digits if both are long enough
  const d1 = n1.replace(/\D/g, '')
  const d2 = n2.replace(/\D/g, '')
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
