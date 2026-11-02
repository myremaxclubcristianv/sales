import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth/admin-auth'
import { createClient } from '@/lib/supabase/server'
import { addClientNote, listClientNotes, ClientNoteError } from '@/lib/db/client-notes'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

function errorResponse(error: unknown, fallback: string) {
  const status = error instanceof ClientNoteError ? error.status : 500
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status })
}

export async function GET(_request: Request, props: Params) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

    const { id } = await props.params
    const supabase = await createClient()
    const notes = await listClientNotes(supabase, id)
    return NextResponse.json({ notes })
  } catch (error: unknown) {
    return errorResponse(error, 'Failed to fetch notes')
  }
}

export async function POST(request: Request, props: Params) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

    const { id } = await props.params
    const body = await request.json().catch(() => null)
    if (!body || typeof body.note !== 'string') {
      return NextResponse.json({ error: 'Textul notiței este obligatoriu.' }, { status: 400 })
    }

    const supabase = await createClient()
    const note = await addClientNote(supabase, id, body.note, auth.user.id)
    return NextResponse.json({ note }, { status: 201 })
  } catch (error: unknown) {
    return errorResponse(error, 'Failed to save note')
  }
}
