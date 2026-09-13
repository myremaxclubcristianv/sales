import { checkDuplicateClients } from '@/lib/db/clients'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, email } = body
    
    const duplicates = await checkDuplicateClients(phone, email)
    return NextResponse.json({ duplicates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check duplicate clients'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
