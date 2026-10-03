import { NextResponse } from 'next/server'
import { getIncomeById, updateIncome, deleteIncome } from '@/lib/db/insurance-financial'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const income = await getIncomeById(id)
    if (!income) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch income'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.income_date !== undefined) updateData.income_date = body.income_date
    if (body.document_number !== undefined) updateData.document_number = body.document_number
    if (body.description !== undefined) updateData.description = body.description
    if (body.insurance_type !== undefined) updateData.insurance_type = body.insurance_type
    if (body.insurer !== undefined) updateData.insurer = body.insurer
    if (body.policy_value !== undefined) updateData.policy_value = body.policy_value !== null ? parseFloat(body.policy_value) : null
    if (body.commission_percent !== undefined) updateData.commission_percent = body.commission_percent !== null ? parseFloat(body.commission_percent) : null
    if (body.commission_received !== undefined) updateData.commission_received = parseFloat(body.commission_received)
    if (body.tax_1_percent !== undefined) updateData.tax_1_percent = body.tax_1_percent !== null ? parseFloat(body.tax_1_percent) : null
    if (body.observations !== undefined) updateData.observations = body.observations

    const updated = await updateIncome(id, updateData)
    if (!updated) {
      return NextResponse.json({ error: 'Income not found or update failed' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update income'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const success = await deleteIncome(id)
    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete income'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
