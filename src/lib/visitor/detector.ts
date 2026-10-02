import { GeoLocation, TrafficSource } from './types'

/**
 * Generates an 8-character random alphanumeric string.
 */
function randomAlphanumeric(length = 8): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Avoid ambiguous characters (0, 1, I, O)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generates a persistent, privacy-conscious, non-PII Visitor ID.
 * Format: V-XXXXXXXX
 */
export function generateVisitorId(): string {
  return `V-${randomAlphanumeric(8)}`
}

/**
 * Generates a Session ID with 30-min rolling activity window.
 * Format: S-XXXXXXXX
 */
export function generateSessionId(): string {
  return `S-${randomAlphanumeric(8)}`
}

/**
 * Parses user agent string into structured device details.
 */
export function parseUserAgent(ua: string): { deviceType: 'Desktop' | 'Mobile' | 'Tablet'; os: string; browser: string } {
  if (!ua) {
    return { deviceType: 'Desktop', os: 'Unknown OS', browser: 'Unknown Browser' }
  }

  const uaLower = ua.toLowerCase()

  // 1. Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop'
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet'
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile'
  }

  // 2. Operating System
  let os = 'Unknown OS'
  if (/windows phone/i.test(uaLower)) os = 'Windows Phone'
  else if (/windows nt 10\.0/i.test(uaLower)) os = 'Windows 10/11'
  else if (/windows nt 6\.3/i.test(uaLower)) os = 'Windows 8.1'
  else if (/windows nt 6\.1/i.test(uaLower)) os = 'Windows 7'
  else if (/windows/i.test(uaLower)) os = 'Windows'
  else if (/iphone|ipad|ipod/i.test(uaLower)) {
    const match = ua.match(/OS (\d+[_.]\d+)/)
    os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS'
  } else if (/macintosh|mac os x/i.test(uaLower)) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/)
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS'
  } else if (/android/i.test(uaLower)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (/linux/i.test(uaLower)) os = 'Linux'
  else if (/cros/i.test(uaLower)) os = 'Chrome OS'

  // 3. Browser
  let browser = 'Unknown Browser'
  if (/edg\//i.test(ua)) {
    const m = ua.match(/edg\/(\d+)/i)
    browser = m ? `Edge ${m[1]}` : 'Edge'
  } else if (/opera|opr\//i.test(ua)) {
    const m = ua.match(/(?:opera|opr)\/(\d+)/i)
    browser = m ? `Opera ${m[1]}` : 'Opera'
  } else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) {
    const m = ua.match(/(?:chrome|crios)\/(\d+)/i)
    browser = m ? `Chrome ${m[1]}` : 'Chrome'
  } else if (/firefox|fxios/i.test(ua)) {
    const m = ua.match(/(?:firefox|fxios)\/(\d+)/i)
    browser = m ? `Firefox ${m[1]}` : 'Firefox'
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    const m = ua.match(/version\/(\d+(\.\d+)?)/i)
    browser = m ? `Safari ${m[1]}` : 'Safari'
  }

  return { deviceType, os, browser }
}

/**
 * Parses traffic source and campaign parameters from URL search params and Referrer.
 */
export function parseTrafficSource(
  searchParams: Record<string, string> | URLSearchParams,
  referrer: string,
  siteHost = 'sales.cristianvaduva.com'
): TrafficSource {
  const getParam = (k: string) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(k) || ''
    return searchParams[k] || ''
  }

  const utmSource = getParam('utm_source').trim()
  const utmMedium = getParam('utm_medium').trim()
  const utmCampaign = getParam('utm_campaign').trim()
  const utmTerm = getParam('utm_term').trim()
  const utmContent = getParam('utm_content').trim()

  // 1. Paid / Custom UTM source
  if (utmSource || utmMedium || utmCampaign) {
    const isPaid = utmMedium.toLowerCase().includes('cpc') || utmMedium.toLowerCase().includes('paid') || utmMedium.toLowerCase().includes('ads')
    return {
      type: isPaid ? 'paid' : 'referral',
      source: utmSource || 'Custom Campaign',
      medium: utmMedium || (isPaid ? 'cpc' : 'campaign'),
      campaign: utmCampaign || '(none)',
      term: utmTerm || undefined,
      content: utmContent || undefined,
      referrer: referrer || '(none)',
    }
  }

  // 2. Inspect Referrer header
  if (!referrer || referrer === '(none)') {
    return {
      type: 'direct',
      source: 'Direct',
      medium: '(none)',
      campaign: '(none)',
      referrer: '(none)',
    }
  }

  try {
    const refUrl = new URL(referrer)
    const refHost = refUrl.hostname.toLowerCase()

    // Internal navigation
    if (refHost.includes(siteHost) || refHost.includes('cristianvaduva.com') || refHost.includes('localhost')) {
      return {
        type: 'direct',
        source: 'Direct / Internal',
        medium: '(none)',
        campaign: '(none)',
        referrer: referrer,
      }
    }

    // Organic Search Engines
    if (/google\./i.test(refHost)) return { type: 'organic', source: 'Google Organic', medium: 'organic', campaign: '(none)', referrer }
    if (/bing\./i.test(refHost)) return { type: 'organic', source: 'Bing Organic', medium: 'organic', campaign: '(none)', referrer }
    if (/yahoo\./i.test(refHost)) return { type: 'organic', source: 'Yahoo Organic', medium: 'organic', campaign: '(none)', referrer }
    if (/duckduckgo\./i.test(refHost)) return { type: 'organic', source: 'DuckDuckGo', medium: 'organic', campaign: '(none)', referrer }
    if (/yandex\./i.test(refHost)) return { type: 'organic', source: 'Yandex', medium: 'organic', campaign: '(none)', referrer }

    // Social Platforms
    if (/facebook\.com|fb\.com|fb\.me/i.test(refHost)) return { type: 'social', source: 'Facebook', medium: 'social', campaign: '(none)', referrer }
    if (/instagram\.com/i.test(refHost)) return { type: 'social', source: 'Instagram', medium: 'social', campaign: '(none)', referrer }
    if (/tiktok\.com/i.test(refHost)) return { type: 'social', source: 'TikTok', medium: 'social', campaign: '(none)', referrer }
    if (/youtube\.com|youtu\.be/i.test(refHost)) return { type: 'social', source: 'YouTube', medium: 'social', campaign: '(none)', referrer }
    if (/linkedin\.com/i.test(refHost)) return { type: 'social', source: 'LinkedIn', medium: 'social', campaign: '(none)', referrer }
    if (/t\.me|telegram\.org/i.test(refHost)) return { type: 'social', source: 'Telegram', medium: 'social', campaign: '(none)', referrer }
    if (/twitter\.com|x\.com|t\.co/i.test(refHost)) return { type: 'social', source: 'Twitter / X', medium: 'social', campaign: '(none)', referrer }
    if (/pinterest\.com/i.test(refHost)) return { type: 'social', source: 'Pinterest', medium: 'social', campaign: '(none)', referrer }
    if (/reddit\.com/i.test(refHost)) return { type: 'social', source: 'Reddit', medium: 'social', campaign: '(none)', referrer }

    // Other External Referral
    return {
      type: 'referral',
      source: refHost,
      medium: 'referral',
      campaign: '(none)',
      referrer,
    }
  } catch {
    return {
      type: 'referral',
      source: referrer.slice(0, 50),
      medium: 'referral',
      campaign: '(none)',
      referrer,
    }
  }
}

/**
 * Extracts approximate location legitimately from trusted HTTP headers.
 * Never requests or exposes raw GPS coords.
 */
export function extractGeoFromHeaders(headers: Headers): GeoLocation {
  const countryCode = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || undefined
  const city = headers.get('x-vercel-ip-city') || undefined
  const region = headers.get('x-vercel-ip-country-region') || undefined

  let country = countryCode
  if (countryCode === 'RO') country = 'Romania (RO)'
  else if (countryCode === 'US') country = 'United States (US)'
  else if (countryCode === 'GB') country = 'United Kingdom (GB)'
  else if (countryCode === 'DE') country = 'Germany (DE)'
  else if (countryCode === 'FR') country = 'France (FR)'
  else if (countryCode === 'IT') country = 'Italy (IT)'
  else if (countryCode === 'ES') country = 'Spain (ES)'
  else if (countryCode === 'AE') country = 'United Arab Emirates (AE)'
  else if (countryCode === 'MC') country = 'Monaco (MC)'

  return {
    country,
    countryCode,
    city: city ? decodeURIComponent(city) : undefined,
    region: region ? decodeURIComponent(region) : undefined,
    approximateLocation: [city, region, country].filter(Boolean).join(', ') || undefined,
  }
}
