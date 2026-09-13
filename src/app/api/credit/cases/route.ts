import { NextResponse } from 'next/server'
import { getCreditCases, createCreditCase } from '@/lib/db/credit'
import { createActivity } from '@/lib/db/activities'
import { createFollowUp } from '@/lib/db/follow-ups'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id') || undefined
    const status = searchParams.get('status') || undefined

    const cases = await getCreditCases({ clientId, status })
    return NextResponse.json(cases)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch credit cases'
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

    if (!body.client_id || !body.amount || !body.purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, amount, and purpose are required' },
        { status: 400 }
      )
    }

    const newCase = await createCreditCase({
      client_id: body.client_id,
      amount: parseFloat(body.amount),
      currency: body.currency || 'EUR',
      purpose: body.purpose,
      status: body.status || 'LEAD',
      institution: body.institution || null,
      notes: body.notes || null,
    })

    // Log to client activity timeline
    try {
      await createActivity({
        client_id: body.client_id,
        type: 'NOTE',
        title: `Financing Case Opened: ${parseFloat(body.amount).toLocaleString()} ${body.currency || 'EUR'}`,
        notes: `Purpose: ${body.purpose} • Bank: ${body.institution || 'Pending Selection'} • Status: ${body.status || 'LEAD'}`,
        date: new Date().toISOString(),
      })
    } catch {
      // Best-effort
    }

    // Create a follow-up for document gathering
    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 3)

      await createFollowUp({
        client_id: body.client_id,
        credit_id: newCase.id,
        reason: `Financing Follow-up: Collect financial documents & income verification for ${parseFloat(body.amount).toLocaleString()} ${body.currency || 'EUR'} loan`,
        due_date: dueDate.toISOString(),
        priority: 'HIGH',
        status: 'PENDING',
      })
    } catch {
      // Best-effort
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create credit case'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
