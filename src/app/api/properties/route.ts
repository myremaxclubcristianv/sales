import { createClient as createServerClient } from '@/lib/supabase/server'
import { createProperty, getProperties } from '@/lib/db/properties'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const location = searchParams.get('location') || undefined

    const properties = await getProperties({ type, status, location })
    return NextResponse.json({ properties })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch properties'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const property = await createProperty(body)
    return NextResponse.json({ property }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create property'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
