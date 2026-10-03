import { NextResponse } from 'next/server'
import { getExpenseById, updateExpense, deleteExpense } from '@/lib/db/insurance-financial'
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
    const expense = await getExpenseById(id)
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expense'
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
    if (body.expense_date !== undefined) updateData.expense_date = body.expense_date
    if (body.document_number !== undefined) updateData.document_number = body.document_number
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.supplier !== undefined) updateData.supplier = body.supplier
    if (body.net_amount !== undefined) updateData.net_amount = parseFloat(body.net_amount)
    if (body.vat_amount !== undefined) updateData.vat_amount = body.vat_amount !== null ? parseFloat(body.vat_amount) : null
    if (body.total_amount !== undefined) updateData.total_amount = parseFloat(body.total_amount)
    if (body.observations !== undefined) updateData.observations = body.observations

    const updated = await updateExpense(id, updateData)
    if (!updated) {
      return NextResponse.json({ error: 'Expense not found or update failed' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update expense'
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
    const success = await deleteExpense(id)
    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
