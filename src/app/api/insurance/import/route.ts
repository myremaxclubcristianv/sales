import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { seedVerifiedInsuranceClients } from '@/lib/db/insurance-isolated'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await seedVerifiedInsuranceClients()
    return NextResponse.json({
      success: true,
      message: 'Idempotent insurance import processed',
      result,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Import error:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
