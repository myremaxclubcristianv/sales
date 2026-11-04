/**
 * Utilities for accurate Romanian (Europe/Bucharest) calendar date, time, and timezone conversions.
 * Properly accounts for EET (UTC+2 in winter) and EEST (UTC+3 in summer) including DST transition days.
 */

/**
 * Validates whether a date string is in YYYY-MM-DD format AND represents a real calendar date.
 * Rejects nonexistent dates such as 2026-02-30 or 2026-04-31.
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(dateStr.trim())
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const d = new Date(Date.UTC(year, month - 1, day))
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  )
}

/**
 * Validates whether a time string is in valid HH:mm format (00:00 - 23:59).
 */
export function isValidTimeString(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr.trim())
}

/**
 * Converts a wall-clock date (YYYY-MM-DD) and time (HH:mm) in Europe/Bucharest timezone
 * to an exact UTC ISO string for PostgreSQL TIMESTAMP WITH TIME ZONE storage.
 * Automatically resolves EET (UTC+2) vs EEST (UTC+3) based on the exact calendar day and hour.
 */
export function bucharestToUtcIso(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.trim()
  const cleanTime = timeStr.trim()

  const [year, month, day] = cleanDate.split('-').map(Number)
  const [hour, minute] = cleanTime.split(':').map(Number)

  // 1. Initial UTC guess
  let guessTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0)

  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // 2. Refine guess to match exact Bucharest wall-clock time
  for (let i = 0; i < 3; i++) {
    const formatted = dtf.format(new Date(guessTime)) // e.g. "2026-11-10, 16:30:00"
    const [dPart, tPart] = formatted.split(/[,\s]+/)
    const [fy, fm, fd] = dPart.split('-').map(Number)
    const [fh, fmin, fs] = (tPart || '00:00:00').split(':').map(Number)

    const formattedBucharestTime = Date.UTC(fy, fm - 1, fd, fh === 24 ? 0 : fh, fmin, fs || 0, 0)
    const targetBucharestTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0)

    const diff = targetBucharestTime - formattedBucharestTime
    if (diff === 0) break
    guessTime += diff
  }

  return new Date(guessTime).toISOString()
}

/**
 * Converts a UTC timestamp / Date object to Europe/Bucharest wall-clock date (YYYY-MM-DD) and time (HH:mm).
 */
export function utcToBucharestParts(isoOrDate: string | Date): { date: string; time: string } {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (isNaN(d.getTime())) {
    return { date: '', time: '' }
  }

  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const formatted = dtf.format(d) // e.g. "2026-11-10, 14:30"
  const parts = formatted.split(/[,\s]+/)
  const date = parts[0] || ''
  let time = parts[1] || ''
  if (time === '24:00') time = '00:00'

  return { date, time }
}
