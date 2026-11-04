import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminSession } from '@/lib/auth/admin-auth'
import { createActivity } from '@/lib/db/activities'

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

    const rawNote = body.note ? String(body.note).trim() : ''
    if (!rawNote) {
      return NextResponse.json({ error: 'Notița este obligatorie.' }, { status: 400 })
    }

    const admin = createAdminClient()
    let targetClientId: string | null = null
    let followUpRecord: { id: string; client_id: string; notes: string | null } | null = null

    // 1. If follow_up_id is provided, verify it and derive client_id strictly from DB
    if (body.follow_up_id) {
      const followUpId = String(body.follow_up_id).trim()
      if (!UUID_REGEX.test(followUpId)) {
        return NextResponse.json({ error: 'ID-ul programării este invalid.' }, { status: 400 })
      }

      const { data: followUp, error: fFetchErr } = await admin
        .from('follow_ups')
        .select('id, client_id, notes')
        .eq('id', followUpId)
        .maybeSingle()

      if (fFetchErr) throw fFetchErr

      if (!followUp) {
        return NextResponse.json({ error: 'Programarea specificată nu a fost găsită.' }, { status: 404 })
      }

      if (!followUp.client_id || !UUID_REGEX.test(followUp.client_id)) {
        return NextResponse.json(
          { error: 'Programarea nu este asociată unui client valid în baza de date.' },
          { status: 400 }
        )
      }

      // CRITICAL FIX: The associated client MUST be strictly the one from the follow-up record
      targetClientId = followUp.client_id
      followUpRecord = followUp
    } else if (body.client_id) {
      const clientId = String(body.client_id).trim()
      if (!UUID_REGEX.test(clientId)) {
        return NextResponse.json({ error: 'ID-ul clientului este invalid.' }, { status: 400 })
      }

      const { data: clientExists, error: cErr } = await admin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .maybeSingle()

      if (cErr) throw cErr
      if (!clientExists) {
        return NextResponse.json({ error: 'Clientul specificat nu a fost găsit.' }, { status: 404 })
      }

      targetClientId = clientId
    } else {
      return NextResponse.json(
        { error: 'Trebuie să specificați o programare (follow_up_id) sau un client (client_id).' },
        { status: 400 }
      )
    }

    // 2. Format Romanian Europe/Bucharest timestamp for note entry
    const nowBucharest = new Date().toLocaleString('ro-RO', {
      timeZone: 'Europe/Bucharest',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const noteEntry = `[${nowBucharest}] ${rawNote}`

    // 3. Create CALL activity first for strict data integrity
    const activityRecord = await createActivity({
      client_id: targetClientId,
      type: 'CALL',
      title: body.title || 'Apel telefonic / Notă programare',
      notes: rawNote,
      date: new Date().toISOString(),
    })

    let updatedNotes = noteEntry

    // 4. If linked to a follow-up, append note to follow-up history
    if (followUpRecord) {
      updatedNotes = followUpRecord.notes
        ? `${followUpRecord.notes}\n\n${noteEntry}`
        : noteEntry

      const { error: updateErr } = await admin
        .from('follow_ups')
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', followUpRecord.id)

      if (updateErr) {
        console.warn(
          '[Calendar Call Note] Warning: Activity created but failed to append to follow_up notes:',
          updateErr
        )
        // Note on atomicity: Supabase REST API does not support multi-table atomic transactions
        // without stored procedures. The primary activity record is preserved.
      }
    }

    return NextResponse.json({
      success: true,
      updatedNotes,
      activity: activityRecord,
      noteEntry,
      client_id: targetClientId,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare la salvarea notiței'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
