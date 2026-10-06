import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndGenerateReminders } from '@/lib/utils/reminders'
import { NextResponse } from 'next/server'

async function handleRemindersCheck(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const isVercelCron = req.headers.get('x-vercel-cron') === '1'
    const cronSecret = process.env.CRON_SECRET?.trim()

    let isAuthorizedCron = false

    // Check Vercel Cron Secret / Authorization header
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorizedCron = true
    } else if (isVercelCron && (!cronSecret || authHeader === `Bearer ${cronSecret}`)) {
      isAuthorizedCron = true
    }

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

