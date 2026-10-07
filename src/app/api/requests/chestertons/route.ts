import { NextResponse } from 'next/server'
import { getChestertonsRequests, getChestertonsMetrics } from '@/lib/db/chestertons-requests'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const tipLead = searchParams.get('tip_lead') || undefined
    const sursa = searchParams.get('sursa') || undefined
    const agent = searchParams.get('agent') || undefined
    const minBudget = searchParams.get('min_budget') ? Number(searchParams.get('min_budget')) : undefined
    const maxBudget = searchParams.get('max_budget') ? Number(searchParams.get('max_budget')) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 50

    const result = await getChestertonsRequests({
      search,
      status,
      tipLead,
      sursa,
      agent,
      minBudget,
      maxBudget,
      page,
      pageSize,
    })

    const metrics = await getChestertonsMetrics()

    return NextResponse.json({
      ...result,
      metrics,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Chestertons requests'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
