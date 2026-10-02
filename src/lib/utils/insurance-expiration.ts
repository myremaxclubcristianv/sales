/**
 * Insurance Expiration and Calculation Utilities
 * Sales CRM — Production-Grade Insurance Engine
 */

export type PolicyExpirationUrgency = 
  | 'EXPIRED'
  | 'EXPIRING_TODAY_OR_URGENT'
  | 'EXPIRING_7_DAYS'
  | 'EXPIRING_14_DAYS'
  | 'EXPIRING_30_DAYS'
  | 'ACTIVE'

export interface ExpirationCalculation {
  daysRemaining: number
  urgency: PolicyExpirationUrgency
  label: string
  badgeColor: string
  isExpired: boolean
  isUrgent: boolean
}

/**
 * Calculates remaining days and urgency bracket dynamically from expiry_date
 * Standardized across all CRM insurance views
 */
export function calculateExpiration(expiryDateStr: string | Date | null | undefined): ExpirationCalculation {
  if (!expiryDateStr) {
    return {
      daysRemaining: 0,
      urgency: 'EXPIRED',
      label: 'Nedefinit',
      badgeColor: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
      isExpired: true,
      isUrgent: false,
    }
  }

  const expiry = new Date(expiryDateStr)
  // Set to midnight UTC for pure calendar day delta
  const today = new Date()
  const todayMidnight = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const expiryMidnight = new Date(Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()))

  const diffMs = expiryMidnight.getTime() - todayMidnight.getTime()
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) {
    return {
      daysRemaining,
      urgency: 'EXPIRED',
      label: `Expirată (${Math.abs(daysRemaining)} zile)`,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
      isExpired: true,
      isUrgent: false,
    }
  }

  if (daysRemaining <= 3) {
    return {
      daysRemaining,
      urgency: 'EXPIRING_TODAY_OR_URGENT',
      label: daysRemaining === 0 ? 'Expiră AZI' : `Expiră în ${daysRemaining} ${daysRemaining === 1 ? 'zi' : 'zile'} (Urgent)`,
      badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900 animate-pulse',
      isExpired: false,
      isUrgent: true,
    }
  }

  if (daysRemaining <= 7) {
    return {
      daysRemaining,
      urgency: 'EXPIRING_7_DAYS',
      label: `Expiră în ${daysRemaining} zile`,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
      isExpired: false,
      isUrgent: true,
    }
  }

  if (daysRemaining <= 14) {
    return {
      daysRemaining,
      urgency: 'EXPIRING_14_DAYS',
      label: `Expiră în ${daysRemaining} zile`,
      badgeColor: 'bg-amber-50/70 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400',
      isExpired: false,
      isUrgent: false,
    }
  }

  if (daysRemaining <= 30) {
    return {
      daysRemaining,
      urgency: 'EXPIRING_30_DAYS',
      label: `Expiră în ${daysRemaining} zile`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
      isExpired: false,
      isUrgent: false,
    }
  }

  return {
    daysRemaining,
    urgency: 'ACTIVE',
    label: `${daysRemaining} zile rămase`,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    isExpired: false,
    isUrgent: false,
  }
}

/**
 * Mask CNP for privacy protection (e.g. ************* or 1910612******)
 */
export function maskCNP(cnp: string | null | undefined, revealCount = 0): string {
  if (!cnp) return '—'
  const clean = cnp.trim()
  if (revealCount <= 0) {
    return '•'.repeat(clean.length || 13)
  }
  if (clean.length <= revealCount) return clean
  return clean.slice(0, revealCount) + '•'.repeat(clean.length - revealCount)
}

/**
 * Canonical Romanian phone formatting (07xxxxxxxx or international)
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 9 && digits.startsWith('7')) {
    return '0' + digits
  }
  if (digits.length === 10 && digits.startsWith('07')) {
    return digits
  }
  if (digits.length === 11 && digits.startsWith('407')) {
    return '0' + digits.slice(2)
  }
  return digits || raw.trim()
}
