import { NextResponse } from 'next/server'
import { createInsuranceClientFull } from '@/lib/db/insurance'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()

    if (!payload?.client?.first_name && !payload?.client?.last_name) {
      return NextResponse.json(
        { error: 'Numele clientului este obligatoriu' },
        { status: 400 }
      )
    }

    if (!payload?.client?.phone && !payload?.client?.email) {
      return NextResponse.json(
        { error: 'Cel puțin un număr de telefon sau o adresă de email este obligatorie' },
        { status: 400 }
      )
    }

    // Policy validation if policy is provided
    if (payload?.policy?.product || payload?.policy?.insurer || payload?.policy?.policy_number) {
      if (!payload?.policy?.product) {
        return NextResponse.json(
          { error: 'Tipul asigurării este obligatoriu pentru poliță' },
          { status: 400 }
        )
      }
      if (!payload?.policy?.insurer) {
        return NextResponse.json(
          { error: 'Asigurătorul este obligatoriu pentru poliță' },
          { status: 400 }
        )
      }
      if (payload?.policy?.start_date && payload?.policy?.expiry_date) {
        const start = new Date(payload.policy.start_date)
        const expiry = new Date(payload.policy.expiry_date)
        if (expiry < start) {
          return NextResponse.json(
            { error: 'Data de expirare a poliței nu poate fi anterioară datei de emitere' },
            { status: 400 }
          )
        }
      }
      if (payload?.policy?.premium && Number(payload.policy.premium) < 0) {
        return NextResponse.json(
          { error: 'Prima de asigurare nu poate fi negativă' },
          { status: 400 }
        )
      }
      if (payload?.policy?.commission && Number(payload.policy.commission) < 0) {
        return NextResponse.json(
          { error: 'Comisionul nu poate fi negativ' },
          { status: 400 }
        )
      }
    }

    const result = await createInsuranceClientFull(payload)

    if (!result?.success || !result?.client_id) {
      return NextResponse.json(
        { error: 'Eroare la salvarea tranzacțională a clientului în baza de date' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating insurance client full:', error)
    const message = error instanceof Error ? error.message : 'Eroare neașteptată la crearea clientului'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
