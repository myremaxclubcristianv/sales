import { convertContactToClient } from '@/lib/db/contacts'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contactId, category, source, interest_summary } = body

    if (!contactId) {
      return NextResponse.json({ error: 'contactId este obligatoriu' }, { status: 400 })
    }

    const result = await convertContactToClient(contactId, {
      category: category || 'REAL_ESTATE',
      source: source || 'DIRECT_CONTACT',
      interest_summary: interest_summary || undefined,
    })

    return NextResponse.json({ success: true, ...result }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to convert contact to client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
