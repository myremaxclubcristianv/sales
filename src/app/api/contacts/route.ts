import { createContact, getContacts } from '@/lib/db/contacts'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const clientFilter = (searchParams.get('clientFilter') as 'all' | 'clients_only' | 'agenda_only') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 1000
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const { data, count } = await getContacts({
      search,
      category,
      clientFilter,
      limit,
      offset,
    })

    return NextResponse.json({ contacts: data, count })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contacts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      first_name,
      last_name,
      phone,
      whatsapp,
      email,
      company_name,
      role,
      category,
      source,
      interest_summary,
      address,
      city,
      notes,
      date_of_birth,
      cnp,
    } = body

    if (!first_name && !last_name && !phone && !email) {
      return NextResponse.json({ error: 'Trebuie specificat măcar un nume, telefon sau email' }, { status: 400 })
    }

    const normPhone = phone ? normalizePhone(phone) : null

    const contact = await createContact({
      first_name: first_name?.trim() || '(Fără prenume)',
      last_name: last_name?.trim() || '',
      phone: normPhone || phone?.trim() || null,
      whatsapp: whatsapp ? normalizePhone(whatsapp) : normPhone,
      email: email?.trim().toLowerCase() || null,
      company_name: company_name?.trim() || null,
      role: role?.trim() || null,
      category: category || null,
      source: source || 'DIRECT_CONTACT',
      interest_summary: interest_summary?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      country: 'Romania',
      notes: notes?.trim() || null,
      date_of_birth: date_of_birth ? date_of_birth.trim() : null,
      cnp: cnp ? cnp.trim() : null,
    })

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create contact'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
