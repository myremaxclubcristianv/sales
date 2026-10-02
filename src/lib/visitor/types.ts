/**
 * Visitor Intelligence & Marketing Analytics Types
 */

export type TrafficSourceType = 'direct' | 'organic' | 'social' | 'referral' | 'paid'

export interface TrafficSource {
  type: TrafficSourceType
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
  referrer: string
}

export interface DeviceDetails {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet'
  os: string
  browser: string
  browserVersion?: string
  screenWidth?: number
  screenHeight?: number
  viewportWidth?: number
  viewportHeight?: number
  language: string
  timezone: string
}

export interface GeoLocation {
  country?: string
  countryCode?: string
  region?: string
  city?: string
  approximateLocation?: string
}

export type VisitorEventType =
  | 'NEW_VISITOR'
  | 'RETURNING_VISITOR'
  | 'PAGE_VIEW'
  | 'LEAD_CREATED'
  | 'FORM_SUBMITTED'
  | 'PHONE_CLICK'
  | 'WHATSAPP_CLICK'
  | 'EMAIL_CLICK'
  | 'CTA_CLICK'
  | 'PROPERTY_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'SEARCH'
  | 'FILTER_USED'
  | 'CONTACT_REQUEST'
  | 'VIEWING_REQUEST'
  | 'LOGIN'
  | 'LOGOUT'
  | 'IMPORTANT_ACTION'

export interface PageJourneyStep {
  path: string
  title?: string
  timestamp: string
}

export interface VisitorHistory {
  visits: number
  previousVisitAt?: string | null
  pagesViewedHistorically: number
}

export interface TrackEventPayload {
  visitorId: string
  sessionId: string
  isNewVisitor: boolean
  isNewSession: boolean
  eventType: VisitorEventType
  eventName?: string
  pagePath: string
  pageTitle?: string
  previousPath?: string
  trafficSource: TrafficSource
  device: DeviceDetails
  geo?: GeoLocation
  pageJourney?: PageJourneyStep[]
  activeDurationSeconds?: number
  pageCount?: number
  metadata?: Record<string, unknown>
}

export interface GlobalVisitorContext {
  visitorId: string
  sessionId: string
  trafficSource: TrafficSource
  device: DeviceDetails
  visitorHistory: VisitorHistory
  pageJourney: PageJourneyStep[]
}

declare global {
  interface Window {
    __CV_VISITOR_INTELLIGENCE__?: GlobalVisitorContext
  }
}

export interface EnrichedLeadPayload {
  leadId?: string
  name: string
  phone?: string | null
  email?: string | null
  message?: string | null
  propertyTitle?: string | null
  requestTitle?: string | null
  source?: string | null
  visitorId?: string | null
  sessionId?: string | null
  trafficSource?: TrafficSource | null
  device?: DeviceDetails | null
  visitorHistory?: VisitorHistory | null
  pageJourney?: PageJourneyStep[] | null
  createdAt?: string | null
}
