/**
 * Comprehensive Automated Verification Suite for
 * VISITOR INTELLIGENCE + TELEGRAM NOTIFICATIONS
 */

import { generateVisitorId, generateSessionId, parseTrafficSource, parseUserAgent, extractGeoFromHeaders } from '../src/lib/visitor/detector'
import { formatNewVisitorTelegramMessage, formatReturningVisitorTelegramMessage, formatVisitorActivityTelegramMessage, formatVisitorLeadTelegramMessage } from '../src/lib/visitor/telegram-formatter'
import { shouldSendTelegramNotification } from '../src/lib/visitor/anti-spam'
import { TrackEventPayload, EnrichedLeadPayload } from '../src/lib/visitor/types'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

;(global as any).WebSocket = class { constructor() {} }

const envPath = path.join(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1].trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1].trim()
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })

let totalGates = 0
let passedGates = 0

function assert(condition: boolean, testName: string, detail = '') {
  totalGates++
  if (condition) {
    passedGates++
    console.log(`[\x1b[32mPASS\x1b[0m] ${testName}`)
  } else {
    console.error(`[\x1b[31mFAIL\x1b[0m] ${testName} -> ${detail}`)
  }
}

async function runVisitorSuite() {
  console.log('================================================================')
  console.log('SALES CRM — VISITOR INTELLIGENCE & TELEGRAM VERIFICATION')
  console.log('================================================================\n')

  // 1. Visitor ID & Session ID generation
  console.log('--- TEST GROUP 1: Visitor & Session Identifiers ---')
  const vid1 = generateVisitorId()
  const vid2 = generateVisitorId()
  const sid1 = generateSessionId()
  assert(/^V-[A-Z0-9]{8}$/.test(vid1), 'Visitor ID format is valid (V-XXXXXXXX)', `Got: ${vid1}`)
  assert(vid1 !== vid2, 'Generated Visitor IDs are unique and non-colliding')
  assert(/^S-[A-Z0-9]{8}$/.test(sid1), 'Session ID format is valid (S-XXXXXXXX)', `Got: ${sid1}`)

  // 2. Traffic Source Detection
  console.log('\n--- TEST GROUP 2: Traffic Source Intelligence ---')
  const directSrc = parseTrafficSource(new URLSearchParams(), '')
  assert(directSrc.type === 'direct' && directSrc.source === 'Direct', 'Direct traffic identified correctly')

  const googleSrc = parseTrafficSource(new URLSearchParams(), 'https://www.google.com/search?q=apartamente+primaverii')
  assert(googleSrc.type === 'organic' && googleSrc.source === 'Google Organic', 'Google Organic identified correctly')

  const bingSrc = parseTrafficSource(new URLSearchParams(), 'https://www.bing.com/')
  assert(bingSrc.type === 'organic' && bingSrc.source === 'Bing Organic', 'Bing Organic identified correctly')

  const fbSrc = parseTrafficSource(new URLSearchParams(), 'https://m.facebook.com/')
  assert(fbSrc.type === 'social' && fbSrc.source === 'Facebook', 'Facebook Social identified correctly')

  const igSrc = parseTrafficSource(new URLSearchParams(), 'https://l.instagram.com/')
  assert(igSrc.type === 'social' && igSrc.source === 'Instagram', 'Instagram Social identified correctly')

  const tgSrc = parseTrafficSource(new URLSearchParams(), 'https://t.me/cristianvaduva')
  assert(tgSrc.type === 'social' && tgSrc.source === 'Telegram', 'Telegram Social identified correctly')

  const utmSrc = parseTrafficSource(
    new URLSearchParams('utm_source=google_ads&utm_medium=cpc&utm_campaign=luxury_villas_2026&utm_term=vila_nord'),
    'https://www.google.com/'
  )
  assert(
    utmSrc.type === 'paid' &&
    utmSrc.source === 'google_ads' &&
    utmSrc.medium === 'cpc' &&
    utmSrc.campaign === 'luxury_villas_2026' &&
    utmSrc.term === 'vila_nord',
    'Paid UTM campaign parameters extracted accurately'
  )

  // 3. Device Intelligence
  console.log('\n--- TEST GROUP 3: Device Intelligence ---')
  const macChrome = parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36')
  assert(macChrome.deviceType === 'Desktop' && macChrome.os.includes('macOS') && macChrome.browser.includes('Chrome'), 'macOS Chrome parsed correctly')

  const iphoneSafari = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1')
  assert(iphoneSafari.deviceType === 'Mobile' && iphoneSafari.os.includes('iOS') && iphoneSafari.browser.includes('Safari'), 'iPhone iOS Safari parsed correctly')

  const ipadSafari = parseUserAgent('Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1')
  assert(ipadSafari.deviceType === 'Tablet' && ipadSafari.os.includes('iOS'), 'iPad Tablet parsed correctly')

  // 4. Geo Intelligence
  console.log('\n--- TEST GROUP 4: Geo Intelligence ---')
  const mockHeaders = new Headers({
    'x-vercel-ip-country': 'RO',
    'x-vercel-ip-city': 'Bucharest',
    'x-vercel-ip-country-region': 'Bucuresti',
  })
  const geo = extractGeoFromHeaders(mockHeaders)
  assert(Boolean(geo.countryCode === 'RO' && geo.country?.includes('Romania') && geo.city === 'Bucharest' && geo.region === 'Bucuresti'), 'Vercel Geo headers mapped accurately')

  // 5. Telegram Message Formatting
  console.log('\n--- TEST GROUP 5: Telegram Structured Formatters ---')
  const mockTrackPayload: TrackEventPayload = {
    visitorId: 'V-A8F2K91B',
    sessionId: 'S-4B8C1D9E',
    isNewVisitor: true,
    isNewSession: true,
    eventType: 'NEW_VISITOR',
    pagePath: '/properties',
    trafficSource: googleSrc,
    device: {
      deviceType: 'Desktop',
      os: 'macOS 14.5',
      browser: 'Chrome 125',
      screenWidth: 1920,
      screenHeight: 1080,
      language: 'ro-RO',
      timezone: 'Europe/Bucharest',
    },
    geo,
    pageJourney: [{ path: '/properties', timestamp: new Date().toISOString() }],
  }

  const newVisMsg = formatNewVisitorTelegramMessage(mockTrackPayload)
  assert(newVisMsg.includes('NEW VISITOR — CRISTIAN VĂDUVA'), 'New visitor Telegram header matches spec')
  assert(newVisMsg.includes('V-A8F2K91B') && newVisMsg.includes('S-4B8C1D9E'), 'New visitor message includes IDs')
  assert(newVisMsg.includes('Google Organic'), 'New visitor message includes traffic source')

  const retVisMsg = formatReturningVisitorTelegramMessage({
    ...mockTrackPayload,
    isNewVisitor: false,
    eventType: 'RETURNING_VISITOR',
    pageCount: 4,
    activeDurationSeconds: 225,
    metadata: {
      visitorHistory: {
        visits: 3,
        previousVisitAt: '2026-10-02T18:30:10Z',
        pagesViewedHistorically: 12,
      },
    },
  })
  assert(retVisMsg.includes('RETURNING VISITOR — CRISTIAN VĂDUVA'), 'Returning visitor Telegram header matches spec')
  assert(retVisMsg.includes('Visits: 3') && retVisMsg.includes('Pages: 4'), 'Returning visitor history properly rendered')

  const activityMsg = formatVisitorActivityTelegramMessage({
    ...mockTrackPayload,
    isNewVisitor: false,
    eventType: 'WHATSAPP_CLICK',
    eventName: 'WhatsApp Contact Click',
    pagePath: '/properties/vila-lux-primaverii',
    previousPath: '/properties',
    metadata: {
      target: 'https://wa.me/40722000000',
    },
  })
  assert(activityMsg.includes('VISITOR ACTIVITY — CRISTIAN VĂDUVA'), 'Activity message header matches spec')
  assert(activityMsg.includes('WhatsApp Contact Click'), 'Activity action matches event')

  const enrichedLead: EnrichedLeadPayload = {
    name: 'Alexandru Popescu',
    phone: '+40722123456',
    email: 'alex@example.com',
    message: 'Doresc o vizionare privata.',
    propertyTitle: 'Vila Lux Primăverii',
    visitorId: 'V-A8F2K91B',
    sessionId: 'S-4B8C1D9E',
    trafficSource: googleSrc,
    device: mockTrackPayload.device,
    visitorHistory: { visits: 2, previousVisitAt: '2026-10-02T12:00:00Z', pagesViewedHistorically: 6 },
    pageJourney: [
      { path: '/', timestamp: '2026-10-03T00:00:00Z' },
      { path: '/properties', timestamp: '2026-10-03T00:01:00Z' },
      { path: '/properties/vila-lux-primaverii', timestamp: '2026-10-03T00:02:00Z' },
      { path: '/contact', timestamp: '2026-10-03T00:03:00Z' },
    ],
    createdAt: new Date().toISOString(),
  }
  const leadMsg = formatVisitorLeadTelegramMessage(enrichedLead)
  assert(leadMsg.includes('NEW LEAD — CRISTIAN VĂDUVA'), 'Lead message header matches spec')
  assert(leadMsg.includes('Alexandru Popescu'), 'Lead name matches')
  assert(leadMsg.includes('Vila Lux Primăverii'), 'Property interest matches')
  assert(leadMsg.includes('Google Organic'), 'Acquisition source matches')

  // 6. Anti-Spam & Throttling Rules
  console.log('\n--- TEST GROUP 6: Anti-Spam & Throttling Rules ---')
  const pageViewDecision = shouldSendTelegramNotification({
    ...mockTrackPayload,
    eventType: 'PAGE_VIEW',
  })
  assert(!pageViewDecision.shouldSend, 'Standard PAGE_VIEW correctly suppressed from Telegram spam')

  const newVisDecision = shouldSendTelegramNotification({
    ...mockTrackPayload,
    eventType: 'NEW_VISITOR',
    visitorId: 'V-TESTNEW1',
    sessionId: 'S-TESTNEW1',
  })
  assert(newVisDecision.shouldSend, 'First NEW_VISITOR event is allowed')

  const dupNewVisDecision = shouldSendTelegramNotification({
    ...mockTrackPayload,
    eventType: 'NEW_VISITOR',
    visitorId: 'V-TESTNEW1',
    sessionId: 'S-TESTNEW1',
  })
  assert(!dupNewVisDecision.shouldSend, 'Duplicate NEW_VISITOR event for same visitor is suppressed')

  const leadDecision = shouldSendTelegramNotification({
    ...mockTrackPayload,
    eventType: 'LEAD_CREATED',
  })
  assert(leadDecision.shouldSend, 'LEAD_CREATED event is always prioritized and allowed')

  // 7. Data Privacy & Zero CNP Leakage
  console.log('\n--- TEST GROUP 7: Data Privacy & CNP Protection ---')
  assert(!newVisMsg.includes('CNP') && !newVisMsg.includes('password'), 'New visitor message contains zero PII secrets')
  assert(!leadMsg.includes('CNP'), 'Enriched lead message strictly excludes CNP')

  // 8. Database Baseline Zero Regression
  console.log('\n--- TEST GROUP 8: Database Baseline Zero Regression ---')
  const { count: clientCount } = await adminClient.from('clients').select('*', { count: 'exact', head: true })
  assert(clientCount === 25, 'CRM clients count is strictly 25 (0 modified/deleted)')

  const { count: leadCount } = await adminClient.from('leads').select('*', { count: 'exact', head: true })
  assert(leadCount === 5, 'CRM leads count is strictly 5 (0 modified/deleted)')

  console.log('\n================================================================')
  console.log(`SUMMARY: ${passedGates}/${totalGates} GATES PASSED`)
  console.log('================================================================\n')

  if (passedGates === totalGates) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runVisitorSuite().catch((err) => {
  console.error('Fatal test failure:', err)
  process.exit(1)
})
