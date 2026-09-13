import { createOpportunity, getOpportunities } from '@/lib/db/opportunities'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') || undefined
    const type = searchParams.get('type') || undefined
    const clientId = searchParams.get('clientId') || undefined
    const propertyId = searchParams.get('propertyId') || undefined

    const opportunities = await getOpportunities({ stage, type, clientId, propertyId })
    return NextResponse.json({ opportunities })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch opportunities'
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
    const { client_id, title, type, value, currency, stage, probability, expected_close_date, property_id, request_id, notes } = body

    if (!client_id || !title || !type) {
      return NextResponse.json(
        { error: 'client_id, title, and type are required' },
        { status: 400 }
      )
    }

    const opportunity = await createOpportunity({
      client_id,
      title,
      type,
      value: value ? Number(value) : null,
      currency: currency || 'EUR',
      stage: stage || 'PROSPECT',
      probability: probability !== undefined ? Number(probability) : 50,
      expected_close_date: expected_close_date || null,
      property_id: property_id || null,
      request_id: request_id || null,
      notes: notes || null,
    })

    return NextResponse.json({ opportunity }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create opportunity'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
