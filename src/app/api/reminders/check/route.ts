import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndGenerateReminders } from '@/lib/utils/reminders'
import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

/**
 * Safely compare two secret tokens in constant time to prevent timing attacks.
 * Normalizes input tokens using SHA-256 before timingSafeEqual to safely handle
 * differing string lengths without leaking length timing or throwing RangeError.
 */
function safeCompareTokens(provided: string | null | undefined, secret: string | null | undefined): boolean {
  if (!provided || !secret) {
    return false
  }

  const cleanProvided = provided.trim()
  const cleanSecret = secret.trim()

  if (!cleanProvided || !cleanSecret) {
    return false
  }

  try {
    const hashProvided = createHash('sha256').update(cleanProvided).digest()
    const hashSecret = createHash('sha256').update(cleanSecret).digest()
    return timingSafeEqual(hashProvided, hashSecret)
  } catch {
    return false
  }
}

async function handleRemindersCheck(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET?.trim()

    // Extract Bearer token if present
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

    // Validate cron authorization strictly via CRON_SECRET and constant-time token comparison.
    // If CRON_SECRET is not configured or empty, cron authorization is strictly rejected.
    // The header 'x-vercel-cron' alone NEVER grants access.
    const isAuthorizedCron = Boolean(cronSecret && bearerToken && safeCompareTokens(bearerToken, cronSecret))

    if (isAuthorizedCron) {
      // Execute with Service Role Client for cron automation
      const adminClient = createAdminClient()
      const result = await checkAndGenerateReminders(adminClient)
      return NextResponse.json({
        success: true,
        source: 'cron',
        timestamp: new Date().toISOString(),
        result,
      }, { status: 200 })
    }

    // Otherwise, check authenticated user session
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const result = await checkAndGenerateReminders(adminClient)
    return NextResponse.json({
      success: true,
      source: 'user',
      userId: user.id,
      timestamp: new Date().toISOString(),
      result,
    }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check reminders'
    console.error('[Reminders Check Route Error]:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return handleRemindersCheck(req)
}

export async function GET(req: Request) {
  return handleRemindersCheck(req)
}
