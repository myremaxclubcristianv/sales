import { createClientRecord, checkDuplicateClients } from '@/lib/db/clients'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'
import { NextResponse } from 'next/server'

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
    const { name, phone, email, interest_summary, category, source, status, forceCreate } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Numele clientului este obligatoriu' }, { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Numărul de telefon este obligatoriu' }, { status: 400 })
    }

    // Parse name into first_name and last_name
    const nameParts = name.trim().split(/\s+/)
    let firstName = nameParts[0]
    let lastName = nameParts.slice(1).join(' ')
    if (!lastName) {
      lastName = firstName
      firstName = ''
    }

    const normPhone = normalizePhone(phone) || phone.trim()

    // Check duplicate unless forceCreate is true
    if (!forceCreate) {
      const duplicates = await checkDuplicateClients(normPhone, email, name)
      if (duplicates && duplicates.length > 0) {
        return NextResponse.json(
          {
            requiresConfirmation: true,
            warning: 'Posibil client existent',
            duplicates,
          },
          { status: 200 }
        )
      }
    }

    const newClient = await createClientRecord({
      first_name: firstName,
      last_name: lastName,
      phone: normPhone,
      whatsapp: normPhone,
      email: email ? email.trim() : null,
      category: category || 'REAL_ESTATE',
      lead_source: source || 'DIRECT_CONTACT',
      interest_summary: interest_summary ? interest_summary.trim() : null,
      status: status || 'NOT_CONTACTED',
      client_type: 'INDIVIDUAL',
      preferred_communication: 'whatsapp',
      country: 'Romania',
    })

    return NextResponse.json({ client: newClient, success: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create quick client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
