import { createClient as createServerClient } from '@/lib/supabase/server'
import { getPropertyById, updateProperty } from '@/lib/db/properties'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const params = await props.params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const property = await getPropertyById(params.id)
    return NextResponse.json({ property })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch property'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const params = await props.params
    const body = await request.json()
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const property = await updateProperty(params.id, body)
    return NextResponse.json({ property })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update property'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
