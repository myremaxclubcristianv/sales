import { createClient as createServerClient } from '@/lib/supabase/server'
import { getMasterCalendarEvents } from '@/lib/db/calendar'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined
    const categoryFilter = searchParams.get('category') || undefined

    const data = await getMasterCalendarEvents({ year, month, categoryFilter })
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load calendar events'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
