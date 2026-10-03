import { NextResponse } from 'next/server'
import { getFinancialOverview } from '@/lib/db/insurance-financial'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || undefined

    const overview = await getFinancialOverview(year)
    return NextResponse.json(overview)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch financial overview'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
