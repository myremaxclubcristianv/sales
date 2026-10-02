import { TrackEventPayload } from './types'

interface CooldownEntry {
  lastNotifiedAt: number
  notificationCount: number
}

// In-memory cooldown & deduplication cache
const eventCooldownMap = new Map<string, CooldownEntry>()
const sessionNotificationCountMap = new Map<string, number>()

// Garbage collection cleanup interval (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  // Clean entries older than 1 hour
  for (const [key, entry] of eventCooldownMap.entries()) {
    if (now - entry.lastNotifiedAt > 3600000) {
      eventCooldownMap.delete(key)
    }
  }
  for (const [key] of sessionNotificationCountMap.entries()) {
    // Purge old sessions
    if (sessionNotificationCountMap.size > 5000) {
      sessionNotificationCountMap.delete(key)
    }
  }
}, 600000)

/**
 * Evaluates whether an event should trigger an immediate Telegram notification.
 */
export function shouldSendTelegramNotification(payload: TrackEventPayload): {
  shouldSend: boolean
  reason: string
} {
  const { eventType, visitorId, sessionId, isNewVisitor, isNewSession } = payload
  const now = Date.now()

  // 1. Never send Telegram for standard page views (anti-spam requirement: Section 4 & 16)
  if (eventType === 'PAGE_VIEW') {
    return { shouldSend: false, reason: 'Standard page view ignored for Telegram anti-spam' }
  }

  // 2. High-priority Lead & Form submissions are always dispatched
  if (eventType === 'LEAD_CREATED' || eventType === 'CONTACT_REQUEST' || eventType === 'VIEWING_REQUEST') {
    return { shouldSend: true, reason: 'High-priority lead conversion' }
  }

  // 3. Check Session Telegram limit (Max 5 notifications per session lifetime to prevent spam)
  const sessionCount = sessionNotificationCountMap.get(sessionId) || 0
  if (sessionCount >= 6) {
    return { shouldSend: false, reason: 'Session notification limit reached' }
  }

  // 4. New Visitor Event
  if (eventType === 'NEW_VISITOR' || isNewVisitor) {
    const key = `new_visitor:${visitorId}`
    if (eventCooldownMap.has(key)) {
      return { shouldSend: false, reason: 'New visitor notification already sent' }
    }
    eventCooldownMap.set(key, { lastNotifiedAt: now, notificationCount: 1 })
    sessionNotificationCountMap.set(sessionId, sessionCount + 1)
    return { shouldSend: true, reason: 'New visitor notification' }
  }

  // 5. Returning Visitor Event (Triggered at start of a returning session)
  if (eventType === 'RETURNING_VISITOR' || (isNewSession && !isNewVisitor)) {
    const key = `returning_session:${sessionId}`
    if (eventCooldownMap.has(key)) {
      return { shouldSend: false, reason: 'Returning visitor notification already sent for this session' }
    }
    eventCooldownMap.set(key, { lastNotifiedAt: now, notificationCount: 1 })
    sessionNotificationCountMap.set(sessionId, sessionCount + 1)
    return { shouldSend: true, reason: 'Returning visitor session start' }
  }

  // 6. High-Value Action Events (WhatsApp, Phone, Email, CTA, Property View)
  const actionKey = `${sessionId}:${eventType}:${payload.metadata?.propertySlug || payload.metadata?.target || payload.pagePath}`
  const existing = eventCooldownMap.get(actionKey)

  // 60-second cooldown for identical action on the same target
  if (existing && now - existing.lastNotifiedAt < 60000) {
    return { shouldSend: false, reason: 'Action throttled (cooldown active)' }
  }

  eventCooldownMap.set(actionKey, {
    lastNotifiedAt: now,
    notificationCount: (existing?.notificationCount || 0) + 1,
  })
  sessionNotificationCountMap.set(sessionId, sessionCount + 1)

  return { shouldSend: true, reason: `Action allowed: ${eventType}` }
}
