import { createClient as createServerClient } from '@/lib/supabase/server'
import { createActivity } from '@/lib/db/activities'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activity = await createActivity({
      ...body,
      created_by: user.id,
    })
    return NextResponse.json({ activity }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create activity'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
