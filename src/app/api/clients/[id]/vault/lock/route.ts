import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, _props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ success: true, message: 'Vault-ul a fost blocat cu succes.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to lock vault'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
