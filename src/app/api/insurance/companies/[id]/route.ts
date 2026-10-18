import { NextResponse } from 'next/server'
import {
  getInsuranceCompanyById,
  updateInsuranceCompany,
  getInsuranceCompanyActivities,
} from '@/lib/db/insurance-companies'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Autentificare necesară.' }, { status: 401 })
    }

    const { id } = await params
    const company = await getInsuranceCompanyById(id)
    if (!company) {
      return NextResponse.json({ error: 'Firma nu a fost găsită' }, { status: 404 })
    }

    const activities = await getInsuranceCompanyActivities(id)

    return NextResponse.json({ company, activities })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la preluarea detaliilor firmei'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Autentificare necesară.' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updated = await updateInsuranceCompany(id, {
      prospect_status: body.prospect_status,
      last_contact_at: body.last_contact_at,
      next_follow_up_at: body.next_follow_up_at,
      crm_notes: body.crm_notes,
      additional_phones: body.additional_phones,
      additional_emails: body.additional_emails,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Firma nu a fost găsită pentru actualizare' }, { status: 404 })
    }

    const activities = await getInsuranceCompanyActivities(id)

    return NextResponse.json({ success: true, company: updated, activities })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la actualizarea firmei'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
