import { NextResponse } from 'next/server'
import { getInsurancePolicies, createInsurancePolicy } from '@/lib/db/insurance'
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
    const product = searchParams.get('product') || undefined
    const expiringInDays = searchParams.get('expiring_in_days') ? parseInt(searchParams.get('expiring_in_days')!, 10) : undefined

    const policies = await getInsurancePolicies({ clientId, status, product, expiringInDays })
    return NextResponse.json(policies)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch insurance policies'
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

    if (!body.client_id || !body.product || !body.insurer || !body.start_date || !body.expiry_date) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, product, insurer, start_date, and expiry_date are required' },
        { status: 400 }
      )
    }

    // 1. Create policy
    const newPolicy = await createInsurancePolicy({
      client_id: body.client_id,
      product: body.product,
      insurer: body.insurer,
      policy_number: body.policy_number || null,
      premium: body.premium ? parseFloat(body.premium) : null,
      currency: body.currency || 'EUR',
      start_date: body.start_date,
      expiry_date: body.expiry_date,
      status: body.status || 'ACTIVE',
      notes: body.notes || null,
    })

    // 2. Automatically generate a renewal follow-up 30 days before expiry
    try {
      const expiryDate = new Date(body.expiry_date)
      const renewalReminderDate = new Date(expiryDate)
      renewalReminderDate.setDate(renewalReminderDate.getDate() - 30)

      await createFollowUp({
        client_id: body.client_id,
        insurance_id: newPolicy.id,
        reason: `Insurance Renewal: ${body.product} policy with ${body.insurer} expires on ${body.expiry_date}`,
        due_date: renewalReminderDate.toISOString(),
        priority: 'HIGH',
        status: 'PENDING',
      })
    } catch {
      // Follow-up creation best-effort
    }

    // 3. Log to client timeline
    try {
      await createActivity({
        client_id: body.client_id,
        type: 'NOTE',
        title: `Insurance Policy Registered: ${body.product} (${body.insurer})`,
        notes: `Policy #${body.policy_number || 'N/A'} • Premium: ${body.premium || 'N/A'} ${body.currency || 'EUR'} • Expiry: ${body.expiry_date}`,
        date: new Date().toISOString(),
      })
    } catch {
      // Activity logging best-effort
    }

    return NextResponse.json(newPolicy, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create insurance policy'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
