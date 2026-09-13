import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClientRecord } from '@/lib/db/clients'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClientRecord(body)
    return NextResponse.json({ client }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
