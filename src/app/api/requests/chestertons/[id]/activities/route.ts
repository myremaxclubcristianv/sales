import { NextResponse } from 'next/server'
import {
  getChestertonsRequestById,
  addChestertonsActivity,
} from '@/lib/db/chestertons-requests'
import { createClient } from '@/lib/supabase/server'
import type { ChestertonsActivityType } from '@/lib/types/chestertons-workflow'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Params) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const reqData = await getChestertonsRequestById(id)

    if (!reqData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json(reqData.activities || [])
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activities'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request, props: Params) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const body = await request.json()

    if (!body.note || !body.note.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 })
    }

    const activityType: ChestertonsActivityType = body.activity_type || 'NOTE'
    const authorName = user.email || 'Agent CRM'

    const activity = await addChestertonsActivity(
      id,
      activityType,
      body.note.trim(),
      authorName,
      user.id
    )

    return NextResponse.json(activity, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create activity'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
