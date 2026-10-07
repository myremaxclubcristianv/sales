import { NextResponse } from 'next/server'
import { getChestertonsRequestById } from '@/lib/db/chestertons-requests'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Params) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const requestData = await getChestertonsRequestById(id)

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json(requestData)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
