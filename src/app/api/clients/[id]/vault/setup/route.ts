import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { setupOrResetClientVault } from '@/lib/db/client-vault'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, props: Params) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const result = await setupOrResetClientVault(id, user.id)

    // Audit activity for password creation/reset (without logging password)
    try {
      const admin = createAdminClient()
      await admin.from('activities').insert({
        client_id: id,
        type: 'NOTE',
        title: `Parolă Vault generată (${user.email || 'Admin'})`,
        notes: 'O nouă parolă criptografică a fost generată pentru Vault-ul privat al clientului.',
        date: new Date().toISOString(),
      })
    } catch {
      // Ignore activity error
    }

    return NextResponse.json({
      success: true,
      plaintextPassword: result.plaintextPassword,
      warning: 'Această parolă nu va mai fi afișată niciodată. Salvați-o într-un loc sigur!',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to setup vault'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
