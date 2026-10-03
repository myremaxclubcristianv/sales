import { NextResponse } from 'next/server'
import { getIncomes, createIncome } from '@/lib/db/insurance-financial'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const insurer = searchParams.get('insurer') || undefined
    const insuranceType = searchParams.get('insuranceType') || undefined
    const year = searchParams.get('year') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getIncomes({
      insurer,
      insuranceType,
      year,
      startDate,
      endDate,
      search,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch financial income'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.income_date || !body.description || body.commission_received === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: income_date, description, and commission_received are required' },
        { status: 400 }
      )
    }

    const commissionReceived = parseFloat(body.commission_received)
    const tax1Percent = body.tax_1_percent !== undefined && body.tax_1_percent !== null ? parseFloat(body.tax_1_percent) : Number((commissionReceived * 0.01).toFixed(4))
    const policyValue = body.policy_value !== undefined && body.policy_value !== null ? parseFloat(body.policy_value) : null
    const commissionPercent = body.commission_percent !== undefined && body.commission_percent !== null ? parseFloat(body.commission_percent) : null

    const record = await createIncome({
      income_date: body.income_date,
      document_number: body.document_number || null,
      description: body.description,
      insurance_type: body.insurance_type || null,
      insurer: body.insurer || null,
      policy_value: policyValue,
      commission_percent: commissionPercent,
      commission_received: commissionReceived,
      tax_1_percent: tax1Percent,
      observations: body.observations || null,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create financial income'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
