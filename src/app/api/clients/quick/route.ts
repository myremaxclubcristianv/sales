import { createClientRecord, updateClient, getClientById, checkDuplicateClients } from '@/lib/db/clients'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'
import { validateCnp } from '@/lib/utils/cnp'
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
    const { id, name, phone, email, cnp, date_of_birth, interest_summary, category, source, status, forceCreate } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Numele clientului este obligatoriu' }, { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Numărul de telefon este obligatoriu' }, { status: 400 })
    }

    // CNP Validation (Optional: empty/null allowed, if provided must be exactly 13 numeric digits)
    let validatedCnp: string | null = null
    if (cnp !== undefined && cnp !== null && String(cnp).trim() !== '') {
      const cnpValidation = validateCnp(String(cnp), true)
      if (!cnpValidation.isValid) {
        return NextResponse.json(
          { error: cnpValidation.error || 'CNP-ul trebuie să conțină exact 13 cifre.' },
          { status: 400 }
        )
      }
      validatedCnp = cnpValidation.normalized
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

    // If edit mode with existing id
    if (id) {
      const existingClient = await getClientById(id)
      if (!existingClient) {
        return NextResponse.json({ error: 'Clientul nu a fost găsit' }, { status: 404 })
      }

      // Preserve existing CNP if empty on edit; otherwise update if new valid CNP supplied
      const finalCnp = validatedCnp !== null ? validatedCnp : (existingClient.cnp || null)

      const updated = await updateClient(id, {
        first_name: firstName,
        last_name: lastName,
        phone: normPhone,
        whatsapp: normPhone,
        email: email ? email.trim() : null,
        date_of_birth: date_of_birth !== undefined ? (date_of_birth ? date_of_birth.trim() : null) : existingClient.date_of_birth,
        category: category || existingClient.category || 'REAL_ESTATE',
        lead_source: source || existingClient.lead_source || 'DIRECT_CONTACT',
        interest_summary: interest_summary !== undefined ? (interest_summary ? interest_summary.trim() : null) : existingClient.interest_summary,
        status: status || existingClient.status || 'NOT_CONTACTED',
        cnp: finalCnp,
      })

      // Mask CNP in API response
      const sanitizedClient = {
        ...updated,
        cnp: updated.cnp ? '•••••••••••••' : null,
      }

      return NextResponse.json({ client: sanitizedClient, success: true }, { status: 200 })
    }

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
      date_of_birth: date_of_birth ? date_of_birth.trim() : null,
      category: category || 'REAL_ESTATE',
      lead_source: source || 'DIRECT_CONTACT',
      interest_summary: interest_summary ? interest_summary.trim() : null,
      status: status || 'NOT_CONTACTED',
      client_type: 'INDIVIDUAL',
      preferred_communication: 'whatsapp',
      country: 'Romania',
      cnp: validatedCnp,
    })

    // Mask CNP in API response
    const sanitizedClient = {
      ...newClient,
      cnp: newClient.cnp ? '•••••••••••••' : null,
    }

    return NextResponse.json({ client: sanitizedClient, success: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create quick client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
