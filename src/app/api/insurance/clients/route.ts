import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInsuranceClients } from '@/lib/db/insurance-isolated'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const policyType = searchParams.get('policyType') || undefined
    const urgency = searchParams.get('urgency') || undefined

    const { clients, totalCount } = await getInsuranceClients({
      search,
      status,
      policyType,
      urgency,
    })

    return NextResponse.json({ clients, totalCount })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching insurance clients:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
