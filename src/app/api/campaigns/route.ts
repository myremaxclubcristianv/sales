import { NextResponse } from 'next/server'
import { getCampaigns, createCampaign } from '@/lib/db/campaigns'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await getCampaigns()
    return NextResponse.json(campaigns)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch campaigns'
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

    if (!body.name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
    }

    const newCampaign = await createCampaign({
      name: body.name,
      objective: body.objective || null,
      channel: body.channel || 'website',
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: body.budget ? parseFloat(body.budget) : null,
      currency: body.currency || 'EUR',
      status: body.status || 'ACTIVE',
      notes: body.notes || null,
    })

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create campaign'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
