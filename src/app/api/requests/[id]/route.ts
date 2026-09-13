import { NextResponse } from 'next/server'
import { getRequestById, updateRequest } from '@/lib/db/requests'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const requestData = await getRequestById(id)
    return NextResponse.json(requestData)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const body = await request.json()

    const updated = await updateRequest(id, body)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
