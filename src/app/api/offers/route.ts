import { NextResponse } from 'next/server'
import { getOffers, createOffer } from '@/lib/db/offers'
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

    const offers = await getOffers({ clientId, propertyId, status })
    return NextResponse.json(offers)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch offers'
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

    if (!body.client_id || !body.property_id || !body.offer_price || !body.asking_price || !body.offer_date) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, property_id, asking_price, offer_price, and offer_date are required' },
        { status: 400 }
      )
    }

    const newOffer = await createOffer({
      client_id: body.client_id,
      property_id: body.property_id,
      asking_price: parseFloat(body.asking_price),
      offer_price: parseFloat(body.offer_price),
      currency: body.currency || 'EUR',
      offer_date: body.offer_date,
      party: body.party || 'buyer',
      notes: body.notes || null,
      status: body.status || 'PENDING',
    })

    // Log to client activity timeline
    try {
      await createActivity({
        client_id: body.client_id,
        property_id: body.property_id,
        type: 'OFFER',
        title: `Offer recorded: ${parseFloat(body.offer_price).toLocaleString()} ${body.currency || 'EUR'} (Asking: ${parseFloat(body.asking_price).toLocaleString()} ${body.currency || 'EUR'})`,
        notes: body.notes || null,
        date: new Date().toISOString(),
      })
    } catch {
      // Activity logging best-effort
    }

    return NextResponse.json(newOffer, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create offer'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
