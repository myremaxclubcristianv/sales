import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  getClientVaultDocuments,
  uploadClientVaultDocument,
} from '@/lib/db/client-documents'
import type { VaultDocumentCategory } from '@/lib/security/vault'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const docs = await getClientVaultDocuments(id)

    return NextResponse.json(docs)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client documents'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as VaultDocumentCategory) || 'ALTELE'
    const description = (formData.get('description') as string) || null

    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier nu a fost selectat.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadClientVaultDocument(
      id,
      buffer,
      file.name,
      file.type,
      category,
      description,
      user.id,
      user.email
    )

    if (!result.success || !result.document) {
      return NextResponse.json({ error: result.error || 'Eroare la încărcarea documentului' }, { status: 400 })
    }

    return NextResponse.json({ success: true, document: result.document }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
