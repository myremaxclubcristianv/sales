import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getClientVaultStatus } from '@/lib/db/client-vault'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const status = await getClientVaultStatus(id)

    return NextResponse.json(status)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vault status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
