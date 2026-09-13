import { NextResponse } from 'next/server'
import { getRequests, createRequest } from '@/lib/db/requests'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const propertyType = searchParams.get('property_type') || undefined
    const buyerId = searchParams.get('buyer_id') || undefined

    const requests = await getRequests({ status, propertyType, buyerId })
    return NextResponse.json(requests)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch requests'
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

    if (!body.title || !body.buyer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title and buyer_id are required' },
        { status: 400 }
      )
    }

    const newRequest = await createRequest({
      title: body.title,
      buyer_id: body.buyer_id,
      property_type: body.property_type || null,
      preferred_locations: body.preferred_locations || [],
      budget_min: body.budget_min ? parseFloat(body.budget_min) : null,
      budget_max: body.budget_max ? parseFloat(body.budget_max) : null,
      currency: body.currency || 'EUR',
      bedrooms: body.bedrooms ? parseInt(body.bedrooms, 10) : null,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms, 10) : null,
      minimum_area: body.minimum_area ? parseFloat(body.minimum_area) : null,
      desired_features: body.desired_features || {},
      timeline: body.timeline || null,
      financing_required: !!body.financing_required,
      status: body.status || 'ACTIVE',
      notes: body.notes || null,
      public_visibility: body.public_visibility !== undefined ? body.public_visibility : true,
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
