import { escapeTelegramHtml } from '../telegram/telegram'
import { EnrichedLeadPayload, TrackEventPayload } from './types'

function formatBucharestTime(dateStr?: string | null): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date()
    return new Intl.DateTimeFormat('ro-RO', {
      timeZone: 'Europe/Bucharest',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d)
  } catch {
    return new Date().toISOString()
  }
}

function formatDuration(seconds = 0): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

/**
 * Section 9: Formats Telegram notification for a NEW VISITOR.
 */
export function formatNewVisitorTelegramMessage(data: TrackEventPayload): string {
  const timestamp = formatBucharestTime(typeof data.metadata?.timestamp === 'string' ? data.metadata.timestamp : undefined)
  const lines: string[] = [
    '🌐 <b>NEW VISITOR — CRISTIAN VĂDUVA</b>',
    '',
    `🕐 ${timestamp}`,
    '',
    '📍 <b>Location:</b>',
    `Country: ${escapeTelegramHtml(data.geo?.country || 'Unknown')}`,
    `City: ${escapeTelegramHtml(data.geo?.city || 'Unknown')}`,
    `Region: ${escapeTelegramHtml(data.geo?.region || 'Unknown')}`,
    '',
    '🔗 <b>Source:</b>',
    `Source: ${escapeTelegramHtml(data.trafficSource.source)}`,
    `Medium: ${escapeTelegramHtml(data.trafficSource.medium)}`,
    `Campaign: ${escapeTelegramHtml(data.trafficSource.campaign)}`,
    `Referrer: ${escapeTelegramHtml(data.trafficSource.referrer)}`,
  ]

  if (data.trafficSource.term) {
    lines.push(`Term: ${escapeTelegramHtml(data.trafficSource.term)}`)
  }

  lines.push(
    '',
    '📄 <b>Landing page:</b>',
    escapeTelegramHtml(data.pagePath || '/'),
    '',
    '💻 <b>Device:</b>',
    `Device: ${escapeTelegramHtml(data.device.deviceType)}`,
    `OS: ${escapeTelegramHtml(data.device.os)}`,
    `Browser: ${escapeTelegramHtml(data.device.browser)}`,
    `Screen: ${data.device.screenWidth && data.device.screenHeight ? `${data.device.screenWidth}x${data.device.screenHeight}` : 'Unknown'}`
  )

  lines.push(
    '',
    '🌍 <b>Language:</b> ' + escapeTelegramHtml(data.device.language || 'Unknown'),
    'Timezone: ' + escapeTelegramHtml(data.device.timezone || 'Unknown'),
    '',
    `🆔 <b>Visitor:</b> <code>${escapeTelegramHtml(data.visitorId)}</code>`,
    `🆔 <b>Session:</b> <code>${escapeTelegramHtml(data.sessionId)}</code>`
  )

  return lines.join('\n')
}

/**
 * Section 10: Formats Telegram notification for a RETURNING VISITOR.
 */
export function formatReturningVisitorTelegramMessage(data: TrackEventPayload): string {
  const timestamp = formatBucharestTime(typeof data.metadata?.timestamp === 'string' ? data.metadata.timestamp : undefined)
  const vHist = data.metadata?.visitorHistory as Record<string, unknown> | undefined
  const visits = typeof vHist?.visits === 'number' ? vHist.visits : 2
  const prevVisit = typeof vHist?.previousVisitAt === 'string'
    ? formatBucharestTime(vHist.previousVisitAt)
    : 'Recent'
  const histPages = typeof vHist?.pagesViewedHistorically === 'number' ? vHist.pagesViewedHistorically : 1

  const lines: string[] = [
    '🔄 <b>RETURNING VISITOR — CRISTIAN VĂDUVA</b>',
    '',
    `🕐 ${timestamp}`,
    '',
    `🆔 <b>Visitor:</b> <code>${escapeTelegramHtml(data.visitorId)}</code>`,
    '',
    '📊 <b>History:</b>',
    `Visits: ${visits}`,
    `Previous visit: ${prevVisit}`,
    `Pages viewed historically: ${histPages}`,
    '',
    '📍 <b>Current source:</b>',
    escapeTelegramHtml(data.trafficSource.source),
    '',
    '📄 <b>Current page:</b>',
    escapeTelegramHtml(data.pagePath || '/'),
    '',
    '💻 <b>Device:</b>',
    `${escapeTelegramHtml(data.device.deviceType)} / ${escapeTelegramHtml(data.device.os)} / ${escapeTelegramHtml(data.device.browser)}`,
    '',
    '🔥 <b>Current session:</b>',
    `Pages: ${data.pageCount || 1}`,
    `Active time: ${formatDuration(data.activeDurationSeconds || 0)}`
  ]

  return lines.join('\n')
}

/**
 * Section 11: Formats Telegram notification for an IMPORTANT VISITOR ACTIVITY.
 */
export function formatVisitorActivityTelegramMessage(data: TrackEventPayload): string {
  const timestamp = formatBucharestTime(typeof data.metadata?.timestamp === 'string' ? data.metadata.timestamp : undefined)
  const actionLabel = data.eventName || data.eventType.replace(/_/g, ' ')

  const lines: string[] = [
    '⚡ <b>VISITOR ACTIVITY — CRISTIAN VĂDUVA</b>',
    '',
    `🕐 ${timestamp}`,
    '',
    `Visitor: <code>${escapeTelegramHtml(data.visitorId)}</code>`,
    `Session: <code>${escapeTelegramHtml(data.sessionId)}</code>`,
    '',
    `👁 <b>Action:</b> ${escapeTelegramHtml(actionLabel)}`
  ]

  if (typeof data.metadata?.propertyTitle === 'string') {
    lines.push(`🏠 <b>Property:</b> ${escapeTelegramHtml(data.metadata.propertyTitle)}`)
  }

  if (typeof data.metadata?.target === 'string') {
    lines.push(`🎯 <b>Target:</b> ${escapeTelegramHtml(data.metadata.target)}`)
  }

  lines.push(
    '',
    `📄 <b>Page:</b> ${escapeTelegramHtml(data.pagePath)}`
  )

  if (data.previousPath) {
    lines.push(`🔗 <b>Previous page:</b> ${escapeTelegramHtml(data.previousPath)}`)
  }

  lines.push(
    `📍 <b>Source:</b> ${escapeTelegramHtml(data.trafficSource.source)}`,
    `💻 <b>Device:</b> ${escapeTelegramHtml(data.device.deviceType)} (${escapeTelegramHtml(data.device.os)} / ${escapeTelegramHtml(data.device.browser)})`
  )

  return lines.join('\n')
}

/**
 * Section 12: Formats Telegram notification for a NEW LEAD with Visitor Journey correlation.
 */
export function formatVisitorLeadTelegramMessage(lead: EnrichedLeadPayload): string {
  const timestamp = formatBucharestTime(lead.createdAt)
  const safeName = escapeTelegramHtml(lead.name.trim())
  const safePhone = lead.phone ? escapeTelegramHtml(lead.phone.trim()) : null
  const safeEmail = lead.email ? escapeTelegramHtml(lead.email.trim()) : null
  const safeMessage = lead.message ? escapeTelegramHtml(lead.message.trim().slice(0, 500)) : null

  const lines: string[] = [
    '🔥 <b>NEW LEAD — CRISTIAN VĂDUVA</b>',
    '',
    '👤 <b>Lead:</b>',
    `Name: ${safeName}`
  ]

  if (safePhone) lines.push(`Phone: ${safePhone}`)
  if (safeEmail) lines.push(`Email: ${safeEmail}`)
  if (safeMessage) lines.push(`Message:\n${safeMessage}`)

  if (lead.propertyTitle) {
    lines.push(`Property: ${escapeTelegramHtml(lead.propertyTitle)}`)
  }

  if (lead.requestTitle) {
    lines.push(`Request: ${escapeTelegramHtml(lead.requestTitle)}`)
  }

  lines.push(
    '',
    '📍 <b>Acquisition:</b>',
    `Source: ${escapeTelegramHtml(lead.trafficSource?.source || lead.source || 'Website')}`,
    `Medium: ${escapeTelegramHtml(lead.trafficSource?.medium || '(none)')}`,
    `Campaign: ${escapeTelegramHtml(lead.trafficSource?.campaign || '(none)')}`,
    `Referrer: ${escapeTelegramHtml(lead.trafficSource?.referrer || '(none)')}`
  )

  if (lead.visitorHistory) {
    lines.push(
      '',
      '📊 <b>Visitor history:</b>',
      `First visit: ${lead.visitorHistory.previousVisitAt ? formatBucharestTime(lead.visitorHistory.previousVisitAt) : timestamp}`,
      `Total visits: ${lead.visitorHistory.visits || 1}`,
      `Pages viewed: ${lead.visitorHistory.pagesViewedHistorically || 1}`,
      `Last visit: ${timestamp}`
    )
  }

  if (lead.pageJourney && lead.pageJourney.length > 0) {
    const journeySummary = lead.pageJourney.map(j => j.path).slice(-5).join(' ➔ ')
    lines.push(
      '',
      '🎯 <b>Journey:</b>',
      escapeTelegramHtml(journeySummary)
    )
  }

  if (lead.device) {
    lines.push(
      '',
      '💻 <b>Device:</b>',
      `${escapeTelegramHtml(lead.device.deviceType)} / ${escapeTelegramHtml(lead.device.os)} / ${escapeTelegramHtml(lead.device.browser)}`
    )
  }

  if (lead.sessionId) {
    lines.push(`🔗 <b>Session:</b> <code>${escapeTelegramHtml(lead.sessionId)}</code>`)
  }
  if (lead.visitorId) {
    lines.push(`🆔 <b>Visitor:</b> <code>${escapeTelegramHtml(lead.visitorId)}</code>`)
  }

  lines.push(`\n🔗 <b>CRM:</b> <a href="https://sales.cristianvaduva.com/admin/leads">sales.cristianvaduva.com/admin/leads</a>`)

  return lines.join('\n')
}
