import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { unlockClientVault } from '@/lib/db/client-vault'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
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
    const body = await request.json()

    if (!body.password || !body.password.trim()) {
      return NextResponse.json({ error: 'Parola este obligatorie.' }, { status: 400 })
    }

    const result = await unlockClientVault(id, body.password)

    if (result.success && result.sessionToken) {
      // Audit successful unlock
      try {
        const admin = createAdminClient()
        await admin.from('activities').insert({
          client_id: id,
          type: 'NOTE',
          title: `Vault deblocat (${user.email || 'Admin'})`,
          notes: 'Sesiune securizată deschisă pentru vizualizarea documentelor private.',
          date: new Date().toISOString(),
        })
      } catch {
        // Ignore
      }

      return NextResponse.json({
        success: true,
        sessionToken: result.sessionToken,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Parolă incorectă',
          remainingAttempts: result.remainingAttempts,
          lockedUntil: result.lockedUntil,
        },
        { status: 403 }
      )
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to unlock vault'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
