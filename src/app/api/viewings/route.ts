import { NextResponse } from 'next/server'
import { getViewings, createViewing } from '@/lib/db/viewings'
import { createActivity } from '@/lib/db/activities'
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
    const propertyId = searchParams.get('property_id') || undefined
    const status = searchParams.get('status') || undefined

    const viewings = await getViewings({ clientId, propertyId, status })
    return NextResponse.json(viewings)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch viewings'
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

    if (!body.client_id || !body.property_id || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, property_id, and date are required' },
        { status: 400 }
      )
    }

    const newViewing = await createViewing({
      client_id: body.client_id,
      property_id: body.property_id,
      date: body.date,
      status: body.status || 'SCHEDULED',
      attendees: body.attendees || [],
      notes: body.notes || null,
      feedback: body.feedback || null,
      interest: body.interest || null,
      next_action: body.next_action || null,
    })

    // Log to client timeline
    try {
      await createActivity({
        client_id: body.client_id,
        property_id: body.property_id,
        type: 'VIEWING',
        title: `Property viewing ${body.status === 'COMPLETED' ? 'completed' : 'scheduled'}`,
        notes: body.notes || body.feedback || null,
        date: body.date,
      })
    } catch {
      // Activity logging best-effort
    }

    return NextResponse.json(newViewing, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create viewing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
