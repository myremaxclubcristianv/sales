import { NextResponse } from 'next/server'
import { getInsuranceCompanies, getInsuranceCompaniesMetrics } from '@/lib/db/insurance-companies'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Autentificare necesară.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const tableParam = searchParams.get('table')
    const tableNumber = tableParam ? parseInt(tableParam, 10) : undefined
    const city = searchParams.get('city') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 50

    const result = await getInsuranceCompanies({
      search,
      status,
      tableNumber,
      city,
      page,
      pageSize,
    })

    const metrics = await getInsuranceCompaniesMetrics()

    return NextResponse.json({
      ...result,
      metrics,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la preluarea firmelor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
