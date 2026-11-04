import { NextResponse } from 'next/server'
import { getInsurancePolicies, createInsurancePolicy } from '@/lib/db/insurance'
import { createActivity } from '@/lib/db/activities'
import { createFollowUp } from '@/lib/db/follow-ups'
import { requireAdminSession } from '@/lib/auth/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidCalendarDate } from '@/lib/utils/timezone'

export const dynamic = 'force-dynamic'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id') || undefined
    const status = searchParams.get('status') || undefined
    const product = searchParams.get('product') || undefined
    const expiringInDays = searchParams.get('expiring_in_days') ? parseInt(searchParams.get('expiring_in_days')!, 10) : undefined

    const policies = await getInsurancePolicies({ clientId, status, product, expiringInDays })
    return NextResponse.json(policies)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch insurance policies'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Datele cererii sunt invalide.' }, { status: 400 })
    }

    const ALLOWED_PRODUCTS = [
      'RCA', 'CASCO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL',
      'LIABILITY', 'PROFESSIONAL_LIABILITY', 'CARGO', 'IMM',
      'BUSINESS', 'CYBER', 'OTHER'
    ]

    // 1. Validate required fields
    if (!body.client_id || !body.product || !body.insurer || !body.start_date || !body.expiry_date) {
      return NextResponse.json(
        { error: 'Câmpurile obligatorii lipsesc: clientul, tipul poliței, asigurătorul, data de început și data de expirare sunt obligatorii.' },
        { status: 400 }
      )
    }

    const clientIdStr = String(body.client_id).trim()
    if (!UUID_REGEX.test(clientIdStr)) {
      return NextResponse.json(
        { error: 'ID-ul clientului este invalid (trebuie să fie format UUID).' },
        { status: 400 }
      )
    }

    // 2. Verify client existence in database
    const admin = createAdminClient()
    const { data: clientRecord, error: clientErr } = await admin
      .from('clients')
      .select('id, first_name, last_name')
      .eq('id', clientIdStr)
      .maybeSingle()

    if (clientErr) throw clientErr
    if (!clientRecord) {
      return NextResponse.json(
        { error: 'Clientul specificat nu a fost găsit în baza de date.' },
        { status: 404 }
      )
    }

    // 3. Validate product
    if (!ALLOWED_PRODUCTS.includes(body.product)) {
      return NextResponse.json(
        { error: `Tipul de asigurare "${body.product}" este invalid. Alegeți un tip existent.` },
        { status: 400 }
      )
    }

    // 4. Validate dates
    const startDateStr = String(body.start_date).trim()
    const expiryDateStr = String(body.expiry_date).trim()

    if (!isValidCalendarDate(startDateStr)) {
      return NextResponse.json(
        { error: 'Data de început a poliței este invalidă (format necesar: YYYY-MM-DD).' },
        { status: 400 }
      )
    }

    if (!isValidCalendarDate(expiryDateStr)) {
      return NextResponse.json(
        { error: 'Data de expirare a poliței este invalidă (format necesar: YYYY-MM-DD).' },
        { status: 400 }
      )
    }

    if (new Date(expiryDateStr) < new Date(startDateStr)) {
      return NextResponse.json(
        { error: 'Data de expirare nu poate fi anterioară datei de început a poliței.' },
        { status: 400 }
      )
    }

    const cleanPolicyNumber = body.policy_number && String(body.policy_number).trim()
      ? String(body.policy_number).trim()
      : null

    const allowedCurrencies = ['EUR', 'RON', 'USD']
    const currency = allowedCurrencies.includes(body.currency) ? body.currency : 'EUR'

    // 5. Create policy with validated fields
    const newPolicy = await createInsurancePolicy({
      client_id: clientIdStr,
      product: body.product,
      insurer: String(body.insurer).trim(),
      policy_number: cleanPolicyNumber,
      premium: body.premium ? parseFloat(body.premium) : null,
      commission: body.commission ? parseFloat(body.commission) : 0,
      currency,
      start_date: startDateStr,
      expiry_date: expiryDateStr,
      status: body.status || 'ACTIVE',
      notes: body.notes ? String(body.notes).trim() : null,
    })

    // 6. Automatically generate a renewal follow-up 30 days before expiry
    try {
      const expiryDate = new Date(expiryDateStr)
      const renewalReminderDate = new Date(expiryDate)
      renewalReminderDate.setDate(renewalReminderDate.getDate() - 30)

      await createFollowUp({
        client_id: clientIdStr,
        insurance_id: newPolicy.id,
        reason: `Insurance Renewal: ${body.product} policy with ${body.insurer} expires on ${expiryDateStr}`,
        due_date: renewalReminderDate.toISOString(),
        priority: 'HIGH',
        status: 'PENDING',
      })
    } catch {
      // Follow-up creation best-effort
    }

    // 7. Log to client timeline
    try {
      await createActivity({
        client_id: clientIdStr,
        type: 'NOTE',
        title: `Insurance Policy Registered: ${body.product} (${body.insurer})`,
        notes: `Policy #${body.policy_number || 'N/A'} • Premium: ${body.premium || 'N/A'} ${currency} • Expiry: ${expiryDateStr}`,
        date: new Date().toISOString(),
      })
    } catch {
      // Activity logging best-effort
    }

    return NextResponse.json(newPolicy, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create insurance policy'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
