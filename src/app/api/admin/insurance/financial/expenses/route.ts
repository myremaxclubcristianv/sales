import { NextResponse } from 'next/server'
import { getExpenses, createExpense } from '@/lib/db/insurance-financial'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const supplier = searchParams.get('supplier') || undefined
    const year = searchParams.get('year') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const search = searchParams.get('search') || undefined
    const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined
    const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined

    const result = await getExpenses({
      category,
      supplier,
      year,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch financial expenses'
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

    if (!body.expense_date || !body.description || !body.category || !body.supplier || body.total_amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: expense_date, description, category, supplier, and total_amount are required' },
        { status: 400 }
      )
    }

    const netAmount = body.net_amount !== undefined ? parseFloat(body.net_amount) : parseFloat(body.total_amount)
    const totalAmount = parseFloat(body.total_amount)
    const vatAmount = body.vat_amount !== undefined && body.vat_amount !== null ? parseFloat(body.vat_amount) : null

    const record = await createExpense({
      expense_date: body.expense_date,
      document_number: body.document_number || null,
      description: body.description,
      category: body.category,
      supplier: body.supplier,
      net_amount: netAmount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      observations: body.observations || null,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create financial expense'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
