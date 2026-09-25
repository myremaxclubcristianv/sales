import { deleteContact, getContactById, updateContact } from '@/lib/db/contacts'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'
import { NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const contact = await getContactById(id)
    return NextResponse.json({ contact })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get contact'
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

    if (body.phone) {
      body.phone = normalizePhone(body.phone) || body.phone
    }
    if (body.whatsapp) {
      body.whatsapp = normalizePhone(body.whatsapp) || body.whatsapp
    }
    if (body.email) {
      body.email = body.email.trim().toLowerCase()
    }

    const updated = await updateContact(id, body)
    return NextResponse.json({ contact: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update contact'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    await deleteContact(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete contact'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
