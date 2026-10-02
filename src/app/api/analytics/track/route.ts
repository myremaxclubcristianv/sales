import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { extractGeoFromHeaders } from '@/lib/visitor/detector'
import { shouldSendTelegramNotification } from '@/lib/visitor/anti-spam'
import {
  formatNewVisitorTelegramMessage,
  formatReturningVisitorTelegramMessage,
  formatVisitorActivityTelegramMessage,
} from '@/lib/visitor/telegram-formatter'
import { sendTelegramMessage } from '@/lib/telegram/telegram'
import { createAdminClient } from '@/lib/supabase/admin'
import { TrackEventPayload } from '@/lib/visitor/types'

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting: max 60 tracking requests per minute per IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rateLimit = checkRateLimit(clientIp, { limit: 60, windowMs: 60000 })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = (await request.json().catch(() => ({}))) as Partial<TrackEventPayload>
    const { visitorId, sessionId, eventType, pagePath, trafficSource, device } = body

    if (!visitorId || !sessionId || !eventType || !pagePath || !trafficSource || !device) {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    // 2. Extract Server-Side Geo Headers
    const geo = extractGeoFromHeaders(request.headers)
    const fullPayload: TrackEventPayload = {
      visitorId,
      sessionId,
      isNewVisitor: Boolean(body.isNewVisitor),
      isNewSession: Boolean(body.isNewSession),
      eventType,
      eventName: body.eventName,
      pagePath,
      pageTitle: body.pageTitle,
      previousPath: body.previousPath,
      trafficSource,
      device,
      geo,
      pageJourney: body.pageJourney || [],
      activeDurationSeconds: body.activeDurationSeconds || 0,
      pageCount: body.pageCount || 1,
      metadata: body.metadata || {},
    }

    // 3. Database Persistence (Non-blocking, isolated)
    try {
      const supabase = createAdminClient()

      // Attempt to upsert session into visitor_sessions if table exists
      await supabase.from('visitor_sessions').upsert(
        {
          visitor_id: visitorId,
          session_id: sessionId,
          landing_page: fullPayload.pageJourney?.[0]?.path || pagePath,
          current_page: pagePath,
          page_count: fullPayload.pageCount || 1,
          active_duration_seconds: fullPayload.activeDurationSeconds || 0,
          referrer: trafficSource.referrer,
          source: trafficSource.source,
          medium: trafficSource.medium,
          campaign: trafficSource.campaign,
          utm_term: trafficSource.term || null,
          utm_content: trafficSource.content || null,
          device_type: device.deviceType,
          os: device.os,
          browser: device.browser,
          screen_resolution: device.screenWidth && device.screenHeight ? `${device.screenWidth}x${device.screenHeight}` : null,
          country: geo.country || null,
          city: geo.city || null,
          region: geo.region || null,
          language: device.language || null,
          timezone: device.timezone || null,
          page_journey: fullPayload.pageJourney || [],
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )

      // Attempt to insert event into visitor_events if table exists
      await supabase.from('visitor_events').insert({
        session_id: sessionId,
        visitor_id: visitorId,
        event_type: eventType,
        event_name: body.eventName || eventType,
        page_path: pagePath,
        page_title: body.pageTitle || null,
        previous_path: body.previousPath || null,
        metadata: body.metadata || {},
      })
    } catch {
      // Database write errors are safely ignored to protect analytics continuity
    }

    // 4. Anti-Spam Evaluation & Telegram Notification
    const { shouldSend, reason } = shouldSendTelegramNotification(fullPayload)

    if (shouldSend) {
      let telegramMessage = ''

      if (eventType === 'NEW_VISITOR' || fullPayload.isNewVisitor) {
        telegramMessage = formatNewVisitorTelegramMessage(fullPayload)
      } else if (eventType === 'RETURNING_VISITOR' || (fullPayload.isNewSession && !fullPayload.isNewVisitor)) {
        telegramMessage = formatReturningVisitorTelegramMessage(fullPayload)
      } else {
        telegramMessage = formatVisitorActivityTelegramMessage(fullPayload)
      }

      if (telegramMessage) {
        // Send asynchronously without blocking API response
        sendTelegramMessage(telegramMessage, {
          parseMode: 'HTML',
          disableWebPagePreview: true,
          timeoutMs: 5000,
        }).catch((err) => {
          console.warn('[Visitor Intelligence Telegram] Safe delivery failure:', err)
        })
      }
    }

    return NextResponse.json({
      success: true,
      visitorId,
      sessionId,
      notified: shouldSend,
      reason,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown tracking error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
