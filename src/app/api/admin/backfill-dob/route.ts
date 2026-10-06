import { createClient as createServerClient } from '@/lib/supabase/server'
import { runBirthdayBackfill } from '@/lib/utils/birthday-backfill'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await runBirthdayBackfill()
    return NextResponse.json({ success: true, stats }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to run birthday backfill'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
