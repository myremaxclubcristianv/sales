import { createClient as createServerClient } from '@/lib/supabase/server'
import { acknowledgeBirthday } from '@/lib/db/follow-ups'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, year, notes } = body

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const result = await acknowledgeBirthday(clientId, year, notes)
    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to acknowledge birthday'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
