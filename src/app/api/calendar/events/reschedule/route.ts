import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminSession } from '@/lib/auth/admin-auth'
import {
  isValidCalendarDate,
  isValidTimeString,
  bucharestToUtcIso,
} from '@/lib/utils/timezone'

export const dynamic = 'force-dynamic'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Datele cererii sunt invalide.' }, { status: 400 })
    }

    const { follow_up_id, date, time } = body

    if (!follow_up_id || typeof follow_up_id !== 'string' || !UUID_REGEX.test(follow_up_id.trim())) {
      return NextResponse.json(
        { error: 'ID-ul programării este obligatoriu și trebuie să fie un UUID valid.' },
        { status: 400 }
      )
    }

    if (!date || typeof date !== 'string' || !isValidCalendarDate(date)) {
      return NextResponse.json(
        { error: 'Data programării este invalidă. Formatul necesar este YYYY-MM-DD (dată calendaristică reală).' },
        { status: 400 }
      )
    }

    const timeStr = typeof time === 'string' && time.trim() ? time.trim() : '10:00'
    if (!isValidTimeString(timeStr)) {
      return NextResponse.json(
        { error: 'Ora programării este invalidă. Formatul necesar este HH:mm (00:00 - 23:59).' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // 1. Verify existence of follow-up
    const { data: existingFollowUp, error: fetchErr } = await admin
      .from('follow_ups')
      .select('id, client_id, due_date')
      .eq('id', follow_up_id.trim())
      .maybeSingle()

    if (fetchErr) {
      throw fetchErr
    }

    if (!existingFollowUp) {
      return NextResponse.json({ error: 'Programarea specificată nu a fost găsită.' }, { status: 404 })
    }

    // 2. Convert Europe/Bucharest local wall-clock time to precise UTC ISO
    const utcIso = bucharestToUtcIso(date.trim(), timeStr)

    // 3. Update existing follow-up without creating duplicates
    const { data: updated, error: updateErr } = await admin
      .from('follow_ups')
      .update({
        due_date: utcIso,
        updated_at: new Date().toISOString(),
      })
      .eq('id', follow_up_id.trim())
      .select()
      .maybeSingle()

    if (updateErr) {
      throw updateErr
    }

    return NextResponse.json({
      success: true,
      followUp: updated,
      newDate: date.trim(),
      newTime: timeStr,
      isoDate: utcIso,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la reprogramare'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
