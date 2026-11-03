import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_CLIENT_NOTE_LENGTH = 5000
export const QUICK_NOTE_TITLE = 'Notiță rapidă'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export class ClientNoteError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ClientNoteError'
    this.status = status
  }
}

/** A note as stored in the existing `activities` table (type = 'NOTE'). */
export interface ClientNote {
  id: string
  client_id: string
  type: string
  title: string
  notes: string | null
  date: string
  created_at: string
  created_by: string | null
}

const NOTE_COLUMNS = 'id,client_id,type,title,notes,date,created_at,created_by'

/**
 * All NOTE activities of one client, newest first. Reuses the existing `activities` model
 * (the same rows shown in the client profile timeline) — no parallel notes store.
 */
export async function listClientNotes(
  supabase: SupabaseClient,
  clientId: string
): Promise<ClientNote[]> {
  if (!isUuid(clientId)) throw new ClientNoteError('ID client invalid.', 400)

  const { data, error } = await supabase
    .from('activities')
    .select(NOTE_COLUMNS)
    .eq('client_id', clientId)
    .eq('type', 'NOTE')
    .order('date', { ascending: false })

  if (error) throw new ClientNoteError(`Citirea notițelor a eșuat: ${error.message}`, 500)
  return (data || []) as ClientNote[]
}

/**
 * Append one NOTE activity for the client identified by its real UUID. Existing notes are never
 * touched. Resolves only with the row the database actually returned.
 */
export async function addClientNote(
  supabase: SupabaseClient,
  clientId: string,
  text: string,
  userId: string | null
): Promise<ClientNote> {
  if (!isUuid(clientId)) throw new ClientNoteError('ID client invalid.', 400)

  const trimmed = (text || '').trim()
  if (!trimmed) throw new ClientNoteError('Notița nu poate fi goală.', 400)
  if (trimmed.length > MAX_CLIENT_NOTE_LENGTH) {
    throw new ClientNoteError(`Notița depășește ${MAX_CLIENT_NOTE_LENGTH} de caractere.`, 400)
  }

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .maybeSingle()
  if (clientErr) throw new ClientNoteError(`Verificarea clientului a eșuat: ${clientErr.message}`, 500)
  if (!client) throw new ClientNoteError('Clientul nu a fost găsit.', 404)

  const { data, error } = await supabase
    .from('activities')
    .insert({
      client_id: clientId,
      type: 'NOTE',
      title: QUICK_NOTE_TITLE,
      notes: trimmed,
      date: new Date().toISOString(),
      created_by: userId && isUuid(userId) ? userId : null,
    })
    .select(NOTE_COLUMNS)
    .single()

  if (error || !data) {
    throw new ClientNoteError(
      `Salvarea notiței a eșuat: ${error?.message || 'baza de date nu a confirmat inserarea'}`,
      500
    )
  }
  return data as ClientNote
}
