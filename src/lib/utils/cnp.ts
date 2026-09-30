/**
 * CNP (Cod Numeric Personal) Utilities & Validation for Romanian Identity Numbers
 *
 * Rules:
 * - Exactly 13 numeric digits
 * - Optional in Quick Client
 * - Server & Client side validation
 * - Formatting spaces are normalized
 * - Masking helper for secure display
 */

/**
 * Normalizes CNP input by removing all whitespace and non-digit characters.
 */
export function normalizeCnp(raw?: string | null): string {
  if (!raw) return ''
  return raw.trim().replace(/\D/g, '')
}

/**
 * Validates whether a provided CNP string is valid (exactly 13 numeric digits).
 * Returns true if valid, false otherwise.
 */
export function isValidCnp(raw?: string | null): boolean {
  if (!raw) return false
  // Check if raw contains non-digits/non-spaces
  if (/[^\d\s]/.test(raw)) return false
  const normalized = normalizeCnp(raw)
  return /^\d{13}$/.test(normalized)
}

/**
 * Comprehensive CNP validator returning validation status, normalized value, and localized error.
 */
export function validateCnp(
  raw?: string | null,
  isOptional: boolean = true
): { isValid: boolean; normalized: string | null; error?: string } {
  if (!raw || !raw.trim()) {
    if (isOptional) {
      return { isValid: true, normalized: null }
    }
    return { isValid: false, normalized: null, error: 'CNP-ul este obligatoriu.' }
  }

  // Check if invalid characters (like letters or symbols) are present
  if (/[^\d\s]/.test(raw)) {
    return {
      isValid: false,
      normalized: normalizeCnp(raw),
      error: 'CNP-ul trebuie să conțină exact 13 cifre.',
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

  return { isValid: true, normalized }
}

/**
 * Masks a CNP string for secure display in the UI.
 * Returns 13 bullet characters (•••••••••••••) or dash if empty.
 */
export function maskCnp(cnp?: string | null): string {
  if (!cnp || !cnp.trim()) return '—'
  return '•••••••••••••'
}
