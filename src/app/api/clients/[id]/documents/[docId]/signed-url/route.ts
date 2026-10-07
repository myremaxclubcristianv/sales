import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generateDocumentSignedUrl } from '@/lib/db/client-documents'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string; docId: string }>
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

    const { id, docId } = await props.params
    const result = await generateDocumentSignedUrl(id, docId, user.id)

    if (!result.success || !result.signedUrl) {
      return NextResponse.json(
        { error: result.error || 'Nu s-a putut genera link-ul securizat.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      document: result.document,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate signed url'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
