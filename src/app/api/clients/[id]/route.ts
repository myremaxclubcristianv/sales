import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getClientById, updateClient } from '@/lib/db/clients'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const client = await getClientById(id)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const body = await request.json()

    // Basic validation
    if (body.first_name !== undefined && !body.first_name.trim()) {
      return NextResponse.json({ error: 'Prenumele este obligatoriu' }, { status: 400 })
    }
    if (body.last_name !== undefined && !body.last_name.trim()) {
      return NextResponse.json({ error: 'Numele este obligatoriu' }, { status: 400 })
    }

    const updated = await updateClient(
      id,
      body,
      undefined,
      user.email || 'Agent CRM'
    )

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
