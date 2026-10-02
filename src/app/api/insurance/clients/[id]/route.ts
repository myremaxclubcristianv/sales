import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInsuranceClientById } from '@/lib/db/insurance-isolated'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getInsuranceClientById(id)
    if (!client) {
      return NextResponse.json({ error: 'Insurance client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching insurance client by ID:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
