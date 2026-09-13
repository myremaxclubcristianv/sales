import { createClient as createServerClient } from '@/lib/supabase/server'
import { createDocumentFolder } from '@/lib/db/documents'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folder = await createDocumentFolder(body)
    return NextResponse.json({ folder }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create document folder'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
