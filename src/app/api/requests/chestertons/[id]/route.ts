import { NextResponse } from 'next/server'
import {
  getChestertonsRequestById,
  updateChestertonsRequestStatus,
  updateChestertonsFollowUp,
} from '@/lib/db/chestertons-requests'
import { requireAdminSession } from '@/lib/auth/admin-auth'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Params) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response

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

export async function PATCH(request: Request, props: Params) {
  try {
    const auth = await requireAdminSession()
    if (!auth.success) return auth.response
    const user = auth.user

    const { id } = await props.params
    const body = await request.json()

    let result: Record<string, unknown> = { success: true }

    // Update CRM Status if provided
    if (body.crm_status) {
      const statusRes = await updateChestertonsRequestStatus(
        id,
        body.crm_status,
        body.note,
        user.email || 'Agent CRM',
        user.id
      )
      result = { ...result, ...statusRes }
    }

    // Update Follow-Up date if provided
    if (body.next_follow_up_at !== undefined) {
      const followUpRes = await updateChestertonsFollowUp(id, body.next_follow_up_at)
      result = { ...result, ...followUpRes }
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
