/**
 * Telegram Notification Service for CRM SALES
 * 
 * Secure, server-only utility for delivering real-time lead and contact
 * notifications to Telegram.
 * 
 * IMPORTANT:
 * - Server-side only (never expose TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID to client).
 * - Non-blocking side effect: Failures never interrupt database transactions or user UX.
 * - Auto-escapes HTML formatting to prevent injection and rendering errors.
 */

export interface LeadNotificationPayload {
  name: string
  phone?: string | null
  email?: string | null
  message?: string | null
  source?: string | null
  property_title?: string | null
  request_title?: string | null
  created_at?: string | null
  id?: string | null
}

export interface TelegramSendResult {
  success: boolean
  skipped?: boolean
  messageId?: number
  error?: string
}

/**
 * Validates whether Telegram bot configuration exists in environment variables.
 */
export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  return Boolean(token && chatId)
}

/**
 * Escapes special HTML characters to prevent Telegram parse mode breaking.
 */
export function escapeTelegramHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sanitizes, normalizes, and truncates untrusted user-submitted text.
 */
export function sanitizeUserText(text: string | null | undefined, maxLength = 1200): string {
  if (!text) return ''
  // Normalize line endings and collapse 3+ consecutive newlines to 2
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (cleaned.length <= maxLength) {
    return escapeTelegramHtml(cleaned)
  }
  return escapeTelegramHtml(cleaned.slice(0, maxLength)) + '… <i>[mesaj trunchiat]</i>'
}

/**
 * Formats a Romanian notification message for new CRM leads in HTML mode.
 */
export function formatLeadTelegramMessage(lead: LeadNotificationPayload): string {
  const safeName = escapeTelegramHtml(lead.name.trim())
  const safePhone = lead.phone ? escapeTelegramHtml(lead.phone.trim()) : null
  const safeEmail = lead.email ? escapeTelegramHtml(lead.email.trim()) : null
  const safeMessage = sanitizeUserText(lead.message)
  const safePropTitle = lead.property_title ? escapeTelegramHtml(lead.property_title.trim()) : null
  const safeReqTitle = lead.request_title ? escapeTelegramHtml(lead.request_title.trim()) : null
  const safeSource = lead.source ? escapeTelegramHtml(lead.source.trim()) : 'Website / Contact'

  // Format date in Bucharest / Europe time
  let formattedDate: string
  try {
    const d = lead.created_at ? new Date(lead.created_at) : new Date()
    formattedDate = new Intl.DateTimeFormat('ro-RO', {
      timeZone: 'Europe/Bucharest',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d)
  } catch {
    formattedDate = new Date().toISOString()
  }

  const lines: string[] = [
    '🔔 <b>NOU LEAD — SALES</b>',
    '',
    `👤 <b>Nume:</b> ${safeName}`,
  ]

  if (safePhone) {
    lines.push(`📞 <b>Telefon:</b> ${safePhone}`)
  }

  if (safeEmail) {
    lines.push(`✉️ <b>Email:</b> ${safeEmail}`)
  }

  if (safePropTitle) {
    lines.push(`🏠 <b>Proprietate:</b> ${safePropTitle}`)
  }

  if (safeReqTitle) {
    lines.push(`📋 <b>Cerere Cumpărător:</b> ${safeReqTitle}`)
  }

  if (safeMessage) {
    lines.push(`💬 <b>Mesaj:</b>\n${safeMessage}`)
  }

  lines.push(`🌐 <b>Sursă:</b> ${safeSource}`)
  lines.push(`🕐 <b>Data:</b> ${formattedDate}`)
  lines.push(`🔗 <b>CRM:</b> <a href="https://sales.cristianvaduva.com/admin/leads">sales.cristianvaduva.com/admin/leads</a>`)

  return lines.join('\n')
}

/**
 * Sends a raw text message to the configured Telegram chat.
 * Fails safely without throwing and without leaking credentials.
 */
export async function sendTelegramMessage(
  text: string,
  options?: {
    parseMode?: 'HTML' | 'MarkdownV2'
    disableWebPagePreview?: boolean
    timeoutMs?: number
  }
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!token || !chatId) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[Telegram] Skipping notification: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.')
    }
    return {
      success: false,
      skipped: true,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured',
    }
  }

  const timeoutMs = options?.timeoutMs || 5000
  const parseMode = options?.parseMode || 'HTML'
  const disablePreview = options?.disableWebPagePreview ?? false

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const endpoint = `https://api.telegram.org/bot${token}/sendMessage`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: disablePreview,
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.ok) {
      const errorDesc = data.description || `HTTP status ${response.status}`
      console.warn(`[Telegram Notification] Failed to send message: ${errorDesc}`)
      return {
        success: false,
        error: errorDesc,
      }
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    }
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError'
    const message = isAbort ? `Request timed out after ${timeoutMs}ms` : 'Network connection failure'
    console.warn(`[Telegram Notification] Error: ${message}`)
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Formats and sends a new lead notification to Telegram.
 * Non-blocking helper: Catches all errors internally.
 */
export async function notifyNewLeadTelegram(
  lead: LeadNotificationPayload
): Promise<TelegramSendResult> {
  try {
    const messageText = formatLeadTelegramMessage(lead)
    return await sendTelegramMessage(messageText, {
      parseMode: 'HTML',
      disableWebPagePreview: true,
      timeoutMs: 5000,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown formatting error'
    console.warn(`[Telegram Notification] Failed to dispatch lead notification: ${msg}`)
    return {
      success: false,
      error: msg,
    }
  }
}
