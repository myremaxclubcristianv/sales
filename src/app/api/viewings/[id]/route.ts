import { NextResponse } from 'next/server'
import { getViewingById, updateViewing, deleteViewing } from '@/lib/db/viewings'
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
    const viewing = await getViewingById(id)
    return NextResponse.json(viewing)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch viewing'
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

    const updated = await updateViewing(id, body)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update viewing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    await deleteViewing(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete viewing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
