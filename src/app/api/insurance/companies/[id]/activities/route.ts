import { NextResponse } from 'next/server'
import {
  addInsuranceCompanyActivity,
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
    const activities = await getInsuranceCompanyActivities(id)
    return NextResponse.json({ activities })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la preluarea activităților'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
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

    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json({ error: 'Conținutul notiței este obligatoriu' }, { status: 400 })
    }

    const activity = await addInsuranceCompanyActivity(id, {
      activity_type: body.activity_type || 'NOTE',
      content: body.content.trim(),
      created_by: user.email || 'Admin CRM',
    })

    const activities = await getInsuranceCompanyActivities(id)

    return NextResponse.json({ success: true, activity, activities }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la adăugarea activității'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
