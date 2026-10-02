'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { generateVisitorId, generateSessionId, parseTrafficSource, parseUserAgent } from '@/lib/visitor/detector'
import { DeviceDetails, PageJourneyStep, TrackEventPayload, TrafficSource, VisitorEventType, VisitorHistory } from '@/lib/visitor/types'

const VISITOR_ID_KEY = 'cv_visitor_id'
const VISIT_COUNT_KEY = 'cv_visit_count'
const LAST_VISIT_KEY = 'cv_last_visit_at'
const SESSION_ID_KEY = 'cv_session_id'
const SESSION_EXPIRY_KEY = 'cv_session_last_active'
const PAGE_JOURNEY_KEY = 'cv_page_journey'
const TRAFFIC_SOURCE_KEY = 'cv_traffic_source'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes rolling activity window

export default function VisitorTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)
  const isInitialMountRef = useRef<boolean>(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Resolve or Generate Visitor ID
    let visitorId = localStorage.getItem(VISITOR_ID_KEY)
    let isNewVisitor = false
    let visitCount = 1
    let previousVisitAt: string | null = null

    if (!visitorId) {
      visitorId = generateVisitorId()
      localStorage.setItem(VISITOR_ID_KEY, visitorId)
      localStorage.setItem(VISIT_COUNT_KEY, '1')
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
      isNewVisitor = true
    } else {
      visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '1', 10)
      previousVisitAt = localStorage.getItem(LAST_VISIT_KEY)
    }

    // 2. Resolve or Generate Session ID with 30-min Inactivity Expiration
    const now = Date.now()
    const lastSessionActive = parseInt(sessionStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10)
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
    let isNewSession = false

    if (!sessionId || now - lastSessionActive > SESSION_TIMEOUT_MS) {
      sessionId = generateSessionId()
      sessionStorage.setItem(SESSION_ID_KEY, sessionId)
      sessionStorage.setItem(PAGE_JOURNEY_KEY, '[]')
      isNewSession = true

      if (!isNewVisitor) {
        visitCount += 1
        localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString())
        localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
      }
    }

    sessionStorage.setItem(SESSION_EXPIRY_KEY, now.toString())

    // 3. Resolve Device Details
    const uaInfo = parseUserAgent(navigator.userAgent)
    const device: DeviceDetails = {
      deviceType: uaInfo.deviceType,
      os: uaInfo.os,
      browser: uaInfo.browser,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      language: navigator.language || 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Bucharest',
    }

    // 4. Resolve Traffic Source
    let trafficSource: TrafficSource
    if (isNewSession || !sessionStorage.getItem(TRAFFIC_SOURCE_KEY)) {
      trafficSource = parseTrafficSource(
        searchParams || new URLSearchParams(),
        document.referrer,
        window.location.hostname
      )
      sessionStorage.setItem(TRAFFIC_SOURCE_KEY, JSON.stringify(trafficSource))
    } else {
      try {
        trafficSource = JSON.parse(sessionStorage.getItem(TRAFFIC_SOURCE_KEY) || '{}')
      } catch {
        trafficSource = parseTrafficSource(
          searchParams || new URLSearchParams(),
          document.referrer,
          window.location.hostname
        )
      }
    }

    // 5. Update Page Journey
    let pageJourney: PageJourneyStep[] = []
    try {
      pageJourney = JSON.parse(sessionStorage.getItem(PAGE_JOURNEY_KEY) || '[]')
    } catch {
      pageJourney = []
    }

    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    pageJourney.push({
      path: currentPath,
      title: document.title,
      timestamp: new Date().toISOString(),
    })
    sessionStorage.setItem(PAGE_JOURNEY_KEY, JSON.stringify(pageJourney.slice(-20))) // Keep last 20 steps

    const visitorHistory: VisitorHistory = {
      visits: visitCount,
      previousVisitAt,
      pagesViewedHistorically: pageJourney.length,
    }

    // Expose on global window object for forms and lead capture integration
    if (typeof window !== 'undefined') {
      window.__CV_VISITOR_INTELLIGENCE__ = {
        visitorId,
        sessionId,
        trafficSource,
        device,
        visitorHistory,
        pageJourney,
      }
    }

    // Helper to send tracking events safely
    const sendTrack = (eventType: VisitorEventType, eventName?: string, metadata: Record<string, unknown> = {}) => {
      const payload: TrackEventPayload = {
        visitorId,
        sessionId,
        isNewVisitor,
        isNewSession,
        eventType,
        eventName: eventName || eventType,
        pagePath: currentPath,
        pageTitle: document.title,
        previousPath: previousPathRef.current || undefined,
        trafficSource,
        device,
        pageJourney,
        pageCount: pageJourney.length,
        metadata: {
          ...metadata,
          visitorHistory,
          timestamp: new Date().toISOString(),
        },
      }

      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // Safe ignore
      }
    }

    // 6. Handle Initial Navigation / Route Change Event
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      if (isNewVisitor) {
        sendTrack('NEW_VISITOR', 'New Visitor Entry')
      } else if (isNewSession) {
        sendTrack('RETURNING_VISITOR', 'Returning Visitor Session')
      } else {
        sendTrack('PAGE_VIEW', `Page View: ${currentPath}`)
      }
    } else {
      sendTrack('PAGE_VIEW', `Page View: ${currentPath}`)
    }

    // 7. Check if this is a Property detail page
    if (pathname.startsWith('/properties/') && pathname !== '/properties') {
      const propSlug = pathname.replace('/properties/', '')
      sendTrack('PROPERTY_VIEW', `Viewed Property: ${propSlug}`, {
        propertySlug: propSlug,
        propertyTitle: document.title,
      })
    }

    previousPathRef.current = currentPath

    // 8. Global Delegated Click Tracker (Phone, WhatsApp, Email, CTA)
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button') as HTMLElement | null
      if (!target) return

      const href = target.getAttribute('href') || ''
      const dataCta = target.getAttribute('data-cta') || target.getAttribute('aria-label') || target.innerText?.trim()

      if (href.startsWith('tel:')) {
        sendTrack('PHONE_CLICK', `Phone Click: ${href.replace('tel:', '')}`, {
          target: href,
        })
      } else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        sendTrack('WHATSAPP_CLICK', 'WhatsApp Contact Click', {
          target: href,
        })
      } else if (href.startsWith('mailto:')) {
        sendTrack('EMAIL_CLICK', `Email Click: ${href.replace('mailto:', '')}`, {
          target: href,
        })
      } else if (dataCta && (target.tagName === 'BUTTON' || target.classList.contains('btn') || href.includes('/contact'))) {
        sendTrack('CTA_CLICK', `CTA Click: ${dataCta.slice(0, 50)}`, {
          target: dataCta,
          href,
        })
      }
    }

    document.addEventListener('click', handleClick, { passive: true })
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [pathname, searchParams])

  return null
}
