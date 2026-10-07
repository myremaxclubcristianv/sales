import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { deleteClientVaultDocument } from '@/lib/db/client-documents'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string; docId: string }>
}

export async function DELETE(_request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, docId } = await props.params
    const result = await deleteClientVaultDocument(id, docId, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Eroare la ștergerea documentului' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Documentul a fost șters din vault.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
