import { createClient as createServerClient } from '@/lib/supabase/server'
import { updateFollowUp, completeFollowUp } from '@/lib/db/follow-ups'
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

    const { data, error } = await supabase
      .from('follow_ups')
      .select('*, clients(id, first_name, last_name, phone, email, category)')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json({ followUp: data }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch follow-up'
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

    // If status is being updated to COMPLETED
    if (body.status === 'COMPLETED') {
      const completed = await completeFollowUp(params.id)
      return NextResponse.json({ followUp: completed }, { status: 200 })
    }

    const updated = await updateFollowUp(params.id, {
      ...body,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ followUp: updated }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update follow-up'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const params = await props.params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('follow_ups')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete follow-up'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
